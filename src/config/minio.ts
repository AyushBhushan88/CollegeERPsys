import * as Minio from 'minio';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    minio: Minio.Client;
  }
}

export async function connectMinio(app: FastifyInstance) {
  try {
    const { MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_USE_SSL } = app.config;

    const minioClient = new Minio.Client({
      endPoint: MINIO_ENDPOINT,
      port: MINIO_PORT,
      useSSL: MINIO_USE_SSL,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
    });

    // Check if connection is valid by listing buckets
    try {
      await minioClient.listBuckets();
      app.log.info('Successfully connected to MinIO');
    } catch (err) {
      app.log.error(`MinIO connection failed during bucket listing: ${err}`);
      // In production we might not want to exit if MinIO is temporarily unavailable,
      // but for foundation we should ensure it's up.
      if (app.config.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }

    // Decorate fastify instance with minio client
    app.decorate('minio', minioClient);

  } catch (err) {
    app.log.error(`MinIO setup error: ${err}`);
    process.exit(1);
  }
}
