import { User, ProductRfid, Box, Shipment, SystemLog } from '../entities';
import { RfidTag, SKU, BoxNumber, ShipmentNumber, UserCode } from '../value-objects';

export interface IUserRepository {
  findByUuid(uuid: string): Promise<User | null>;
  findByAccount(account: string): Promise<User | null>;
  findByCode(code: UserCode): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(uuid: string): Promise<void>;
}

export interface IProductRfidRepository {
  findByRfid(rfid: RfidTag): Promise<ProductRfid | null>;
  findBySku(sku: SKU): Promise<ProductRfid[]>;
  findByBoxNo(boxNo: BoxNumber): Promise<ProductRfid[]>;
  save(productRfid: ProductRfid): Promise<void>;
  delete(rfid: RfidTag): Promise<void>;
}

export interface IBoxRepository {
  findByBoxNo(boxNo: BoxNumber): Promise<Box | null>;
  findByUserCode(userCode: UserCode): Promise<Box[]>;
  findByShipmentNo(shipmentNo: ShipmentNumber): Promise<Box[]>;
  save(box: Box): Promise<void>;
  delete(boxNo: BoxNumber): Promise<void>;
}

export interface IShipmentRepository {
  findByShipmentNo(shipmentNo: ShipmentNumber): Promise<Shipment | null>;
  findByUserCode(userCode: UserCode): Promise<Shipment[]>;
  save(shipment: Shipment): Promise<void>;
  delete(shipmentNo: ShipmentNumber): Promise<void>;
}

export interface ISystemLogRepository {
  save(log: SystemLog): Promise<void>;
  findByUserUuid(userUuid: string): Promise<SystemLog[]>;
  findByAction(action: string): Promise<SystemLog[]>;
}