/**
 * SKU Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the SKU (Stock Keeping Unit) value object validation and behavior including:
 * - Valid SKU format validation based on business rules
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between SKU instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid SKUs: "SKU-001", "PRODUCT-ABC-123", "12345"
 * - Invalid formats: null, undefined, empty string, too short, too long
 * - Different SKUs for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: SKU instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { SKU } from '../../../../src/domain/value-objects/sku';

describe('SKU Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create SKU with valid format', () => {
      const validSKUs = [
        'SKU-001',
        'PRODUCT-ABC-123',
        'P12345',
        '12345',
        'ABC123DEF',
        'ITEM-XYZ-789'
      ];

      validSKUs.forEach(sku => {
        const skuObject = new SKU(sku);
        expect(skuObject.getValue()).toBe(sku);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new SKU(null as any)).toThrow('SKU cannot be null or undefined');
      expect(() => new SKU(undefined as any)).toThrow('SKU cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new SKU('')).toThrow('SKU cannot be empty');
      expect(() => new SKU('   ')).toThrow('SKU cannot be empty');
    });

    it('should throw error for too short SKU', () => {
      const tooShortSKUs = [
        'A',
        'AB',
        '1',
        '12'
      ];

      tooShortSKUs.forEach(sku => {
        expect(() => new SKU(sku)).toThrow('SKU must be between 3 and 50 characters');
      });
    });

    it('should throw error for too long SKU', () => {
      const tooLongSKU = 'A'.repeat(51); // 51 characters
      expect(() => new SKU(tooLongSKU)).toThrow('SKU must be between 3 and 50 characters');
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacterSKUs = [
        'SKU@001',      // @ symbol
        'SKU 001',      // space
        'SKU#001',      // # symbol
        'SKU%001',      // % symbol
        'SKU&001'       // & symbol
      ];

      invalidCharacterSKUs.forEach(sku => {
        expect(() => new SKU(sku)).toThrow('SKU can only contain alphanumeric characters, hyphens, and underscores');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same SKU values', () => {
      const sku1 = new SKU('SKU-001');
      const sku2 = new SKU('SKU-001');

      expect(sku1.equals(sku2)).toBe(true);
      expect(sku2.equals(sku1)).toBe(true);
    });

    it('should not be equal for different SKU values', () => {
      const sku1 = new SKU('SKU-001');
      const sku2 = new SKU('SKU-002');

      expect(sku1.equals(sku2)).toBe(false);
      expect(sku2.equals(sku1)).toBe(false);
    });

    it('should be case sensitive', () => {
      const sku1 = new SKU('SKU-001');
      const sku2 = new SKU('sku-001');

      expect(sku1.equals(sku2)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const sku = new SKU('SKU-001');

      expect(sku.equals(null as any)).toBe(false);
      expect(sku.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'PRODUCT-ABC-123';
      const sku = new SKU(originalValue);

      expect(sku.getValue()).toBe(originalValue);
      expect(typeof sku.getValue()).toBe('string');
    });
  });

  describe('Format Variations', () => {
    it('should handle numeric-only SKUs', () => {
      const numericSKU = '12345';
      const sku = new SKU(numericSKU);
      expect(sku.getValue()).toBe(numericSKU);
    });

    it('should handle alpha-only SKUs', () => {
      const alphaSKU = 'ABCDEF';
      const sku = new SKU(alphaSKU);
      expect(sku.getValue()).toBe(alphaSKU);
    });

    it('should handle SKUs with hyphens', () => {
      const hyphenSKU = 'SKU-ITEM-001';
      const sku = new SKU(hyphenSKU);
      expect(sku.getValue()).toBe(hyphenSKU);
    });

    it('should handle SKUs with underscores', () => {
      const underscoreSKU = 'SKU_ITEM_001';
      const sku = new SKU(underscoreSKU);
      expect(sku.getValue()).toBe(underscoreSKU);
    });

    it('should handle mixed format SKUs', () => {
      const mixedSKU = 'P123-ABC_456';
      const sku = new SKU(mixedSKU);
      expect(sku.getValue()).toBe(mixedSKU);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum length SKU', () => {
      const minSKU = 'ABC';
      const sku = new SKU(minSKU);
      expect(sku.getValue()).toBe(minSKU);
    });

    it('should handle maximum length SKU', () => {
      const maxSKU = 'A'.repeat(50); // 50 characters
      const sku = new SKU(maxSKU);
      expect(sku.getValue()).toBe(maxSKU);
    });

    it('should handle all uppercase SKU', () => {
      const upperSKU = 'PRODUCT-ITEM-123';
      const sku = new SKU(upperSKU);
      expect(sku.getValue()).toBe(upperSKU);
    });

    it('should handle all lowercase SKU', () => {
      const lowerSKU = 'product-item-123';
      const sku = new SKU(lowerSKU);
      expect(sku.getValue()).toBe(lowerSKU);
    });

    it('should handle mixed case SKU', () => {
      const mixedSKU = 'Product-Item-123';
      const sku = new SKU(mixedSKU);
      expect(sku.getValue()).toBe(mixedSKU);
    });
  });
});