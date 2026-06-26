import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@/common/enums/user-role.enum';
import { RefreshTokenService } from './refresh-token.service';
import { TokenService } from './token.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { User } from '../entities/user.entity';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser: User = {
    id: 'user-uuid',
    tenantId: 'tenant-uuid',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.MANAGER,
    mfaSecret: null,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateRefreshTokenValue: jest.fn(),
            hashToken: jest.fn(),
            getRefreshTokenExpirationDate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RefreshTokenService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    tokenService = module.get(TokenService);
  });

  describe('createForUser', () => {
    it('deve criar e persistir refresh token', async () => {
      const expiresAt = new Date();
      const entity = {
        id: 'rt-uuid',
        userId: mockUser.id,
        tokenHash: 'hash',
        expiresAt,
        revoked: false,
      } as RefreshToken;

      tokenService.generateRefreshTokenValue.mockReturnValue('raw-token');
      tokenService.hashToken.mockReturnValue('hash');
      tokenService.getRefreshTokenExpirationDate.mockReturnValue(expiresAt);
      refreshTokenRepository.create.mockReturnValue(entity);
      refreshTokenRepository.save.mockResolvedValue(entity);

      const result = await service.createForUser(mockUser);

      expect(result.token).toBe('raw-token');
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('findValidToken', () => {
    it('deve retornar token válido', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      tokenService.hashToken.mockReturnValue('hash');
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'rt-uuid',
        tokenHash: 'hash',
        revoked: false,
        expiresAt: futureDate,
        user: mockUser,
      } as RefreshToken);

      const result = await service.findValidToken('raw-token');

      expect(result.id).toBe('rt-uuid');
    });

    it('deve lançar UnauthorizedException para token inexistente', async () => {
      tokenService.hashToken.mockReturnValue('hash');
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.findValidToken('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException para token expirado', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      tokenService.hashToken.mockReturnValue('hash');
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'rt-uuid',
        tokenHash: 'hash',
        revoked: false,
        expiresAt: pastDate,
      } as RefreshToken);

      await expect(service.findValidToken('expired')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeByRawToken', () => {
    it('deve revogar token existente', async () => {
      const entity = {
        id: 'rt-uuid',
        revoked: false,
      } as RefreshToken;

      tokenService.hashToken.mockReturnValue('hash');
      refreshTokenRepository.findOne.mockResolvedValue(entity);
      refreshTokenRepository.save.mockResolvedValue({ ...entity, revoked: true });

      await service.revokeByRawToken('raw-token');

      expect(refreshTokenRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ revoked: true }),
      );
    });
  });
});
