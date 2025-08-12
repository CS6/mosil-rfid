export class BoxNumber {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Box number cannot be empty');
    }

    if (value.length !== 13) {
      throw new Error('Box number must be exactly 13 characters');
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      throw new Error('Box number must contain only uppercase letters and numbers');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: BoxNumber): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}