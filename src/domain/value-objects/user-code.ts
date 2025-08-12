export class UserCode {
  private readonly value: string;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('User code cannot be empty');
    }

    if (value.length !== 3) {
      throw new Error('User code must be exactly 3 characters');
    }

    if (!/^[A-Z0-9]+$/.test(value)) {
      throw new Error('User code must contain only uppercase letters and numbers');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: UserCode): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}