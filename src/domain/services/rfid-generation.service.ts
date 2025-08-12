import { RfidTag, SKU, ProductNumber, SerialNumber } from '../value-objects';
import { ProductRfid } from '../entities';
import { IProductRfidRepository } from '../interfaces/repositories';

export class RfidGenerationService {
  constructor(private productRfidRepository: IProductRfidRepository) {}

  public async generateRfid(
    sku: SKU,
    productNo: ProductNumber,
    serialNo: SerialNumber,
    createdBy: string
  ): Promise<ProductRfid> {
    // 驗證 ProductNo 必須是 SKU 的前 8 碼
    const skuValue = sku.getValue();
    const productNoValue = productNo.getValue();
    
    if (skuValue.substring(0, 8) !== productNoValue) {
      throw new Error(`ProductNo ${productNoValue} does not match SKU prefix ${skuValue.substring(0, 8)}`);
    }

    const rfidValue = this.generateRfidValue(sku, productNo, serialNo);
    const rfidTag = new RfidTag(rfidValue);

    const existingRfid = await this.productRfidRepository.findByRfid(rfidTag);
    if (existingRfid) {
      throw new Error(`RFID ${rfidValue} already exists`);
    }

    return new ProductRfid(
      rfidTag,
      sku,
      productNo,
      serialNo,
      createdBy
    );
  }

  private generateRfidValue(
    sku: SKU,
    productNo: ProductNumber,
    serialNo: SerialNumber
  ): string {
    // RFID = SKU (13碼) + SerialNo (4碼) = 17碼
    const skuValue = sku.getValue();
    const serialValue = serialNo.getValue();
    
    return `${skuValue}${serialValue}`;
  }
}