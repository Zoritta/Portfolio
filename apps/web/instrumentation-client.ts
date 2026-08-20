import * as Sentry from '@sentry/nextjs';

// Runs in the browser. Next.js auto-loads this file by its name — no manual import needed.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
