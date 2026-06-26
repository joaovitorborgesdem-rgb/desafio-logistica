import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@/common/enums/user-role.enum';
import { TokenService } from './token.service';
import { User } from '../entities/user.entity';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 'user-uuid',
    tenantId: 'tenant-uuid',
    email: 'user@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.OPERATOR,
    mfaSecret: null,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get(TokenService);
    jwtService = module.get(JwtService);
  });

  describe('generateAccessToken', () => {
    it('deve gerar access token com payload do usuário', () => {
      jwtService.sign.mockReturnValue('signed-access-token');

      const token = service.generateAccessToken(mockUser);

      expect(token).toBe('signed-access-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          tenantId: mockUser.tenantId,
          email: mockUser.email,
          role: mockUser.role,
        },
        expect.objectContaining({ expiresIn: '15m', secret: 'test-secret' }),
      );
    });
  });

  describe('generateRefreshTokenValue', () => {
    it('deve gerar token aleatório de 128 caracteres hex', () => {
      const token = service.generateRefreshTokenValue();

      expect(token).toHaveLength(128);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('hashToken', () => {
    it('deve gerar hash SHA-256 determinístico', () => {
      const hash1 = service.hashToken('my-token');
      const hash2 = service.hashToken('my-token');

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('getRefreshTokenExpirationDate', () => {
    it('deve retornar data 7 dias no futuro', () => {
      const now = new Date();
      const expiresAt = service.getRefreshTokenExpirationDate();
      const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      expect(diffDays).toBeGreaterThanOrEqual(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });
  });

  describe('buildAuthResponse', () => {
    it('deve montar resposta com tokens e expiresIn', () => {
      const response = service.buildAuthResponse('access', 'refresh');

      expect(response).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresIn: 900,
      });
    });
  });
});
