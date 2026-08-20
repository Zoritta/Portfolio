import * as Sentry from '@sentry/nextjs';

// Runs for code executing in the Edge runtime (middleware). Separate from
// sentry.server.config.ts because the edge runtime can't use Node.js APIs.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
