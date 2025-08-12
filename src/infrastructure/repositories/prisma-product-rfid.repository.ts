import { PrismaClient } from '@prisma/client';
import { 
  ProductRfid, 
  IProductRfidRepository, 
  RfidTag, 
  SKU, 
  ProductNumber, 
  SerialNumber, 
  BoxNumber 
} from '../../domain';

export class PrismaProductRfidRepository implements IProductRfidRepository {
  constructor(private prisma: PrismaClient) {}

  async findByRfid(rfid: RfidTag): Promise<ProductRfid | null> {
    const rfidData = await this.prisma.productRfid.findUnique({
      where: { rfid: rfid.getValue() }
    });

    return rfidData ? this.toDomainEntity(rfidData) : null;
  }

  async findBySku(sku: SKU): Promise<ProductRfid[]> {
    const rfidData = await this.prisma.productRfid.findMany({
      where: { sku: sku.getValue() }
    });

    return rfidData.map(data => this.toDomainEntity(data));
  }

  async findByBoxNo(boxNo: BoxNumber): Promise<ProductRfid[]> {
    const rfidData = await this.prisma.productRfid.findMany({
      where: { boxNo: boxNo.getValue() }
    });

    return rfidData.map(data => this.toDomainEntity(data));
  }

  async save(productRfid: ProductRfid): Promise<void> {
    const data = {
      rfid: productRfid.getRfid().getValue(),
      sku: productRfid.getSku().getValue(),
      productNo: productRfid.getProductNo().getValue(),
      serialNo: productRfid.getSerialNo().getValue(),
      boxNo: productRfid.getBoxNo()?.getValue(),
      createdBy: productRfid.getCreatedBy(),
      createdAt: productRfid.getCreatedAt()
    };

    await this.prisma.productRfid.upsert({
      where: { rfid: productRfid.getRfid().getValue() },
      create: data,
      update: data
    });
  }

  async delete(rfid: RfidTag): Promise<void> {
    await this.prisma.productRfid.delete({
      where: { rfid: rfid.getValue() }
    });
  }

  private toDomainEntity(rfidData: any): ProductRfid {
    return new ProductRfid(
      new RfidTag(rfidData.rfid),
      new SKU(rfidData.sku),
      new ProductNumber(rfidData.productNo),
      new SerialNumber(rfidData.serialNo),
      rfidData.createdBy,
      rfidData.boxNo ? new BoxNumber(rfidData.boxNo) : undefined,
      rfidData.createdAt
    );
  }
}