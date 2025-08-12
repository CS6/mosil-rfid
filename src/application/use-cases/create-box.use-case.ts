import { 
  IBoxRepository, 
  IUserRepository,
  UserCode,
  BoxGenerationService,
  AuditService
} from '../../domain';
import { CreateBoxRequest, BoxResponse } from '../dtos';

export class CreateBoxUseCase {
  constructor(
    private boxRepository: IBoxRepository,
    private userRepository: IUserRepository,
    private boxGenerationService: BoxGenerationService,
    private auditService: AuditService
  ) {}

  public async execute(
    request: CreateBoxRequest,
    userUuid: string,
    ipAddress?: string
  ): Promise<BoxResponse> {
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.getIsActive()) {
      throw new Error('User is not active');
    }

    const userCode = new UserCode(request.userCode);

    const box = await this.boxGenerationService.generateBox(userCode, userUuid);
    
    await this.boxRepository.save(box);

    await this.auditService.logBoxCreation(
      userUuid,
      box.getBoxNo().getValue(),
      ipAddress
    );

    return {
      boxNo: box.getBoxNo().getValue(),
      userCode: box.getUserCode().getValue(),
      shipmentNo: box.getShipmentNo()?.getValue(),
      productCount: box.getProductCount(),
      createdBy: box.getCreatedBy(),
      createdAt: box.getCreatedAt(),
      updatedAt: box.getUpdatedAt()
    };
  }
}