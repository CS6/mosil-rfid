/**
 * RfidTag Value Object Unit Tests
 * 
 * Test Logic:
 * Tests the RfidTag value object validation and behavior including:
 * - Valid RFID tag format validation (17 characters, alphanumeric uppercase)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between RfidTag instances
 * - Value extraction functionality
 * 
 * Test Inputs:
 * - Valid RFID tags: "A252600201234ABCD", "Z999999999999ZZZZ"
 * - Invalid formats: null, undefined, empty string, wrong length, lowercase, special chars
 * - Different RFID tags for inequality testing
 * 
 * Expected Outputs:
 * - Valid inputs: RfidTag instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { RfidTag } from '../../../../src/domain/value-objects/rfid-tag';

describe('RfidTag Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create RfidTag with valid format', () => {
      const validRfidTags = [
        'A252600201234ABCD',
        'Z999999999999ZZZZ',
        '1234567890ABCDEFG',
        'ABCDEFGHIJKLMNOPQ'
      ];

      validRfidTags.forEach(rfid => {
        const rfidTag = new RfidTag(rfid);
        expect(rfidTag.getValue()).toBe(rfid);
      });
    });

    it('should throw error for null or undefined', () => {
      expect(() => new RfidTag(null as any)).toThrow('RFID tag cannot be null or undefined');
      expect(() => new RfidTag(undefined as any)).toThrow('RFID tag cannot be null or undefined');
    });

    it('should throw error for empty string', () => {
      expect(() => new RfidTag('')).toThrow('RFID tag cannot be empty');
      expect(() => new RfidTag('   ')).toThrow('RFID tag cannot be empty');
    });

    it('should throw error for wrong length', () => {
      const invalidLengths = [
        'A252600201234ABC',    // 16 chars (too short)
        'A252600201234ABCDE',  // 18 chars (too long)
        'A252',                // 4 chars (too short)
        'A252600201234ABCDEFGHIJK'  // 22 chars (too long)
      ];

      invalidLengths.forEach(rfid => {
        expect(() => new RfidTag(rfid)).toThrow('RFID tag must be exactly 17 characters');
      });
    });

    it('should throw error for invalid characters', () => {
      const invalidCharacters = [
        'a252600201234ABCD',  // Lowercase letter
        'A252600201234abcd',  // Lowercase letters
        'A252600201234AB@D',  // Special character
        'A252600201234AB-D',  // Hyphen
        'A252600201234AB_D',  // Underscore
        'A252600201234AB D',  // Space
        'A252600201234ABäD'   // Non-ASCII character
      ];

      invalidCharacters.forEach(rfid => {
        expect(() => new RfidTag(rfid)).toThrow('RFID tag must contain only uppercase letters and numbers');
      });
    });
  });

  describe('Equality Comparison', () => {
    it('should be equal for same RFID tag values', () => {
      const rfid1 = new RfidTag('A252600201234ABCD');
      const rfid2 = new RfidTag('A252600201234ABCD');

      expect(rfid1.equals(rfid2)).toBe(true);
      expect(rfid2.equals(rfid1)).toBe(true);
    });

    it('should not be equal for different RFID tag values', () => {
      const rfid1 = new RfidTag('A252600201234ABCD');
      const rfid2 = new RfidTag('A252600201234ABCE');

      expect(rfid1.equals(rfid2)).toBe(false);
      expect(rfid2.equals(rfid1)).toBe(false);
    });

    it('should handle null comparison gracefully', () => {
      const rfid = new RfidTag('A252600201234ABCD');

      expect(rfid.equals(null as any)).toBe(false);
      expect(rfid.equals(undefined as any)).toBe(false);
    });
  });

  describe('Value Extraction', () => {
    it('should return original string value', () => {
      const originalValue = 'Z123456789ABCDEFG';
      const rfidTag = new RfidTag(originalValue);

      expect(rfidTag.getValue()).toBe(originalValue);
      expect(typeof rfidTag.getValue()).toBe('string');
    });
  });

  describe('Format Analysis', () => {
    it('should handle numeric-only RFID tags', () => {
      const numericRfid = '12345678901234567';
      const rfidTag = new RfidTag(numericRfid);
      expect(rfidTag.getValue()).toBe(numericRfid);
    });

    it('should handle alpha-only RFID tags', () => {
      const alphaRfid = 'ABCDEFGHIJKLMNOPQ';
      const rfidTag = new RfidTag(alphaRfid);
      expect(rfidTag.getValue()).toBe(alphaRfid);
    });

    it('should handle mixed alphanumeric RFID tags', () => {
      const mixedRfid = 'A1B2C3D4E5F6G7H8I';
      const rfidTag = new RfidTag(mixedRfid);
      expect(rfidTag.getValue()).toBe(mixedRfid);
    });
  });

  describe('Edge Cases', () => {
    it('should handle all zeros', () => {
      const zeroRfid = '00000000000000000';
      const rfidTag = new RfidTag(zeroRfid);
      expect(rfidTag.getValue()).toBe(zeroRfid);
    });

    it('should handle all nines', () => {
      const nineRfid = '99999999999999999';
      const rfidTag = new RfidTag(nineRfid);
      expect(rfidTag.getValue()).toBe(nineRfid);
    });

    it('should handle all A characters', () => {
      const aRfid = 'AAAAAAAAAAAAAAAAA';
      const rfidTag = new RfidTag(aRfid);
      expect(rfidTag.getValue()).toBe(aRfid);
    });

    it('should handle all Z characters', () => {
      const zRfid = 'ZZZZZZZZZZZZZZZZZ';
      const rfidTag = new RfidTag(zRfid);
      expect(rfidTag.getValue()).toBe(zRfid);
    });
  });
});