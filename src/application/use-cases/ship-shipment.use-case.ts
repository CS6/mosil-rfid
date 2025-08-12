import { 
  IShipmentRepository, 
  IUserRepository,
  ShipmentNumber,
  AuditService
} from '../../domain';
import { ShipShipmentRequest, ShipmentResponse } from '../dtos';

export class ShipShipmentUseCase {
  constructor(
    private shipmentRepository: IShipmentRepository,
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: ShipShipmentRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<ShipmentResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    const shipmentNo = new ShipmentNumber(request.shipmentNo);

    const shipment = await this.shipmentRepository.findByShipmentNo(shipmentNo);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    shipment.ship();
    
    await this.shipmentRepository.save(shipment);

    await this.auditService.logShipmentShipped(
      userUuid,
      shipment.getShipmentNo().getValue(),
      shipment.getBoxCount(),
      ipAddress
    );

    return {
      shipmentNo: shipment.getShipmentNo().getValue(),
      userCode: shipment.getUserCode().getValue(),
      boxCount: shipment.getBoxCount(),
      status: shipment.getStatus(),
      note: shipment.getNote(),
      createdBy: shipment.getCreatedBy(),
      createdAt: shipment.getCreatedAt(),
      updatedAt: shipment.getUpdatedAt()
    };
  }
}