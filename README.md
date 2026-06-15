# CariAir

Malaysia's Mineral and Spring Water Source Registry

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/PostgreSQL-15-blue?style=flat&logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat&logo=docker" alt="Docker">
</p>

## Overview

CariAir is a Next.js 15 web platform serving as Malaysia's comprehensive mineral and spring water source registry. Users can search, compare, and learn about mineral water brands with detailed data on:

- pH levels
- Total Dissolved Solids (TDS)
- Mineral composition (calcium, magnesium, potassium, sodium, etc.)
- Pricing and availability
- Water source locations with KKM approval numbers

## Tech Stack

- **Framework**: Next.js 15 with App Router (React Server Components)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Database**: PostgreSQL with connection pooling via `pg`
- **Authentication**: NextAuth.js v5 (Auth.js) with Google OAuth + credentials
- **Internationalization**: next-intl (Malay `ms` as default, English `en`)
- **AI Chatbot**: Groq-powered chatbot for water-related queries
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

# Groq API (Optional - for chatbot)
GROQ_API_KEY=your-groq-api-key
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
│   ├── (routes)/          # Page routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── db.ts             # Database connection
│   ├── auth.ts           # NextAuth configuration
│   └── features.ts       # Feature flags
├── sql/                   # Database scripts
│   └── schema.sql        # Full schema + seed data
├── i18n/                  # Internationalization
├── messages/              # Translation files
│   ├── ms.json           # Malay
│   └── en.json           # English
└── scripts/               # Deployment scripts
```

## Key Features

### Database Architecture

- PostgreSQL with NextAuth adapter tables
- Images stored as BYTEA in database
- Proper foreign key relationships between products, brands, sources, and manufacturers
- Connection pooling to prevent exhaustion

### API Routes

- `/api/products` - Product search and filtering
- `/api/sources` - Water source data with KKM approval numbers
- `/api/brands` - Brand listings and parent companies
- `/api/manufacturers` - Manufacturer information
- `/api/images/[id]` - Image retrieval
- `/api/chat` - AI-powered water assistant

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

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

- Change default database passwords in production
- Generate secure `AUTH_SECRET` with `openssl rand -base64 32`
- Keep `.env` files secure (chmod 600)
- PostgreSQL port not exposed in production Docker setup

See [SECURITY.md](SECURITY.md) for security policies.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

For issues or feature requests, please open a GitHub issue.

---

<p align="center">Made with ❤️ for Malaysia's water community</p>
