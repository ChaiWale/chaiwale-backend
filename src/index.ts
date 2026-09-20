import { createApp } from './app';
import { config } from './config/env.config';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`[CHAIWALE BACKEND] Server listening on port ${config.port} (${config.env})`);
  console.log(`[CHAIWALE BACKEND] Health Check available at http://localhost:${config.port}/api/health`);
});

export default server;
