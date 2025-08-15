/**
 * ShipmentNumber Value Object Unit Tests (Fixed Version)
 * 
 * Test Logic:
 * Tests the ShipmentNumber value object validation and behavior including:
 * - Valid shipment number format validation (exactly 16 characters, uppercase letters and numbers)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between ShipmentNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid shipment numbers: "SHP1234567890123", "ABC1234567890123", "1234567890123456"
 * - Invalid formats: null, undefined, empty string, wrong length, lowercase, special chars
 * - Different shipment numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: ShipmentNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { ShipmentNumber } from '../../../../src/domain/value-objects/shipment-number';

describe('ShipmentNumber Value Object (Fixed)', () => {
  describe('Constructor Validation', () => {
    it('should create ShipmentNumber with valid format', () => {
      const validShipmentNumbers = [
        'SHP1234567890123',
        'ABC1234567890123',
        '1234567890123456',
        'A1B2C3D4E5F6G7H8',
        'SHIPMENT12345678'
      ];

      validShipmentNumbers.forEach(shipmentNo => {
        const shipmentNumber = new ShipmentNumber(shipmentNo);
        expect(shipmentNumber.getValue()).toBe(shipmentNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ShipmentNumber(null as any)).toThrow('Shipment number cannot be empty');
      expect(() => new ShipmentNumber(undefined as any)).toThrow('Shipment number cannot be empty');
    });

    it('should throw error for empty string', () => {
      expect(() => new ShipmentNumber('')).toThrow('Shipment number cannot be empty');
      expect(() => new ShipmentNumber('   ')).toThrow('Shipment number must be exactly 16 characters');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        'SHP123456789012',   // 15 chars (too short)
        'SHP12345678901234', // 17 chars (too long)
        'SHP001',            // 6 chars (too short)
        'SHP1234567890123456789' // 22 chars (too long)
      ];

      invalidLengths.forEach(shipmentNo => {
        expect(() => new ShipmentNumber(shipmentNo)).toThrow('Shipment number must be exactly 16 characters');
      });
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacters = [
        'shp1234567890123',  // lowercase
        'SHP@123456789012',  // @ symbol
        'SHP 123456789012',  // space
        'SHP-123456789012',  // hyphen
        'SHP.123456789012',  // dot
        'SHP_123456789012'   // underscore
      ];

      invalidCharacters.forEach(shipmentNo => {
        expect(() => new ShipmentNumber(shipmentNo)).toThrow('Shipment number must contain only uppercase letters and numbers');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same shipment number values', () => {
      const shipmentNo1 = new ShipmentNumber('SHP1234567890123');
      const shipmentNo2 = new ShipmentNumber('SHP1234567890123');

      expect(shipmentNo1.equals(shipmentNo2)).toBe(true);
      expect(shipmentNo2.equals(shipmentNo1)).toBe(true);
    });

    it('should not be equal for different shipment number values', () => {
      const shipmentNo1 = new ShipmentNumber('SHP1234567890123');
      const shipmentNo2 = new ShipmentNumber('SHP1234567890124');

      expect(shipmentNo1.equals(shipmentNo2)).toBe(false);
      expect(shipmentNo2.equals(shipmentNo1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const shipmentNo = new ShipmentNumber('SHP1234567890123');

      expect(() => shipmentNo.equals(null as any)).toThrow();
      expect(() => shipmentNo.equals(undefined as any)).toThrow();
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'ABC1234567890123';
      const shipmentNumber = new ShipmentNumber(originalValue);

      expect(shipmentNumber.getValue()).toBe(originalValue);
      expect(typeof shipmentNumber.getValue()).toBe('string');
    });

    it('should handle string representation', () => {
      const shipmentNumber = new ShipmentNumber('SHP1234567890123');
      expect(shipmentNumber.toString()).toBe('SHP1234567890123');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only shipment numbers', () => {
      const numericNumber = '1234567890123456';
      const shipmentNumber = new ShipmentNumber(numericNumber);
      expect(shipmentNumber.getValue()).toBe(numericNumber);
    });

    it('should handle alpha-only shipment numbers', () => {
      const alphaNumber = 'ABCDEFGHIJKLMNOP';
      const shipmentNumber = new ShipmentNumber(alphaNumber);
      expect(shipmentNumber.getValue()).toBe(alphaNumber);
    });

    it('should handle mixed alphanumeric shipment numbers', () => {
      const alphanumericNumber = 'A1B2C3D4E5F6G7H8';
      const shipmentNumber = new ShipmentNumber(alphanumericNumber);
      expect(shipmentNumber.getValue()).toBe(alphanumericNumber);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroNumber = '0000000000000000';
      const shipmentNumber = new ShipmentNumber(zeroNumber);
      expect(shipmentNumber.getValue()).toBe(zeroNumber);
    });

    it('should handle all nines', () => {
      const nineNumber = '9999999999999999';
      const shipmentNumber = new ShipmentNumber(nineNumber);
      expect(shipmentNumber.getValue()).toBe(nineNumber);
    });

    it('should handle all A characters', () => {
      const aNumber = 'AAAAAAAAAAAAAAAA';
      const shipmentNumber = new ShipmentNumber(aNumber);
      expect(shipmentNumber.getValue()).toBe(aNumber);
    });

    it('should handle all Z characters', () => {
      const zNumber = 'ZZZZZZZZZZZZZZZZ';
      const shipmentNumber = new ShipmentNumber(zNumber);
      expect(shipmentNumber.getValue()).toBe(zNumber);
    });

    it('should handle different prefix patterns', () => {
      const patterns = [
        'SHP1234567890123',
        'SHIP123456789012',
        'ABC1234567890123'
      ];

      patterns.forEach(pattern => {
        const shipmentNumber = new ShipmentNumber(pattern);
        expect(shipmentNumber.getValue()).toBe(pattern);
      });
    });
  });
});