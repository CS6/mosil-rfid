import { RfidTag, SKU, ProductNumber, SerialNumber, BoxNumber } from '../value-objects';

export class ProductRfid {
  constructor(
    private readonly rfid: RfidTag,
    private readonly sku: SKU,
    private readonly productNo: ProductNumber,
    private readonly serialNo: SerialNumber,
    private readonly createdBy: string,
    private boxNo?: BoxNumber,
    private readonly createdAt: Date = new Date()
  ) {}

  public getRfid(): RfidTag {
    return this.rfid;
  }

  public getSku(): SKU {
    return this.sku;
  }

  public getProductNo(): ProductNumber {
    return this.productNo;
  }

  public getSerialNo(): SerialNumber {
    return this.serialNo;
  }

  public getBoxNo(): BoxNumber | undefined {
    return this.boxNo;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public assignToBox(boxNo: BoxNumber): void {
    this.boxNo = boxNo;
  }

  public removeFromBox(): void {
    this.boxNo = undefined;
  }

  public isAssignedToBox(): boolean {
    return this.boxNo !== undefined;
  }

  public equals(other: ProductRfid): boolean {
    return this.rfid.equals(other.rfid);
  }
}