import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { jwtConfig } from '@/config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { AuthTokensResponse } from './interfaces/auth.interface';
import { RefreshTokenService } from './services/refresh-token.service';
import { TokenService } from './services/token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    const existingUser = await this.userRepository.findOne({
      where: { tenantId: dto.tenantId, email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado neste tenant');
    }

    const passwordHash = await bcrypt.hash(dto.password, jwtConfig.bcryptRounds);

    const user = this.userRepository.create({
      tenantId: dto.tenantId,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      mfaEnabled: false,
      mfaSecret: null,
    });

    const saved = await this.userRepository.save(user);
    this.logger.log(`Usuário registrado: ${saved.id} no tenant ${saved.tenantId}`);

    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async login(dto: LoginDto): Promise<AuthTokensResponse> {
    const user = await this.userRepository.findOne({
      where: { tenantId: dto.tenantId, email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return this.issueTokens(user);
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokensResponse> {
    const refreshToken = await this.refreshTokenService.findValidToken(rawRefreshToken);
    const user = refreshToken.user;

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    await this.refreshTokenService.revoke(refreshToken);
    this.logger.log(`Refresh token rotacionado para usuário ${user.id}`);

    return this.issueTokens(user);
  }

  async logout(rawRefreshToken: string): Promise<{ message: string }> {
    await this.refreshTokenService.revokeByRawToken(rawRefreshToken);
    this.logger.log('Logout realizado com sucesso');

    return { message: 'Logout realizado com sucesso' };
  }

  private async issueTokens(user: User): Promise<AuthTokensResponse> {
    const accessToken = this.tokenService.generateAccessToken(user);
    const { token: refreshToken } = await this.refreshTokenService.createForUser(user);

    return this.tokenService.buildAuthResponse(accessToken, refreshToken);
  }
}
