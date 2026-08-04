# Web — Build Log & Learning Notes

A running log of what's been built in `apps/web`, why, and the concepts behind it.
Kept as a personal reference until the project is done — not meant for recruiters (that's what `README.md` is for).

## What this app is

The frontend of the portfolio: a Next.js/TypeScript app deployed to Vercel. Displays projects,
skills, and experience (pulled from the `apps/api` backend), and will host the Job Fit Analyzer UI —
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
3. Nothing custom built yet — this is still the default scaffold.

## Local dev cheat sheet

```bash
# from repo root
npm run dev:web    # starts Next.js dev server (usually :3000, or next free port if apps/api is on 3000)
npm run build:web
npm run lint:web
```

## What's next

- Build pages/components that fetch from `apps/api`'s `/projects`, `/skills`, `/experience` endpoints.
- Job Fit Analyzer UI: job-description input, streamed fit report (Vercel AI SDK), match score, citations.
- Testing: Vitest/Jest for units, Playwright for e2e.
- Deploy to Vercel; wire up environment variables for the AWS-hosted API URL.
