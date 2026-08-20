import * as Sentry from '@sentry/nextjs';

// Next.js calls register() once on server startup. NEXT_RUNTIME tells us which of the two
// server-side environments (Node.js vs. edge) we're actually starting in, so we only load the
// matching Sentry config instead of both.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Next.js calls this for errors that happen during rendering but outside a component
// (e.g. in nested React Server Components) — global-error.tsx alone doesn't catch these.
export const onRequestError = Sentry.captureRequestError;
