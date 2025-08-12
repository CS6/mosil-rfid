import { 
  IBoxRepository, 
  IProductRfidRepository,
  IUserRepository,
  BoxNumber,
  RfidTag,
  AuditService
} from '../../domain';
import { RemoveRfidFromBoxRequest, BoxDetailResponse } from '../dtos';

export class RemoveRfidFromBoxUseCase {
  constructor(
    private boxRepository: IBoxRepository,
    private productRfidRepository: IProductRfidRepository,
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: RemoveRfidFromBoxRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<BoxDetailResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    const boxNo = new BoxNumber(request.boxNo);
    const rfidTag = new RfidTag(request.rfid);

    const box = await this.boxRepository.findByBoxNo(boxNo);
    if (!box) {
      throw new Error('Box not found');
    }

    if (box.isAssignedToShipment()) {
      throw new Error('Cannot modify box that is assigned to a shipment');
    }

    const productRfid = await this.productRfidRepository.findByRfid(rfidTag);
    if (!productRfid) {
      throw new Error('RFID not found');
    }

    if (!productRfid.isAssignedToBox()) {
      throw new Error('RFID is not assigned to any box');
    }

    if (productRfid.getBoxNo()?.getValue() !== request.boxNo) {
      throw new Error('RFID is not assigned to this box');
    }

    box.removeProductRfid(rfidTag.getValue());
    
    await this.boxRepository.save(box);
    await this.productRfidRepository.save(productRfid);

    await this.auditService.logAction(
      userUuid,
      'REMOVE_RFID_FROM_BOX',
      'Box',
      box.getBoxNo().getValue(),
      `Removed RFID ${rfidTag.getValue()} from box`,
      ipAddress
    );

    const productRfids = box.getProductRfids().map(rfid => ({
      rfid: rfid.getRfid().getValue(),
      sku: rfid.getSku().getValue(),
      productNo: rfid.getProductNo().getValue(),
      serialNo: rfid.getSerialNo().getValue()
    }));

    return {
      boxNo: box.getBoxNo().getValue(),
      code: box.getCode(),
      shipmentNo: box.getShipmentNo()?.getValue(),
      productCount: box.getProductCount(),
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt(),
      productRfids
    };
  }
}