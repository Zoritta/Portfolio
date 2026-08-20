import 'dotenv/config';
import './instrument';

import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

// CORS does exact string matching (no wildcard subdomain support), so every real frontend origin
// that will ever call this API needs to be listed explicitly — the custom domain redirects its
// bare apex to `www`, so both variants are needed, not just whichever one a browser's address bar
// happens to show. WEB_ORIGIN stays supported too, for e.g. a preview deployment URL.
const ALLOWED_ORIGINS = [
  'https://www.zohrehsadeghi.se',
  'https://zohrehsadeghi.se',
  'https://portfolio-web-iota-self.vercel.app',
  'http://localhost:3000',
  process.env.WEB_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: ALLOWED_ORIGINS });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
