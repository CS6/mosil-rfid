import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  uuid: string;
  account: string;
  userType: string;
  code: string;
}

export class JwtUtil {
  private static readonly ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret-key';
  private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key';

  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.ACCESS_SECRET, {
      expiresIn: '1h',
      issuer: 'rfid-system'
    });
  }

  static generateRefreshToken(payload: Pick<JwtPayload, 'uuid'>): string {
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: '7d',
      issuer: 'rfid-system'
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.ACCESS_SECRET) as JwtPayload;
  }

  static verifyRefreshToken(token: string): Pick<JwtPayload, 'uuid'> {
    return jwt.verify(token, this.REFRESH_SECRET) as Pick<JwtPayload, 'uuid'>;
  }

  static generateTokenPair(payload: JwtPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken({ uuid: payload.uuid })
    };
  }
}