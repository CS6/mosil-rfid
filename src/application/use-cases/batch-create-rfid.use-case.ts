import { 
  IProductRfidRepository, 
  IUserRepository,
  SKU, 
  ProductNumber, 
  SerialNumber,
  RfidGenerationService,
  AuditService
} from '../../domain';
import { BatchCreateRfidRequest, BatchRfidResponse } from '../dtos';

export class BatchCreateRfidUseCase {
  constructor(
    private productRfidRepository: IProductRfidRepository,
    private userRepository: IUserRepository,
    private rfidGenerationService: RfidGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: BatchCreateRfidRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<BatchRfidResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    // 驗證請求參數
    const sku = new SKU(request.sku);
    const productNo = new ProductNumber(request.productNo);
    const startSerial = parseInt(request.startSerialNo, 10);

    if (isNaN(startSerial) || startSerial < 1 || startSerial > 9999) {
      throw new Error('Invalid start serial number');
    }

    if (request.quantity < 1 || request.quantity > 1000) {
      throw new Error('Quantity must be between 1 and 1000');
    }

    // 批次處理結果
    const results: BatchRfidResponse['rfids'] = [];
    let created = 0;
    let failed = 0;

    for (let i = 0; i < request.quantity; i++) {
      const currentSerial = startSerial + i;
      
      // 檢查是否超過 4 位數
      if (currentSerial > 9999) {
        results.push({
          rfid: '',
          sku: request.sku,
          productNo: request.productNo,
          serialNo: currentSerial.toString().padStart(4, '0'),
          status: 'skipped',
          reason: 'Serial number exceeds 9999'
        });
        failed++;
        continue;
      }

      const serialNoStr = currentSerial.toString().padStart(4, '0');
      const serialNo = new SerialNumber(serialNoStr);

      try {
        // 檢查是否已存在
        const existingRfids = await this.productRfidRepository.findBySku(sku);
        const existingSerial = existingRfids.find(
          rfid => rfid.getSerialNo().equals(serialNo)
        );
        
        if (existingSerial) {
          results.push({
            rfid: existingSerial.getRfid().getValue(),
            sku: request.sku,
            productNo: request.productNo,
            serialNo: serialNoStr,
            status: 'skipped',
            reason: 'Serial number already exists'
          });
          failed++;
          continue;
        }

        // 產生新的 RFID
        const productRfid = await this.rfidGenerationService.generateRfid(
          sku,
          productNo,
          serialNo,
          userUuid
        );

        await this.productRfidRepository.save(productRfid);

        results.push({
          rfid: productRfid.getRfid().getValue(),
          sku: productRfid.getSku().getValue(),
          productNo: productRfid.getProductNo().getValue(),
          serialNo: productRfid.getSerialNo().getValue(),
          status: 'created'
        });
        created++;

      } catch (error) {
        results.push({
          rfid: '',
          sku: request.sku,
          productNo: request.productNo,
          serialNo: serialNoStr,
          status: 'skipped',
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    // 記錄審計日誌
    await this.auditService.logAction(
      userUuid,
      'BATCH_CREATE_RFID',
      'ProductRfid',
      sku.getValue(),
      `Batch created ${created} RFIDs for SKU: ${sku.getValue()}, starting from ${request.startSerialNo}`,
      ipAddress
    );

    return {
      totalRequested: request.quantity,
      totalCreated: created,
      failed: failed,
      rfids: results
    };
  }
}