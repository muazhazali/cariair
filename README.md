# CariAir

Malaysia's Mineral and Spring Water Source Registry

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=flat&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/Drizzle-ORM-000000?style=flat" alt="Drizzle ORM">
</p>

## Overview

CariAir is a Next.js 16 web platform serving as Malaysia's comprehensive mineral and spring water source registry. Users can search, compare, and learn about mineral water brands with detailed data on:

- pH levels
- Total Dissolved Solids (TDS)
- Mineral composition (calcium, magnesium, potassium, sodium, etc.)
- Water source locations with KKM approval numbers
- Brand and manufacturer information
- Interactive map of water sources

## Tech Stack

- **Framework**: Next.js 16 with App Router (React Server Components)
- **Frontend**: React 19, TypeScript (Strict Mode), Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Auth.js) with Google OAuth + credentials
- **Internationalization**: next-intl (Malay `ms` as default, English `en`)
- **API Documentation**: Swagger/OpenAPI at `/docs`
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL database)

### Installation

```bash
# Clone the repository
git clone https://github.com/muazhazali/cariair.git
cd cariair

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials
```

### Development

**Recommended: Database in Docker, Next.js locally (fastest)**

```bash
# Terminal 1: Start PostgreSQL in Docker
pnpm run dev:db

# Terminal 2: Start Next.js dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

**Alternative: Manual PostgreSQL setup**

If you prefer not to use Docker:

```bash
# Setup PostgreSQL manually
createdb cariair
psql -d cariair -f sql/schema.sql

# Start dev server
pnpm dev
```

## Environment Variables

Create `.env.local` for development:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your-password
DB_NAME=cariair

# Authentication (Required)
AUTH_SECRET=your-secret-key

# Google OAuth (Optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

## Production Deployment

### Docker Deployment (Recommended)

```bash
# Start with Docker Compose
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Auto-start on Boot

For LXC containers or servers requiring auto-start:

```bash
# Install systemd service (Docker)
sudo ./scripts/install-systemd.sh

# Or native systemd (if Docker has issues)
sudo ./scripts/install-native.sh
```

See [PRODUCTION.md](PRODUCTION.md) for detailed deployment instructions.

## Project Structure

```
cariair/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── export/       # CSV/JSON export endpoints
│   │   ├── openapi/      # OpenAPI specification
│   │   └── ...
│   ├── docs/             # API documentation (Swagger UI)
│   ├── (routes)/         # Page routes
│   └── layout.tsx        # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── db/               # Database operations
│   │   ├── schema.ts     # Drizzle ORM schema
│   │   ├── drizzle.ts    # Drizzle client
│   │   ├── products.ts   # Product queries
│   │   ├── sources.ts    # Source queries
│   │   └── ...
│   ├── auth.ts           # NextAuth configuration
│   └── types/            # TypeScript types
├── drizzle/              # Drizzle ORM migrations
│   └── migrations/       # Migration files
├── sql/                  # Database scripts
│   └── schema.sql        # Full schema + seed data
├── i18n/                 # Internationalization
├── messages/             # Translation files
│   ├── ms.json          # Malay
│   └── en.json          # English
└── scripts/             # Deployment scripts
```

## Key Features

### Database Architecture

- PostgreSQL with Drizzle ORM for type-safe queries
- NextAuth adapter tables for authentication
- Images stored as BYTEA in database
- Proper foreign key relationships between products, brands, sources, and manufacturers
- Connection pooling to prevent exhaustion
- Incremental database migrations with Drizzle Kit

### API Routes

- `/api/products` - Product search and filtering with pagination
- `/api/sources` - Water source data with KKM approval numbers
- `/api/brands` - Brand listings and parent companies
- `/api/manufacturers` - Manufacturer information
- `/api/images/[id]` - Image retrieval
- `/api/export/products` - CSV export of all products
- `/api/export/products/json` - JSON export of all products
- `/api/openapi` - OpenAPI specification

### API Documentation

Interactive API documentation is available at `/docs` powered by Swagger UI. The documentation includes:

- All available endpoints
- Request/response schemas
- Query parameters
- Example requests

### Data Export

Export all product data for analysis:

- **CSV Export**: `/api/export/products` - Download as `cariair-products.csv`
- **JSON Export**: `/api/export/products/json` - Download as `cariair-products.json`

### Internationalization

- Locale detection via cookie (not URL prefix)
- Malay (`ms`) as default language
- English (`en`) as secondary
- Easy to add more languages

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm run db:schema` | Initialize database schema |
| `pnpm run db:generate` | Generate Drizzle migrations |
| `pnpm run db:migrate` | Run database migrations |
| `pnpm run db:studio` | Open Drizzle Studio GUI |

## Docker Commands

The `docker-compose.yml` only includes PostgreSQL (not the full app). Next.js runs locally for faster development.

```bash
# Start PostgreSQL database
pnpm run dev:db

# View database logs
docker compose logs -f

# Stop PostgreSQL
pnpm run dev:db:stop

# Stop and remove volumes (resets database)
docker compose down -v
```

See [PRODUCTION.md](PRODUCTION.md) for full-stack Docker deployment.

## Database Migrations

We use Drizzle ORM for type-safe database operations and migrations:

```bash
# Generate migrations after schema changes
pnpm run db:generate

# Apply migrations to database
pnpm run db:migrate

# Open Drizzle Studio to browse data
pnpm run db:studio
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

- Change default database passwords in production
- Generate secure `AUTH_SECRET` with `openssl rand -base64 32`
- Keep `.env` files secure (chmod 600)
- PostgreSQL port not exposed in production Docker setup
- TypeScript strict mode enabled for compile-time safety

See [SECURITY.md](SECURITY.md) for security policies.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

For issues or feature requests, please open a GitHub issue.

---

<p align="center">Made with ❤️ for Malaysia's water community</p>
