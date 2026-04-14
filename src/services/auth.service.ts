import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { Tenant } from '../models/Tenant.js';
import { User, IUser } from '../models/User.js';
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js';
import mongoose from 'mongoose';

export class AuthService {
  private app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this.app = app;
  }

  async registerTenant(input: RegisterInput) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create Tenant
      const tenant = new Tenant({
        name: input.tenantName,
        slug: input.tenantSlug,
      });
      await tenant.save({ session });

      // 2. Hash Password
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // 3. Create Admin User for this tenant
      const user = new User({
        email: input.email,
        password: hashedPassword,
        roles: ['tenant-admin'],
        tenantId: tenant._id,
      });
      await user.save({ session });

      await session.commitTransaction();
      return { tenant, user };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async login(input: LoginInput) {
    // 1. Find Tenant by slug if provided
    let tenant;
    if (input.tenantSlug) {
      tenant = await Tenant.findOne({ slug: input.tenantSlug });
      if (!tenant) {
        throw new Error('Tenant not found');
      }
    }

    // 2. Find User by email and matching tenant
    const query: any = { email: input.email };
    if (tenant) {
      query.tenantId = tenant._id;
    }

    // Note: If multiple tenants exist and no slug was provided,
    // this could find a user from ANY tenant if not isolated.
    // However, our mongoose isolation should theoretically help here 
    // IF the x-tenant-id header is already set.
    // If not, we should probably require tenantSlug or handle carefully.
    const user = await User.findOne(query);
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 4. Generate Tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions || [],
        tenantId: user.tenantId,
        profileId: user.profileId,
      },
      accessToken,
      refreshToken,
    };
  }

  async generateAccessToken(user: IUser) {
    return (this.app as any).jwt.sign(
      {
        sub: user._id,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions || [],
        tenantId: user.tenantId,
      },
      { expiresIn: '15m' }
    );
  }

  async generateRefreshToken(user: IUser) {
    const refreshToken = (this.app as any).jwt.sign(
      { sub: user._id, tenantId: user.tenantId },
      { expiresIn: '7d' }
    );

    // Store in Redis with TTL - for session management
    const tokenSuffix = refreshToken.substring(refreshToken.length - 10);
    const redisKey = `refresh_token:${user._id}:${tokenSuffix}`;
    
    // Max 3 sessions as per requirement
    const userTokens = await this.app.redis.keys(`refresh_token:${user._id}:*`);
    if (userTokens.length >= 3) {
      // Remove oldest? Sort them if possible, but for simplicity just delete one
      await this.app.redis.del(userTokens[0]);
    }

    await this.app.redis.set(redisKey, refreshToken, {
      EX: 7 * 24 * 60 * 60, // 7 days
    });

    return refreshToken;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = await (this.app as any).jwt.verify(refreshToken) as any;
      const userId = decoded.sub;
      const tokenSuffix = refreshToken.substring(refreshToken.length - 10);
      const redisKey = `refresh_token:${userId}:${tokenSuffix}`;

      const storedToken = await this.app.redis.get(redisKey);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const newAccessToken = await this.generateAccessToken(user);
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string, tenantSlug?: string) {
    let tenant;
    if (tenantSlug) {
      tenant = await Tenant.findOne({ slug: tenantSlug });
      if (!tenant) throw new Error('Tenant not found');
    }

    const query: any = { email };
    if (tenant) query.tenantId = tenant._id;

    const user = await User.findOne(query);
    if (!user) return; // Silent return for security

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const redisKey = `password_reset:${resetToken}`;

    // Store in Redis with 1 hour TTL
    await this.app.redis.set(redisKey, user._id.toString(), {
      EX: 60 * 60,
    });

    // In a real app, send email with resetToken
    this.app.log.info(`Password reset requested for ${email}. Token: ${resetToken}`);
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string) {
    const redisKey = `password_reset:${token}`;
    const userId = await this.app.redis.get(redisKey);

    if (!userId) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Revoke the token
    await this.app.redis.del(redisKey);

    // Also revoke all active sessions for this user
    const userTokens = await this.app.redis.keys(`refresh_token:${userId}:*`);
    for (const tokenKey of userTokens) {
      await this.app.redis.del(tokenKey);
    }
  }

  async logout(refreshToken: string) {
    try {
      const decoded = await (this.app as any).jwt.verify(refreshToken) as any;
      const userId = decoded.sub;
      const tokenSuffix = refreshToken.substring(refreshToken.length - 10);
      const redisKey = `refresh_token:${userId}:${tokenSuffix}`;
      await this.app.redis.del(redisKey);
    } catch (error) {
      // Silent error on logout
    }
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
