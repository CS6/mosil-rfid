export class ShipmentNumber {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Shipment number cannot be empty');
    }

    if (value.length !== 16) {
      throw new Error('Shipment number must be exactly 16 characters');
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      throw new Error('Shipment number must contain only uppercase letters and numbers');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ShipmentNumber): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}