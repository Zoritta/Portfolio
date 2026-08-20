import * as Sentry from '@sentry/nestjs';

// Must be imported before any other module (see main.ts) so Sentry can instrument everything
// else as it loads.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
