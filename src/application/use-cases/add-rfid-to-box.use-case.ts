import { 
  IBoxRepository, 
  IProductRfidRepository,
  IUserRepository,
  BoxNumber,
  RfidTag,
  AuditService
} from '../../domain';
import { AddRfidToBoxRequest, BoxDetailResponse } from '../dtos';

export class AddRfidToBoxUseCase {
  constructor(
    private boxRepository: IBoxRepository,
    private productRfidRepository: IProductRfidRepository,
    private userRepository: IUserRepository,
    private auditService: AuditService
  ) {}

  public async execute(
    request: AddRfidToBoxRequest,
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

    box.addProductRfid(productRfid);
    
    await this.boxRepository.save(box);
    await this.productRfidRepository.save(productRfid);

    await this.auditService.logAction(
      userUuid,
      'ADD_RFID_TO_BOX',
      'Box',
      box.getBoxNo().getValue(),
      `Added RFID ${rfidTag.getValue()} to box`,
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
      userCode: box.getUserCode().getValue(),
      shipmentNo: box.getShipmentNo()?.getValue(),
      productCount: box.getProductCount(),
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt(),
      productRfids
    };
  }
}