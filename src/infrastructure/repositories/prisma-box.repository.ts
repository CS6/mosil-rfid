import { PrismaClient } from '@prisma/client';
import { 
  Box, 
  IBoxRepository, 
  BoxNumber, 
  UserCode, 
  ShipmentNumber,
  ProductRfid,
  RfidTag,
  SKU,
  ProductNumber,
  SerialNumber
} from '../../domain';

export class PrismaBoxRepository implements IBoxRepository {
  constructor(private prisma: PrismaClient) {}

  async findByBoxNo(boxNo: BoxNumber): Promise<Box | null> {
    const boxData = await this.prisma.box.findUnique({
      where: { boxNo: boxNo.getValue() },
      include: {
        productRfids: true
      }
    });

    return boxData ? this.toDomainEntity(boxData) : null;
  }

  async findByUserCode(userCode: UserCode): Promise<Box[]> {
    const boxData = await this.prisma.box.findMany({
      where: { userCode: userCode.getValue() },
      include: {
        productRfids: true
      }
    });

    return boxData.map(data => this.toDomainEntity(data));
  }

  async findByShipmentNo(shipmentNo: ShipmentNumber): Promise<Box[]> {
    const boxData = await this.prisma.box.findMany({
      where: { shipmentNo: shipmentNo.getValue() },
      include: {
        productRfids: true
      }
    });

    return boxData.map(data => this.toDomainEntity(data));
  }

  async save(box: Box): Promise<void> {
    const data = {
      boxNo: box.getBoxNo().getValue(),
      userCode: box.getUserCode().getValue(),
      shipmentNo: box.getShipmentNo()?.getValue(),
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt()
    };

    await this.prisma.box.upsert({
      where: { boxNo: box.getBoxNo().getValue() },
      create: data,
      update: data
    });
  }

  async delete(boxNo: BoxNumber): Promise<void> {
    await this.prisma.box.delete({
      where: { boxNo: boxNo.getValue() }
    });
  }

  private toDomainEntity(boxData: any): Box {
    const box = new Box(
      new BoxNumber(boxData.boxNo),
      new UserCode(boxData.userCode),
      boxData.createdBy,
      boxData.shipmentNo ? new ShipmentNumber(boxData.shipmentNo) : undefined,
      boxData.createdAt,
      boxData.updatedAt
    );

    // Add product RFIDs to the box
    if (boxData.productRfids) {
      boxData.productRfids.forEach((rfidData: any) => {
        const productRfid = new ProductRfid(
          new RfidTag(rfidData.rfid),
          new SKU(rfidData.sku),
          new ProductNumber(rfidData.productNo),
          new SerialNumber(rfidData.serialNo),
          rfidData.createdBy,
          rfidData.boxNo ? new BoxNumber(rfidData.boxNo) : undefined,
          rfidData.createdAt
        );
        
        // Note: This is a simplified approach. In a more complex implementation,
        // you might want to handle this differently to avoid breaking encapsulation.
        (box as any).productRfids.push(productRfid);
      });
    }

    return box;
  }
}