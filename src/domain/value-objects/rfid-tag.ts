export class RfidTag {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('RFID tag cannot be empty');
    }

    if (value.length !== 17) {
      throw new Error('RFID tag must be exactly 17 characters');
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      throw new Error('RFID tag must contain only uppercase letters and numbers');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: RfidTag): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}