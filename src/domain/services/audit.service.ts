import { SystemLog } from '../entities';
import { ISystemLogRepository } from '../interfaces/repositories';

export class AuditService {
  constructor(private systemLogRepository: ISystemLogRepository) {}

  public async logAction(
    userUuid: string,
    action: string,
    targetType?: string,
    targetId?: string,
    description?: string,
    ipAddress?: string
  ): Promise<void> {
    const log = SystemLog.createLog(
      userUuid,
      action,
      targetType,
      targetId,
      description,
      ipAddress
    );

    await this.systemLogRepository.save(log as SystemLog);
  }

  public async logRfidCreation(
    userUuid: string,
    rfid: string,
    sku: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction(
      userUuid,
      'CREATE_RFID',
      'ProductRfid',
      rfid,
      `Created RFID for SKU: ${sku}`,
      ipAddress
    );
  }

  public async logBoxCreation(
    userUuid: string,
    boxNo: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction(
      userUuid,
      'CREATE_BOX',
      'Box',
      boxNo,
      `Created box: ${boxNo}`,
      ipAddress
    );
  }

  public async logShipmentCreation(
    userUuid: string,
    shipmentNo: string,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction(
      userUuid,
      'CREATE_SHIPMENT',
      'Shipment',
      shipmentNo,
      `Created shipment: ${shipmentNo}`,
      ipAddress
    );
  }

  public async logShipmentShipped(
    userUuid: string,
    shipmentNo: string,
    boxCount: number,
    ipAddress?: string
  ): Promise<void> {
    await this.logAction(
      userUuid,
      'SHIP_SHIPMENT',
      'Shipment',
      shipmentNo,
      `Shipped shipment with ${boxCount} boxes`,
      ipAddress
    );
  }
}