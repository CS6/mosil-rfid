import { 
  IProductRfidRepository, 
  IUserRepository,
  SKU, 
  ProductNumber, 
  SerialNumber,
  RfidGenerationService,
  AuditService
} from '../../domain';
import { CreateRfidRequest, RfidResponse } from '../dtos';

export class CreateRfidUseCase {
  constructor(
    private productRfidRepository: IProductRfidRepository,
    private userRepository: IUserRepository,
    private rfidGenerationService: RfidGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: CreateRfidRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<RfidResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    const sku = new SKU(request.sku);
    const productNo = new ProductNumber(request.productNo);
    const serialNo = new SerialNumber(request.serialNo);

    const existingRfids = await this.productRfidRepository.findBySku(sku);
    const existingSerial = existingRfids.find(
      rfid => rfid.getSerialNo().equals(serialNo)
    );
    
    if (existingSerial) {
      throw new Error(`Serial number ${serialNo.getValue()} already exists for SKU ${sku.getValue()}`);
    }

    const productRfid = await this.rfidGenerationService.generateRfid(
      sku,
      productNo,
      serialNo,
      userUuid
    );

    await this.productRfidRepository.save(productRfid);

    await this.auditService.logRfidCreation(
      userUuid,
      productRfid.getRfid().getValue(),
      sku.getValue(),
      ipAddress
    );

    return {
      rfid: productRfid.getRfid().getValue(),
      sku: productRfid.getSku().getValue(),
      productNo: productRfid.getProductNo().getValue(),
      serialNo: productRfid.getSerialNo().getValue(),
      boxNo: productRfid.getBoxNo()?.getValue(),
      createdBy: productRfid.getCreatedBy(),
      createdAt: productRfid.getCreatedAt()
    };
  }
}