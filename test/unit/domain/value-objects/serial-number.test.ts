/**
 * SerialNumber Value Object Unit Tests (Fixed Version)
 * 
 * Test Logic:
 * Tests the SerialNumber value object validation and behavior including:
 * - Valid serial number format validation (exactly 4 digits)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between SerialNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid serial numbers: "0001", "1234", "9999"
 * - Invalid formats: null, undefined, empty string, wrong length, non-numeric
 * - Different serial numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: SerialNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { SerialNumber } from '../../../../src/domain/value-objects/serial-number';

describe('SerialNumber Value Object (Fixed)', () => {
  describe('Constructor Validation', () => {
    it('should create SerialNumber with valid 4-digit format', () => {
      const validSerialNumbers = [
        '0001',
        '1234',
        '9999',
        '0000',
        '5678'
      ];

      validSerialNumbers.forEach(serialNo => {
        const serialNumber = new SerialNumber(serialNo);
        expect(serialNumber.getValue()).toBe(serialNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new SerialNumber(null as any)).toThrow('Serial number cannot be empty');
      expect(() => new SerialNumber(undefined as any)).toThrow('Serial number cannot be empty');
    });

    it('should throw error for empty string', () => {
      expect(() => new SerialNumber('')).toThrow('Serial number cannot be empty');
      expect(() => new SerialNumber('   ')).toThrow('Serial number must be exactly 4 characters');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        '123',      // 3 digits (too short)
        '12345',    // 5 digits (too long)
        '12',       // 2 digits (too short)
        '123456'    // 6 digits (too long)
      ];

      invalidLengths.forEach(serialNo => {
        expect(() => new SerialNumber(serialNo)).toThrow('Serial number must be exactly 4 characters');
      });
    });

    it('should throw error for non-numeric characters', () => {
      const invalidCharacters = [
        'ABC1',     // Letters
        '12A3',     // Letter in middle
        '123@',     // Special character
        '12-3',     // Hyphen
        '12 3'      // Space
      ];

      invalidCharacters.forEach(serialNo => {
        expect(() => new SerialNumber(serialNo)).toThrow('Serial number must be 4 digits');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same serial number values', () => {
      const serialNo1 = new SerialNumber('1234');
      const serialNo2 = new SerialNumber('1234');

      expect(serialNo1.equals(serialNo2)).toBe(true);
      expect(serialNo2.equals(serialNo1)).toBe(true);
    });

    it('should not be equal for different serial number values', () => {
      const serialNo1 = new SerialNumber('1234');
      const serialNo2 = new SerialNumber('5678');

      expect(serialNo1.equals(serialNo2)).toBe(false);
      expect(serialNo2.equals(serialNo1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const serialNo = new SerialNumber('1234');

      expect(() => serialNo.equals(null as any)).toThrow();
      expect(() => serialNo.equals(undefined as any)).toThrow();
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = '5678';
      const serialNumber = new SerialNumber(originalValue);

      expect(serialNumber.getValue()).toBe(originalValue);
      expect(typeof serialNumber.getValue()).toBe('string');
    });

    it('should handle string representation', () => {
      const serialNumber = new SerialNumber('1234');
      expect(serialNumber.toString()).toBe('1234');
    });

    it('should preserve leading zeros', () => {
      const serialWithLeadingZeros = '0001';
      const serialNumber = new SerialNumber(serialWithLeadingZeros);
      expect(serialNumber.getValue()).toBe(serialWithLeadingZeros);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroSerial = '0000';
      const serialNumber = new SerialNumber(zeroSerial);
      expect(serialNumber.getValue()).toBe(zeroSerial);
    });

    it('should handle all nines', () => {
      const nineSerial = '9999';
      const serialNumber = new SerialNumber(nineSerial);
      expect(serialNumber.getValue()).toBe(nineSerial);
    });

    it('should handle middle values', () => {
      const middleValues = [
        '0123',
        '4567',
        '7890',
        '5432'
      ];

      middleValues.forEach(value => {
        const serialNumber = new SerialNumber(value);
        expect(serialNumber.getValue()).toBe(value);
      });
    });
  });
});