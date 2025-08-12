export class ProductNumber {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Product number cannot be empty');
    }

    if (value.length !== 8) {
      throw new Error('Product number must be exactly 8 characters');
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      throw new Error('Product number must contain only uppercase letters and numbers');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ProductNumber): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}