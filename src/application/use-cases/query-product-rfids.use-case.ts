import { IProductRfidRepository, ProductRfid } from '../../domain';
import { QueryProductRfidsRequest, QueryProductRfidsResponse, ProductRfidItem } from '../dtos';

export class QueryProductRfidsUseCase {
  // @ts-ignore: productRfidRepository will be used when repository methods are implemented
  constructor(private productRfidRepository: IProductRfidRepository) {}

  public async execute(query: QueryProductRfidsRequest): Promise<QueryProductRfidsResponse> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100); // Max 100 items per page

    // This would need to be implemented in the repository with proper filtering
    // For now, we'll return a basic structure with proper typing
    const rfids: ProductRfid[] = []; // Would get from repository with filters
    const total = 0; // Would get total count from repository

    // Map ProductRfid entities to ProductRfidItem DTOs
    const rfidItems: ProductRfidItem[] = rfids.map(rfid => ({
      rfid: rfid.getRfid().getValue(),
      sku: rfid.getSku().getValue(),
      productNo: rfid.getProductNo().getValue(),
      serialNo: rfid.getSerialNo().getValue(),
      status: this.determineRfidStatus(rfid),
      boxNo: rfid.getBoxNo()?.getValue(),
      createdAt: rfid.getCreatedAt(),
      updatedAt: new Date() // ProductRfid entity might need an updatedAt field
    }));

    return {
      rfids: rfidItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  private determineRfidStatus(rfid: ProductRfid): 'available' | 'bound' | 'shipped' {
    if (rfid.isAssignedToBox()) {
      // Would need to check if the box is shipped
      return 'bound';
    }
    return 'available';
  }
}