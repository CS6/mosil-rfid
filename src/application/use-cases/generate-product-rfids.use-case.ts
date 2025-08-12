import { 
  IProductRfidRepository, 
  IUserRepository,
  RfidGenerationService,
  AuditService,
  SKU,
  ProductNumber,
  SerialNumber
} from '../../domain';
import { GenerateProductRfidsRequest, GenerateProductRfidsResponse } from '../dtos';

export class GenerateProductRfidsUseCase {
  constructor(
    private productRfidRepository: IProductRfidRepository,
    private userRepository: IUserRepository,
    private rfidGenerationService: RfidGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: GenerateProductRfidsRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<GenerateProductRfidsResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    if (request.quantity <= 0 || request.quantity > 1000) {
      throw new Error('Quantity must be between 1 and 1000');
    }

    const sku = new SKU(request.sku);
    const productNo = new ProductNumber(sku.getValue().substring(0, 8)); // Auto-derive from SKU
    
    // Generate sequential RFID tags
    const rfids: string[] = [];
    const startSerialNumber = 1;

    for (let i = 0; i < request.quantity; i++) {
      const serialNumber = new SerialNumber((startSerialNumber + i).toString().padStart(4, '0'));
      
      try {
        const productRfid = await this.rfidGenerationService.generateRfid(
          sku,
          productNo,
          serialNumber,
          userUuid
        );

        await this.productRfidRepository.save(productRfid);
        rfids.push(productRfid.getRfid().getValue());

        // Log each RFID creation
        await this.auditService.logRfidCreation(
          userUuid,
          productRfid.getRfid().getValue(),
          sku.getValue(),
          ipAddress
        );
      } catch (error) {
        // If we encounter an error, we continue but log it
        console.warn(`Failed to generate RFID for serial ${serialNumber.getValue()}: ${error}`);
      }
    }

    // Calculate start and end serial numbers
    const startSerial = startSerialNumber.toString().padStart(4, '0');
    const endSerial = (startSerialNumber + rfids.length - 1).toString().padStart(4, '0');

    return {
      sku: request.sku,
      generatedCount: rfids.length,
      startSerial,
      endSerial,
      rfids
    };
  }
}