# Architecture Overview

## System Context
LittleHelper integrates Git-hosted Markdown with a PostgreSQL metadata layer, delivering SSR public documentation and CSR admin experiences. Services communicate over HTTP/HTTPS and rely on S3-compatible storage for media.

## High-Level Components
- **Frontend SSR (Public)**: React + Vite SSR served by Node (Fastify). Renders localized help pages, release-specific versions, redirects, and paragraph-level comments via API calls.
- **Frontend CSR (Admin)**: React SPA bundled separately, bootstrapped from `/admin`. Interacts with backend via JSON APIs and websockets for live validation/status.
- **Backend API**: Node (Fastify) with route groups: public SSR, admin APIs, auth callbacks, webhook endpoints (GitHub), and health checks.
- **Database**: PostgreSQL managed by Prisma schema. Stores pages, locales, anchors, comments, releases, redirects, settings, users, sessions.
- **GitHub Connector**: Service module handling repo cloning, commits, tags, and re-indexing. Prefers GitHub App; supports PAT fallback.
- **Gemini Integration**: Generates SEO summaries and keywords on demand with toggles per settings.
- **Storage Service**: S3-compatible client for uploads and asset retrieval, using presigned URLs for admin uploads.
- **Auth**: Google OAuth (popup flow) with session tokens; roles and bans enforced in middleware.
- **Releases Engine**: Creates Git tags and DB snapshots, serves release-specific content via tag checkout.
- **Redirect Resolver**: Checks redirect table before resolving page slugs; issues 301 responses.

## Repository & Build Architecture
- **pnpm workspace** at repo root with `package.json` + `pnpm-workspace.yaml` (to be added during scaffolding).
- Proposed packages:
  - `apps/api`: Fastify server hosting SSR rendering, admin/public APIs, OAuth callbacks, webhooks, and health checks.
  - `apps/web`: React/Vite SSR entry that consumes API-rendered data for public pages and releases.
  - `apps/admin`: React CSR bundle for settings, content editing, and moderation with Vite dev server.
  - `packages/ui`: Shared component library with theming (light/dark/auto), typography, and button style selector.
  - `packages/shared`: Zod/TypeScript contracts, locale utilities, anchor helpers, and Gemini client wrappers.
- **Makefile orchestration**: `launch`/`interactive` spin up dev servers (after pnpm install), `test` runs workspace tests, `verify` performs production builds, `migrate` and `migrate test` wrap Prisma flows. CI/CD should call these targets to ensure parity with local workflows.
- **pnpm scripts** mirror Makefile expectations: each app exposes `dev`, `build`, and `test`; shared packages expose `build` and `lint`.

## Clean Architecture Standard (LittleHelper)
Goal: keep domain logic independent of frameworks, ensure external dependencies (GitHub, Prisma, Gemini, S3) are swappable, and keep SSR/CSR UI separate from business rules while maintaining thin routes and testable orchestration. This layered approach also preserves a clear path to future microservices.

### Layers
- **Entities (Domain Models)**: Pure TypeScript types/classes with no external imports. Only business rules: slug creation, redirect rules, paragraph anchor stability, release validity, edit constraints, comment validation, and version selection. No DB/HTTP/GitHub/S3/Gemini references.
- **Use Cases (Application)**: Orchestration layer. Validates input via domain entities, calls repositories/gateways via interfaces, triggers indexing/redirects/SEO, and returns DTOs. Knows what must happen—not how.
- **Interface Adapters**:
  - **Repositories (DB adapters)**: Prisma implementations such as `PageRepositoryPrisma`, `ReleaseRepositoryPrisma`, `CommentRepositoryPrisma`, `SettingsRepositoryPrisma`, `RedirectRepositoryPrisma`, `UserRepositoryPrisma` implementing interfaces from `application/ports/repositories`.
  - **Gateways (external services)**: `GithubGateway`, `GithubTagGateway`, `GeminiGateway`, `S3StorageGateway`, `OAuthGoogleGateway` implementing interfaces from `application/ports/gateways`.
  - **Controllers / Route Handlers**: API + SSR controllers (`ContentController`, `ReleaseController`, `SeoController`, `AuthController`, `SettingsController`, `CommentController`, `SSRPageRenderer`, `SSRReleaseRenderer`, `SSRRedirectHandler`) parse requests, call use cases, and return results. No business logic inside controllers.
- **Framework & Drivers (Outer Layer)**: Fastify/Express server, Vite SSR hooks, middleware, Prisma client wiring, sessions, file uploads, CORS/cookies/compression. Only layer aware of frameworks.

### Example Folder Structure
```
src/
  domain/
    content/
    releases/
    comments/
    redirects/
    users/
    settings/
  application/
    usecases/
    ports/
      repositories/
      gateways/
    dto/
  infrastructure/
    repositories/
    gateways/
    prisma/
    markdown/
    parsing/
  interface/
    api/
    ssr/
    presenters/
  server/
    server.ts
    routes.ts
    middlewares/
    vite-ssr/
  frontend/
    components/
    pages/
    admin/
    hooks/
    styles/
```

### How the Architecture Covers Key Features
- **GitHub commit-on-edit**: `CommitPageEditUseCase` + `IGithubGateway` + `PageRepositoryPrisma`.
- **Releases & historical content**: `CreateReleaseUseCase`, `ReleaseSnapshot` domain, `IGithubTagGateway`, `SSRReleaseRenderer`.
- **301 redirects**: `Redirect` domain + `CreateRedirectUseCase` + `RedirectRepositoryPrisma` + `SSRRedirectHandler`.
- **Gemini SEO generation**: `GenerateSeoMetadataUseCase` + `IGeminiGateway`.
- **Paragraph-level comments**: `ParagraphAnchor` and `Comment` domain + `AddCommentUseCase`.
- **GitHub sync + indexing**: `SyncFromGithubUseCase`; markdown parser in infrastructure.
- **Multi-language pages**: `PageLocale` domain; SSR handles fallback.
- **Hybrid Git+DB content**: domain rules define contracts; gateways implement Git; repositories handle persistence.
- **SSR public / CSR admin**: SSR/CSR concerns stay out of domain/use cases; controllers adapt requests/responses only.

## Data Flows
### Content Sync & Edit
1. Admin edits page in admin UI → saves Markdown.
2. Backend updates file in working copy, commits, pushes to configured branch via GitHub App/PAT.
3. Re-indexer pulls latest, parses Markdown frontmatter, computes anchors, updates DB. Redirects added when slugs/paths change.

### Page Rendering (Latest)
1. Request hits SSR router.
2. Router checks redirect table; issues 301 if match.
3. Resolve page by locale & slug hierarchy from DB; fetch markdown from working copy cache (latest branch) or content service.
4. Render React SSR with anchors, comments (fetched via API), breadcrumbs, header image.

### Page Rendering (Release)
1. Request to `/releases/<tag>/<locale>/<slug>/`.
2. Router validates release exists; checkout/tag content (cached) and render using release slug map and metadata snapshot.

### Paragraph Anchors
- Markdown parsed into blocks. For each block, normalize text (lowercase, strip markup), hash with page ID + locale + block index fallback. Stored in DB and reused across updates by matching similarity and order when content shifts.

## Domain Model (logical)
- `User`: id, email, name, avatar, role (admin/user), banned, lastLogin.
- `Session`: session token, user linkage, expiry.
- `Page`: canonical entity with stable ID, parent relation, header image, created/updated metadata.
- `PageLocale`: locale-specific data (title, slug, summary, keywords, markdownPath, headerImage override, Gemini lock flags).
- `Anchor`: paragraph anchors per PageLocale with stable ids and source hash/index.
- `CommentThread` & `Comment`: threads tied to anchor and user.
- `Redirect`: oldSlug, newSlug, locale, createdAt.
- `Release`: tag, name, description, createdAt, snapshot relations.
- `ReleasePageSnapshot`: mapping of PageLocale to slug at release.
- `Setting`: grouped values for tabs; stored as JSON with validation.
- `StorageAsset`: optional registry of uploaded images with metadata.
- `SyncLog`: records sync attempts and errors.

## Deployment & Runtime
- Containerized Node app with multi-stage build (install, build SSR/CSR, runtime).
- Environment variables for DB, GitHub, S3, Gemini, Google OAuth, session secrets.
- Assets served via S3; SSR server behind CDN/load balancer; health checks on `/healthz`.
- Monorepo dependencies managed with **pnpm** workspaces; CI uses `pnpm install --frozen-lockfile` and script execution via pnpm.

## Error Handling & Observability
- Structured logging (pino), request IDs, tracing hooks. Validation errors returned with field-level messages. Metrics endpoints prepared for future Prometheus integration.

## Security Considerations
- OAuth-only authentication; CSRF protection on admin mutations (token + same-site cookies).
- Least-privilege GitHub and S3 credentials. Rate limiting on auth and admin actions.
- Sanitized Markdown rendering with allowed HTML; anchors generated post-sanitization.

## Performance & Caching
- SSR output cacheable per locale/slug/release; revalidated on content sync. Redirect lookups cached in-memory. Static assets cached via CDN. Anchors and comments fetched via efficient batched queries.

## Extensibility
- Modular service boundaries: content sync, rendering, auth, settings, comments, releases. Each module exposed via interfaces to enable future provider swaps (e.g., different AI service, storage backend).

