import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'app.serviceJwtSecret': 'test-access-secret',
        JWT_ACCESS_EXPIRATION: '15m',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token for valid hospital credentials', async () => {
      const result = await service.login({
        email: 'admin@hgd.cm',
        password: 'password',
        platform: 'hospital',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.scope).toBe('scope:hospital');
      expect(result.user.entityType).toBe('hospital');
    });

    it('should return token for valid insurance credentials', async () => {
      const result = await service.login({
        email: 'admin@assurancesanteplus.cm',
        password: 'password',
        platform: 'insurance',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.scope).toBe('scope:insurance');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      await expect(
        service.login({
          email: 'nonexistent@email.com',
          password: 'password',
          platform: 'hospital',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      await expect(
        service.login({
          email: 'admin@hgd.cm',
          password: 'wrongpassword',
          platform: 'hospital',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should complete without error', async () => {
      await expect(service.logout('user-123')).resolves.toBeUndefined();
    });
  });
});
