import { 
  IBoxRepository, 
  IUserRepository,
  BoxGenerationService,
  AuditService
} from '../../domain';
import { CreateBatchBoxRequest, BatchBoxResponse } from '../dtos';

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
  ): Promise<BatchBoxResponse> {
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

    const currentYear = new Date().getFullYear().toString();
    const boxnos = boxes.map(box => box.getBoxNo().getValue());

    return {
      code: request.code,
      year: currentYear,
      generatedCount: boxes.length,
      boxnos
    };
  }
}