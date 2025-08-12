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
    const skuValue = sku.getValue();
    const productValue = productNo.getValue();
    const serialValue = serialNo.getValue();
    
    const combined = `${skuValue}${productValue}${serialValue}`;
    
    const hash = this.simpleHash(combined);
    const hexHash = hash.toString(16).toUpperCase().padStart(17, '0');
    
    return hexHash.substring(0, 17);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}