# AGENTS.md

Compact guidance for OpenCode sessions working on CariAir.

## Commands

```bash
pnpm install    # Install deps
pnpm dev        # Dev server (binds 0.0.0.0) - requires DB running
pnpm build      # Production build
pnpm lint       # ESLint only (no test runner configured)
pnpm run db:schema   # Load sql/schema.sql (needs DB_HOST, DB_USER, DB_PASS, DB_NAME env vars)

# Database for development (PostgreSQL in Docker, Next.js native)
pnpm run dev:db        # Start PostgreSQL container
pnpm run dev:db:stop   # Stop PostgreSQL container
pnpm run dev:db:logs   # View DB logs
```

**Package manager:** pnpm (never npm/yarn)

## Development Workflow (Recommended)

**Fast local development** - PostgreSQL in Docker, Next.js native (10x faster builds):
```bash
# Terminal 1: Start database
pnpm run dev:db

# Terminal 2: Run Next.js dev server (hot reload)
pnpm dev
```

**Docker Compose:**
- `docker-compose.yml` - PostgreSQL only (Next.js runs locally)

## Environment Setup

Required in `.env.local`:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=
DB_NAME=cariair
AUTH_SECRET=        # Required for auth
AUTH_GOOGLE_ID=     # Optional
AUTH_GOOGLE_SECRET= # Optional
GROQ_API_KEY=       # Optional (chatbot)
```

## Architecture Notes

**Next.js 15 App Router** with React Server Components by default.

**Database (PostgreSQL):**
- `lib/db.ts` exports `query()`, `withTransaction()`, `getPool()` - always use these, never create new Pool instances
- Naming: DB uses `snake_case`, TypeScript uses `camelCase` - use `toCamelCase()` / `toSnakeCase()` helpers from `lib/db.ts`
- Images stored as BYTEA in `images` table, served via `/api/images/[id]`

**i18n (next-intl):**
- Locales: `ms` (default), `en`
- Locale detection via `CARIAIR_LOCALE` cookie, **not** URL prefix
- Config in `i18n/routing.ts`, translations in `messages/{ms,en}.json`

**Authentication (next-auth v5):**
- Config in `lib/auth.ts`
- Protected routes: `const session = await auth()`
- Google OAuth + credentials (bcrypt) via `@auth/pg-adapter`

**Path Aliases:**
- `@/*` maps to repository root only
- Import pattern: `@/lib/db`, `@/components/ui/button`

**Feature Flags:**
- Check `lib/features.ts` for `CHATBOT_ENABLED` and other flags

**API Pattern:**
```typescript
import { auth } from "@/lib/auth";
import { query, buildWhereClause } from "@/lib/db";
// Route handlers use NextRequest/NextResponse
```

## File Organization

- `app/api/*/` - API routes
- `app/*/page.tsx` - Page routes
- `components/ui/*` - shadcn/ui components
- `lib/db/*.ts` - Table-specific data access layer
- `sql/schema.sql` - Full DB schema with seed data
