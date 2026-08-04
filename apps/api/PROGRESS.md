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

## Local dev cheat sheet

```bash
# from repo root: starts Postgres automatically, then the API
npm run dev:api

# from apps/api, if needed directly:
npx prisma migrate deploy   # apply migrations (non-interactive)
npx prisma db seed          # (re)populate Project/Skill/Experience
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

10. **Unit tests** for all three modules — `*.service.spec.ts` mocks `PrismaService`, `*.controller.spec.ts`
    mocks the service. Covers `findAll`, `findOne` (found + not-found → `NotFoundException`), and
    that controllers correctly delegate to their service. 7 suites / 16 tests, all passing (`npm test`).
    Mocking Prisma keeps these fast and DB-independent; real-DB-backed e2e tests come later with Playwright.

## What's next

- Connect the Next.js frontend to these endpoints.
- Job Fit Analyzer: RAG pipeline (pgvector), OpenAI integration, `FitRequest` logging, rate limiting, prompt-injection hardening.
- MCP server exposing this same data as agent-callable tools.
- Dockerize the API, Terraform for AWS (RDS, ECS Fargate, Secrets Manager), GitHub Actions CI/CD.
