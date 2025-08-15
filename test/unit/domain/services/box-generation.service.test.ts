/**
 * BoxGenerationService Unit Tests
 * 
 * Test Logic:
 * Tests the BoxGenerationService domain service functionality including:
 * - Single box generation with unique box numbers
 * - Batch box generation with sequential numbering
 * - Duplicate box number detection and prevention
 * - Year-based numbering system validation
 * - Serial number generation and incrementing
 * 
 * Test Inputs:
 * - Valid 3-digit codes: "001", "999", "123"
 * - Invalid codes: null, undefined, "AB", "1234"
 * - Batch quantities: 1, 10, 100
 * - CreatedBy user identifiers
 * 
 * Expected Outputs:
 * - Box instance with correct BoxNumber format (B + 3 digits + 4 digits + 5 digits)
 * - Sequential box numbers for batch generation
 * - Proper error handling for invalid inputs
 * - Duplicate detection errors when applicable
 */

import { BoxGenerationService } from '../../../../src/domain/services/box-generation.service';
import { IBoxRepository } from '../../../../src/domain/interfaces/repositories';
import { Box } from '../../../../src/domain/entities/box';
import { BoxNumber } from '../../../../src/domain/value-objects/box-number';

// Mock implementation of IBoxRepository
class MockBoxRepository implements IBoxRepository {
  private boxes: Box[] = [];
  private latestBoxes: { [prefix: string]: Box } = {};

  async findByBoxNo(boxNo: BoxNumber): Promise<Box | null> {
    return this.boxes.find(box => box.getBoxNo().equals(boxNo)) || null;
  }

  async findByUserCode(): Promise<Box[]> {
    return [];
  }

  async findByShipmentNo(): Promise<Box[]> {
    return [];
  }

  async findLatestByPrefix(prefix: string): Promise<Box | null> {
    return this.latestBoxes[prefix] || null;
  }

  async findAll(): Promise<{ boxes: Box[]; total: number }> {
    return { boxes: this.boxes, total: this.boxes.length };
  }

  async exists(boxNo: BoxNumber): Promise<boolean> {
    return this.boxes.some(box => box.getBoxNo().equals(boxNo));
  }

  async save(box: Box): Promise<void> {
    const existingIndex = this.boxes.findIndex(b => b.getBoxNo().equals(box.getBoxNo()));
    if (existingIndex >= 0) {
      this.boxes[existingIndex] = box;
    } else {
      this.boxes.push(box);
    }
    
    // Update latest box for prefix
    const boxNoValue = box.getBoxNo().getValue();
    const prefix = boxNoValue.substring(0, 8); // B + 3 digits + 4 digits
    if (!this.latestBoxes[prefix] || boxNoValue > this.latestBoxes[prefix].getBoxNo().getValue()) {
      this.latestBoxes[prefix] = box;
    }
  }

  async saveBatch(boxes: Box[]): Promise<void> {
    for (const box of boxes) {
      await this.save(box);
    }
  }

  async delete(boxNo: BoxNumber): Promise<void> {
    this.boxes = this.boxes.filter(box => !box.getBoxNo().equals(boxNo));
  }

  // Helper method for testing
  reset(): void {
    this.boxes = [];
    this.latestBoxes = {};
  }

  // Helper method to simulate existing boxes
  addMockBox(boxNoValue: string, code: string, createdBy: string): void {
    const box = new Box(new BoxNumber(boxNoValue), code, createdBy);
    this.boxes.push(box);
    
    const prefix = boxNoValue.substring(0, 8);
    if (!this.latestBoxes[prefix] || boxNoValue > this.latestBoxes[prefix].getBoxNo().getValue()) {
      this.latestBoxes[prefix] = box;
    }
  }
}

describe('BoxGenerationService', () => {
  let service: BoxGenerationService;
  let mockRepository: MockBoxRepository;
  const validCreatedBy = 'test-user-uuid';

  beforeEach(() => {
    mockRepository = new MockBoxRepository();
    service = new BoxGenerationService(mockRepository);
  });

  describe('generateBox', () => {
    it('should generate first box with serial number 00001', async () => {
      const result = await service.generateBox('001', validCreatedBy);

      expect(result).toBeInstanceOf(Box);
      expect(result.getCode()).toBe('001');
      expect(result.getCreatedBy()).toBe(validCreatedBy);
      
      const boxNoValue = result.getBoxNo().getValue();
      const currentYear = new Date().getFullYear().toString();
      expect(boxNoValue).toMatch(new RegExp(`^B001${currentYear}00001$`));
    });

    it('should generate sequential box numbers', async () => {
      const currentYear = new Date().getFullYear().toString();
      mockRepository.addMockBox(`B001${currentYear}00001`, '001', validCreatedBy);

      const result = await service.generateBox('001', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      
      expect(boxNoValue).toBe(`B001${currentYear}00002`);
    });

    it('should generate box with different code', async () => {
      const result = await service.generateBox('999', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      const currentYear = new Date().getFullYear().toString();
      
      expect(boxNoValue).toMatch(new RegExp(`^B999${currentYear}00001$`));
    });

    it('should throw error for invalid code format', async () => {
      const invalidCodes = ['12', '1234', 'ABC', 'A01', ''];

      for (const code of invalidCodes) {
        await expect(service.generateBox(code, validCreatedBy))
          .rejects.toThrow('Code must be exactly 3 digits');
      }
    });

    it('should throw error when serial number exceeds maximum', async () => {
      const currentYear = new Date().getFullYear().toString();
      mockRepository.addMockBox(`B001${currentYear}99999`, '001', validCreatedBy);

      await expect(service.generateBox('001', validCreatedBy))
        .rejects.toThrow('Box serial number exceeded maximum (99999)');
    });

    it('should detect duplicate box numbers', async () => {
      const currentYear = new Date().getFullYear().toString();
      const duplicateBoxNo = `B001${currentYear}00001`;
      mockRepository.addMockBox(duplicateBoxNo, '001', validCreatedBy);

      // Mock exists to return true for the next number to simulate race condition
      jest.spyOn(mockRepository, 'exists').mockResolvedValueOnce(true);

      await expect(service.generateBox('001', validCreatedBy))
        .rejects.toThrow(`Box number B001${currentYear}00002 already exists`);
    });
  });

  describe('generateBatchBoxes', () => {
    it('should generate batch of boxes with sequential numbers', async () => {
      const quantity = 5;
      const result = await service.generateBatchBoxes('001', quantity, validCreatedBy);

      expect(result).toHaveLength(quantity);
      
      const currentYear = new Date().getFullYear().toString();
      for (let i = 0; i < quantity; i++) {
        const expectedBoxNo = `B001${currentYear}${(i + 1).toString().padStart(5, '0')}`;
        expect(result[i].getBoxNo().getValue()).toBe(expectedBoxNo);
        expect(result[i].getCode()).toBe('001');
        expect(result[i].getCreatedBy()).toBe(validCreatedBy);
      }
    });

    it('should continue sequential numbering from existing boxes', async () => {
      const currentYear = new Date().getFullYear().toString();
      mockRepository.addMockBox(`B001${currentYear}00003`, '001', validCreatedBy);

      const result = await service.generateBatchBoxes('001', 3, validCreatedBy);

      expect(result).toHaveLength(3);
      expect(result[0].getBoxNo().getValue()).toBe(`B001${currentYear}00004`);
      expect(result[1].getBoxNo().getValue()).toBe(`B001${currentYear}00005`);
      expect(result[2].getBoxNo().getValue()).toBe(`B001${currentYear}00006`);
    });

    it('should throw error for invalid code format', async () => {
      await expect(service.generateBatchBoxes('AB', 5, validCreatedBy))
        .rejects.toThrow('Code must be exactly 3 digits');
    });

    it('should throw error when batch would exceed maximum serial number', async () => {
      const currentYear = new Date().getFullYear().toString();
      mockRepository.addMockBox(`B001${currentYear}99990`, '001', validCreatedBy);

      await expect(service.generateBatchBoxes('001', 15, validCreatedBy))
        .rejects.toThrow('Cannot generate 15 boxes: would exceed maximum serial number (99999)');
    });

    it('should handle single box batch', async () => {
      const result = await service.generateBatchBoxes('001', 1, validCreatedBy);

      expect(result).toHaveLength(1);
      const currentYear = new Date().getFullYear().toString();
      expect(result[0].getBoxNo().getValue()).toBe(`B001${currentYear}00001`);
    });

    it('should handle large batch generation', async () => {
      const quantity = 100;
      const result = await service.generateBatchBoxes('999', quantity, validCreatedBy);

      expect(result).toHaveLength(quantity);
      
      const currentYear = new Date().getFullYear().toString();
      expect(result[0].getBoxNo().getValue()).toBe(`B999${currentYear}00001`);
      expect(result[99].getBoxNo().getValue()).toBe(`B999${currentYear}00100`);
    });
  });

  describe('Year Handling', () => {
    it('should use current year in box number generation', async () => {
      const result = await service.generateBox('123', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      const currentYear = new Date().getFullYear().toString();
      
      expect(boxNoValue).toContain(currentYear);
    });

    it('should handle year transition correctly', async () => {
      // This test verifies that the service uses current year
      // In real scenarios, this would test year boundary conditions
      const result = await service.generateBox('456', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      
      // Should always use current year, not hardcoded year
      expect(boxNoValue.substring(4, 8)).toBe(new Date().getFullYear().toString());
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple codes independently', async () => {
      const result1 = await service.generateBox('001', validCreatedBy);
      const result2 = await service.generateBox('002', validCreatedBy);

      const currentYear = new Date().getFullYear().toString();
      expect(result1.getBoxNo().getValue()).toBe(`B001${currentYear}00001`);
      expect(result2.getBoxNo().getValue()).toBe(`B002${currentYear}00001`);
    });

    it('should handle code 000', async () => {
      const result = await service.generateBox('000', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      
      expect(boxNoValue).toMatch(/^B000\d{8}$/);
    });

    it('should handle code 999', async () => {
      const result = await service.generateBox('999', validCreatedBy);
      const boxNoValue = result.getBoxNo().getValue();
      
      expect(boxNoValue).toMatch(/^B999\d{8}$/);
    });

    it('should preserve box creation metadata', async () => {
      const customCreatedBy = 'custom-user-123';
      const result = await service.generateBox('001', customCreatedBy);

      expect(result.getCreatedBy()).toBe(customCreatedBy);
      expect(result.getCreatedAt()).toBeInstanceOf(Date);
      expect(result.getUpdatedAt()).toBeInstanceOf(Date);
      expect(result.getProductCount()).toBe(0);
      expect(result.isAssignedToShipment()).toBe(false);
    });
  });
});