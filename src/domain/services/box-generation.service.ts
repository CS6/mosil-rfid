import { BoxNumber, UserCode } from '../value-objects';
import { Box } from '../entities';
import { IBoxRepository } from '../interfaces/repositories';

export class BoxGenerationService {
  constructor(private boxRepository: IBoxRepository) {}

  public async generateBox(
    userCode: UserCode,
    createdBy: string
  ): Promise<Box> {
    const boxNumber = await this.generateUniqueBoxNumber(userCode);
    
    return new Box(boxNumber, userCode, createdBy);
  }

  private async generateUniqueBoxNumber(userCode: UserCode): Promise<BoxNumber> {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const boxValue = `${userCode.getValue()}${timestamp}${random}`.substring(0, 13);

      const boxNumber = new BoxNumber(boxValue);
      const existingBox = await this.boxRepository.findByBoxNo(boxNumber);
      
      if (!existingBox) {
        return boxNumber;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique box number after maximum attempts');
  }
}