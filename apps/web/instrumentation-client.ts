import * as Sentry from '@sentry/nextjs';

// Runs in the browser. Next.js auto-loads this file by its name — no manual import needed.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// Required by the SDK so client-side route changes (e.g. clicking a Link) get tracked as
// navigation spans, not just full page loads.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
