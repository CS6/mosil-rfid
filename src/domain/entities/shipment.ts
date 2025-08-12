import { ShipmentNumber, UserCode } from '../value-objects';
import { ShipmentStatus } from '../enums';
import { Box } from './box';

export class Shipment {
  private boxes: Box[] = [];

  constructor(
    private readonly shipmentNo: ShipmentNumber,
    private readonly userCode: UserCode,
    private readonly createdBy: string,
    private status: ShipmentStatus = ShipmentStatus.CREATED,
    private note?: string,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  public getShipmentNo(): ShipmentNumber {
    return this.shipmentNo;
  }

  public getUserCode(): UserCode {
    return this.userCode;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getStatus(): ShipmentStatus {
    return this.status;
  }

  public getNote(): string | undefined {
    return this.note;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getBoxes(): Box[] {
    return [...this.boxes];
  }

  public getBoxCount(): number {
    return this.boxes.length;
  }

  public addBox(box: Box): void {
    if (this.status === ShipmentStatus.SHIPPED) {
      throw new Error('Cannot add boxes to shipped shipment');
    }

    if (box.isAssignedToShipment()) {
      throw new Error('Box is already assigned to another shipment');
    }

    this.boxes.push(box);
    box.assignToShipment(this.shipmentNo);
    this.updatedAt = new Date();
  }

  public removeBox(boxNo: string): void {
    if (this.status === ShipmentStatus.SHIPPED) {
      throw new Error('Cannot remove boxes from shipped shipment');
    }

    const index = this.boxes.findIndex(
      b => b.getBoxNo().getValue() === boxNo
    );

    if (index !== -1) {
      const removed = this.boxes.splice(index, 1)[0];
      removed.removeFromShipment();
      this.updatedAt = new Date();
    }
  }

  public ship(): void {
    if (this.status === ShipmentStatus.SHIPPED) {
      throw new Error('Shipment is already shipped');
    }

    if (this.boxes.length === 0) {
      throw new Error('Cannot ship empty shipment');
    }

    this.status = ShipmentStatus.SHIPPED;
    this.updatedAt = new Date();
  }

  public updateNote(note: string): void {
    this.note = note;
    this.updatedAt = new Date();
  }

  public isShipped(): boolean {
    return this.status === ShipmentStatus.SHIPPED;
  }

  public equals(other: Shipment): boolean {
    return this.shipmentNo.equals(other.shipmentNo);
  }
}