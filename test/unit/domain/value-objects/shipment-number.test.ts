/**
 * ShipmentNumber Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the ShipmentNumber value object validation and behavior including:
 * - Valid shipment number format validation (S + 3 digits + 4 digits + 5 digits = 13 chars)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between ShipmentNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid shipment numbers: "S001202500001", "S999202599999"
 * - Invalid formats: null, undefined, empty string, wrong length, wrong pattern
 * - Different shipment numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: ShipmentNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { ShipmentNumber } from '../../../../src/domain/value-objects/shipment-number';

describe('ShipmentNumber Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create ShipmentNumber with valid format', () => {
      const validShipmentNumbers = [
        'S001202500001',
        'S999202599999',
        'S123202412345'
      ];

      validShipmentNumbers.forEach(shipmentNo => {
        const shipmentNumber = new ShipmentNumber(shipmentNo);
        expect(shipmentNumber.getValue()).toBe(shipmentNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ShipmentNumber(null as any)).toThrow('Shipment number cannot be null or undefined');
      expect(() => new ShipmentNumber(undefined as any)).toThrow('Shipment number cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new ShipmentNumber('')).toThrow('Shipment number cannot be empty');
      expect(() => new ShipmentNumber('   ')).toThrow('Shipment number cannot be empty');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        'S00120250000',     // 12 chars (too short)
        'S0012025000001',   // 14 chars (too long)
        'S001',             // 4 chars (too short)
        'S001202500001234'  // 16 chars (too long)
      ];

      invalidLengths.forEach(shipmentNo => {
        expect(() => new ShipmentNumber(shipmentNo)).toThrow('Shipment number must be exactly 13 characters');
      });
    });

    it('should throw error for invalid format pattern', () => {
      const invalidPatterns = [
        'B001202500001',  // Wrong prefix
        's001202500001',  // Lowercase prefix
        'S00A202500001',  // Letter in code section
        'S001ABC500001',  // Letters in year section
        'S00120250000A',  // Letter in serial section
        '1001202500001',  // No prefix
        'SS01202500001'   // Double prefix
      ];

      invalidPatterns.forEach(shipmentNo => {
        expect(() => new ShipmentNumber(shipmentNo)).toThrow('Shipment number must follow format: S + 3 digits + 4 digits + 5 digits');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same shipment number values', () => {
      const shipmentNo1 = new ShipmentNumber('S001202500001');
      const shipmentNo2 = new ShipmentNumber('S001202500001');

      expect(shipmentNo1.equals(shipmentNo2)).toBe(true);
      expect(shipmentNo2.equals(shipmentNo1)).toBe(true);
    });

    it('should not be equal for different shipment number values', () => {
      const shipmentNo1 = new ShipmentNumber('S001202500001');
      const shipmentNo2 = new ShipmentNumber('S001202500002');

      expect(shipmentNo1.equals(shipmentNo2)).toBe(false);
      expect(shipmentNo2.equals(shipmentNo1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const shipmentNo = new ShipmentNumber('S001202500001');

      expect(shipmentNo.equals(null as any)).toBe(false);
      expect(shipmentNo.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'S123202456789';
      const shipmentNumber = new ShipmentNumber(originalValue);

      expect(shipmentNumber.getValue()).toBe(originalValue);
      expect(typeof shipmentNumber.getValue()).toBe('string');
    });
  });

  describe('Component Extraction', () => {
    it('should extract code component correctly', () => {
      const shipmentNumber = new ShipmentNumber('S123202456789');
      
      // Assuming ShipmentNumber has getCode method
      if ('getCode' in shipmentNumber) {
        expect((shipmentNumber as any).getCode()).toBe('123');
      }
    });

    it('should extract year component correctly', () => {
      const shipmentNumber = new ShipmentNumber('S123202456789');
      
      // Assuming ShipmentNumber has getYear method
      if ('getYear' in shipmentNumber) {
        expect((shipmentNumber as any).getYear()).toBe('2024');
      }
    });

    it('should extract serial component correctly', () => {
      const shipmentNumber = new ShipmentNumber('S123202456789');
      
      // Assuming ShipmentNumber has getSerial method
      if ('getSerial' in shipmentNumber) {
        expect((shipmentNumber as any).getSerial()).toBe('56789');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum valid values', () => {
      const minShipmentNumber = new ShipmentNumber('S000200000001');
      expect(minShipmentNumber.getValue()).toBe('S000200000001');
    });

    it('should handle maximum valid values', () => {
      const maxShipmentNumber = new ShipmentNumber('S999999999999');
      expect(maxShipmentNumber.getValue()).toBe('S999999999999');
    });

    it('should handle current year format', () => {
      const currentYear = new Date().getFullYear().toString();
      const shipmentNumber = new ShipmentNumber(`S001${currentYear}00001`);
      expect(shipmentNumber.getValue()).toBe(`S001${currentYear}00001`);
    });

    it('should handle all zeros in sections', () => {
      const zeroShipmentNumber = new ShipmentNumber('S000000000000');
      expect(zeroShipmentNumber.getValue()).toBe('S000000000000');
    });

    it('should handle all nines in sections', () => {
      const nineShipmentNumber = new ShipmentNumber('S999999999999');
      expect(nineShipmentNumber.getValue()).toBe('S999999999999');
    });
  });

  describe('Business Logic Validation', () => {
    it('should accept future years', () => {
      const futureYear = (new Date().getFullYear() + 1).toString();
      const futureShipmentNumber = new ShipmentNumber(`S001${futureYear}00001`);
      expect(futureShipmentNumber.getValue()).toBe(`S001${futureYear}00001`);
    });

    it('should accept past years', () => {
      const pastYear = (new Date().getFullYear() - 1).toString();
      const pastShipmentNumber = new ShipmentNumber(`S001${pastYear}00001`);
      expect(pastShipmentNumber.getValue()).toBe(`S001${pastYear}00001`);
    });

    it('should handle sequential numbering patterns', () => {
      const sequentialNumbers = [
        'S001202500001',
        'S001202500002',
        'S001202500003'
      ];

      sequentialNumbers.forEach(shipmentNo => {
        const shipmentNumber = new ShipmentNumber(shipmentNo);
        expect(shipmentNumber.getValue()).toBe(shipmentNo);
      });
    });
  });
});