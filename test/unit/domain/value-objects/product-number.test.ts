/**
 * ProductNumber Value Object Unit Tests (Fixed Version)
 * 
 * Test Logic:
 * Tests the ProductNumber value object validation and behavior including:
 * - Valid product number format validation (exactly 8 characters, uppercase letters and numbers)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between ProductNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid product numbers: "PROD0001", "ABC12345", "12345678"
 * - Invalid formats: null, undefined, empty string, wrong length, lowercase, special chars
 * - Different product numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: ProductNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { ProductNumber } from '../../../../src/domain/value-objects/product-number';

describe('ProductNumber Value Object (Fixed)', () => {
  describe('Constructor Validation', () => {
    it('should create ProductNumber with valid format', () => {
      const validProductNumbers = [
        'PROD0001',
        'ABC12345',
        '12345678',
        'A1B2C3D4',
        'ZZZZZ999'
      ];

      validProductNumbers.forEach(productNo => {
        const productNumber = new ProductNumber(productNo);
        expect(productNumber.getValue()).toBe(productNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ProductNumber(null as any)).toThrow('Product number cannot be empty');
      expect(() => new ProductNumber(undefined as any)).toThrow('Product number cannot be empty');
    });

    it('should throw error for empty string', () => {
      expect(() => new ProductNumber('')).toThrow('Product number cannot be empty');
      expect(() => new ProductNumber('   ')).toThrow('Product number must be exactly 8 characters');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        'P001',         // 4 chars (too short)
        'PROD001',      // 7 chars (too short) 
        'PROD00001',    // 9 chars (too long)
        'ABCDEFGHIJK'   // 11 chars (too long)
      ];

      invalidLengths.forEach(productNo => {
        expect(() => new ProductNumber(productNo)).toThrow('Product number must be exactly 8 characters');
      });
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacterNumbers = [
        'prod0001',     // lowercase
        'PROD@001',     // @ symbol
        'PROD 001',     // space
        'PROD-001',     // hyphen
        'PROD.001',     // dot
        'PROD_001'      // underscore
      ];

      invalidCharacterNumbers.forEach(productNo => {
        expect(() => new ProductNumber(productNo)).toThrow('Product number must contain only uppercase letters and numbers');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same product number values', () => {
      const productNo1 = new ProductNumber('PROD0001');
      const productNo2 = new ProductNumber('PROD0001');

      expect(productNo1.equals(productNo2)).toBe(true);
      expect(productNo2.equals(productNo1)).toBe(true);
    });

    it('should not be equal for different product number values', () => {
      const productNo1 = new ProductNumber('PROD0001');
      const productNo2 = new ProductNumber('PROD0002');

      expect(productNo1.equals(productNo2)).toBe(false);
      expect(productNo2.equals(productNo1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const productNo = new ProductNumber('PROD0001');

      expect(() => productNo.equals(null as any)).toThrow();
      expect(() => productNo.equals(undefined as any)).toThrow();
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'ABC12345';
      const productNumber = new ProductNumber(originalValue);

      expect(productNumber.getValue()).toBe(originalValue);
      expect(typeof productNumber.getValue()).toBe('string');
    });

    it('should handle string representation', () => {
      const productNumber = new ProductNumber('PROD1234');
      expect(productNumber.toString()).toBe('PROD1234');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only product numbers', () => {
      const numericNumber = '12345678';
      const productNumber = new ProductNumber(numericNumber);
      expect(productNumber.getValue()).toBe(numericNumber);
    });

    it('should handle alpha-only product numbers', () => {
      const alphaNumber = 'ABCDEFGH';
      const productNumber = new ProductNumber(alphaNumber);
      expect(productNumber.getValue()).toBe(alphaNumber);
    });

    it('should handle mixed alphanumeric product numbers', () => {
      const alphanumericNumber = 'A1B2C3D4';
      const productNumber = new ProductNumber(alphanumericNumber);
      expect(productNumber.getValue()).toBe(alphanumericNumber);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroNumber = '00000000';
      const productNumber = new ProductNumber(zeroNumber);
      expect(productNumber.getValue()).toBe(zeroNumber);
    });

    it('should handle all nines', () => {
      const nineNumber = '99999999';
      const productNumber = new ProductNumber(nineNumber);
      expect(productNumber.getValue()).toBe(nineNumber);
    });

    it('should handle all A characters', () => {
      const aNumber = 'AAAAAAAA';
      const productNumber = new ProductNumber(aNumber);
      expect(productNumber.getValue()).toBe(aNumber);
    });

    it('should handle all Z characters', () => {
      const zNumber = 'ZZZZZZZZ';
      const productNumber = new ProductNumber(zNumber);
      expect(productNumber.getValue()).toBe(zNumber);
    });
  });
});