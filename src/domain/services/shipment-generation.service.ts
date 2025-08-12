import { ShipmentNumber, UserCode } from '../value-objects';
import { Shipment } from '../entities';
import { IShipmentRepository } from '../interfaces/repositories';

export class ShipmentGenerationService {
  constructor(private shipmentRepository: IShipmentRepository) {}

  public async generateShipment(
    userCode: UserCode,
    createdBy: string,
    note?: string
  ): Promise<Shipment> {
    const shipmentNumber = await this.generateUniqueShipmentNumber(userCode);
    
    return new Shipment(shipmentNumber, userCode, createdBy, undefined, note);
  }

  private async generateUniqueShipmentNumber(userCode: UserCode): Promise<ShipmentNumber> {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const shipmentValue = `${userCode.getValue()}${timestamp}${random}`.substring(0, 16);

      const shipmentNumber = new ShipmentNumber(shipmentValue);
      const existingShipment = await this.shipmentRepository.findByShipmentNo(shipmentNumber);
      
      if (!existingShipment) {
        return shipmentNumber;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique shipment number after maximum attempts');
  }
}