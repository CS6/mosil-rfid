/**
 * UserCode Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the UserCode value object validation and behavior including:
 * - Valid user code format validation (3 digits)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between UserCode instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid user codes: "001", "999", "123"
 * - Invalid formats: null, undefined, empty string, wrong length, non-numeric
 * - Different user codes for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: UserCode instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { UserCode } from '../../../../src/domain/value-objects/user-code';

describe('UserCode Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create UserCode with valid format', () => {
      const validUserCodes = [
        '001',
        '999',
        '123',
        '000',
        '456'
      ];

      validUserCodes.forEach(userCode => {
        const userCodeObject = new UserCode(userCode);
        expect(userCodeObject.getValue()).toBe(userCode);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new UserCode(null as any)).toThrow('User code cannot be null or undefined');
      expect(() => new UserCode(undefined as any)).toThrow('User code cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new UserCode('')).toThrow('User code cannot be empty');
      expect(() => new UserCode('   ')).toThrow('User code cannot be empty');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        '1',       // 1 digit (too short)
        '12',      // 2 digits (too short)
        '1234',    // 4 digits (too long)
        '12345'    // 5 digits (too long)
      ];

      invalidLengths.forEach(userCode => {
        expect(() => new UserCode(userCode)).toThrow('User code must be exactly 3 digits');
      });
    });

    it('should throw error for non-numeric characters', () => {
      const invalidCharacters = [
        'A01',      // Letter A
        '0B1',      // Letter B
        '01C',      // Letter C
        'ABC',      // All letters
        '1A2',      // Letter in middle
        '00@',      // Special character
        '0 1',      // Space
        '0-1'       // Hyphen
      ];

      invalidCharacters.forEach(userCode => {
        expect(() => new UserCode(userCode)).toThrow('User code must contain only digits');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same user code values', () => {
      const userCode1 = new UserCode('001');
      const userCode2 = new UserCode('001');

      expect(userCode1.equals(userCode2)).toBe(true);
      expect(userCode2.equals(userCode1)).toBe(true);
    });

    it('should not be equal for different user code values', () => {
      const userCode1 = new UserCode('001');
      const userCode2 = new UserCode('002');

      expect(userCode1.equals(userCode2)).toBe(false);
      expect(userCode2.equals(userCode1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const userCode = new UserCode('001');

      expect(userCode.equals(null as any)).toBe(false);
      expect(userCode.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = '123';
      const userCode = new UserCode(originalValue);

      expect(userCode.getValue()).toBe(originalValue);
      expect(typeof userCode.getValue()).toBe('string');
    });

    it('should preserve leading zeros', () => {
      const codeWithLeadingZeros = '001';
      const userCode = new UserCode(codeWithLeadingZeros);
      expect(userCode.getValue()).toBe(codeWithLeadingZeros);
    });
  });

  describe('Numeric Value Handling', () => {
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

    it('should handle single digit with leading zeros', () => {
      const singleDigitCodes = ['001', '002', '003', '004', '005'];
      
      singleDigitCodes.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });

    it('should handle double digit with leading zero', () => {
      const doubleDigitCodes = ['010', '020', '030', '099'];
      
      doubleDigitCodes.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });

    it('should handle three digit codes', () => {
      const threeDigitCodes = ['100', '200', '300', '999'];
      
      threeDigitCodes.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should handle sequential user codes', () => {
      const sequentialCodes = ['001', '002', '003', '004', '005'];
      
      sequentialCodes.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });

    it('should handle common user code patterns', () => {
      const commonPatterns = [
        '100',  // First hundred user
        '200',  // Second hundred user
        '500',  // Mid-range user
        '888',  // Lucky number pattern
        '123',  // Sequential pattern
        '321'   // Reverse sequential pattern
      ];
      
      commonPatterns.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum valid value', () => {
      const minCode = '000';
      const userCode = new UserCode(minCode);
      expect(userCode.getValue()).toBe(minCode);
    });

    it('should handle maximum valid value', () => {
      const maxCode = '999';
      const userCode = new UserCode(maxCode);
      expect(userCode.getValue()).toBe(maxCode);
    });

    it('should handle repeated digits', () => {
      const repeatedDigitCodes = ['111', '222', '333', '444', '555', '666', '777', '888', '999'];
      
      repeatedDigitCodes.forEach(code => {
        const userCode = new UserCode(code);
        expect(userCode.getValue()).toBe(code);
      });
    });
  });
});