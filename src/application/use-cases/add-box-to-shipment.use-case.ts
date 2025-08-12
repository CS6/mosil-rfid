import { 
  IShipmentRepository, 
  IBoxRepository,
  IUserRepository,
  ShipmentNumber,
  BoxNumber,
  AuditService
} from '../../domain';
import { AddBoxToShipmentRequest, ShipmentDetailResponse } from '../dtos';

export class AddBoxToShipmentUseCase {
  constructor(
    private shipmentRepository: IShipmentRepository,
    private boxRepository: IBoxRepository,
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: AddBoxToShipmentRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<ShipmentDetailResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    const shipmentNo = new ShipmentNumber(request.shipmentNo);
    const boxNo = new BoxNumber(request.boxNo);

    const shipment = await this.shipmentRepository.findByShipmentNo(shipmentNo);
    if (!shipment) {
      throw new Error('Shipment not found');
    }

    const box = await this.boxRepository.findByBoxNo(boxNo);
    if (!box) {
      throw new Error('Box not found');
    }

    if (box.getProductCount() === 0) {
      throw new Error('Cannot add empty box to shipment');
    }

    shipment.addBox(box);
    
    await this.shipmentRepository.save(shipment);
    await this.boxRepository.save(box);

    await this.auditService.logAction(
      userUuid,
      'ADD_BOX_TO_SHIPMENT',
      'Shipment',
      shipment.getShipmentNo().getValue(),
      `Added box ${boxNo.getValue()} to shipment`,
      ipAddress
    );

    const boxes = shipment.getBoxes().map(b => ({
      boxNo: b.getBoxNo().getValue(),
      productCount: b.getProductCount(),
      createdAt: b.getCreatedAt()
    }));

    return {
      shipmentNo: shipment.getShipmentNo().getValue(),
      userCode: shipment.getUserCode().getValue(),
      boxCount: shipment.getBoxCount(),
      status: shipment.getStatus(),
      note: shipment.getNote(),
      createdBy: shipment.getCreatedBy(),
      createdAt: shipment.getCreatedAt(),
      updatedAt: shipment.getUpdatedAt(),
      boxes
    };
  }
}