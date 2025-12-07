# LittleHelper Product Specification

## Overview
LittleHelper is a hybrid documentation/help platform modeled after premium hardware/software vendor help centers. It combines Git-hosted Markdown with a PostgreSQL metadata layer, SSR public experience, and CSR admin console.

## Goals
- Deliver searchable, SEO-friendly, multi-language documentation with releases and redirects.
- Provide paragraph-level comments tied to stable anchors resilient to minor Markdown edits.
- Allow admins to author via GitHub-backed Markdown with automated Gemini SEO metadata and S3 image storage.
- Support responsive, accessible UX with theme controls, button style selector, and Google SSO.

## Assumptions
- GitHub App is preferred for commits; PAT fallback allowed. Credentials stored securely via env/secret manager (not in repo).
- Markdown resides under a configurable base content folder; default `docs/` in repo.
- Frontmatter keys: `title`, `slug`, `locale`, `parent`, `headerImage` (optional), `summary` (optional, overwritten by Gemini unless locked), `keywords` (optional list).
- Paragraph anchors generated from normalized text hash with position fallback; algorithm documented in architecture.
- Releases created by tagging the Git repository (e.g., `help-vX.Y`); content for releases fetched by checking out tag in a read-only mode.
- Google OAuth client IDs/secrets are configured per environment; only Google SSO is enabled (no local/password login).
- S3-compatible storage supports presigned uploads; images referenced in Markdown via absolute S3 URLs.
- SSR uses Vite + React + Fastify (Node 20+). Admin CSR bundled separately but shares component library.
- Clean Architecture is mandatory: domain entities remain pure (no IO/framework), application use cases orchestrate via ports, interface adapters implement DB/service gateways, and server/Vite/Prisma live in the outer layer only.
- Prisma migration system owns database schema; `prisma migrate` used for changes.
- Search indexing handled via future component (placeholder hooks), not implemented yet.
- DigitalOcean/AWS deploy via Docker; Kubernetes/compose manifests added later.
- Package management uses **pnpm** workspaces; lockfile committed and npm/yarn avoided.
- Makefile orchestrates repeatable tasks (`launch`, `interactive`, `test`, `verify`, `migrate`, `migrate test`) and assumes pnpm tooling; commands should remain non-interactive for CI friendliness.

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
   - S3-compatible storage for images/assets; presigned uploads from admin UI.

10. **SEO**
    - Gemini used for summary/keywords generation; SSR ensures crawlable markup; meta tags include locale and release version when applicable.

## Non-Functional Requirements
- TypeScript-only codebase; linted and tested (Vitest/Playwright).
- High availability assumptions: single DB and storage endpoints; horizontal scaling left for future infra work.
- Performance: SSR response cached via CDN-friendly headers; admin endpoints rate-limited.
- Security: OAuth-only login; CSRF protection on admin mutations; signed cookies/JWT for sessions.
- Accessibility: WCAG AA targets; focus management for modal login; keyboard operable comments.

## Out-of-Scope (initial)
- Full-text search implementation (hooks reserved).
- Detailed analytics/dashboarding.
- Non-Google authentication providers.

