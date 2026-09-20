import { createApp } from '../src/app';

const app = createApp();

// Vercel serverless: must use module.exports (not ES default export)
// TypeScript `export default` compiles to `exports.default` in CommonJS,
// which Vercel does NOT recognise as a valid handler.
module.exports = app;
