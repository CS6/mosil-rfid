export class SystemLog {
  constructor(
    private readonly id: bigint,
    private readonly userUuid: string,
    private readonly action: string,
    private readonly targetType: string | undefined,
    private readonly targetId: string | undefined,
    private readonly description: string | undefined,
    private readonly ipAddress: string | undefined,
    private readonly createdAt: Date = new Date()
  ) {}

  public getId(): bigint {
    return this.id;
  }

  public getUserUuid(): string {
    return this.userUuid;
  }

  public getAction(): string {
    return this.action;
  }

  public getTargetType(): string | undefined {
    return this.targetType;
  }

  public getTargetId(): string | undefined {
    return this.targetId;
  }

  public getDescription(): string | undefined {
    return this.description;
  }

  public getIpAddress(): string | undefined {
    return this.ipAddress;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public equals(other: SystemLog): boolean {
    return this.id === other.id;
  }

  public static createLog(
    userUuid: string,
    action: string,
    targetType?: string,
    targetId?: string,
    description?: string,
    ipAddress?: string
  ): SystemLog {
    return new SystemLog(
      BigInt(0), // Will be set by the database
      userUuid,
      action,
      targetType,
      targetId,
      description,
      ipAddress,
      new Date()
    );
  }
}