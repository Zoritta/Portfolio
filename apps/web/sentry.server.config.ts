import * as Sentry from '@sentry/nextjs';

// Runs once when the Node.js server starts. Handles errors thrown in Server Components,
// Route Handlers, and Server Actions.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
