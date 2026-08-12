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

8. **UI/UX polish pass.** Before adding more tech, made the app *feel* finished.
    - **Manual dark/light toggle** (`next-themes`) — replaced the previous OS-only
      `prefers-color-scheme` approach. Used the library rather than hand-rolling it because getting
      this right (no flash-of-wrong-theme on load) needs a synchronous script injected before first
      paint, which is easy to get subtly wrong by hand. `globals.css` now defines
      `@custom-variant dark (&:where(.dark, .dark *))` so every existing `dark:` utility class now
      matches a `.dark` class on `<html>` instead of the media query — no component markup had to
      change. `ThemeToggle.tsx` renders a placeholder `<div>` until mounted client-side (its real
      icon depends on `resolvedTheme`, which is unknown during server rendering — rendering it
      immediately would cause a hydration mismatch).
    - **Reconsidered and dropped a homepage Suspense/streaming refactor** — initially planned to
      split Projects/Skills/Experience into separate `<Suspense>`-wrapped sections with skeletons.
      Correctly called out as overkill: all three already fetch in parallel from one fast local
      backend via a single `Promise.all`, so splitting them wouldn't change what a visitor perceives,
      just add three files and duplicated error handling. Kept `page.tsx` as-is. Good example of a
      pattern being architecturally interesting but not worth its complexity for this specific case.
    - **Project cards**: `repoUrl`, `liveUrl`, and `highlights` were being fetched but never
      rendered — a real gap, now fixed (conditionally rendered, since both currently-seeded projects
      have `liveUrl: null`). Added hover elevation (`hover:shadow-md`).
    - **Empty states** added for all three homepage sections (in case Projects/Skills/Experience
      ever return empty) via a small shared `EmptyState` component.
    - **Job Fit Analyzer loading skeleton**: replaced the plain "Analyzing…" button-text-only loading
      state with a proper skeleton (new `Skeleton.tsx` primitive, `animate-pulse`) shaped like the
      real report, plus a `fade-in` CSS keyframe (`globals.css`) applied to both the success report
      and error message when they appear. This is a loading *indicator*, not streaming — the backend
      still returns the whole `FitReport` in one response only once `generateObject` fully completes;
      nothing is sent incrementally. Real LLM-token streaming (`streamObject`/`useObject`) was
      considered and skipped, same reasoning as before: a schema-validated structured report doesn't
      benefit from rendering partial/invalid JSON mid-generation.
    - **`FormEvent` → `SubmitEvent`**: `@types/react` (React 19) marks `FormEvent` as deprecated —
      it was never backed by a real DOM event; `SubmitEvent<T>` is the correct type for a form's
      `onSubmit` handler. Caught by a real (not stale) type-checker diagnostic.
    - **Verified**: `npx tsc --noEmit` clean throughout, real data confirmed via `curl` against the
      live API (e.g. confirmed `liveUrl: null` on both seeded projects directly, so the missing "Live"
      link is correct data, not a rendering bug), and a human click-through confirmed the toggle,
      cards, and skeleton/fade-in all work in a real browser.

9. **Frontend test setup + component tests.** Zero test tooling existed before this — set up
   Jest + React Testing Library, matching Jest as the test runner across both `apps/api` and
   `apps/web` (one tool to know, not two).
    - `npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
      @testing-library/user-event @types/jest`.
    - `jest.config.ts` uses `next/jest` (Next's official helper — auto-configures the SWC
      transform, CSS/asset mocking) plus an explicit `moduleNameMapper` for the `@/*` alias: Next's
      automatic alias detection from `tsconfig.json` wasn't picking it up on this Next.js version,
      so it's declared directly rather than spending time root-causing a canary-version quirk.
      Also had to change `import nextJest from "next/jest"` to `"next/jest.js"` — this Next version
      enforces strict ESM resolution for that subpath, which requires the explicit extension.
    - `jest.setup.ts` imports `@testing-library/jest-dom` for matchers like `.toBeInTheDocument()`.
    - **`FitAnalyzer.spec.tsx`** (3 tests) — the submit button stays disabled until the job
      description clears the 50-char minimum; a successful submit shows a loading state then the
      rendered report (score, summary, strengths, gaps); a rejected `FitAnalysisError` renders its
      message. Mocks only `analyzeJobFit` from `@/lib/api` (via `jest.requireActual` for everything
      else) — `FitAnalysisError` has to stay the *real* class, since the component does
      `err instanceof FitAnalysisError` to decide which message to show; mocking it would break that.
    - **Deliberately skipped a `ThemeToggle` test** — it's ~30 lines of trivial branching (pick an
      icon, call `setTheme` with the opposite value); a bug there is immediately obvious visually
      and purely cosmetic. `FitAnalyzer` has real branching logic (validation boundary, three
      distinct error paths, loading/success transitions) tied to the flagship feature, where a
      regression could actually mislead a visitor — that's where test investment pays off, not here.
    - Added `npm test` / `npm test:watch` scripts, matching `apps/api`'s naming.

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
- **Loading skeleton vs. streaming**: a skeleton is just client-side UI shown while waiting on a
  single request/response cycle — no different network behavior involved. Streaming means the server
  sends a response in chunks that the client renders progressively (e.g. Suspense-based streaming
  SSR, or LLM token streaming). The two are easy to conflate but solve different problems.
- **`@custom-variant dark (&:where(.dark, .dark *))`** (Tailwind v4, `globals.css`): redefines what
  the `dark:` prefix means. Tailwind v4's default is "matches `prefers-color-scheme: dark`"; this
  makes it "matches when a `.dark` class exists on `<html>` or an ancestor" instead — required for
  `next-themes` (or anything) to let a user manually override the OS preference.

## Local dev cheat sheet

```bash
# from repo root — starts Postgres + API (:3001)
npm run dev:api

# in a second terminal, from repo root — starts Next.js (:3000)
npm run dev:web

# from apps/web
npm test          # run component tests once
npm run test:watch
```

10. **`ThemeToggle` fixed for a newer `react-hooks` lint rule.** Surfaced while setting up CI
    (see `apps/api/PROGRESS.md` item 17) — `useEffect(() => setMounted(true), [])` trips
    `react-hooks/set-state-in-effect`, which flags calling `setState` synchronously inside an
    effect body (it causes an extra cascading render). Replaced with `useSyncExternalStore`:
    ```ts
    const subscribe = () => () => {};
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);
    ```
    `subscribe` is a no-op (there's nothing to subscribe to — this value only ever flips once),
    `() => true` is the snapshot used once running in the browser, `() => false` is the snapshot
    used during server rendering. This gives the same "false during SSR, true after hydration"
    behavior the effect+state version had (needed so `resolvedTheme` — unknown on the server — never
    causes a hydration mismatch), without an effect or a `setState` call at all. A known idiom for
    exactly this "mount detection" problem, not something specific to this component.

## What's next

11. **Deployed to Vercel (Phase 4 of the roadmap).** Live at
    `https://portfolio-web-iota-self.vercel.app`. Root Directory set to `apps/web` in Vercel's
    project settings — required for a monorepo, since Vercel scans the whole repo by default and
    needs to be told which app to build. Vercel auto-detects the root `package.json`'s npm
    `workspaces` field and still installs from the true repo root even with Root Directory scoped
    down, so no custom install/build command was needed — the plain `next build` script Just Worked.
    - `API_URL` and `NEXT_PUBLIC_API_URL` both set to the live Render API URL
      (`https://portfolio-iwzr.onrender.com`) as Vercel env vars.
    - **Verified for real**: `curl`'d the deployed homepage and confirmed real seeded content
      (project titles, name) came back rather than the `page.tsx` fallback message for an
      unreachable API; a human click-through confirmed the Job Fit Analyzer works end-to-end
      against the live Render API from a real browser (see `apps/api/PROGRESS.md` item 18 for the
      CORS trailing-slash bug that had to be fixed first, and how it was found).

## What's next

- Playwright for e2e (including a full Job Fit Analyzer submit flow against a real running API).
- `npm audit` flagged 3 high-severity issues in `next`'s own transitive deps (`postcss`, `sharp`) —
  pre-existing, unrelated to anything built here. Worth a dedicated look, not fixed yet.
