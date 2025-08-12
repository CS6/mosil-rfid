import { BoxNumber } from '../value-objects';
import { Box } from '../entities';
import { IBoxRepository } from '../interfaces/repositories';

export class BoxGenerationService {
  constructor(private boxRepository: IBoxRepository) {}

  public async generateBox(
    code: string, // 3位編號
    createdBy: string
  ): Promise<Box> {
    const boxNumber = await this.generateUniqueBoxNumber(code);
    
    return new Box(boxNumber, code, createdBy);
  }

  public async generateBatchBoxes(
    code: string, // 3位編號
    quantity: number,
    createdBy: string
  ): Promise<Box[]> {
    // 驗證編號格式
    if (!/^\d{3}$/.test(code)) {
      throw new Error('Code must be exactly 3 digits');
    }

    // 取得當前年份
    const currentYear = new Date().getFullYear().toString();
    
    // 取得最新的流水號
    const prefix = `B${code}${currentYear}`;
    const latestBox = await this.boxRepository.findLatestByPrefix(prefix);
    
    let nextSerial = 1;
    if (latestBox) {
      const boxNoValue = latestBox.getBoxNo().getValue();
      const currentSerial = parseInt(boxNoValue.substring(8), 10);
      nextSerial = currentSerial + 1;
    }
    
    if (nextSerial + quantity - 1 > 99999) {
      throw new Error(`Cannot generate ${quantity} boxes: would exceed maximum serial number (99999)`);
    }

    const boxes: Box[] = [];
    
    for (let i = 0; i < quantity; i++) {
      const serialNumber = nextSerial + i;
      const boxValue = `${prefix}${serialNumber.toString().padStart(5, '0')}`;
      const boxNumber = new BoxNumber(boxValue);
      
      boxes.push(new Box(boxNumber, code, createdBy));
    }
    
    return boxes;
  }

  private async generateUniqueBoxNumber(code: string): Promise<BoxNumber> {
    // 驗證編號格式
    if (!/^\d{3}$/.test(code)) {
      throw new Error('Code must be exactly 3 digits');
    }

    // 取得當前年份
    const currentYear = new Date().getFullYear().toString();
    
    // 取得最新的流水號
    const prefix = `B${code}${currentYear}`;
    const latestBox = await this.boxRepository.findLatestByPrefix(prefix);
    
    let nextSerial = 1;
    if (latestBox) {
      const boxNoValue = latestBox.getBoxNo().getValue();
      const currentSerial = parseInt(boxNoValue.substring(8), 10);
      nextSerial = currentSerial + 1;
    }
    
    if (nextSerial > 99999) {
      throw new Error('Box serial number exceeded maximum (99999)');
    }
    
    // 格式：B + 編號3碼 + 年份4碼 + 流水號5碼 = 13碼
    const boxValue = `${prefix}${nextSerial.toString().padStart(5, '0')}`;
    
    return new BoxNumber(boxValue);
  }
}