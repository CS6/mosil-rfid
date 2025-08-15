/**
 * SerialNumber Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the SerialNumber value object validation and behavior including:
 * - Valid serial number format validation based on business rules
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between SerialNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid serial numbers: "SN123456", "12345678", "ABC-123-DEF"
 * - Invalid formats: null, undefined, empty string, invalid patterns
 * - Different serial numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: SerialNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { SerialNumber } from '../../../../src/domain/value-objects/serial-number';

describe('SerialNumber Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create SerialNumber with valid format', () => {
      const validSerialNumbers = [
        'SN123456',
        '12345678',
        'ABC-123-DEF',
        'SER001',
        'SERIAL123ABC',
        'S-12345-ABC'
      ];

      validSerialNumbers.forEach(serialNo => {
        const serialNumber = new SerialNumber(serialNo);
        expect(serialNumber.getValue()).toBe(serialNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new SerialNumber(null as any)).toThrow('Serial number cannot be null or undefined');
      expect(() => new SerialNumber(undefined as any)).toThrow('Serial number cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new SerialNumber('')).toThrow('Serial number cannot be empty');
      expect(() => new SerialNumber('   ')).toThrow('Serial number cannot be empty');
    });

    it('should throw error for too short serial number', () => {
      const tooShortNumbers = [
        'S',
        'AB',
        '1',
        '12'
      ];

      tooShortNumbers.forEach(serialNo => {
        expect(() => new SerialNumber(serialNo)).toThrow('Serial number must be between 3 and 25 characters');
      });
    });

    it('should throw error for too long serial number', () => {
      const tooLongNumber = 'S'.repeat(26); // 26 characters
      expect(() => new SerialNumber(tooLongNumber)).toThrow('Serial number must be between 3 and 25 characters');
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacterNumbers = [
        'SN@123',       // @ symbol
        'SER 123',      // space
        'SN#123',       // # symbol
        'SER%123',      // % symbol
        'SN&123',       // & symbol
        'SER!123'       // ! symbol
      ];

      invalidCharacterNumbers.forEach(serialNo => {
        expect(() => new SerialNumber(serialNo)).toThrow('Serial number can only contain alphanumeric characters and hyphens');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same serial number values', () => {
      const serialNo1 = new SerialNumber('SN123456');
      const serialNo2 = new SerialNumber('SN123456');

      expect(serialNo1.equals(serialNo2)).toBe(true);
      expect(serialNo2.equals(serialNo1)).toBe(true);
    });

    it('should not be equal for different serial number values', () => {
      const serialNo1 = new SerialNumber('SN123456');
      const serialNo2 = new SerialNumber('SN123457');

      expect(serialNo1.equals(serialNo2)).toBe(false);
      expect(serialNo2.equals(serialNo1)).toBe(false);
    });

    it('should be case sensitive', () => {
      const serialNo1 = new SerialNumber('SN123456');
      const serialNo2 = new SerialNumber('sn123456');

      expect(serialNo1.equals(serialNo2)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const serialNo = new SerialNumber('SN123456');

      expect(serialNo.equals(null as any)).toBe(false);
      expect(serialNo.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'SERIAL-ABC-123';
      const serialNumber = new SerialNumber(originalValue);

      expect(serialNumber.getValue()).toBe(originalValue);
      expect(typeof serialNumber.getValue()).toBe('string');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only serial numbers', () => {
      const numericNumber = '123456789';
      const serialNumber = new SerialNumber(numericNumber);
      expect(serialNumber.getValue()).toBe(numericNumber);
    });

    it('should handle alpha-only serial numbers', () => {
      const alphaNumber = 'SERIALNUMBER';
      const serialNumber = new SerialNumber(alphaNumber);
      expect(serialNumber.getValue()).toBe(alphaNumber);
    });

    it('should handle serial numbers with hyphens', () => {
      const hyphenNumber = 'SER-001';
      const serialNumber = new SerialNumber(hyphenNumber);
      expect(serialNumber.getValue()).toBe(hyphenNumber);
    });

    it('should handle alphanumeric serial numbers', () => {
      const alphanumericNumber = 'S123ABC456';
      const serialNumber = new SerialNumber(alphanumericNumber);
      expect(serialNumber.getValue()).toBe(alphanumericNumber);
    });

    it('should handle complex format serial numbers', () => {
      const complexNumber = 'SER-123-ABC-456';
      const serialNumber = new SerialNumber(complexNumber);
      expect(serialNumber.getValue()).toBe(complexNumber);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum length serial number', () => {
      const minNumber = 'S01';
      const serialNumber = new SerialNumber(minNumber);
      expect(serialNumber.getValue()).toBe(minNumber);
    });

    it('should handle maximum length serial number', () => {
      const maxNumber = 'S'.repeat(25); // 25 characters
      const serialNumber = new SerialNumber(maxNumber);
      expect(serialNumber.getValue()).toBe(maxNumber);
    });

    it('should handle all uppercase serial number', () => {
      const upperNumber = 'SERIAL-123';
      const serialNumber = new SerialNumber(upperNumber);
      expect(serialNumber.getValue()).toBe(upperNumber);
    });

    it('should handle all lowercase serial number', () => {
      const lowerNumber = 'serial-123';
      const serialNumber = new SerialNumber(lowerNumber);
      expect(serialNumber.getValue()).toBe(lowerNumber);
    });

    it('should handle mixed case serial number', () => {
      const mixedNumber = 'Serial-123';
      const serialNumber = new SerialNumber(mixedNumber);
      expect(serialNumber.getValue()).toBe(mixedNumber);
    });

    it('should handle numbers starting with digits', () => {
      const digitNumber = '123-SER';
      const serialNumber = new SerialNumber(digitNumber);
      expect(serialNumber.getValue()).toBe(digitNumber);
    });

    it('should handle consecutive hyphens', () => {
      const multiHyphenNumber = 'SER--123';
      const serialNumber = new SerialNumber(multiHyphenNumber);
      expect(serialNumber.getValue()).toBe(multiHyphenNumber);
    });

    it('should handle all numeric with leading zeros', () => {
      const leadingZeroNumber = '000123456';
      const serialNumber = new SerialNumber(leadingZeroNumber);
      expect(serialNumber.getValue()).toBe(leadingZeroNumber);
    });
  });
});