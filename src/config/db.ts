import mongoose from 'mongoose';
import type { FastifyInstance } from 'fastify';
import { mongooseTenantIsolation } from '../plugins/mongooseIsolation.js';

export async function connectDB(app: FastifyInstance) {
  try {
    const { MONGODB_URI } = app.config;
    
    // Register global isolation plugin
    mongoose.plugin(mongooseTenantIsolation);

    await mongoose.connect(MONGODB_URI);
    app.log.info('Successfully connected to MongoDB');

    // Register mongoose with Fastify for shutdown
    app.addHook('onClose', async () => {
      await mongoose.connection.close();
      app.log.info('Mongoose connection closed');
    });
  } catch (err) {
    app.log.error(`MongoDB connection error: ${err}`);
    process.exit(1);
  }
}
