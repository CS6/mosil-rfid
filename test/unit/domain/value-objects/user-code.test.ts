/**
 * UserCode Value Object Unit Tests (Fixed Version)
 * 
 * Test Logic:
 * Tests the UserCode value object validation and behavior including:
 * - Valid user code format validation (exactly 3 characters, uppercase letters and numbers)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between UserCode instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid user codes: "001", "ABC", "A1B", "123", "XYZ"
 * - Invalid formats: null, undefined, empty string, wrong length, lowercase, special chars
 * - Different user codes for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: UserCode instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { UserCode } from '../../../../src/domain/value-objects/user-code';

describe('UserCode Value Object (Fixed)', () => {
  describe('Constructor Validation', () => {
    it('should create UserCode with valid format', () => {
      const validUserCodes = [
        '001',
        '999',
        '123',
        'ABC',
        'XYZ',
        'A1B',
        '1A2',
        'Z9Z'
      ];

      validUserCodes.forEach(userCode => {
        const userCodeObject = new UserCode(userCode);
        expect(userCodeObject.getValue()).toBe(userCode);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new UserCode(null as any)).toThrow('User code cannot be empty');
      expect(() => new UserCode(undefined as any)).toThrow('User code cannot be empty');
    });

    it('should throw error for empty string', () => {
      expect(() => new UserCode('')).toThrow('User code cannot be empty');
      expect(() => new UserCode('   ')).toThrow('User code must contain only uppercase letters and numbers');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        '1',       // 1 char (too short)
        '12',      // 2 chars (too short)
        '1234',    // 4 chars (too long)
        'ABCDE'    // 5 chars (too long)
      ];

      invalidLengths.forEach(userCode => {
        expect(() => new UserCode(userCode)).toThrow('User code must be exactly 3 characters');
      });
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacters = [
        'abc',      // lowercase
        'a01',      // lowercase letter
        '0b1',      // lowercase letter
        '01c',      // lowercase letter
        '00@',      // special character @
        '0 1',      // space
        '0-1',      // hyphen
        '0.1',      // dot
        '0_1'       // underscore
      ];

      invalidCharacters.forEach(userCode => {
        expect(() => new UserCode(userCode)).toThrow('User code must contain only uppercase letters and numbers');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same user code values', () => {
      const userCode1 = new UserCode('ABC');
      const userCode2 = new UserCode('ABC');

      expect(userCode1.equals(userCode2)).toBe(true);
      expect(userCode2.equals(userCode1)).toBe(true);
    });

    it('should not be equal for different user code values', () => {
      const userCode1 = new UserCode('ABC');
      const userCode2 = new UserCode('XYZ');

      expect(userCode1.equals(userCode2)).toBe(false);
      expect(userCode2.equals(userCode1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const userCode = new UserCode('ABC');

      expect(() => userCode.equals(null as any)).toThrow();
      expect(() => userCode.equals(undefined as any)).toThrow();
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'A1B';
      const userCode = new UserCode(originalValue);

      expect(userCode.getValue()).toBe(originalValue);
      expect(typeof userCode.getValue()).toBe('string');
    });

    it('should handle string representation', () => {
      const userCode = new UserCode('XYZ');
      expect(userCode.toString()).toBe('XYZ');
    });

    it('should preserve leading zeros in numeric codes', () => {
      const codeWithLeadingZeros = '001';
      const userCode = new UserCode(codeWithLeadingZeros);
      expect(userCode.getValue()).toBe(codeWithLeadingZeros);
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only user codes', () => {
      const numericCode = '123';
      const userCode = new UserCode(numericCode);
      expect(userCode.getValue()).toBe(numericCode);
    });

    it('should handle alpha-only user codes', () => {
      const alphaCode = 'ABC';
      const userCode = new UserCode(alphaCode);
      expect(userCode.getValue()).toBe(alphaCode);
    });

    it('should handle mixed alphanumeric user codes', () => {
      const alphanumericCode = 'A1B';
      const userCode = new UserCode(alphanumericCode);
      expect(userCode.getValue()).toBe(alphanumericCode);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroCode = '000';
      const userCode = new UserCode(zeroCode);
      expect(userCode.getValue()).toBe(zeroCode);
    });

    it('should handle all nines', () => {
      const nineCode = '999';
      const userCode = new UserCode(nineCode);
      expect(userCode.getValue()).toBe(nineCode);
    });

    it('should handle all A characters', () => {
      const aCode = 'AAA';
      const userCode = new UserCode(aCode);
      expect(userCode.getValue()).toBe(aCode);
    });

    it('should handle all Z characters', () => {
      const zCode = 'ZZZ';
      const userCode = new UserCode(zCode);
      expect(userCode.getValue()).toBe(zCode);
    });

    it('should handle various patterns', () => {
      const patterns = [
        'A01',
        'B23',
        'Z99',
        '1A2',
        '9Z8'
      ];

      patterns.forEach(pattern => {
        const userCode = new UserCode(pattern);
        expect(userCode.getValue()).toBe(pattern);
      });
    });
  });
});