import { IBoxRepository } from '../../domain';
import { BoxListResponse } from '../dtos';

export interface GetBoxesRequest {
  page: number;
  limit: number;
  shipmentNo?: string;
  status?: string;
}

export class GetBoxesUseCase {
  constructor(private boxRepository: IBoxRepository) {}

  public async execute(request: GetBoxesRequest): Promise<BoxListResponse> {
    const { page, limit, shipmentNo, status } = request;

    // 驗證分頁參數
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const { boxes, total } = await this.boxRepository.findAll({
      page,
      limit,
      shipmentNo,
      status
    });

    const boxResponses = boxes.map(box => ({
      boxNo: box.getBoxNo().getValue(),
      code: box.getCode(),
      shipmentNo: box.getShipmentNo()?.getValue() || undefined,
      productCount: box.getProductCount(),
      status: box.getShipmentNo() ? 'PACKED' : 'CREATED', // 簡單的狀態判斷
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt()
    }));

    return {
      boxes: boxResponses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}