# API — Build Log & Learning Notes

A running log of what's been built in `apps/api`, why, and the concepts behind it.
Kept as a personal reference until the project is done — not meant for recruiters (that's what `README.md` is for).

## What this app is

The standalone backend for the portfolio: a NestJS REST API backed by PostgreSQL (via Prisma),
deployed independently from the Next.js frontend (Docker → AWS ECS Fargate, later). It serves
project/skill/experience data to the frontend, and will host the Job Fit Analyzer (RAG + LLM) feature.

## Stack decisions (and why)

- **NestJS**, not a lighter framework like Fastify: chosen deliberately because its module /
  controller / service / dependency-injection structure mirrors the enterprise Java/Angular-style
  architecture common at Nordic employers (e.g. Pleo, Netcompany) — a deliberate signal for the
  Swedish/Danish job market.
- **Prisma + PostgreSQL**: type-safe DB access + versioned SQL migrations. We're pinned to
  **Prisma 6.19.3** on purpose — Prisma 7 is very new and its `schema-engine` binary had unresolved
  connection issues on this Windows/Docker setup (see Gotchas). Don't upgrade without testing migrations first.
- **Docker Compose for local Postgres**: mirrors how the DB will run in production (AWS RDS) and is
  standard DevOps practice, rather than installing Postgres natively on Windows.

## What's been built so far

1. **Monorepo scaffold** — npm workspaces (`apps/web`, `apps/api`), root `package.json` with
   cross-workspace scripts, shared `.gitignore`.
2. **NestJS app scaffolded** (`@nestjs/cli new api`).
3. **Prisma schema** (`prisma/schema.prisma`) — four models:
   - `Project` (title unique, description, techStack[], repoUrl, liveUrl, highlights[])
   - `Skill` (name unique, category, proficiency 1–5)
   - `Experience` (company + role unique together, description, startDate, endDate?) — used for
     both work history *and* education entries (school = company, programme = role)
   - `FitRequest` — not used yet; will log each Job Fit Analyzer call (job description text, match
     score, full result JSON) once that feature is built, for rate-limiting/analytics.
4. **Local Postgres** via root-level `docker-compose.yml` (service name `postgres`, db/user/pass all `portfolio`).
5. **Two migrations applied**: `init` (initial tables) and `add_unique_constraints` (added the
   `Project.title` and `Experience(company, role)` unique constraints needed for idempotent seeding).
6. **Seed script** (`prisma/seed.ts`) — populated from the real CV: 5 experience entries (3 jobs +
   2 education programmes), 2 projects, 53 skills. Skills include both CV-confirmed production
   skills (rated 4–5) *and* skills being learned through building this very project — NestJS,
   Prisma, PostgreSQL, RAG, MCP, Terraform, AWS ECS, security hardening (rated 1–3 for now,
   honestly reflecting current depth). **Bump these ratings up as each piece actually gets built.**
   Run with `npx prisma db seed`.
7. **PrismaService / PrismaModule** (`src/prisma/`) — a single `PrismaClient` instance, connected
   once on app startup and injected wherever needed via Nest's DI, rather than every module
   opening its own DB connection. Marked `@Global()` so other modules don't need to import it explicitly.
8. **Three feature modules** — `Projects`, `Skills`, `Experience` — each with a `*.module.ts`,
   `*.controller.ts`, `*.service.ts`. Currently read-only:
   - `GET /projects`, `GET /projects/:id`
   - `GET /skills`, `GET /skills/:id`
   - `GET /experience`, `GET /experience/:id`
   Write endpoints weren't added yet — YAGNI until something (e.g. an admin flow, or FitRequest
   logging) actually needs them.
9. **Verified against the real dev server** (not just written) — started `npm run start:dev`,
   curled all three endpoints, confirmed real seeded data comes back and a bad ID 404s correctly
   via `NotFoundException`.
10. **Unit tests** for all three modules — `*.service.spec.ts` mocks `PrismaService`, `*.controller.spec.ts`
    mocks the service. Covers `findAll`, `findOne` (found + not-found → `NotFoundException`), and
    that controllers correctly delegate to their service. 7 suites / 16 tests, all passing (`npm test`).
    Mocking Prisma keeps these fast and DB-independent; real-DB-backed e2e tests come later with Playwright.
11. **Connected to the Next.js frontend** — CORS enabled, port moved to `3001` to avoid colliding
    with `next dev`. See `apps/web/PROGRESS.md` for the frontend side of this.
12. **Job Fit Analyzer, stage 1: pgvector + embeddings.**
    - Switched local Postgres from `postgres:16-alpine` to `pgvector/pgvector:pg16` (docker-compose.yml)
      to get the `vector` extension. This required wiping and rebuilding the local dev volume — safe,
      since everything is reproducible from migrations + `seed.ts`.
    - New `Embedding` model (`prisma/schema.prisma`): `sourceType` + `sourceId` (which Project/Skill/
      Experience row this came from), `content` (the raw text that was embedded, kept for citations
      later), `embedding` — a `vector(1536)` column typed in Prisma as `Unsupported("vector(1536)")`,
      since Prisma has no native vector type. All reads/writes to that column go through raw SQL.
    - New `EmbeddingsModule`/`EmbeddingsService` (`src/embeddings/`) — wraps the OpenAI SDK
      (`text-embedding-3-small`, 1536 dims) and upserts into `Embedding` via `$executeRaw`. The
      OpenAI client is constructed **lazily** (only on first real use, not in the constructor) so a
      missing `OPENAI_API_KEY` can't crash the whole app at boot — see the "lazy construction" note below.
    - Added `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true })` in `app.module.ts`) as the
      explicit, standard way to load `.env` — `DATABASE_URL` happened to work before this via Prisma
      Client's own internal dotenv loading, but that's Prisma-specific behavior not worth depending
      on for a new secret like `OPENAI_API_KEY`.
    - `src/embeddings/generate-embeddings.script.ts` — a one-off script using
      `NestFactory.createApplicationContext(AppModule)` (boots the same DI container as the real
      server, minus the HTTP listener) to pull every Project/Skill/Experience row, build a text
      representation of each, and embed+store it. Run via `npm run embed:generate`. Runs sequentially
      (not `Promise.all`) to stay well under OpenAI rate limits — cost for ~60 short texts on
      `text-embedding-3-small` is a fraction of a cent.
    - `apps/api/.env.example` added, documenting required env vars (`DATABASE_URL`, `OPENAI_API_KEY`)
      without containing real secrets.
    - **Verified, not just run**: checked row counts by type (2 projects/53 skills/5 experiences —
      matches the seed exactly), confirmed 1536-dimension vectors, and ran a cosine-distance sanity
      query proving the embeddings are semantically meaningful (`React` is measurably closer to
      `Next.js` than to `Figma`) — this is what makes retrieval in stage 2 actually work.

## Key concepts (for future-me)

- **NestJS module**: a bundle of related controllers/services/providers. `@Global()` on a module
  makes its exports available everywhere without re-importing.
- **Dependency Injection**: services are declared as `providers`, then requested in a constructor
  (`constructor(private readonly prisma: PrismaService) {}`) — Nest wires up the instance automatically.
- **Prisma migration**: a versioned SQL file (`prisma/migrations/<timestamp>_<name>/migration.sql`)
  that evolves the DB schema. `migrate dev` creates + applies + regenerates the client in one step
  (interactive); `migrate deploy` only applies existing migration files (non-interactive, used in CI/prod).
- **Upsert with a natural unique key**: `Project.title` and `Experience(company, role)` are marked
  `@unique`/`@@unique` so the seed script can be re-run safely (updates existing rows instead of duplicating).
- **Embedding**: a vector (list of numbers) representing the *meaning* of a piece of text, produced
  by an embedding model. Texts with similar meaning end up with vectors that are mathematically
  close together — that's what makes semantic search possible (as opposed to keyword matching).
- **Cosine distance** (the `<=>` operator in pgvector): a measure of how far apart two vectors are —
  lower means more similar. This is the mechanism the Job Fit Analyzer's retrieval step will use:
  embed the pasted job description, then find which of your Project/Skill/Experience embeddings have
  the smallest cosine distance to it.
- **Lazy vs. eager construction**: `EmbeddingsService`'s OpenAI client is only built the first time
  it's actually needed (inside a method), not in the constructor. Nest constructs every provider at
  app boot regardless of whether a request needs it — so an eager `new OpenAI(...)` in the constructor
  would crash the *entire* app on startup if `OPENAI_API_KEY` were ever missing, even for routes that
  have nothing to do with embeddings. Verified this directly: booted the app with no key set and
  confirmed it started cleanly; only calling `embedText()` would fail.
- **`NestFactory.createApplicationContext(AppModule)`**: boots the full Nest dependency-injection
  container (all modules, all services) without starting an HTTP server — the standard way to write
  one-off scripts/CLI tasks that need real access to app services like `PrismaService`, rather than
  reimplementing DB connections from scratch.
- **RAG in one sentence**: instead of stuffing your entire dataset into every LLM prompt (expensive,
  and drowns out what's actually relevant), *retrieve* only the most relevant pieces first (via vector
  similarity), then *generate* an answer grounded in just those pieces — hence "Retrieval-Augmented Generation."
- **`generateObject` vs. a raw chat completion**: `generateObject` (Vercel AI SDK) takes a Zod schema
  and guarantees (via the SDK, working with the model's structured-output support) that what you get
  back matches that schema — no manually parsing JSON out of a text response and hoping the model
  didn't wrap it in a sentence or markdown fences.
- **Zod `.describe()`**: the strings passed to `.describe()` on schema fields aren't just documentation
  — they're sent to the model as part of the schema definition, effectively instructing it what each
  field should contain. Worth writing them carefully.
- **Rate limiting (`@nestjs/throttler`)**: tracks request counts per client IP within a rolling time
  window (`ttl`) and rejects requests over `limit` with `429 Too Many Requests`. Registered globally via
  `APP_GUARD` so it applies to every route by default, then overridden per-route with `@Throttle(...)`
  where a stricter (or looser) limit makes sense — global + per-route override, not one flat number
  everywhere, since a free `GET` and a paid-API-backed `POST` don't carry the same abuse risk.
- **Retryable vs. non-retryable errors**: the pragmatic, common pattern for calling an external API —
  catch failures at one boundary, check whether the SDK's error says the failure is transient (rate
  limit, timeout, the provider's own 5xx), and map only those to a `503` telling the client to try
  again. Everything else becomes a generic `500` with no internal details leaked, but logged
  server-side (`Logger`) so it's actually debuggable. Not every SDK-specific error subtype needs its
  own branch — two buckets (retryable / not) covers what a client can actually act on.
- **Jest can't parse ESM-only packages by default**: Jest's default config skips transforming anything
  in `node_modules`, assuming installed packages are plain CommonJS. Modern SDKs (`ai`, `@ai-sdk/openai`
  here) increasingly ship ESM-only, which breaks under that assumption — even though the real app runs
  fine, because Node's own resolver (not Jest's) correctly picks a CJS-compatible build via the
  package's `exports` field. Fix: mock the ESM package outright (`jest.mock('ai', factory)`) so the
  real file is never loaded/parsed — `jest.requireActual(...)` defeats this, since it deliberately
  loads the real (ESM) file.
- **`jest.mock()` hoisting**: Jest moves every `jest.mock()` call to the top of the file — above even
  `import` statements — before anything else runs, so mocking can affect those imports. This means a
  mock factory can't reference a variable/class declared later in the same file (it isn't initialized
  yet at that relocated position); declare it *inside* the factory function's body instead, since the
  factory itself only runs later, when the mock is actually used.

## Local dev cheat sheet

```bash
# from repo root: starts Postgres automatically, then the API
npm run dev:api

# from apps/api, if needed directly:
npx prisma migrate deploy   # apply migrations (non-interactive)
npx prisma db seed          # (re)populate Project/Skill/Experience
npm run embed:generate      # (re)generate embeddings for all Project/Skill/Experience rows
npm test                    # run unit tests
```

`npm run dev:api` (from repo root) automatically runs `docker compose up -d postgres` first via
npm's `predev:api` lifecycle hook (root `package.json`) — no need to remember to start the DB
container yourself. `docker compose up -d` is idempotent, so this is safe to run even if Postgres
is already running. You still need Docker Desktop itself open first — that part isn't automated.

## Gotchas hit on this machine (Windows)

- **`npx create-next-app` / other npx scaffolding "path not writable" errors in Git Bash** — false
  error, works fine in PowerShell. Use PowerShell for npx scaffolding commands here.
- **`prisma migrate dev` fails with "non-interactive environment" when there's a warning to confirm**
  (e.g. adding a unique constraint) — because this environment's shell isn't a real TTY. Fix: use
  `migrate dev --create-only` to generate the migration file, or hand-write the SQL, then apply with
  `migrate deploy` (which never prompts).
- **Prisma 7's `schema-engine-windows.exe` couldn't reach the Dockerized Postgres** even though raw
  TCP from Node worked fine — root cause was a flaky Docker Desktop/WSL2 networking state, not a
  config issue. A full Docker Desktop reinstall fixed it. We also downgraded to Prisma 6 in the
  process since 7's config format (`prisma.config.ts`) was still rough. Stay on 6 for now.
- **After reinstalling Docker Desktop, the `docker` CLI vanished from open shell sessions** — PATH
  was updated at the OS level but existing terminal sessions had a stale copy. Fix: reload PATH from
  the registry in-session, or just open a fresh terminal.
- **`prisma init` (v7) auto-installs AI-agent "skills" folders** (`.claude/skills`,
  `.windsurf/skills`, `.agents/skills`, `skills-lock.json`) — unwanted clutter, safe to delete.
- **Switching Postgres Docker images (alpine → pgvector's debian-based image) can risk index
  corruption** if you keep the old data volume — different base images can use different text
  collation libraries. Safe fix: `docker compose down -v` to drop the volume, then rebuild from
  migrations + seed (both in git, so nothing real is lost). Only reasonable because this is
  disposable local dev data, not production.
- **A secret pasted into a file the assistant has touched in a session can end up visible in that
  session's transcript**, even if you never paste it directly into chat — file-change tracking can
  surface diffs. Treat any key placed in a tracked file as exposed to that session; rotate keys that
  went through this path rather than relying on session boundaries for secrecy.

13. **Job Fit Analyzer, stage 2: retrieval + generation endpoint.**
    - `EmbeddingsService.findSimilar(queryEmbedding, limit)` — raw SQL using pgvector's `<=>`
      (cosine distance) operator, `ORDER BY distance ASC LIMIT n`. This is the "retrieval" half of RAG.
    - New `FitAnalysisModule` (`src/fit-analysis/`) — `POST /fit-analysis`:
      1. Validate the request body with a Zod schema (`jobDescription`, 50–8000 chars) via a small
         reusable `ZodValidationPipe` (`src/common/pipes/`) — chose Zod over `class-validator` to stay
         consistent with one validation library across the project.
      2. Embed the job description (reusing `EmbeddingsService.embedText`).
      3. Retrieve the top 12 closest `Embedding` rows.
      4. Call `generateObject` (Vercel AI SDK, `@ai-sdk/openai`, model `gpt-4o-mini`) with a Zod
         schema (`fit-report.schema.ts`) for the output shape — the model's response is validated
         against that schema by the SDK, so we get a typed object back, not raw text to parse.
      5. Log the result to `FitRequest` (job description, match score, full result JSON).
    - Same lazy-construction pattern as `EmbeddingsService`: the AI SDK's OpenAI provider is built
      inside `getModel()`, not the constructor.
    - **Baseline prompt-injection hygiene included now** (cheap to do correctly from the start): the
      system prompt explicitly tells the model the job description is untrusted data to analyze, not
      instructions to follow, and the prompt clearly delimits it with `"""` fences. This is *not* full
      hardening — no rate limiting, no abuse detection yet. That's still the next stage before this
      could safely be exposed publicly.
    - **Verified with a real call** (not mocked): posted a realistic Malmö fullstack job description,
      got back a grounded 92% match report citing specific sources, correctly flagged PostgreSQL and
      Kubernetes as gaps (matching the honestly-low proficiency ratings seeded for those skills — proof
      the grounding is actually working, not just plausible-sounding), and confirmed the `FitRequest`
      row was written. Also verified the 400 path: a too-short job description is rejected by Zod
      before any OpenAI call is made.
    - Added light unit tests for the Zod schema boundary and the validation pipe (9 suites / 22 tests
      passing). Deep-mocking `generateObject` itself wasn't worth it — mocking an LLM call doesn't
      prove much; the real end-to-end call above is the meaningful verification.

14. **Job Fit Analyzer, stage 3: security hardening.**
    - **Rate limiting** (`@nestjs/throttler`) — the real risk `/fit-analysis` carries: each call makes
      two paid OpenAI requests (one embedding + one `gpt-4o-mini` generation) with no auth in front of
      it, so an unthrottled endpoint is a direct cost-abuse target. Registered a generous app-wide
      default (`ThrottlerModule.forRoot`, 60 requests/min per IP) in `app.module.ts` via `APP_GUARD` so
      normal portfolio browsing (multiple GETs from `/projects`, `/skills`, `/experience`) never trips
      it, then overrode it with a much stricter `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on
      `FitAnalysisController` specifically. Response headers now include `X-RateLimit-Limit` /
      `-Remaining` / `-Reset`.
    - **HTTP security headers** (`helmet`) — added `app.use(helmet())` in `main.ts`. Sets baseline
      headers like `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
      `X-Frame-Options: SAMEORIGIN`, `Strict-Transport-Security`. Low-cost, standard hardening for any
      public-facing API, even a pure-JSON one.
    - **Prompt-injection defense reviewed, not rebuilt** — this was already in decent shape from stage
      2: the system prompt explicitly labels the job description as untrusted data (not instructions),
      and `generateObject`'s schema constraint means injected text can't make the model emit anything
      outside the fixed `FitReport` shape. No code change needed here; this is an inherent LLM
      limitation (grounding reduces but can't 100% eliminate the risk of a model being swayed by
      adversarial input) rather than something a rate limiter or header can fix.
    - **Verified against a real running server**: killed a stale dev server holding port 3001, restarted
      clean, fired 6 rapid `POST /fit-analysis` requests — first 5 returned `201`, the 6th returned
      `429`. Confirmed `helmet`'s headers appear on a real response via `curl -I`. Full test suite still
      green (9 suites / 22 tests) after both changes.

15. **Job Fit Analyzer, stage 4: specific error handling + real test coverage.**
    - **Before**: any failure inside `analyze()` (OpenAI down, rate-limited, DB write failure) fell
      through uncaught to Nest's default generic `500 Internal server error`, with nothing logged
      server-side — no way to tell "OpenAI is having an outage" from "our own code broke" from the logs.
    - **Split `analyze()` into two parts** — `generateReport()` (the AI-dependent work: embed, retrieve,
      `generateObject`) and `logRequest()` (writing the `FitRequest` row), each with its own try/catch,
      because they have different failure semantics:
      - `generateReport()` failures are user-facing: checked `error instanceof APICallError &&
        error.isRetryable` (from the `ai` SDK) or `error instanceof APIError` (from `openai`) with a
        429/5xx `.status` — these map to `ServiceUnavailableException` (503, "temporarily unavailable,
        try again"). Anything else maps to a generic `InternalServerErrorException` (500) — deliberately
        not leaking internal details (e.g. a misconfigured API key) to the client.
      - `logRequest()` failures are **not** user-facing: by the time this runs, the visitor already has
        a real report. A failed analytics write shouldn't turn a successful request into an error, so
        this is caught, logged, and swallowed — the response still succeeds.
      - Added `Logger` (NestJS's built-in) so both failure paths are actually visible server-side now,
        instead of vanishing.
    - **Frontend** (`apps/web/src/lib/api.ts`): added a `503` branch to `analyzeJobFit()` ("The AI
      service is temporarily unavailable...") alongside the existing 400/429 handling, and made the
      generic fallback message slightly more honest ("Something went wrong on our end").
    - **Real bug found while wiring this up, not cosmetic**: `generateObject` itself is marked
      `@deprecated` in the installed `ai` SDK version (`Use generateText with an output setting
      instead`) — still fully functional, not fixed now to avoid scope creep on this stage, but worth
      migrating later.
    - **New tests**: `embeddings.service.spec.ts` (4 tests — API-key-missing guard, `embedText`,
      `upsert`, `findSimilar`), `fit-analysis.service.spec.ts` (4 tests — happy path, retryable-error →
      503, unexpected-error → 500, and that a `FitRequest` logging failure doesn't fail the overall
      request), `fit-analysis.controller.spec.ts` (1 delegation test, matching the existing controller
      test style). 12 suites / 31 tests passing.
    - **Real, non-obvious Jest problem hit and fixed**: `ai` and `@ai-sdk/openai` ship ESM-only, which
      Jest's default CommonJS transform can't parse (`node_modules` is untransformed by default) —
      the real app works because Node's own resolver picks the CJS-compatible build via the package's
      `exports` field, but Jest's resolver doesn't make the same choice. Fixed by mocking both modules
      outright (`jest.mock('ai', factory)`, no `jest.requireActual`) so the real ESM files are never
      loaded. Also hit and fixed a `jest.mock()` hoisting issue: `jest.mock()` calls are moved above
      all other code (even `import`s) before the file runs, so a class referenced by the factory but
      declared elsewhere in the file isn't initialized yet at that point — fixed by declaring the
      stand-in class *inside* the factory function itself.

## What's next

- Migrate `generateObject` → `generateText` with an `output` setting (deprecated in the installed
  `ai` SDK version, still functional).
- MCP server exposing this same data as agent-callable tools.
- Dockerize the API, Terraform for AWS (RDS, ECS Fargate, Secrets Manager), GitHub Actions CI/CD.
