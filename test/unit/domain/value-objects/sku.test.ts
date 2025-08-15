/**
 * SKU Value Object Unit Tests (Fixed Version)
 * 
 * Test Logic:
 * Tests the SKU (Stock Keeping Unit) value object validation and behavior including:
 * - Valid SKU format validation (exactly 13 characters, uppercase letters and numbers)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between SKU instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid SKUs: "SKU1234567890", "ABC1234567890", "1234567890ABC"
 * - Invalid formats: null, undefined, empty string, wrong length, lowercase, special chars
 * - Different SKUs for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: SKU instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { SKU } from '../../../../src/domain/value-objects/sku';

describe('SKU Value Object (Fixed)', () => {
  describe('Constructor Validation', () => {
    it('should create SKU with valid format', () => {
      const validSKUs = [
        'SKU1234567890',
        'ABC1234567890',
        '1234567890ABC',
        'A1B2C3D4E5F67',
        'ABCDEFGHIJK12'
      ];

      validSKUs.forEach(sku => {
        const skuObject = new SKU(sku);
        expect(skuObject.getValue()).toBe(sku);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new SKU(null as any)).toThrow('SKU cannot be empty');
      expect(() => new SKU(undefined as any)).toThrow('SKU cannot be empty');
    });

    it('should throw error for empty string', () => {
      expect(() => new SKU('')).toThrow('SKU cannot be empty');
      expect(() => new SKU('   ')).toThrow('SKU must be exactly 13 characters');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        'SKU001',           // 6 chars (too short)
        'SKU12345678901',   // 14 chars (too long)
        'ABC',              // 3 chars (too short)
        'ABCDEFGHIJKLMN'    // 15 chars (too long)
      ];

      invalidLengths.forEach(sku => {
        expect(() => new SKU(sku)).toThrow('SKU must be exactly 13 characters');
      });
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacterSKUs = [
        'sku1234567890',    // lowercase
        'SKU@123456789',    // @ symbol
        'SKU 123456789',    // space
        'SKU-123456789',    // hyphen
        'SKU.123456789',    // dot
        'SKU_123456789'     // underscore
      ];

      invalidCharacterSKUs.forEach(sku => {
        expect(() => new SKU(sku)).toThrow('SKU must contain only uppercase letters and numbers');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same SKU values', () => {
      const sku1 = new SKU('SKU1234567890');
      const sku2 = new SKU('SKU1234567890');

      expect(sku1.equals(sku2)).toBe(true);
      expect(sku2.equals(sku1)).toBe(true);
    });

    it('should not be equal for different SKU values', () => {
      const sku1 = new SKU('SKU1234567890');
      const sku2 = new SKU('SKU0987654321');

      expect(sku1.equals(sku2)).toBe(false);
      expect(sku2.equals(sku1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const sku = new SKU('SKU1234567890');

      expect(() => sku.equals(null as any)).toThrow();
      expect(() => sku.equals(undefined as any)).toThrow();
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'ABC1234567890';
      const sku = new SKU(originalValue);

      expect(sku.getValue()).toBe(originalValue);
      expect(typeof sku.getValue()).toBe('string');
    });

    it('should handle string representation', () => {
      const sku = new SKU('SKU1234567890');
      expect(sku.toString()).toBe('SKU1234567890');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only SKUs', () => {
      const numericSKU = '1234567890123';
      const sku = new SKU(numericSKU);
      expect(sku.getValue()).toBe(numericSKU);
    });

    it('should handle alpha-only SKUs', () => {
      const alphaSKU = 'ABCDEFGHIJKLM';
      const sku = new SKU(alphaSKU);
      expect(sku.getValue()).toBe(alphaSKU);
    });

    it('should handle mixed alphanumeric SKUs', () => {
      const mixedSKU = 'A1B2C3D4E5F67';
      const sku = new SKU(mixedSKU);
      expect(sku.getValue()).toBe(mixedSKU);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroSKU = '0000000000000';
      const sku = new SKU(zeroSKU);
      expect(sku.getValue()).toBe(zeroSKU);
    });

    it('should handle all nines', () => {
      const nineSKU = '9999999999999';
      const sku = new SKU(nineSKU);
      expect(sku.getValue()).toBe(nineSKU);
    });

    it('should handle all A characters', () => {
      const aSKU = 'AAAAAAAAAAAAA';
      const sku = new SKU(aSKU);
      expect(sku.getValue()).toBe(aSKU);
    });

    it('should handle all Z characters', () => {
      const zSKU = 'ZZZZZZZZZZZZZ';
      const sku = new SKU(zSKU);
      expect(sku.getValue()).toBe(zSKU);
    });

    it('should handle mixed case-sensitive patterns', () => {
      // Note: Only uppercase is allowed, so these are examples of valid patterns
      const patterns = [
        'PROD123456789',
        'ITEM987654321',
        'CODE555666777'
      ];

      patterns.forEach(pattern => {
        const sku = new SKU(pattern);
        expect(sku.getValue()).toBe(pattern);
      });
    });
  });
});