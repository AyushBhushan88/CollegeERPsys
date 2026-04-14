import { FastifyReply, FastifyRequest } from 'fastify';

export type UserRole = 'super-admin' | 'tenant-admin' | 'faculty' | 'student';

export const checkRoles = (allowedRoles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // request.user is added by @fastify/jwt after successful jwtVerify
      const user = request.user as any;

      if (!user || !user.roles) {
        return reply.status(401).send({
          status: 'error',
          message: 'Unauthorized: No user roles found'
        });
      }

      const hasPermission = user.roles.some((role: UserRole) => 
        allowedRoles.includes(role)
      );

      if (!hasPermission) {
        return reply.status(403).send({
          status: 'error',
          message: 'Forbidden: You do not have permission to access this resource'
        });
      }
    } catch (error) {
      return reply.status(401).send({
        status: 'error',
        message: 'Unauthorized'
      });
    }
  };
};

export const checkPermissions = (requiredPermissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user as any;

      if (!user) {
        return reply.status(401).send({
          status: 'error',
          message: 'Unauthorized: No user found'
        });
      }

      // Super-admin bypasses all permission checks
      if (user.roles && user.roles.includes('super-admin')) {
        return;
      }

      const userPermissions = user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(perm => 
        userPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        return reply.status(403).send({
          status: 'error',
          message: 'Forbidden: Missing required permissions'
        });
      }
    } catch (error) {
      return reply.status(401).send({
        status: 'error',
        message: 'Unauthorized'
      });
    }
  };
};
