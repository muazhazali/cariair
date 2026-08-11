# AGENTS.md

Guidance for AI agents working in this repo. Where this file conflicts with
`README.md`, `CONTRIBUTING.md`, or `PRODUCTION.md`, trust this file — those
docs are partially stale (they describe a PostgreSQL stack that no longer
exists).

## Storage: JSON file, NOT PostgreSQL

- All data lives in `data/db.json` via `lib/json-store.ts` (atomic tmp+rename
  writes, in-memory cache, serialized writes). No DB server required.
- `lib/db/{products,brands,sources,manufacturers,images}.ts` are thin wrappers
  over the JSON store; `lib/db/index.ts` re-exports them.
- **There is no PostgreSQL, Drizzle ORM, `drizzle/`, `sql/schema.sql`, or
  `pnpm run db:*` scripts.** Ignore those sections in the docs. `.env.example`
  is the source of truth for storage.
- Images live in `public/images/db/`, not in the DB.
- Record field names are snake_case (mirrors the old Postgres schema); see
  `lib/types/db.ts` and `lib/data-schema.ts`.

## Environment

- `.env.example` is authoritative. The JSON store needs no env vars. Optional:
  `GROQ_API_KEY` (chatbot), `NEXT_PUBLIC_UMAMI_*` (analytics).
- `lib/env.ts` validates `DB_HOST/DB_USER/DB_NAME/AUTH_SECRET` and **throws on
  import** if missing — but **nothing imports it**. Do not add `@/lib/env`
  imports unless you also supply DB env vars or remove those requirements. It
  is stale.
- Feature flags: `lib/features.ts` hardcodes `CHATBOT_ENABLED = false`. The
  `NEXT_PUBLIC_*` flags in `lib/env.ts` are unused. Toggle features by editing
  `lib/features.ts`, not via env.

## Commands

- Package manager: **pnpm 10** (`packageManager: pnpm@10.29.2`). Use `pnpm`,
  not npm/yarn.
- `pnpm dev` — Next.js dev server on `0.0.0.0:3000`.
- `pnpm build` — `next build` (standalone output) **plus** copies
  `.next/static`, `public/`, and `data/` into `.next/standalone/`. Do not
  strip the copy steps; the standalone server needs them.
- `pnpm start` — `next start` (not the production deployment path).
- `pnpm lint` — `next lint`. No typecheck script; run `pnpm exec tsc --noEmit`.
- No `db:*`, `test`, or `e2e` scripts are defined despite README listing them.
  Run tests directly:
  - Unit: `pnpm exec vitest` (config `vitest.config.ts`; `tests/setup.ts`
    injects mock env vars).
  - E2e: `pnpm exec playwright test` (config `playwright.config.ts`; auto-
    starts `pnpm dev` as the `webServer`).

## Tests are partially broken — verify before trusting

- `tests/db.test.ts` imports `toCamelCase/toSnakeCase/isValidUUID/
  buildWhereClause` from `@/lib/db`, but those helpers do not exist in the
  JSON-store modules. This test will fail to import. Don't assume green tests.
- `tsconfig.json` excludes `tests/` and `e2e/` from typechecking.

## i18n (next-intl, cookie-based)

- Locales: `ms` (default), `en`. Messages in `messages/{ms,en}.json`.
- Locale is selected via the **`CARIAIR_LOCALE` cookie**, not a URL prefix
  (`i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`). Do not add
  `/[locale]` route segments.
- `middleware.ts` sets the cookie, guards `/contribute` and `/analytics`
  (redirect to `/login`), and redirects logged-in users away from `/login`
  and `/register`.

## Auth caveat

- `middleware.ts` imports `auth` from `@/lib/auth`, but **no `lib/auth.ts`
  exists** in the repo. The auth layer is unimplemented/missing; protected-
  route redirects will error at runtime. Confirm the current state before
  adding auth-dependent code.

## App structure

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind, shadcn/ui
  (`components/ui/`).
- Path alias: `@/*` -> repo root (tsconfig + vitest).
- API routes under `app/api/`: `products`, `brands`, `sources`,
  `manufacturers`, `images`, `export/{products,products/json}`, `openapi`,
  `health`, `db-test`, `chat`, `rate-limit`. Swagger UI at `/docs`.
- `server.js` (root) is a committed standalone Next.js server entry used in
  production; `start-prod.sh` runs `.next/standalone/server.js`. Note:
  `server.js` hardcodes `outputFileTracingRoot: "/opt/cariair"`.

## Production deploy

- Native Node.js + systemd (LXC-friendly, no Docker). `sudo
  ./scripts/install-native.sh` installs to `/opt/cariair`, builds, copies
  standalone artifacts, and enables `cariair.service`. The systemd commands in
  `PRODUCTION.md` are accurate; its DB/env sections are stale.

## Conventions

- TypeScript strict, no emit. Prefer editing existing files; shadcn/ui
  components live in `components/ui/`.
- Commit messages: present-tense imperative, <=72-char subject
  (`CONTRIBUTING.md`).
- No CI workflows are defined; `.github/` contains only issue/PR templates.