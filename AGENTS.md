# AGENTS.md

Guidance for AI agents working in this repo. Where this file conflicts with
`README.md`, `CONTRIBUTING.md`, or `PRODUCTION.md`, trust this file — those
docs are partially stale (they describe a PostgreSQL stack that no longer
exists).

## Storage: JSON file, NOT PostgreSQL

- All data lives in the schema-v2 `data/db.json` via `lib/json-store.ts` (atomic tmp+rename
  writes, in-memory cache, serialized writes). No DB server required.
- The canonical JSON is product-centric and flat. Brands, sources, and
  manufacturers are derived compatibility views; they are not separate JSON collections.
- Product IDs use `<brand>-<type>` slugs, where type is `mineral-water` or
  `drinking-water`. Each product's image is `public/images/products/<id>.webp`.
- Run `pnpm data:validate` after editing catalogue data.
- **There is no PostgreSQL, Drizzle ORM, `drizzle/`, `sql/schema.sql`, or
  `pnpm run db:*` scripts.** Ignore those sections in the docs. `.env.example`
  is the source of truth for storage.
- Images live in `public/images/products/`; their slug filename is recorded in each product.
- Record field names are snake_case (mirrors the old Postgres schema); see
  `lib/types/db.ts`.
- `lib/products.ts` is a live compatibility shim (used by `app/page.tsx`) that
  re-exports `lib/db/*` helpers as `getBrands`/`searchWaterSources`/etc. Its
  comments mention PostgreSQL but it calls the JSON store.

## Environment

- `.env.example` is authoritative. The JSON store needs no env vars. Optional:
  `GROQ_API_KEY` (chatbot), `NEXT_PUBLIC_UMAMI_*` (analytics).
- Feature flags live in `lib/features.ts`: `CHATBOT_ENABLED` (hardcoded
  `false`) and `ANALYTICS_CONFIG` (enabled only when both
  `NEXT_PUBLIC_UMAMI_SCRIPT_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` are set).
  Toggle features by editing `lib/features.ts`, not via env.

## Commands

- Package manager: **pnpm 10** (`packageManager: pnpm@10.29.2`). Use `pnpm`,
  not npm/yarn.
- `pnpm dev` — Next.js dev server on `0.0.0.0:3000`.
- `pnpm build` — `next build` (standalone output) **plus** copies
  `.next/static`, `public/`, and `data/` into `.next/standalone/` via Unix
  `cp -r`. Do not strip the copy steps; the standalone server needs them.
  **Note:** the `cp` commands fail on Windows PowerShell; run the build under
  Git Bash/WSL, or replace with cross-platform copies if developing on Windows.
- `pnpm start` — `next start` (not the production deployment path).
- `pnpm lint` — `next lint`, which is **deprecated in Next 16** and errors with
  "Invalid project directory". Use a direct ESLint invocation instead, or
  migrate to the new lint setup.
- No typecheck script; run `pnpm exec tsc --noEmit`.
- No `db:*`, `test`, or `e2e` scripts are defined despite README listing them.

## Tests

- No unit tests currently exist (`tests/` was removed — the previous tests
  imported nonexistent Postgres helpers). `vitest.config.ts` is gone.
- E2e: `playwright.config.ts` exists but `@playwright/test` is **not a
  dependency**. To run e2e, first `pnpm add -D @playwright/test`, then
  `pnpm exec playwright test` (config auto-starts `pnpm dev` as the
  `webServer`). Only `e2e/api.spec.ts` remains; it tests `/api/health`,
  `/api/products`, and `/api/sources`.
- `tsconfig.json` excludes `e2e/` and `playwright.config.ts` from
  typechecking (the latter is needed so `next build` doesn't fail on the
  missing `@playwright/test` import).

## i18n (next-intl, cookie-based)

- Locales: `ms` (default), `en`. Messages in `messages/{ms,en}.json`.
- Locale is selected via the **`CARIAIR_LOCALE` cookie**, not a URL prefix
  (`i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`). Do not add
  `/[locale]` route segments.
- `middleware.ts` currently only sets the locale cookie. Auth-based route
  protection (`/contribute`, `/analytics`) is **disabled** because the auth
  layer is unimplemented (see below).

## Auth caveat

- **No `lib/auth.ts` exists.** The auth layer is unimplemented/missing.
- `middleware.ts` previously imported `auth` from `@/lib/auth` and guarded
  `/contribute` + `/analytics` (redirect to `/login`) and redirected logged-in
  users away from `/login` + `/register`. That auth logic was removed to make
  the build pass; restore it only when `lib/auth.ts` is implemented.
- There is no `next-auth` dependency, no `lib/auth.ts`, and no
  `types/next-auth.d.ts` (removed — it augmented a module that wasn't
  installed). Confirm the current state before adding auth-dependent code.

## App structure

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind, shadcn/ui
  (`components/ui/`).
- Path alias: `@/*` -> repo root (tsconfig).
- API routes under `app/api/`: `products`, `brands`, `sources`,
  `manufacturers`, `images`, `export/{products,products/json}`, `openapi`,
  `health`, `db-test`, `chat`, `rate-limit`. Swagger UI at `/docs`.
- `components/ui/` contains only the shadcn components actually used by the
  app (19 files). Removed ~30 unused shadcn components and their Radix deps
  during cleanup; re-add via `pnpm dlx shadcn@latest add <name>` if needed.
- Production runs `.next/standalone/server.js` (the build output), launched
  by `start-prod.sh` or the systemd service. There is no longer a root
  `server.js` entry.

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
