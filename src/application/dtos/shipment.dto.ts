import { ShipmentStatus } from '../../domain/enums';

export interface CreateShipmentRequest {
  userCode: string;
  note?: string;
}

export interface AddBoxToShipmentRequest {
  shipmentNo: string;
  boxNo: string;
}

export interface ShipShipmentRequest {
  shipmentNo: string;
}

export interface ShipmentResponse {
  shipmentNo: string;
  userCode: string;
  boxCount: number;
  status: ShipmentStatus;
  note?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentDetailResponse extends ShipmentResponse {
  boxes: {
    boxNo: string;
    productCount: number;
    createdAt: Date;
  }[];
}