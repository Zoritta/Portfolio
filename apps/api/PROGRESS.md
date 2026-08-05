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

## What's next

- Job Fit Analyzer, stage 2: a retrieval + generation endpoint — embed an incoming job description,
  find the closest Embedding rows (cosine distance), and call the OpenAI API (via Vercel AI SDK) to
  generate a grounded fit report with citations and a match score. Log each call to `FitRequest`.
- Security hardening around that endpoint: zod input validation, rate limiting, prompt-injection defenses.
- Frontend: Job Fit Analyzer UI (job-description input, streamed report).
- MCP server exposing this same data as agent-callable tools.
- Dockerize the API, Terraform for AWS (RDS, ECS Fargate, Secrets Manager), GitHub Actions CI/CD.
