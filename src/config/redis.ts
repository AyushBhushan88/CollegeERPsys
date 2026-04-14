import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    redis: RedisClientType;
  }
}

export async function connectRedis(app: FastifyInstance) {
  try {
    const { REDIS_URL } = app.config;
    const client = createClient({ url: REDIS_URL });

    client.on('error', (err) => app.log.error(`Redis Error: ${err}`));

    await client.connect();
    app.log.info('Successfully connected to Redis');

    // Decorate fastify instance with redis client
    app.decorate('redis', client);

    // Register redis with Fastify for shutdown
    app.addHook('onClose', async () => {
      await client.disconnect();
      app.log.info('Redis connection closed');
    });
  } catch (err) {
    app.log.error(`Redis connection error: ${err}`);
    process.exit(1);
  }
}
