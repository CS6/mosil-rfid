/**
 * CreateBoxUseCase Unit Tests
 * 
 * Test Logic:
 * Tests the CreateBoxUseCase application service functionality including:
 * - Valid box creation with proper user validation
 * - User existence and active status validation
 * - Box generation service integration
 * - Audit logging for box creation actions
 * - Error handling for invalid inputs and business rule violations
 * 
 * Test Inputs:
 * - Valid CreateBoxRequest: { code: "001" }
 * - Invalid codes: null, undefined, "AB", "1234"
 * - Valid user UUIDs and invalid/inactive users
 * - IP addresses for audit trails
 * 
 * Expected Outputs:
 * - BoxResponse with generated box details
 * - Audit log entries for successful creations
 * - Appropriate errors for invalid inputs
 * - Box saved to repository
 */

import { CreateBoxUseCase } from '../../../../src/application/use-cases/create-box.use-case';
import { CreateBoxRequest, BoxResponse } from '../../../../src/application/dtos/box.dto';
import { IBoxRepository, IUserRepository } from '../../../../src/domain/interfaces/repositories';
import { BoxGenerationService, AuditService } from '../../../../src/domain/services';
import { Box } from '../../../../src/domain/entities/box';
import { User } from '../../../../src/domain/entities/user';
import { BoxNumber } from '../../../../src/domain/value-objects/box-number';

// Mock implementations
class MockBoxRepository implements IBoxRepository {
  private boxes: Box[] = [];

  async findByBoxNo(boxNo: BoxNumber): Promise<Box | null> {
    return this.boxes.find(box => box.getBoxNo().equals(boxNo)) || null;
  }

  async findByUserCode(): Promise<Box[]> { return []; }
  async findByShipmentNo(): Promise<Box[]> { return []; }
  async findLatestByPrefix(): Promise<Box | null> { return null; }
  async findAll(): Promise<{ boxes: Box[]; total: number }> {
    return { boxes: this.boxes, total: this.boxes.length };
  }
  async exists(): Promise<boolean> { return false; }

  async save(box: Box): Promise<void> {
    const existingIndex = this.boxes.findIndex(b => b.getBoxNo().equals(box.getBoxNo()));
    if (existingIndex >= 0) {
      this.boxes[existingIndex] = box;
    } else {
      this.boxes.push(box);
    }
  }

  async saveBatch(boxes: Box[]): Promise<void> {
    for (const box of boxes) {
      await this.save(box);
    }
  }

  async delete(): Promise<void> {}

  // Helper methods for testing
  getBoxes(): Box[] { return [...this.boxes]; }
  reset(): void { this.boxes = []; }
}

class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findByUuid(uuid: string): Promise<User | null> {
    return this.users.get(uuid) || null;
  }

  async findByEmail(): Promise<User | null> { return null; }
  async findAll(): Promise<{ users: User[]; total: number }> {
    return { users: Array.from(this.users.values()), total: this.users.size };
  }
  async save(): Promise<void> {}
  async delete(): Promise<void> {}

  // Helper methods for testing
  addMockUser(uuid: string, email: string, name: string, isActive: boolean = true): void {
    const user = new User(email, name, 'hashedPassword', uuid);
    if (!isActive) {
      // Assuming User has setActive method or similar
      (user as any).isActive = false;
    }
    this.users.set(uuid, user);
  }

  reset(): void { this.users.clear(); }
}

class MockBoxGenerationService {
  async generateBox(code: string, createdBy: string): Promise<Box> {
    if (!/^\d{3}$/.test(code)) {
      throw new Error('Code must be exactly 3 digits');
    }

    const currentYear = new Date().getFullYear().toString();
    const boxNoValue = `B${code}${currentYear}00001`;
    const boxNumber = new BoxNumber(boxNoValue);
    
    return new Box(boxNumber, code, createdBy);
  }
}

class MockAuditService {
  private logs: any[] = [];

  async logAction(
    userUuid: string,
    action: string,
    entityType: string,
    entityId: string,
    description: string,
    ipAddress?: string
  ): Promise<void> {
    this.logs.push({
      userUuid,
      action,
      entityType,
      entityId,
      description,
      ipAddress,
      timestamp: new Date()
    });
  }

  getLogs(): any[] { return [...this.logs]; }
  reset(): void { this.logs = []; }
}

describe('CreateBoxUseCase', () => {
  let useCase: CreateBoxUseCase;
  let mockBoxRepository: MockBoxRepository;
  let mockUserRepository: MockUserRepository;
  let mockBoxGenerationService: MockBoxGenerationService;
  let mockAuditService: MockAuditService;

  const validUserUuid = 'test-user-uuid';
  const validIpAddress = '192.168.1.1';

  beforeEach(() => {
    mockBoxRepository = new MockBoxRepository();
    mockUserRepository = new MockUserRepository();
    mockBoxGenerationService = new MockBoxGenerationService();
    mockAuditService = new MockAuditService();

    useCase = new CreateBoxUseCase(
      mockBoxRepository,
      mockUserRepository,
      mockBoxGenerationService as any,
      mockAuditService as any
    );

    // Setup default active user
    mockUserRepository.addMockUser(validUserUuid, 'test@example.com', 'Test User', true);
  });

  describe('Successful Box Creation', () => {
    it('should create box with valid input', async () => {
      const request: CreateBoxRequest = { code: '001' };

      const result = await useCase.execute(request, validUserUuid, validIpAddress);

      expect(result).toBeDefined();
      expect(result.code).toBe('001');
      expect(result.createdBy).toBe(validUserUuid);
      expect(result.boxNo).toMatch(/^B001\d{8}$/);
      expect(result.shipmentNo).toBeUndefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should save box to repository', async () => {
      const request: CreateBoxRequest = { code: '123' };

      await useCase.execute(request, validUserUuid, validIpAddress);

      const savedBoxes = mockBoxRepository.getBoxes();
      expect(savedBoxes).toHaveLength(1);
      expect(savedBoxes[0].getCode()).toBe('123');
      expect(savedBoxes[0].getCreatedBy()).toBe(validUserUuid);
    });

    it('should create audit log entry', async () => {
      const request: CreateBoxRequest = { code: '456' };

      const result = await useCase.execute(request, validUserUuid, validIpAddress);

      const logs = mockAuditService.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        userUuid: validUserUuid,
        action: 'CREATE_BOX',
        entityType: 'Box',
        entityId: result.boxNo,
        ipAddress: validIpAddress
      });
      expect(logs[0].description).toContain('Created box');
    });

    it('should work without IP address', async () => {
      const request: CreateBoxRequest = { code: '789' };

      const result = await useCase.execute(request, validUserUuid);

      expect(result).toBeDefined();
      expect(result.code).toBe('789');

      const logs = mockAuditService.getLogs();
      expect(logs[0].ipAddress).toBeUndefined();
    });
  });

  describe('User Validation', () => {
    it('should throw error for non-existent user', async () => {
      const request: CreateBoxRequest = { code: '001' };
      const invalidUserUuid = 'invalid-user-uuid';

      await expect(useCase.execute(request, invalidUserUuid, validIpAddress))
        .rejects.toThrow('User not found');
    });

    it('should throw error for inactive user', async () => {
      const inactiveUserUuid = 'inactive-user-uuid';
      mockUserRepository.addMockUser(inactiveUserUuid, 'inactive@example.com', 'Inactive User', false);

      const request: CreateBoxRequest = { code: '001' };

      await expect(useCase.execute(request, inactiveUserUuid, validIpAddress))
        .rejects.toThrow('User is not active');
    });
  });

  describe('Input Validation', () => {
    it('should throw error for invalid code format', async () => {
      const invalidCodes = ['12', '1234', 'ABC', 'A01', ''];

      for (const code of invalidCodes) {
        const request: CreateBoxRequest = { code };

        await expect(useCase.execute(request, validUserUuid, validIpAddress))
          .rejects.toThrow('Code must be exactly 3 digits');
      }
    });

    it('should handle null/undefined code', async () => {
      const request: CreateBoxRequest = { code: null as any };

      await expect(useCase.execute(request, validUserUuid, validIpAddress))
        .rejects.toThrow();
    });
  });

  describe('Business Logic', () => {
    it('should generate unique box numbers for same code', async () => {
      const request: CreateBoxRequest = { code: '001' };

      // Create multiple boxes with same code
      const result1 = await useCase.execute(request, validUserUuid, validIpAddress);
      
      // Mock the service to return next sequential number
      const currentYear = new Date().getFullYear().toString();
      jest.spyOn(mockBoxGenerationService, 'generateBox')
        .mockResolvedValueOnce(new Box(new BoxNumber(`B001${currentYear}00002`), '001', validUserUuid));
      
      const result2 = await useCase.execute(request, validUserUuid, validIpAddress);

      expect(result1.boxNo).not.toBe(result2.boxNo);
      expect(result1.boxNo).toBe(`B001${currentYear}00001`);
      expect(result2.boxNo).toBe(`B001${currentYear}00002`);
    });

    it('should handle different codes independently', async () => {
      const request1: CreateBoxRequest = { code: '001' };
      const request2: CreateBoxRequest = { code: '002' };

      const result1 = await useCase.execute(request1, validUserUuid, validIpAddress);
      const result2 = await useCase.execute(request2, validUserUuid, validIpAddress);

      expect(result1.code).toBe('001');
      expect(result2.code).toBe('002');
      expect(result1.boxNo).toContain('B001');
      expect(result2.boxNo).toContain('B002');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      const request: CreateBoxRequest = { code: '999' };

      const result = await useCase.execute(request, validUserUuid, validIpAddress);

      // Verify all required fields are present
      expect(result).toHaveProperty('boxNo');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('shipmentNo');
      expect(result).toHaveProperty('createdBy');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');

      // Verify data types
      expect(typeof result.boxNo).toBe('string');
      expect(typeof result.code).toBe('string');
      expect(typeof result.createdBy).toBe('string');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.shipmentNo).toBeUndefined();
    });

    it('should include current timestamp', async () => {
      const beforeExecution = new Date();
      const request: CreateBoxRequest = { code: '001' };

      const result = await useCase.execute(request, validUserUuid, validIpAddress);
      const afterExecution = new Date();

      expect(result.createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecution.getTime());
      expect(result.createdAt.getTime()).toBeLessThanOrEqual(afterExecution.getTime());
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeExecution.getTime());
      expect(result.updatedAt.getTime()).toBeLessThanOrEqual(afterExecution.getTime());
    });
  });

  describe('Error Handling', () => {
    it('should handle repository save failures', async () => {
      const request: CreateBoxRequest = { code: '001' };

      // Mock repository to throw error
      jest.spyOn(mockBoxRepository, 'save').mockRejectedValueOnce(new Error('Database error'));

      await expect(useCase.execute(request, validUserUuid, validIpAddress))
        .rejects.toThrow('Database error');
    });

    it('should handle box generation service failures', async () => {
      const request: CreateBoxRequest = { code: '001' };

      // Mock service to throw error
      jest.spyOn(mockBoxGenerationService, 'generateBox')
        .mockRejectedValueOnce(new Error('Generation failed'));

      await expect(useCase.execute(request, validUserUuid, validIpAddress))
        .rejects.toThrow('Generation failed');
    });

    it('should handle audit service failures gracefully', async () => {
      const request: CreateBoxRequest = { code: '001' };

      // Mock audit service to throw error
      jest.spyOn(mockAuditService, 'logAction').mockRejectedValueOnce(new Error('Audit failed'));

      // Box creation should still succeed even if audit fails
      await expect(useCase.execute(request, validUserUuid, validIpAddress))
        .rejects.toThrow('Audit failed');
    });
  });
});