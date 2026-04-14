import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  PasswordResetRequestInput,
  PasswordResetConfirmInput
} from '../schemas/auth.schema.js';

export default async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService(app);

  // Register a new tenant and its admin user
  app.post('/auth/register', {
    schema: {
      body: registerSchema
    }
  }, async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    try {
      const result = await authService.registerTenant(request.body);
      return reply.status(201).send({
        status: 'success',
        message: 'Tenant and admin user created successfully',
        data: {
          tenant: {
            id: result.tenant._id,
            name: result.tenant.name,
            slug: result.tenant.slug
          },
          user: {
            id: result.user._id,
            email: result.user.email
          }
        }
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({
        status: 'error',
        message: error.message || 'Registration failed'
      });
    }
  });

  // Login for an existing user
  app.post('/auth/login', {
    schema: {
      body: loginSchema
    }
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const result = await authService.login(request.body);
      return reply.send({
        status: 'success',
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(401).send({
        status: 'error',
        message: error.message || 'Login failed'
      });
    }
  });

  // Refresh tokens
  app.post('/auth/refresh', {
    schema: {
      body: refreshTokenSchema
    }
  }, async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) => {
    try {
      const result = await authService.refreshTokens(request.body.refreshToken);
      return reply.send({
        status: 'success',
        message: 'Tokens refreshed',
        data: result
      });
    } catch (error: any) {
      return reply.status(401).send({
        status: 'error',
        message: error.message || 'Refresh failed'
      });
    }
  });

  // Logout
  app.post('/auth/logout', {
    schema: {
      body: refreshTokenSchema
    }
  }, async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) => {
    await authService.logout(request.body.refreshToken);
    return reply.send({
      status: 'success',
      message: 'Logout successful'
    });
  });

  // Password Reset - Request
  app.post('/auth/password-reset/request', {
    schema: {
      body: passwordResetRequestSchema
    }
  }, async (request: FastifyRequest<{ Body: PasswordResetRequestInput }>, reply: FastifyReply) => {
    try {
      await authService.requestPasswordReset(request.body.email, request.body.tenantSlug);
      return reply.send({
        status: 'success',
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({
        status: 'error',
        message: error.message || 'Password reset request failed'
      });
    }
  });

  // Password Reset - Confirm
  app.post('/auth/password-reset/confirm', {
    schema: {
      body: passwordResetConfirmSchema
    }
  }, async (request: FastifyRequest<{ Body: PasswordResetConfirmInput }>, reply: FastifyReply) => {
    try {
      await authService.resetPassword(request.body.token, request.body.newPassword);
      return reply.send({
        status: 'success',
        message: 'Password has been reset successfully'
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({
        status: 'error',
        message: error.message || 'Password reset failed'
      });
    }
  });

  // Get current user profile
  app.get('/auth/me', {
    preHandler: [app.authenticate]
  }, async (request: any, reply: FastifyReply) => {
    try {
      const user = await authService.getUserById(request.user.sub);
      return reply.send({
        status: 'success',
        data: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          permissions: user.permissions,
          tenantId: user.tenantId,
          profileId: user.profileId
        }
      });
    } catch (error: any) {
      return reply.status(404).send({
        status: 'error',
        message: error.message || 'User not found'
      });
    }
  });
}
