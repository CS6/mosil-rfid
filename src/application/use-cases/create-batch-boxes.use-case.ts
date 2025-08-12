import { 
  IBoxRepository, 
  IUserRepository,
  BoxGenerationService,
  AuditService
} from '../../domain';
import { CreateBatchBoxRequest, BoxResponse } from '../dtos';

export class CreateBatchBoxesUseCase {
  constructor(
    private boxRepository: IBoxRepository,
    private userRepository: IUserRepository,
    private boxGenerationService: BoxGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: CreateBatchBoxRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<BoxResponse[]> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    if (request.quantity <= 0 || request.quantity > 100) {
      throw new Error('Quantity must be between 1 and 100');
    }

    const boxes = await this.boxGenerationService.generateBatchBoxes(
      request.code, 
      request.quantity, 
      userUuid
    );
    
    await this.boxRepository.saveBatch(boxes);

    // Log batch creation
    await this.auditService.logBatchBoxCreation(
      userUuid,
      boxes.map(box => box.getBoxNo().getValue()),
      ipAddress
    );

    return boxes.map(box => ({
      boxNo: box.getBoxNo().getValue(),
      code: box.getCode(),
      shipmentNo: box.getShipmentNo()?.getValue(),
      productCount: box.getProductCount(),
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt()
    }));
  }
}