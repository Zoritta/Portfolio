'use client';

export default function SentryTestPage() {
  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>Sentry test (temporary — delete after verifying)</h1>
      <button
        onClick={() => {
          throw new Error('Sentry test error: client-side');
        }}
      >
        Throw client-side error
      </button>
      <br />
      <br />
      <button
        onClick={async () => {
          const res = await fetch('/sentry-test-tmp/api');
          console.log('server route responded with status', res.status);
        }}
      >
        Trigger server-side error
      </button>
    </main>
  );
}
