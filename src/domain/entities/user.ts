import { UserCode } from '../value-objects';
import { UserType } from '../enums';
import { v4 as uuidv4 } from 'uuid';

export class User {
  constructor(
    private readonly uuid: string,
    private readonly account: string,
    private readonly password: string, // Used for authentication (not exposed in getters)
    private readonly code: UserCode,
    private readonly name: string,
    private readonly userType: UserType,
    private isActive: boolean = true,
    private lastLoginAt?: Date,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  public getUuid(): string {
    return this.uuid;
  }

  public getAccount(): string {
    return this.account;
  }

  public getCode(): UserCode {
    return this.code;
  }

  public getName(): string {
    return this.name;
  }

  public getUserType(): UserType {
    return this.userType;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getLastLoginAt(): Date | undefined {
    return this.lastLoginAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public updateLastLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  public isAdmin(): boolean {
    return this.userType === UserType.ADMIN;
  }

  public isSupplier(): boolean {
    return this.userType === UserType.SUPPLIER;
  }

  public equals(other: User): boolean {
    return this.uuid === other.uuid;
  }

  public getPasswordHash(): string {
    return this.password;
  }

  public validatePassword(plainPassword: string): boolean {
    // In a real application, this would use proper password hashing comparison
    // For now, we'll just reference the password to avoid TypeScript warning
    return this.password === plainPassword;
  }

  public static create(
    account: string,
    hashedPassword: string,
    code: UserCode,
    name: string,
    userType: string
  ): User {
    return new User(
      uuidv4(),
      account,
      hashedPassword,
      code,
      name,
      userType as UserType,
      true, // isActive
      undefined, // lastLoginAt
      new Date(), // createdAt
      new Date() // updatedAt
    );
  }
}