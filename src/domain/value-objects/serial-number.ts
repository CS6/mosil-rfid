export class SerialNumber {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Serial number cannot be empty');
    }

    if (value.length !== 4) {
      throw new Error('Serial number must be exactly 4 characters');
    }

    if (!/^\d{4}$/.test(value)) {
      throw new Error('Serial number must be 4 digits');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: SerialNumber): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}