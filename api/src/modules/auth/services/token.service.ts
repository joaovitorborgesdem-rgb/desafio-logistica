import { createHash, randomBytes } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConfig } from '@/config/jwt.config';
import { AuthTokensResponse, JwtPayload } from '../interfaces/auth.interface';
import { User } from '../entities/user.entity';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', jwtConfig.accessSecret),
      expiresIn: jwtConfig.accessExpiresIn,
    });
  }

  generateRefreshTokenValue(): string {
    return randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  getRefreshTokenExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + jwtConfig.refreshExpiresInDays);
    return expiresAt;
  }

  buildAuthResponse(accessToken: string, refreshToken: string): AuthTokensResponse {
    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    };
  }
}
