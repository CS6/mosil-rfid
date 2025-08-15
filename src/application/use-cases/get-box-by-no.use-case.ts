import { IBoxRepository, BoxNumber } from '../../domain';
import { BoxDetailResponse } from '../dtos';

export class GetBoxByNoUseCase {
  constructor(private boxRepository: IBoxRepository) {}

  public async execute(boxNo: string): Promise<BoxDetailResponse> {
    const boxNumber = new BoxNumber(boxNo);
    const box = await this.boxRepository.findByBoxNo(boxNumber);

    if (!box) {
      throw new Error(`Box ${boxNo} not found`);
    }

    const productRfids = box.getProductRfids().map(rfid => ({
      rfid: rfid.getRfid().getValue(),
      sku: rfid.getSku().getValue(),
      productNo: rfid.getProductNo().getValue(),
      serialNo: rfid.getSerialNo().getValue()
    }));

    return {
      boxNo: box.getBoxNo().getValue(),
      code: box.getCode(),
      shipmentNo: box.getShipmentNo()?.getValue() || undefined,
      productCount: box.getProductCount(),
      status: box.getShipmentNo() ? 'PACKED' : 'CREATED',
      productRfids,
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt()
    };
  }
}