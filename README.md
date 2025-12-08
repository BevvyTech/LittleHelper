# LittleHelper

A hybrid documentation/help platform combining Git-hosted Markdown with PostgreSQL metadata, SSR public experience, and CSR admin console. Designed for premium software vendor help centers.

## Features

- **Git-backed content**: Markdown files in GitHub with automatic sync
- **Multi-language support**: Locale-specific pages with shared structure
- **Paragraph-level comments**: Stable anchors survive content edits
- **Release versioning**: Tag-based snapshots for versioned documentation
- **SEO optimization**: AI-powered summaries and keywords via Gemini
- **Flexible storage**: Local filesystem or S3-compatible (AWS, DigitalOcean Spaces, MinIO)
- **Responsive UI**: SSR public pages, CSR admin console, dark/light themes

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **pnpm** 8+ (`corepack enable` to install)
- **PostgreSQL** 14+
- **Git** (for GitHub sync functionality)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/littlehelper.git
cd littlehelper

# Install dependencies
pnpm install

# Copy environment template and configure
cp .env.example .env

# Run database migrations
make migrate

# Start development servers
make launch
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required
- `DATABASE_URL` - PostgreSQL connection string

### Authentication (Required for login)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SESSION_SECRET` - Secret for signing session cookies

### Optional (can be configured via Admin UI)
- `GITHUB_*` - GitHub App or PAT credentials
- `STORAGE_*` - S3-compatible storage configuration
- `GEMINI_API_KEY` - Google Gemini API key for SEO generation

See `.env.example` for complete list with descriptions.

## Development

```bash
# Start all dev servers (API, Web SSR, Admin CSR)
make launch

# Run tests
make test

# Production build verification
make verify

# Database migrations
make migrate           # Apply migrations
make migrate-test      # Validate against test DB
```

## Project Structure

```
littlehelper/
├── apps/
│   ├── api/          # Fastify backend (API + SSR serving)
│   ├── web/          # React SSR public pages
│   └── admin/        # React CSR admin console
├── packages/
│   ├── shared/       # Shared types, Zod schemas, utilities
│   └── ui/           # Shared component library
├── prisma/
│   └── schema.prisma # Database schema
├── docs/             # Project documentation
│   ├── SPEC.md       # Product specification
│   ├── ARCHITECTURE.md
│   ├── UI_DESIGN.md
│   ├── AGENTS.md     # Development guidelines
│   └── IMPLEMENTATION_PLAN.md
└── uploads/          # Local storage directory (gitignored)
```

## Architecture

LittleHelper follows **Clean Architecture** principles:

- **Domain Layer**: Pure TypeScript entities with business rules
- **Application Layer**: Use cases orchestrating domain logic
- **Interface Adapters**: Controllers, repositories, gateways
- **Framework Layer**: Fastify, Prisma, Vite, React

SSR pages have direct database access for performance. Mutations go through the API.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## Configuration Hierarchy

External services (GitHub, Storage, Gemini) support dual configuration:

1. **Environment variables** (highest priority) - for production/CI
2. **Admin Settings UI** (fallback) - for development/simple deployments

When env vars are set, corresponding UI fields are disabled with an explanation.

## Documentation

- [Product Specification](docs/SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [UI Design Guidelines](docs/UI_DESIGN.md)
- [Development Guidelines](docs/AGENTS.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

## License

[MIT](LICENSE)
