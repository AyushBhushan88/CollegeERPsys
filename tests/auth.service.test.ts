import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/services/auth.service.js';
import { Tenant } from '../src/models/Tenant.js';
import { User } from '../src/models/User.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

vi.mock('../src/models/Tenant.js');
vi.mock('../src/models/User.js');
vi.mock('bcrypt');
vi.mock('mongoose');

describe('AuthService', () => {
  let authService: any;
  let mockApp: any;

  beforeEach(() => {
    mockApp = {
      jwt: {
        sign: vi.fn().mockReturnValue('mockToken'),
        verify: vi.fn().mockReturnValue({ sub: 'userId' }),
      },
      redis: {
        set: vi.fn(),
        get: vi.fn(),
        del: vi.fn(),
        keys: vi.fn().mockResolvedValue([]),
      },
      log: {
        info: vi.fn(),
        error: vi.fn(),
      },
    };
    authService = new AuthService(mockApp);
    vi.clearAllMocks();
  });

  describe('registerTenant', () => {
    it('should create a tenant and admin user in a transaction', async () => {
      const input = {
        tenantName: 'Test College',
        tenantSlug: 'test-college',
        email: 'admin@test.com',
        password: 'password123',
      };

      const mockSession = {
        startTransaction: vi.fn(),
        commitTransaction: vi.fn(),
        abortTransaction: vi.fn(),
        endSession: vi.fn(),
      };
      (mongoose.startSession as any).mockResolvedValue(mockSession);

      // Mock Tenant and User saves
      (Tenant.prototype.save as any).mockResolvedValue({ _id: 'tenantId', name: 'Test College', slug: 'test-college' });
      (User.prototype.save as any).mockResolvedValue({ _id: 'userId', email: 'admin@test.com' });
      (bcrypt.hash as any).mockResolvedValue('hashedPassword');

      const result = await authService.registerTenant(input);

      expect(mongoose.startSession).toHaveBeenCalled();
      expect(mockSession.startTransaction).toHaveBeenCalled();
      expect(Tenant).toHaveBeenCalledWith({ name: 'Test College', slug: 'test-college' });
      expect(User).toHaveBeenCalledWith({
        email: 'admin@test.com',
        password: 'hashedPassword',
        roles: ['tenant-admin'],
        tenantId: expect.anything(),
      });
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(result.tenant).toBeDefined();
      expect(result.user).toBeDefined();
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const input = {
        email: 'admin@test.com',
        password: 'password123',
        tenantSlug: 'test-college',
      };

      const mockTenant = { _id: 'tenantId', slug: 'test-college' };
      const mockUser = {
        _id: 'userId',
        email: 'admin@test.com',
        password: 'hashedPassword',
        roles: ['tenant-admin'],
        tenantId: 'tenantId',
      };

      (Tenant.findOne as any).mockResolvedValue(mockTenant);
      (User.findOne as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await authService.login(input);

      expect(result.accessToken).toBe('mockToken');
      expect(result.refreshToken).toBe('mockToken');
      expect(result.user.id).toBe('userId');
    });

    it('should throw error for invalid password', async () => {
      const input = { email: 'admin@test.com', password: 'wrong' };
      (User.findOne as any).mockResolvedValue({ password: 'hashed' });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(authService.login(input)).rejects.toThrow('Invalid email or password');
    });
  });
});
