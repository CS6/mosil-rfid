import { 
  IShipmentRepository, 
  IUserRepository,
  UserCode,
  ShipmentGenerationService,
  AuditService
} from '../../domain';
import { CreateShipmentRequest, ShipmentResponse } from '../dtos';

export class CreateShipmentUseCase {
  constructor(
    private shipmentRepository: IShipmentRepository,
    private userRepository: IUserRepository,
    private shipmentGenerationService: ShipmentGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: CreateShipmentRequest,
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

    const userCode = new UserCode(request.userCode);

    const shipment = await this.shipmentGenerationService.generateShipment(
      userCode, 
      userUuid, 
      request.note
    );
    
    await this.shipmentRepository.save(shipment);

    await this.auditService.logShipmentCreation(
      userUuid,
      shipment.getShipmentNo().getValue(),
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