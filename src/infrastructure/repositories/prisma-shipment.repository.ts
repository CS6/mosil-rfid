import { PrismaClient } from '@prisma/client';
import { 
  Shipment, 
  IShipmentRepository, 
  ShipmentNumber, 
  UserCode,
  ShipmentStatus,
  Box,
  BoxNumber
} from '../../domain';

export class PrismaShipmentRepository implements IShipmentRepository {
  constructor(private prisma: PrismaClient) {}

  async findByShipmentNo(shipmentNo: ShipmentNumber): Promise<Shipment | null> {
    const shipmentData = await this.prisma.shipment.findUnique({
      where: { shipmentNo: shipmentNo.getValue() },
      include: {
        boxes: {
          include: {
            productRfids: true
          }
        }
      }
    });

    return shipmentData ? this.toDomainEntity(shipmentData) : null;
  }

  async findByUserCode(userCode: UserCode): Promise<Shipment[]> {
    const shipmentData = await this.prisma.shipment.findMany({
      where: { userCode: userCode.getValue() },
      include: {
        boxes: {
          include: {
            productRfids: true
          }
        }
      }
    });

    return shipmentData.map(data => this.toDomainEntity(data));
  }

  async save(shipment: Shipment): Promise<void> {
    const data = {
      shipmentNo: shipment.getShipmentNo().getValue(),
      userCode: shipment.getUserCode().getValue(),
      boxCount: shipment.getBoxCount(),
      status: shipment.getStatus(),
      note: shipment.getNote(),
      createdBy: shipment.getCreatedBy(),
      createdAt: shipment.getCreatedAt(),
      updatedAt: shipment.getUpdatedAt()
    };

    await this.prisma.shipment.upsert({
      where: { shipmentNo: shipment.getShipmentNo().getValue() },
      create: data,
      update: data
    });
  }

  async delete(shipmentNo: ShipmentNumber): Promise<void> {
    await this.prisma.shipment.delete({
      where: { shipmentNo: shipmentNo.getValue() }
    });
  }

  private toDomainEntity(shipmentData: any): Shipment {
    const shipment = new Shipment(
      new ShipmentNumber(shipmentData.shipmentNo),
      new UserCode(shipmentData.userCode),
      shipmentData.createdBy,
      shipmentData.status as ShipmentStatus,
      shipmentData.note,
      shipmentData.createdAt,
      shipmentData.updatedAt
    );

    // Add boxes to the shipment
    if (shipmentData.boxes) {
      shipmentData.boxes.forEach((boxData: any) => {
        const box = new Box(
          new BoxNumber(boxData.boxNo),
          boxData.userCode, // Now it's just the 3-digit code string
          boxData.createdBy,
          boxData.shipmentNo ? new ShipmentNumber(boxData.shipmentNo) : undefined,
          boxData.createdAt,
          boxData.updatedAt
        );
        
        // Note: This is a simplified approach for loading the relationship
        (shipment as any).boxes.push(box);
      });
    }

    return shipment;
  }
}