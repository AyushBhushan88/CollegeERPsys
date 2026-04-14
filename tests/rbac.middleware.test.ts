import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRoles, checkPermissions } from '../src/middleware/rbac.js';
import { FastifyReply, FastifyRequest } from 'fastify';

describe('RBAC Middleware', () => {
  let mockRequest: any;
  let mockReply: any;

  beforeEach(() => {
    mockRequest = {
      user: {
        roles: [],
        permissions: []
      }
    };
    mockReply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
  });

  describe('checkRoles', () => {
    it('should allow access if user has one of the allowed roles', async () => {
      mockRequest.user.roles = ['faculty'];
      const middleware = checkRoles(['faculty', 'tenant-admin']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should deny access if user does not have any of the allowed roles', async () => {
      mockRequest.user.roles = ['student'];
      const middleware = checkRoles(['faculty', 'tenant-admin']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('Forbidden')
      }));
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      const middleware = checkRoles(['faculty']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).toHaveBeenCalledWith(401);
    });
  });

  describe('checkPermissions', () => {
    it('should allow access if user has all required permissions', async () => {
      mockRequest.user.permissions = ['read:student', 'write:student'];
      const middleware = checkPermissions(['read:student', 'write:student']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should deny access if user is missing a required permission', async () => {
      mockRequest.user.permissions = ['read:student'];
      const middleware = checkPermissions(['read:student', 'write:student']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).toHaveBeenCalledWith(403);
    });

    it('should allow super-admin to bypass permission checks', async () => {
      mockRequest.user.roles = ['super-admin'];
      mockRequest.user.permissions = [];
      const middleware = checkPermissions(['any:permission']);
      
      await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).not.toHaveBeenCalled();
    });
  });
});
