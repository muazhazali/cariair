# CariAir

CariAir is a comprehensive web platform serving as Malaysia's definitive mineral and spring water source registry. The platform enables users to search, compare, and learn about various mineral water brands.

## Tech Stack

### Frontend Framework
- **Next.js 15** - React framework for production
- **React 19** - JavaScript library for building user interfaces
- **TypeScript** - For type-safe code

### Backend & Database
- **PostgreSQL** - Primary database
- **NextAuth.js v5** - Authentication with Google OAuth
- **pg** - PostgreSQL client for Node.js

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components for building high‑quality design systems
- **Lucide React** - Beautiful and consistent icon set
- **Embla Carousel** - Extensible carousel/slider
- **Leaflet** - Interactive maps library
- **Recharts** - Composable charting library

### Form Handling & Validation
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Input OTP** - One-time password input component

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS transformation tool
- **next-themes** - Theme management for Next.js

## Getting Started

### Option 1: Docker (Recommended)

The easiest way to run the project with all dependencies:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cariair.git
cd cariair
```

2. Copy the environment file:
```bash
cp .env.example .env.local
# Edit .env.local and add your Google OAuth credentials (optional for local dev)
```

3. Start with Docker Compose:
```bash
docker-compose up
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The Docker setup includes:
- PostgreSQL database (auto-initialized with schema)
- Next.js application
- All dependencies pre-configured

### Option 2: Local Development

If you prefer running without Docker:

#### Prerequisites
- Node.js 20+ 
- PostgreSQL 14+
- pnpm (or npm/yarn)

#### Setup

1. Clone and install:
```bash
git clone https://github.com/yourusername/cariair.git
cd cariair
pnpm install
```

2. Set up PostgreSQL:
```bash
# Create database
createdb cariair

# Run schema
psql -d cariair -f sql/schema.sql
```

3. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your database credentials
```

4. Start development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
# Database (for Docker, these are pre-configured)
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASS="postgres"
DB_NAME="cariair"

# NextAuth.js (Required for authentication)
AUTH_SECRET="your-secret-key-generate-with-openssl"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Optional: Groq API for AI chatbot
GROQ_API_KEY="your-groq-api-key"
```

Generate a secret:
```bash
openssl rand -base64 32
```

## Available Scripts

- `pnpm dev` - Starts the development server
- `pnpm build` - Builds the app for production
- `pnpm start` - Runs the built app in production mode
- `pnpm lint` - Runs ESLint to catch errors

## Docker Commands

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after dependency changes
docker-compose up --build

# Access database
docker-compose exec postgres psql -U postgres -d cariair
```

## Database Schema

The project uses PostgreSQL with the following main tables:

- **brands** - Water brands (Spritzer, Cactus, etc.)
- **sources** - Water sources with GPS coordinates
- **manufacturers** - Manufacturing companies
- **products** - Water products with pH, TDS, mineral data
- **images** - Product images stored as BYTEA
- **users** - User accounts (NextAuth.js compatible)

See `sql/schema.sql` for full schema.

## Contributing

We welcome contributions to CariAir! Here's how you can help:

1. Fork the repository
2. Create your feature branch:
```bash
git checkout -b feature/AmazingFeature
```

3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```

4. Push to the branch:
```bash
git push origin feature/AmazingFeature
```

5. Open a Pull Request

### Development Guidelines

- Write clean, maintainable, and testable code
- Follow TypeScript best practices
- Ensure your code is properly formatted
- Write meaningful commit messages
- Update documentation as needed

## License

[MIT](LICENSE)

## Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue.
