import { buildApp } from './app.js';

const start = async () => {
  try {
    const app = await buildApp();
    const port = (app as any).config.PORT || 3000;
    const host = '0.0.0.0';

    await app.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
