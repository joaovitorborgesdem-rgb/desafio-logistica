import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@/common/enums/user-role.enum';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { RefreshTokenService } from './services/refresh-token.service';
import { TokenService } from './services/token.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let tokenService: jest.Mocked<TokenService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  const mockUser: User = {
    id: 'user-uuid',
    tenantId: 'tenant-uuid',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    mfaSecret: null,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            buildAuthResponse: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            createForUser: jest.fn(),
            findValidToken: jest.fn(),
            revoke: jest.fn(),
            revokeByRawToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    tokenService = module.get(TokenService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve registrar um novo usuário', async () => {
      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        tenantId: 'tenant-uuid',
        email: 'user@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      });

      expect(result.email).toBe('user@example.com');
      expect(result).not.toHaveProperty('passwordHash');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('deve lançar ConflictException se e-mail já existir no tenant', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          tenantId: 'tenant-uuid',
          email: 'user@example.com',
          password: 'password123',
          role: UserRole.ADMIN,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('deve retornar tokens com credenciais válidas', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      tokenService.generateAccessToken.mockReturnValue('access-token');
      refreshTokenService.createForUser.mockResolvedValue({
        token: 'refresh-token',
        entity: {} as never,
      });
      tokenService.buildAuthResponse.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      const result = await service.login({
        tenantId: 'tenant-uuid',
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('deve lançar UnauthorizedException com credenciais inválidas', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          tenantId: 'tenant-uuid',
          email: 'user@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('deve rotacionar refresh token e emitir novos tokens', async () => {
      refreshTokenService.findValidToken.mockResolvedValue({
        id: 'rt-uuid',
        user: mockUser,
      } as never);
      refreshTokenService.revoke.mockResolvedValue(undefined);
      tokenService.generateAccessToken.mockReturnValue('new-access-token');
      refreshTokenService.createForUser.mockResolvedValue({
        token: 'new-refresh-token',
        entity: {} as never,
      });
      tokenService.buildAuthResponse.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
      });

      const result = await service.refresh('old-refresh-token');

      expect(refreshTokenService.revoke).toHaveBeenCalled();
      expect(result.accessToken).toBe('new-access-token');
    });
  });

  describe('logout', () => {
    it('deve revogar refresh token', async () => {
      refreshTokenService.revokeByRawToken.mockResolvedValue(undefined);

      const result = await service.logout('refresh-token');

      expect(refreshTokenService.revokeByRawToken).toHaveBeenCalledWith('refresh-token');
      expect(result.message).toBe('Logout realizado com sucesso');
    });
  });
});
