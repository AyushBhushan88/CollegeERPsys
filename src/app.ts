import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyAutoload from '@fastify/autoload';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { connectMinio } from './config/minio.js';
import { tenantMiddleware } from './middleware/tenant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      MONGODB_URI: string;
      REDIS_URL: string;
      PORT: number;
      NODE_ENV: string;
      JWT_SECRET: string;
      MINIO_ENDPOINT: string;
      MINIO_PORT: number;
      MINIO_ACCESS_KEY: string;
      MINIO_SECRET_KEY: string;
      MINIO_USE_SSL: boolean;
      RAZORPAY_KEY_ID: string;
      RAZORPAY_KEY_SECRET: string;
      RAZORPAY_WEBHOOK_SECRET: string;
      BASE_URL: string;
    };
  }
}

const schema = {
  type: 'object',
  required: ['MONGODB_URI', 'REDIS_URL', 'JWT_SECRET', 'MINIO_ENDPOINT', 'MINIO_PORT', 'MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
  properties: {
    PORT: {
      type: 'integer',
      default: 3000
    },
    MONGODB_URI: {
      type: 'string'
    },
    REDIS_URL: {
      type: 'string'
    },
    JWT_SECRET: {
      type: 'string'
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    MINIO_ENDPOINT: {
      type: 'string'
    },
    MINIO_PORT: {
      type: 'integer',
      default: 9000
    },
    MINIO_ACCESS_KEY: {
      type: 'string'
    },
    MINIO_SECRET_KEY: {
      type: 'string'
    },
    MINIO_USE_SSL: {
      type: 'boolean',
      default: false
    },
    RAZORPAY_KEY_ID: {
      type: 'string'
    },
    RAZORPAY_KEY_SECRET: {
      type: 'string'
    },
    RAZORPAY_WEBHOOK_SECRET: {
      type: 'string'
    },
    BASE_URL: {
      type: 'string',
      default: 'http://localhost:3000'
    }
  }
};

const options = {
  confKey: 'config',
  schema: schema,
  dotenv: true,
  data: process.env
};

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true
  });

  await app.register(fastifyEnv, options);

  // Connection plugins will be registered here
  await connectDB(app);
  await connectRedis(app);
  await connectMinio(app);

  // Register raw body support for signature verification
  await app.register(import('fastify-raw-body'), {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true
  });

  // Register multipart support for file uploads
  await app.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });

  // Register tenant middleware as an onRequest hook to wrap all logic
  app.addHook('onRequest', tenantMiddleware);

  // Autoload plugins
  app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, app.config)
  });

  // Autoload routes
  app.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, app.config)
  });

  return app;
}
