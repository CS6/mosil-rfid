/**
 * ProductNumber Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the ProductNumber value object validation and behavior including:
 * - Valid product number format validation based on business rules
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between ProductNumber instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid product numbers: "P001", "PROD-123", "12345678"
 * - Invalid formats: null, undefined, empty string, invalid patterns
 * - Different product numbers for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: ProductNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { ProductNumber } from '../../../../src/domain/value-objects/product-number';

describe('ProductNumber Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create ProductNumber with valid format', () => {
      const validProductNumbers = [
        'P001',
        'PROD-123',
        '12345678',
        'PN-ABC-001',
        'PRODUCT123',
        'P-12345-ABC'
      ];

      validProductNumbers.forEach(productNo => {
        const productNumber = new ProductNumber(productNo);
        expect(productNumber.getValue()).toBe(productNo);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ProductNumber(null as any)).toThrow('Product number cannot be null or undefined');
      expect(() => new ProductNumber(undefined as any)).toThrow('Product number cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new ProductNumber('')).toThrow('Product number cannot be empty');
      expect(() => new ProductNumber('   ')).toThrow('Product number cannot be empty');
    });

    it('should throw error for too short product number', () => {
      const tooShortNumbers = [
        'P',
        'AB',
        '1',
        '12'
      ];

      tooShortNumbers.forEach(productNo => {
        expect(() => new ProductNumber(productNo)).toThrow('Product number must be between 3 and 30 characters');
      });
    });

    it('should throw error for too long product number', () => {
      const tooLongNumber = 'P'.repeat(31); // 31 characters
      expect(() => new ProductNumber(tooLongNumber)).toThrow('Product number must be between 3 and 30 characters');
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacterNumbers = [
        'P@001',        // @ symbol
        'PROD 123',     // space
        'P#001',        // # symbol
        'PROD%123',     // % symbol
        'P&001',        // & symbol
        'PROD!123'      // ! symbol
      ];

      invalidCharacterNumbers.forEach(productNo => {
        expect(() => new ProductNumber(productNo)).toThrow('Product number can only contain alphanumeric characters and hyphens');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same product number values', () => {
      const productNo1 = new ProductNumber('P001');
      const productNo2 = new ProductNumber('P001');

      expect(productNo1.equals(productNo2)).toBe(true);
      expect(productNo2.equals(productNo1)).toBe(true);
    });

    it('should not be equal for different product number values', () => {
      const productNo1 = new ProductNumber('P001');
      const productNo2 = new ProductNumber('P002');

      expect(productNo1.equals(productNo2)).toBe(false);
      expect(productNo2.equals(productNo1)).toBe(false);
    });

    it('should be case sensitive', () => {
      const productNo1 = new ProductNumber('P001');
      const productNo2 = new ProductNumber('p001');

      expect(productNo1.equals(productNo2)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const productNo = new ProductNumber('P001');

      expect(productNo.equals(null as any)).toBe(false);
      expect(productNo.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'PROD-ABC-123';
      const productNumber = new ProductNumber(originalValue);

      expect(productNumber.getValue()).toBe(originalValue);
      expect(typeof productNumber.getValue()).toBe('string');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only product numbers', () => {
      const numericNumber = '12345';
      const productNumber = new ProductNumber(numericNumber);
      expect(productNumber.getValue()).toBe(numericNumber);
    });

    it('should handle alpha-only product numbers', () => {
      const alphaNumber = 'PRODUCT';
      const productNumber = new ProductNumber(alphaNumber);
      expect(productNumber.getValue()).toBe(alphaNumber);
    });

    it('should handle product numbers with hyphens', () => {
      const hyphenNumber = 'PROD-001';
      const productNumber = new ProductNumber(hyphenNumber);
      expect(productNumber.getValue()).toBe(hyphenNumber);
    });

    it('should handle alphanumeric product numbers', () => {
      const alphanumericNumber = 'P123ABC';
      const productNumber = new ProductNumber(alphanumericNumber);
      expect(productNumber.getValue()).toBe(alphanumericNumber);
    });

    it('should handle complex format product numbers', () => {
      const complexNumber = 'PROD-123-ABC-456';
      const productNumber = new ProductNumber(complexNumber);
      expect(productNumber.getValue()).toBe(complexNumber);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum length product number', () => {
      const minNumber = 'P01';
      const productNumber = new ProductNumber(minNumber);
      expect(productNumber.getValue()).toBe(minNumber);
    });

    it('should handle maximum length product number', () => {
      const maxNumber = 'P'.repeat(30); // 30 characters
      const productNumber = new ProductNumber(maxNumber);
      expect(productNumber.getValue()).toBe(maxNumber);
    });

    it('should handle all uppercase product number', () => {
      const upperNumber = 'PRODUCT-123';
      const productNumber = new ProductNumber(upperNumber);
      expect(productNumber.getValue()).toBe(upperNumber);
    });

    it('should handle all lowercase product number', () => {
      const lowerNumber = 'product-123';
      const productNumber = new ProductNumber(lowerNumber);
      expect(productNumber.getValue()).toBe(lowerNumber);
    });

    it('should handle mixed case product number', () => {
      const mixedNumber = 'Product-123';
      const productNumber = new ProductNumber(mixedNumber);
      expect(productNumber.getValue()).toBe(mixedNumber);
    });

    it('should handle numbers starting with digits', () => {
      const digitNumber = '123-PROD';
      const productNumber = new ProductNumber(digitNumber);
      expect(productNumber.getValue()).toBe(digitNumber);
    });

    it('should handle consecutive hyphens', () => {
      const multiHyphenNumber = 'PROD--123';
      const productNumber = new ProductNumber(multiHyphenNumber);
      expect(productNumber.getValue()).toBe(multiHyphenNumber);
    });
  });
});