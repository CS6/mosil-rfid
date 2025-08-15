/**
 * BoxNumber Value Object Unit Tests
 *
 * Test Logic:
 * Tests the BoxNumber value object validation and behavior including:
 * - Valid box number format validation (B + 3 digits + 4 digits + 5 digits = 13 chars)
 * - Invalid format rejection with appropriate error messages
 * - Equality comparison between BoxNumber instances
 * - Value extraction functionality
 *
 * Test Inputs:
 * - Valid box numbers: "B001202500001", "B999202599999"
 * - Invalid formats: null, undefined, empty string, wrong length, wrong pattern
 * - Different box numbers for inequality testing
 *
 * Expected Outputs:
 * - Valid inputs: BoxNumber instance with correct value
 * - Invalid inputs: Error with descriptive message
 * - Equality: true for same values, false for different values
 * - getValue(): returns original string value
 */

import { BoxNumber } from "../../../../src/domain/value-objects/box-number";

describe("BoxNumber Value Object", () => {
  describe("Constructor Validation", () => {
    it("should create BoxNumber with valid format", () => {
      const validBoxNumbers = [
        "B001202500001",
        "B999202599999",
        "B123202412345",
      ];

      validBoxNumbers.forEach((boxNo) => {
        const boxNumber = new BoxNumber(boxNo);
        expect(boxNumber.getValue()).toBe(boxNo);
      });
    });

    it("should throw error for null or undefined", () => {
      expect(() => new BoxNumber(null as any)).toThrow(
        "Box number cannot be empty"
      );
      expect(() => new BoxNumber(undefined as any)).toThrow(
        "Box number cannot be empty"
      );
    });

    it("should throw error for empty string", () => {
      expect(() => new BoxNumber("")).toThrow("Box number cannot be empty");
      expect(() => new BoxNumber("   ")).toThrow(
        "Box number must be exactly 13 characters"
      );
    });

    it("should throw error for wrong length", () => {
      const invalidLengths = [
        "B00120250000", // 12 chars (too short)
        "B0012025000001", // 14 chars (too long)
        "B001", // 4 chars (too short)
        "B001202500001234", // 16 chars (too long)
      ];

      invalidLengths.forEach((boxNo) => {
        expect(() => new BoxNumber(boxNo)).toThrow(
          "Box number must be exactly 13 characters"
        );
      });
    });

    it("should throw error for invalid format pattern", () => {
      const invalidPatterns = [
        "a001202500001", // Lowercase letter
        "B00120250000a", // Lowercase letter
        "B001202500@01", // Special character
        "B001202500-01", // Hyphen
        "B001202500 01", // Space
        "B001202500.01", // Dot
      ];

      invalidPatterns.forEach((boxNo) => {
        expect(() => new BoxNumber(boxNo)).toThrow(
          "Box number must contain only uppercase letters and numbers"
        );
      });
    });
  });

  describe("Equality Comparison", () => {
    it("should be equal for same box number values", () => {
      const boxNo1 = new BoxNumber("B001202500001");
      const boxNo2 = new BoxNumber("B001202500001");

      expect(boxNo1.equals(boxNo2)).toBe(true);
      expect(boxNo2.equals(boxNo1)).toBe(true);
    });

    it("should not be equal for different box number values", () => {
      const boxNo1 = new BoxNumber("B001202500001");
      const boxNo2 = new BoxNumber("B001202500002");

      expect(boxNo1.equals(boxNo2)).toBe(false);
      expect(boxNo2.equals(boxNo1)).toBe(false);
    });

    it("should handle null comparison gracefully", () => {
      const boxNo = new BoxNumber("B001202500001");

      expect(() => boxNo.equals(null as any)).toThrow();
      expect(() => boxNo.equals(undefined as any)).toThrow();
    });
  });

  describe("Value Extraction", () => {
    it("should return original string value", () => {
      const originalValue = "B123202456789";
      const boxNumber = new BoxNumber(originalValue);

      expect(boxNumber.getValue()).toBe(originalValue);
      expect(typeof boxNumber.getValue()).toBe("string");
    });
  });

  describe("String Representation", () => {
    it("should convert to string correctly", () => {
      const boxNumber = new BoxNumber("B123202456789");
      expect(boxNumber.toString()).toBe("B123202456789");
    });
  });

  describe("Edge Cases", () => {
    it("should handle minimum valid values", () => {
      const minBoxNumber = new BoxNumber("B000200000001");
      expect(minBoxNumber.getValue()).toBe("B000200000001");
    });

    it("should handle maximum valid values", () => {
      const maxBoxNumber = new BoxNumber("B999999999999");
      expect(maxBoxNumber.getValue()).toBe("B999999999999");
    });

    it("should handle current year format", () => {
      const currentYear = new Date().getFullYear().toString();
      const boxNumber = new BoxNumber(`B001${currentYear}00001`);
      expect(boxNumber.getValue()).toBe(`B001${currentYear}00001`);
    });
  });
});


