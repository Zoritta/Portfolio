# Web — Build Log & Learning Notes

A running log of what's been built in `apps/web`, why, and the concepts behind it.
Kept as a personal reference until the project is done — not meant for recruiters (that's what `README.md` is for).

## What this app is

The frontend of the portfolio: a Next.js/TypeScript app deployed to Vercel. Displays projects,
skills, and experience (pulled from the `apps/api` backend), and hosts the Job Fit Analyzer UI —
the flagship AI feature where a visitor pastes a job description and gets a RAG-grounded fit report.

## Stack decisions (and why)

- **Next.js App Router**, not Pages Router: the current standard, and what most job listings in
  the Swedish/Danish market ask for.
- **Frontend on Vercel, backend on AWS**: kept deliberately separate (rather than using Next.js API
  routes for everything) so the project can genuinely demonstrate a standalone Node.js backend
  (NestJS) — see `apps/api/PROGRESS.md` for why that mattered to this project's goals.
- **Tailwind CSS + ESLint**: scaffolded in by default via `create-next-app`.

## What's been built so far

1. Scaffolded via `create-next-app@latest` — TypeScript, App Router, ESLint, Tailwind, `src/` dir,
   import alias `@/*`.
2. Removed auto-generated `AGENTS.md` / `CLAUDE.md` template noise (not needed for this project).
3. **Connected to the API.** `src/lib/api.ts` is a small typed client (`Project`/`Skill`/`Experience`
   types mirroring the Prisma models, plus `getProjects()`/`getSkills()`/`getExperience()`) that
   fetches from `apps/api` using `API_URL` (set in `.env.local`, defaults to `http://localhost:3001`).
4. `src/app/page.tsx` is now an **async Server Component** — it `await`s all three fetches directly
   in the component (no client-side loading state needed) and renders real project/experience/skill
   data. Falls back to a plain "couldn't reach the API" message if the fetch fails, rather than crashing.
5. Fixed a **port collision**: both `next dev` and NestJS defaulted to port 3000. The API now
   defaults to `3001` (`apps/api/src/main.ts`, `PORT` env var overridable), and has CORS enabled
   (`WEB_ORIGIN` env var, defaults to `http://localhost:3000`) — needed for later features (like the
   Job Fit Analyzer) that will call the API directly from the browser instead of server-side.
6. Verified against real running servers (both started, HTML fetched, confirmed it contains actual
   seeded data like "Insighta Inc." and "Vercel AI SDK" — not just that the code compiles).

7. **Job Fit Analyzer UI.**
    - `src/lib/api.ts` gained a `FitReport` type (hand-mirrored from the backend's Zod schema — the
      two apps share no code, so the frontend just declares a matching shape), an `analyzeJobFit()`
      client function, and a `FitAnalysisError` class carrying an HTTP `status` so the UI can branch
      on *why* a request failed (429 vs. 400 vs. other) without re-parsing message strings.
    - `analyzeJobFit()` reads a **second** API URL constant, `NEXT_PUBLIC_API_URL`, instead of the
      existing `API_URL` — see Key concepts below for why two constants are needed for the same value.
    - `src/components/FitAnalyzer.tsx` — a `'use client'` component: textarea + submit button, local
      `useState` for the draft text and `idle`/`loading`/`error`/`success` status, client-side length
      validation (50–8000 chars) mirroring the backend's Zod bounds so the button disables before a
      doomed request is even sent. Renders the match score (color-coded by band), summary, strengths,
      gaps, and suggested interview questions on success.
    - Wired into `src/app/page.tsx` directly under the header, ahead of Projects — it's the flagship
      feature, so it's the first thing a visitor sees.
    - Calls the NestJS API **directly from the browser** (not proxied through a Next.js API route) —
      the backend's existing CORS config already allows `http://localhost:3000`, and calling it
      directly keeps the two-service architecture visible in the browser's network tab, which is part
      of the point of this project.
    - Added `NEXT_PUBLIC_API_URL=http://localhost:3001` to `.env.local`.
    - **Verified for real**: confirmed the static HTML renders correctly via `curl` (couldn't verify
      client-side interactivity that way — `curl` doesn't execute JavaScript), then had a human click
      through the actual form in a real browser: submitted a job description, got back a real match
      score and interview questions end-to-end.

## Key concepts (for future-me)

- **Server Component data fetching**: any `async function` page/component in the App Router can
  `await fetch(...)` directly — Next.js awaits it server-side before sending HTML to the browser.
  No `useEffect`/`useState`/loading spinners needed for data that's available at request time.
- **`{ cache: 'no-store' }`** on our fetches: tells Next.js not to cache/statically-generate this
  data — always fetch fresh. Fine for now since the app is small and data changes as we build; worth
  revisiting (e.g. `revalidate`) once the site has real traffic.
- Server-side fetches (Server Component → API) don't hit CORS at all — CORS is a *browser* rule.
  We added it anyway because upcoming client-side features (Job Fit Analyzer) will need it.
- **`NEXT_PUBLIC_` env var prefix**: Server Components run in Node.js on the server, so they can read
  any env var (`API_URL`). Client Components run in the visitor's browser after hydration, which has
  no access to server env vars at all — Next.js only inlines vars prefixed `NEXT_PUBLIC_` into the
  JS bundle it ships to the browser. Same backend URL, two constants (`API_URL` / `NEXT_PUBLIC_API_URL`),
  because *where the code runs* determines which one is even readable.
- **Server vs. Client Components, in practice**: the homepage is a Server Component (fetches data,
  ships finished HTML, no interactivity needed). `FitAnalyzer` needs `useState` and click/submit
  handlers that run after the page has loaded — that only works in a Client Component (`'use client'`
  at the top of the file). A page can freely mix both: a Server Component parent rendering a Client
  Component child, which is exactly what `page.tsx` → `<FitAnalyzer />` does here.

## Local dev cheat sheet

```bash
# from repo root — starts Postgres + API (:3001)
npm run dev:api

# in a second terminal, from repo root — starts Next.js (:3000)
npm run dev:web
```

## What's next

- Testing: Vitest/Jest for units, Playwright for e2e (including the Job Fit Analyzer form).
- Deploy to Vercel; wire up environment variables for the AWS-hosted API URL (both `API_URL` and
  `NEXT_PUBLIC_API_URL` will need to point at the deployed backend).
