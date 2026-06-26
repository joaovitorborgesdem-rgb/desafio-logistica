import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';
import { TokenService } from './token.service';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly tokenService: TokenService,
  ) {}

  async createForUser(user: User): Promise<{ token: string; entity: RefreshToken }> {
    const token = this.tokenService.generateRefreshTokenValue();
    const tokenHash = this.tokenService.hashToken(token);
    const expiresAt = this.tokenService.getRefreshTokenExpirationDate();

    const entity = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    const saved = await this.refreshTokenRepository.save(entity);
    this.logger.log(`Refresh token criado para usuário ${user.id} no tenant ${user.tenantId}`);

    return { token, entity: saved };
  }

  async findValidToken(rawToken: string): Promise<RefreshToken> {
    const tokenHash = this.tokenService.hashToken(rawToken);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash, revoked: false },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado');
    }

    return refreshToken;
  }

  async revoke(refreshToken: RefreshToken): Promise<void> {
    refreshToken.revoked = true;
    await this.refreshTokenRepository.save(refreshToken);
    this.logger.log(`Refresh token ${refreshToken.id} revogado`);
  }

  async revokeByRawToken(rawToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashToken(rawToken);

    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { tokenHash },
    });

    if (!refreshToken || refreshToken.revoked) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    await this.revoke(refreshToken);
  }
}
