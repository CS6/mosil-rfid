/**
 * Box Entity Unit Tests
 * 
 * Test Logic:
 * Tests the Box entity behavior and business rules including:
 * - Box creation with valid parameters
 * - ProductRfid addition and removal operations
 * - Shipment assignment and validation
 * - Product count calculation
 * - Box state validation (assigned/unassigned to shipment)
 * 
 * Test Inputs:
 * - Valid Box construction: BoxNumber, code, createdBy, optional shipmentNo
 * - ProductRfid instances for addition/removal
 * - ShipmentNumber for assignment operations
 * 
 * Expected Outputs:
 * - Box instance with correct properties
 * - Accurate product count after RFID operations
 * - Correct assignment status
 * - Appropriate errors for invalid operations
 */

import { Box } from '../../../../src/domain/entities/box';
import { ProductRfid } from '../../../../src/domain/entities/product-rfid';
import { BoxNumber, ShipmentNumber, RfidTag, SKU, ProductNumber, SerialNumber } from '../../../../src/domain/value-objects';

describe('Box Entity', () => {
  let validBoxNumber: BoxNumber;
  let validCode: string;
  let validCreatedBy: string;
  let validShipmentNumber: ShipmentNumber;
  let sampleProductRfid: ProductRfid;

  beforeEach(() => {
    validBoxNumber = new BoxNumber('B001202500001');
    validCode = '001';
    validCreatedBy = 'test-user-uuid';
    validShipmentNumber = new ShipmentNumber('S001202500001');
    
    sampleProductRfid = new ProductRfid(
      new RfidTag('A252600201234ABCD'),
      new SKU('SKU-001'),
      new ProductNumber('P001'),
      new SerialNumber('SN001'),
      validCreatedBy
    );
  });

  describe('Constructor', () => {
    it('should create Box with valid parameters', () => {
      const box = new Box(
        validBoxNumber,
        validCode,
        validCreatedBy
      );

      expect(box.getBoxNo()).toBe(validBoxNumber);
      expect(box.getCode()).toBe(validCode);
      expect(box.getCreatedBy()).toBe(validCreatedBy);
      expect(box.getShipmentNo()).toBeUndefined();
      expect(box.getProductCount()).toBe(0);
      expect(box.getCreatedAt()).toBeInstanceOf(Date);
      expect(box.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create Box with shipment number', () => {
      const box = new Box(
        validBoxNumber,
        validCode,
        validCreatedBy,
        validShipmentNumber
      );

      expect(box.getShipmentNo()).toBe(validShipmentNumber);
      expect(box.isAssignedToShipment()).toBe(true);
    });

    it('should create Box with custom timestamps', () => {
      const customCreatedAt = new Date('2025-01-01');
      const customUpdatedAt = new Date('2025-01-02');

      const box = new Box(
        validBoxNumber,
        validCode,
        validCreatedBy,
        undefined,
        customCreatedAt,
        customUpdatedAt
      );

      expect(box.getCreatedAt()).toBe(customCreatedAt);
      expect(box.getUpdatedAt()).toBe(customUpdatedAt);
    });
  });

  describe('ProductRfid Management', () => {
    let box: Box;

    beforeEach(() => {
      box = new Box(validBoxNumber, validCode, validCreatedBy);
    });

    it('should add ProductRfid successfully', () => {
      box.addProductRfid(sampleProductRfid);

      expect(box.getProductCount()).toBe(1);
      expect(box.getProductRfids()).toContain(sampleProductRfid);
    });

    it('should add multiple ProductRfids', () => {
      const secondProductRfid = new ProductRfid(
        new RfidTag('B252600201234ABCD'),
        new SKU('SKU-002'),
        new ProductNumber('P002'),
        new SerialNumber('SN002'),
        validCreatedBy
      );

      box.addProductRfid(sampleProductRfid);
      box.addProductRfid(secondProductRfid);

      expect(box.getProductCount()).toBe(2);
      expect(box.getProductRfids()).toHaveLength(2);
    });

    it('should prevent adding duplicate RFID', () => {
      box.addProductRfid(sampleProductRfid);

      expect(() => {
        box.addProductRfid(sampleProductRfid);
      }).toThrow('RFID A252600201234ABCD is already in this box');
    });

    it('should remove ProductRfid successfully', () => {
      box.addProductRfid(sampleProductRfid);
      expect(box.getProductCount()).toBe(1);

      box.removeProductRfid(sampleProductRfid.getRfid().getValue());
      expect(box.getProductCount()).toBe(0);
      expect(box.getProductRfids()).not.toContain(sampleProductRfid);
    });

    it('should throw error when removing non-existent RFID', () => {
      expect(() => {
        box.removeProductRfid('A252600201234ABCD');
      }).toThrow('RFID A252600201234ABCD not found in this box');
    });

    it('should get ProductRfids as readonly array', () => {
      box.addProductRfid(sampleProductRfid);
      const productRfids = box.getProductRfids();

      expect(productRfids).toHaveLength(1);
      expect(productRfids[0]).toBe(sampleProductRfid);
    });
  });

  describe('Shipment Assignment', () => {
    let box: Box;

    beforeEach(() => {
      box = new Box(validBoxNumber, validCode, validCreatedBy);
    });

    it('should assign to shipment successfully', () => {
      box.assignToShipment(validShipmentNumber);

      expect(box.getShipmentNo()).toBe(validShipmentNumber);
      expect(box.isAssignedToShipment()).toBe(true);
    });

    it('should prevent reassignment to different shipment', () => {
      const anotherShipmentNumber = new ShipmentNumber('S002202500001');
      
      box.assignToShipment(validShipmentNumber);

      expect(() => {
        box.assignToShipment(anotherShipmentNumber);
      }).toThrow('Box is already assigned to shipment S001202500001');
    });

    it('should allow assignment to same shipment', () => {
      box.assignToShipment(validShipmentNumber);
      
      // Should not throw error
      expect(() => {
        box.assignToShipment(validShipmentNumber);
      }).not.toThrow();
    });

    it('should unassign from shipment', () => {
      box.assignToShipment(validShipmentNumber);
      expect(box.isAssignedToShipment()).toBe(true);

      box.unassignFromShipment();
      expect(box.getShipmentNo()).toBeUndefined();
      expect(box.isAssignedToShipment()).toBe(false);
    });
  });

  describe('Business Rules Validation', () => {
    let box: Box;

    beforeEach(() => {
      box = new Box(validBoxNumber, validCode, validCreatedBy);
    });

    it('should prevent adding RFID when assigned to shipment', () => {
      box.assignToShipment(validShipmentNumber);

      expect(() => {
        box.addProductRfid(sampleProductRfid);
      }).toThrow('Cannot modify box contents when assigned to a shipment');
    });

    it('should prevent removing RFID when assigned to shipment', () => {
      box.addProductRfid(sampleProductRfid);
      box.assignToShipment(validShipmentNumber);

      expect(() => {
        box.removeProductRfid(sampleProductRfid.getRfid().getValue());
      }).toThrow('Cannot modify box contents when assigned to a shipment');
    });

    it('should allow RFID operations when not assigned to shipment', () => {
      // Should not throw any errors
      expect(() => {
        box.addProductRfid(sampleProductRfid);
        box.removeProductRfid(sampleProductRfid.getRfid().getValue());
      }).not.toThrow();
    });
  });

  describe('Timestamp Management', () => {
    let box: Box;

    beforeEach(() => {
      box = new Box(validBoxNumber, validCode, validCreatedBy);
    });

    it('should update timestamp when adding ProductRfid', () => {
      const originalUpdatedAt = box.getUpdatedAt();
      
      // Wait a small amount to ensure timestamp difference
      setTimeout(() => {
        box.addProductRfid(sampleProductRfid);
        expect(box.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });

    it('should update timestamp when removing ProductRfid', () => {
      box.addProductRfid(sampleProductRfid);
      const originalUpdatedAt = box.getUpdatedAt();
      
      setTimeout(() => {
        box.removeProductRfid(sampleProductRfid.getRfid().getValue());
        expect(box.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });

    it('should update timestamp when assigning to shipment', () => {
      const originalUpdatedAt = box.getUpdatedAt();
      
      setTimeout(() => {
        box.assignToShipment(validShipmentNumber);
        expect(box.getUpdatedAt().getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty product list correctly', () => {
      const box = new Box(validBoxNumber, validCode, validCreatedBy);
      
      expect(box.getProductCount()).toBe(0);
      expect(box.getProductRfids()).toHaveLength(0);
    });

    it('should handle large number of ProductRfids', () => {
      const box = new Box(validBoxNumber, validCode, validCreatedBy);
      const productRfids: ProductRfid[] = [];

      // Add 100 ProductRfids
      for (let i = 0; i < 100; i++) {
        const rfid = new ProductRfid(
          new RfidTag(`A25260020123${i.toString().padStart(4, '0')}`),
          new SKU(`SKU-${i.toString().padStart(3, '0')}`),
          new ProductNumber(`P${i.toString().padStart(3, '0')}`),
          new SerialNumber(`SN${i.toString().padStart(3, '0')}`),
          validCreatedBy
        );
        productRfids.push(rfid);
        box.addProductRfid(rfid);
      }

      expect(box.getProductCount()).toBe(100);
      expect(box.getProductRfids()).toHaveLength(100);
    });

    it('should maintain data integrity after multiple operations', () => {
      const box = new Box(validBoxNumber, validCode, validCreatedBy);
      
      // Add RFIDs
      box.addProductRfid(sampleProductRfid);
      const secondRfid = new ProductRfid(
        new RfidTag('B252600201234ABCD'),
        new SKU('SKU-002'),
        new ProductNumber('P002'),
        new SerialNumber('SN002'),
        validCreatedBy
      );
      box.addProductRfid(secondRfid);

      // Remove one RFID
      box.removeProductRfid(sampleProductRfid.getRfid().getValue());

      // Assign to shipment
      box.assignToShipment(validShipmentNumber);

      expect(box.getProductCount()).toBe(1);
      expect(box.isAssignedToShipment()).toBe(true);
      expect(box.getProductRfids()).toContain(secondRfid);
      expect(box.getProductRfids()).not.toContain(sampleProductRfid);
    });
  });
});