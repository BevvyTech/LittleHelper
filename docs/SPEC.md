# LittleHelper Product Specification

## Overview
LittleHelper is a hybrid documentation/help platform modeled after premium hardware/software vendor help centers. It combines Git-hosted Markdown with a PostgreSQL metadata layer, SSR public experience, and CSR admin console.

## Goals
- Deliver searchable, SEO-friendly, multi-language documentation with releases and redirects.
- Provide paragraph-level comments tied to stable anchors resilient to minor Markdown edits.
- Allow admins to author via GitHub-backed Markdown with automated Gemini SEO metadata and S3 image storage.
- Support responsive, accessible UX with theme controls, button style selector, and Google SSO.

## Assumptions
- GitHub App is preferred for commits; PAT fallback allowed. Credentials configurable via environment variables OR admin settings UI (env vars take precedence and grey out UI fields).
- Markdown resides under a configurable base content folder; default `docs/` in repo.
- Frontmatter keys: `title`, `slug`, `locale`, `parent`, `headerImage` (optional), `summary` (optional, overwritten by Gemini unless locked), `keywords` (optional list).
- Paragraph anchors generated from normalized text hash with position fallback; algorithm documented in architecture.
- Releases created by tagging the Git repository (e.g., `help-vX.Y`); content for releases fetched by checking out tag in a read-only mode.
- Google OAuth client IDs/secrets are configured per environment; only Google SSO is enabled (no local/password login).
- **Storage is dual-mode**: local filesystem by default, S3-compatible (AWS S3, DigitalOcean Spaces, MinIO) when configured. Credentials configurable via environment variables OR admin settings UI (env vars take precedence).
- SSR uses Vite + React + Fastify (Node 20+). Admin CSR lives under `/admin` within the same web bundle and shares the component library.
- **SSR has direct database access** for optimal performance; API routes used for mutations and admin operations.
- Clean Architecture is mandatory: domain entities remain pure (no IO/framework), application use cases orchestrate via ports, interface adapters implement DB/service gateways, and server/Vite/Prisma live in the outer layer only.
- Prisma migration system owns database schema; `prisma migrate` used for changes.
- Search indexing handled via future component (placeholder hooks), not implemented yet.
- DigitalOcean/AWS deploy via Docker; Kubernetes/compose manifests added later.
- Package management uses **pnpm** workspaces; lockfile committed and npm/yarn avoided.
- Makefile orchestrates repeatable tasks (`launch`, `interactive`, `test`, `verify`, `migrate`, `migrate test`) and assumes pnpm tooling; commands should remain non-interactive for CI friendliness.
- **Gemini API** credentials configurable via environment variables OR admin settings UI (env vars take precedence).

## Functional Requirements
1. **Content model**
   - Markdown in Git, metadata in Postgres via Prisma.
   - Each page: title, slug, locale, parent category, header image (optional), Gemini-generated summary & keywords, anchors, comment threads.
   - Multi-language via locale-specific page entries linked to canonical page entity.
   - Releases store snapshot of slug mapping and content tag reference.

2. **GitHub connector**
   - Configurable repository URL, branch, base folder; PAT or GitHub App credentials.
   - Test connection action with inline validation and result messaging.
   - On save/edit: update Markdown file, commit, push, trigger re-index.
   - Manual re-index pulls repo, parses Markdown, updates DB, emits redirect entries on slug changes.

3. **Paragraph anchors & comments**
   - Paragraph hashing for stability; comments linked to anchors and locale.
   - UI shows inline comment affordances; threads per anchor with user identity.

4. **Releases**
   - Admin creates named release → Git tag + DB snapshot (pageId → slugAtRelease, release metadata).
   - Public pages can render latest or specific release via `/releases/<tag>/<locale>/<slug>/`.

5. **Redirects**
   - On slug or parent change, persist 301 redirect entry (oldSlug, newSlug, locale, timestamp).
   - SSR router checks redirects before page resolution.

6. **Authentication & users**
   - Google SSO modal login flow; parent page retains scroll position.
   - Roles: admin vs standard; admins can manage users (ban/unban, role changes) and settings.

7. **Settings tabs**
   - General, Content Source, Storage, AI Integrations, User Management, Admin Tools with inline validation and descriptions.

8. **UI/UX**
   - SSR for public pages; CSR for admin console.
   - Responsive, accessible, breadcrumbed layouts; optional header image; configurable subpage list position; dark/light/auto themes with button style selector.
   - Clean URLs without `.html`.

9. **Storage**
   - **Dual-mode storage**: local filesystem (default) or S3-compatible (AWS S3, DigitalOcean Spaces, MinIO).
   - **Database tracks all assets**: Every file has a DB record with storage location and public URL for backend-agnostic access.
   - Local storage uses configurable directory (default: `./uploads/`) with structured folder layout.
   - Asset paths organized by page short ID (8-char unique identifier per page) to avoid complications when pages are moved/reorganized.
   - Folder structure: `/{page-short-id}/{timestamp}-{filename}` (e.g., `/ab12cd34/1699876543-hero-image.png`).
   - **S3 buckets must be public** (or objects set to public ACL) for direct browser access.
   - S3 mode uses presigned URLs for uploads only; reads go direct to public URL.
   - Assets referenced in Markdown via `asset:` URLs resolved from database at render time.
   - **Secure assets mode** (optional setting): When enabled, all asset URLs route through server proxy with session validation. Enables private documentation deployments and prepares for enterprise SSO integration.
   - Migration path: Old assets remain accessible via stored public URLs; admin tool available for full backend migration.

10. **SEO**
    - Gemini used for summary/keywords generation; SSR ensures crawlable markup; meta tags include locale and release version when applicable.

## Non-Functional Requirements
- TypeScript-only codebase; linted and tested (Vitest/Playwright).
- High availability assumptions: single DB and storage endpoints; horizontal scaling left for future infra work.
- Performance: SSR response cached via CDN-friendly headers; admin endpoints rate-limited.
- Security: OAuth-only login; CSRF protection on admin mutations; signed cookies/JWT for sessions.
- Accessibility: WCAG AA targets; focus management for modal login; keyboard operable comments.

## Error Handling & Notification System
- **Inline errors**: Form field validation errors displayed directly below the field with red styling.
- **Alert notifications**: System-wide alerts for non-field-specific errors and status messages.
- **Alert types** with distinct colors:
  - `danger` (red): Critical errors, failed operations, destructive action confirmations
  - `warning` (amber/yellow): Non-blocking issues, deprecation notices, potential problems
  - `success` (green): Successful operations, confirmations
  - `info` (blue): Informational messages, tips, neutral notifications
- **Alert behavior**:
  - Toast-style for transient success/info messages (auto-dismiss after 5s)
  - Persistent banners for warnings requiring acknowledgment
  - Modal dialogs for critical errors and destructive confirmations
- **Error recovery**: All error states provide clear recovery actions (retry, dismiss, navigate).

## Configuration Hierarchy
External service credentials (GitHub, S3/Storage, Gemini) support dual configuration:
1. **Environment variables** (highest priority): When set, UI fields are disabled with explanation text.
2. **Database settings** (fallback): Configurable via admin Settings UI when env vars not present.

This allows:
- Production deployments to use secure env var injection (secrets managers, CI/CD)
- Development/small deployments to configure via UI without infrastructure changes
- Clear visibility into which configuration source is active

## Out-of-Scope (initial)
- Full-text search implementation (hooks reserved).
- Detailed analytics/dashboarding.
- Non-Google authentication providers.
