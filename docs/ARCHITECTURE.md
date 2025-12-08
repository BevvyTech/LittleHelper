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

#### Algorithm Overview
Paragraph anchors provide stable identifiers for content blocks, enabling comments to survive minor edits.

#### Step 1: Block Extraction
```
1. Parse Markdown into AST (using unified/remark)
2. Extract top-level blocks: paragraphs, headings, code blocks, lists, blockquotes
3. Skip empty blocks and metadata-only blocks
4. Assign sequential position index (0, 1, 2, ...)
```

#### Step 2: Text Normalization
```
For each block:
1. Strip all Markdown formatting (bold, italic, links, etc.)
2. Convert to lowercase
3. Collapse whitespace (multiple spaces/newlines → single space)
4. Trim leading/trailing whitespace
5. Remove punctuation for hashing (keep for display)
Result: normalized plain text string
```

#### Step 3: Hash Generation
```
anchorHash = SHA-256(pageLocaleId + ":" + normalizedText).substring(0, 16)
anchorId = "p-" + anchorHash
```

#### Step 4: Anchor Reconciliation (on content update)
```
1. Generate new anchors for updated content
2. For each new anchor:
   a. Exact match: Find existing anchor with same hash → reuse anchorId
   b. Fuzzy match: If no exact match, find anchor within ±3 positions
      with >80% text similarity (Levenshtein ratio) → reuse anchorId
   c. No match: Create new anchorId
3. Orphaned anchors (existing but not matched):
   - Keep in DB for 30 days (comments remain accessible via direct link)
   - Mark as "orphaned" with timestamp
   - Cleanup job removes after retention period
```

#### Edge Cases
- **Duplicate content**: Same text appearing twice gets unique anchors via position tiebreaker
- **Block splitting**: When one block splits into two, first half keeps original anchor
- **Block merging**: When blocks merge, the first block's anchor is preserved
- **Reordering**: Position tolerance (±3) handles minor reordering without breaking anchors

## API Design

### Architecture Decision: SSR with Direct DB Access
SSR pages have **direct database access** via Prisma for optimal read performance. This eliminates HTTP overhead for page rendering while keeping mutations through the API for proper validation and side effects.

### Route Structure
All API routes are mounted under `/api/` prefix on the same Fastify server.

#### Public API (no auth required)
```
GET  /api/health                          # Health check
GET  /api/pages/:locale/:slug             # Page content (for client-side hydration)
GET  /api/pages/:pageLocaleId/comments    # Comments for a page
GET  /api/releases                        # List available releases
GET  /api/releases/:tag                   # Release metadata
GET  /api/assets/*                        # Asset proxy (when secure mode enabled, requires auth)
```

#### Authenticated API (session required)
```
POST /api/comments                        # Create comment
DELETE /api/comments/:id                  # Delete own comment
GET  /api/auth/me                         # Current user info
POST /api/auth/logout                     # End session
```

#### Admin API (admin role required)
```
# Content Management
GET    /api/admin/pages                   # List all pages (tree structure)
GET    /api/admin/pages/:id               # Page details with all locales
POST   /api/admin/pages                   # Create new page
PUT    /api/admin/pages/:id               # Update page metadata
DELETE /api/admin/pages/:id               # Delete page (with redirects)
PUT    /api/admin/pages/:id/content       # Update Markdown content (triggers Git commit)

# GitHub Sync
POST   /api/admin/sync/trigger            # Manual sync from GitHub
GET    /api/admin/sync/status             # Current sync status
GET    /api/admin/sync/logs               # Sync history
POST   /api/admin/sync/test-connection    # Test GitHub connection

# Releases
POST   /api/admin/releases                # Create new release
DELETE /api/admin/releases/:tag           # Delete release

# Comments Moderation
GET    /api/admin/comments                # List all comments (with filters)
DELETE /api/admin/comments/:id            # Delete any comment

# User Management
GET    /api/admin/users                   # List users
PUT    /api/admin/users/:id/role          # Change user role
PUT    /api/admin/users/:id/ban           # Ban/unban user

# Settings
GET    /api/admin/settings/:group         # Get settings group
PUT    /api/admin/settings/:group         # Update settings group
GET    /api/admin/settings/env-status     # Which settings are env-controlled

# Storage
POST   /api/admin/upload                  # Upload asset (multipart)
GET    /api/admin/assets                  # List assets
DELETE /api/admin/assets/:id              # Delete asset
POST   /api/admin/upload/presign          # Get presigned URL (S3 mode only)

# SEO
POST   /api/admin/seo/generate/:pageLocaleId  # Generate SEO for page
POST   /api/admin/seo/generate-all            # Bulk SEO generation
```

#### Auth Callbacks (OAuth flow)
```
GET  /auth/google                         # Initiate Google OAuth
GET  /auth/google/callback                # OAuth callback handler
```

### Request/Response Format
- All API responses use JSON
- Success responses: `{ data: T }` or `{ data: T, meta: { ... } }` for pagination
- Error responses: `{ error: { code: string, message: string, details?: Record<string, string> } }`
- Field validation errors include `details` mapping field names to error messages

### Error Codes
```
AUTH_REQUIRED          # No valid session
AUTH_FORBIDDEN         # Insufficient permissions
VALIDATION_ERROR       # Request validation failed (check details)
NOT_FOUND              # Resource not found
CONFLICT               # Resource conflict (e.g., duplicate slug)
RATE_LIMITED           # Too many requests
EXTERNAL_SERVICE_ERROR # GitHub/Gemini/S3 error
INTERNAL_ERROR         # Unexpected server error
```

## Storage Architecture

### Design Principles
1. **Database is source of truth**: Every asset has a DB record tracking its location
2. **Public by default**: Assets served directly from storage (no server proxy)
3. **Secure mode optional**: Admin can enable proxied access for private deployments
4. **Backend-agnostic**: Switching storage backends doesn't break existing references

### Storage Backends

#### Local Storage (Default)
- Files stored in configurable directory (default: `./uploads/`)
- Direct file system operations, no external dependencies
- Public access via Fastify static file handler at `/uploads/*`
- Suitable for: development, small deployments, single-server setups

#### S3-Compatible Storage
- Works with AWS S3, DigitalOcean Spaces, MinIO, etc.
- **Files must be publicly accessible** (public bucket or public ACL on objects)
- Direct browser access via public URL (no presigned URLs for reads)
- Upload uses presigned URLs for secure direct-to-S3 uploads
- Suitable for: production, multi-server, CDN-backed setups

### Asset Database Record
Every uploaded file creates a `StorageAsset` record containing:
- `storageType`: Which backend holds the file (LOCAL, S3)
- `storagePath`: Path within that backend
- `publicUrl`: Direct access URL (resolved at upload time)
- File metadata (original name, mime type, size)

This ensures:
- Assets remain accessible if storage backend changes (old URLs still work)
- Future storage migrations can update records without breaking references
- Analytics/audit trail of all uploaded assets

### File Organization
```
/{page-short-id}/{timestamp}-{sanitized-filename}

Examples:
/ab12cd34/1699876543-hero-image.png
/ab12cd34/1699876600-diagram.svg
/ef56gh78/1699877000-screenshot.jpg
```

**Page Short ID**: 8-character identifier (first 8 chars of page's cuid). Remains constant even if page is moved/renamed.

**Timestamp prefix**: Unix timestamp prevents filename collisions and provides natural ordering.

**Sanitized filename**: Original filename with unsafe characters removed/replaced.

### Asset Resolution
Markdown references assets via syntax:
```markdown
![Alt text](asset:ab12cd34/hero-image.png)
```

At render time:
1. Look up asset in database by path pattern match
2. Return `publicUrl` from the asset record
3. If secure mode enabled, return proxied URL instead

**Public mode** (default):
- Local: `https://help.example.com/uploads/ab12cd34/1699876543-hero-image.png`
- S3: `https://cdn.example.com/ab12cd34/1699876543-hero-image.png`

**Secure mode** (when enabled):
- All backends: `https://help.example.com/api/assets/ab12cd34/1699876543-hero-image.png`
- Server validates session before streaming file
- Adds latency but enables private documentation deployments

### Secure Assets Mode
Admin setting: **"Require authentication for assets"**

When enabled:
- All asset URLs rewritten to proxy endpoint `/api/assets/*`
- Proxy validates user session before serving
- Supports future enterprise SSO integration
- Works with any storage backend (local or S3)

When disabled (default):
- Assets served directly from storage
- No authentication check on asset access
- Best performance, CDN-friendly

### Storage Configuration Hierarchy
1. **Environment variables** (highest priority):
   - `STORAGE_TYPE`: `local` | `s3`
   - `STORAGE_LOCAL_PATH`: Local storage directory
   - `STORAGE_S3_ENDPOINT`: S3 endpoint URL
   - `STORAGE_S3_BUCKET`: Bucket name
   - `STORAGE_S3_REGION`: AWS region or equivalent
   - `STORAGE_S3_ACCESS_KEY`: Access key
   - `STORAGE_S3_SECRET_KEY`: Secret key
   - `STORAGE_S3_PUBLIC_URL`: Public URL prefix for assets
   - `STORAGE_SECURE_MODE`: `true` | `false`

2. **Database settings** (fallback): Same fields configurable via admin UI

When env vars are set, corresponding UI fields show "Configured via environment" and are disabled.

### Migration Between Backends
When switching storage backends:
1. New uploads go to new backend
2. Existing assets remain accessible via stored `publicUrl`
3. Optional: Admin tool to migrate existing assets (copies files, updates records)
4. Old backend can be decommissioned after full migration

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

