import { BoxNumber, UserCode, ShipmentNumber } from '../value-objects';
import { ProductRfid } from './product-rfid';

export class Box {
  private productRfids: ProductRfid[] = [];

  constructor(
    private readonly boxNo: BoxNumber,
    private readonly userCode: UserCode,
    private readonly createdBy: string,
    private shipmentNo?: ShipmentNumber,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  public getBoxNo(): BoxNumber {
    return this.boxNo;
  }

  public getUserCode(): UserCode {
    return this.userCode;
  }

  public getShipmentNo(): ShipmentNumber | undefined {
    return this.shipmentNo;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getProductRfids(): ProductRfid[] {
    return [...this.productRfids];
  }

  public addProductRfid(productRfid: ProductRfid): void {
    if (productRfid.isAssignedToBox()) {
      throw new Error('Product RFID is already assigned to another box');
    }
    
    this.productRfids.push(productRfid);
    productRfid.assignToBox(this.boxNo);
    this.updatedAt = new Date();
  }

  public removeProductRfid(rfidTag: string): void {
    const index = this.productRfids.findIndex(
      p => p.getRfid().getValue() === rfidTag
    );
    
    if (index !== -1) {
      const removed = this.productRfids.splice(index, 1)[0];
      removed.removeFromBox();
      this.updatedAt = new Date();
    }
  }

  public assignToShipment(shipmentNo: ShipmentNumber): void {
    this.shipmentNo = shipmentNo;
    this.updatedAt = new Date();
  }

  public removeFromShipment(): void {
    this.shipmentNo = undefined;
    this.updatedAt = new Date();
  }

  public isAssignedToShipment(): boolean {
    return this.shipmentNo !== undefined;
  }

  public getProductCount(): number {
    return this.productRfids.length;
  }

  public equals(other: Box): boolean {
    return this.boxNo.equals(other.boxNo);
  }
}