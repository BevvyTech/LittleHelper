# Implementation Plan

Tickboxes must be updated as phases complete. Follow mandated order.

---

## Phase 1: Documentation

- [x] Produce SPEC.md
- [x] Produce AGENTS.md
- [x] Produce ARCHITECTURE.md
- [x] Produce IMPLEMENTATION_PLAN.md
- [x] Produce UI_DESIGN.md
- [x] Produce prisma/schema.prisma
- [x] Produce Makefile
- [x] Create README.md with project overview and quick start
- [x] Create .env.example with all required environment variables
- [x] Document anchor hashing algorithm in ARCHITECTURE.md
- [x] Document API design in ARCHITECTURE.md
- [x] Document storage architecture in ARCHITECTURE.md
- [x] Document error handling and alert system in UI_DESIGN.md
- [x] Create GitHub Actions CI workflow (.github/workflows/ci.yml)
- [x] Update .gitignore for project-specific files

---

## Phase 2: Scaffolding

### 2.1 Workspace Setup
- [x] Create root `package.json` with pnpm workspace configuration
- [x] Create `pnpm-workspace.yaml` defining apps and packages
- [x] Configure TypeScript base config (`tsconfig.base.json`)
- [x] Configure ESLint with TypeScript strict rules
- [x] Configure Prettier for code formatting
- [x] Add `.gitignore` for Node, pnpm, Prisma, and IDE files
- [x] Add `.nvmrc` specifying Node 20+

### 2.2 Package: `packages/shared`
- [x] Initialize package.json with build/lint scripts
- [x] Create TypeScript config extending base
- [x] Define Zod schemas for API contracts (request/response validation)
- [x] Define locale utilities (supported locales list, validation, defaults)
- [x] Define anchor helper types and constants
- [x] Define common error types and codes
- [x] Export shared TypeScript types/interfaces

### 2.3 Package: `packages/ui`
- [x] Initialize package.json with build/lint scripts
- [x] Set up component library structure (atoms, molecules, organisms)
- [x] Create theming system (CSS variables for light/dark/auto)
- [x] Create button component with pill/rounded variants
- [ ] Create typography components (headings, body, code)
- [x] Create form primitives (input, select, textarea, checkbox)
- [x] Create feedback components (toast, loading skeleton, error boundary)
- [ ] Create layout primitives (container, grid, flex)

### 2.4 App: `apps/api`
- [x] Initialize package.json with dev/build/test scripts
- [x] Set up Fastify server entry point (`server.ts`)
- [x] Create Clean Architecture folder structure:
  - [x] `src/domain/` - Pure TypeScript domain entities
  - [ ] `src/application/usecases/` - Use case orchestrators
  - [x] `src/application/ports/repositories/` - Repository interfaces
  - [x] `src/application/ports/gateways/` - Gateway interfaces
  - [ ] `src/application/dto/` - Data transfer objects
  - [x] `src/infrastructure/repositories/` - Prisma implementations
  - [ ] `src/infrastructure/gateways/` - External service implementations
  - [x] `src/infrastructure/prisma/` - Prisma client setup
  - [ ] `src/interface/api/` - REST controllers
  - [ ] `src/interface/ssr/` - SSR renderers
  - [x] `src/server/middlewares/` - Fastify middleware
  - [x] `src/server/routes.ts` - Route registration
- [x] Configure Prisma client generation and connection
- [x] Create configuration loader (env vars with validation)
- [x] Set up health check endpoint (`GET /healthz`)
- [x] Set up structured logging with Pino
- [x] Create base error handling middleware

### 2.5 App: `apps/web` (SSR Public)
- [x] Initialize package.json with dev/build scripts
- [x] Set up Vite SSR configuration
- [ ] Create React SSR entry points (client + server)
- [x] Set up routing structure for public pages
- [x] Create base layout component with header/footer
- [x] Create placeholder home page
- [x] Integrate with `packages/ui` components

### 2.6 App: `apps/admin` (CSR Admin)
- [x] Initialize package.json with dev/build scripts
- [x] Set up Vite CSR configuration
- [x] Create React SPA entry point
- [x] Set up React Router for admin routes
- [x] Create admin shell layout (sidebar, top bar, content area)
- [x] Create placeholder dashboard page
- [x] Integrate with `packages/ui` components

### 2.7 Docker & DevOps
- [x] Create multi-stage Dockerfile (install, build, runtime)
- [x] Create docker-compose.yml for local development (app + postgres)
- [ ] Verify Makefile targets work with scaffolded structure

---

## Phase 3: SSR Router & Admin Shell

### 3.1 Authentication Foundation
- [ ] Create `User` domain entity with validation rules
- [ ] Create `Session` domain entity with expiry logic
- [ ] Define `IUserRepository` interface
- [ ] Define `ISessionRepository` interface
- [ ] Define `IOAuthGateway` interface
- [ ] Implement `UserRepositoryPrisma`
- [ ] Implement `SessionRepositoryPrisma`
- [ ] Implement `OAuthGoogleGateway` (Google OAuth flow)
- [ ] Create `AuthenticateUserUseCase` (OAuth callback handling)
- [ ] Create `GetCurrentUserUseCase` (session validation)
- [ ] Create `LogoutUserUseCase` (session invalidation)
- [ ] Implement auth controller with routes:
  - [ ] `GET /auth/google` - Initiate OAuth flow
  - [ ] `GET /auth/google/callback` - Handle OAuth callback
  - [ ] `POST /auth/logout` - End session
  - [ ] `GET /auth/me` - Get current user
- [ ] Create auth middleware for protected routes
- [ ] Create session cookie handling (signed, httpOnly, secure)

### 3.2 SSR Public Routes
- [ ] Create `Page` domain entity
- [ ] Create `PageLocale` domain entity with slug validation
- [ ] Create `Redirect` domain entity
- [ ] Define `IPageRepository` interface
- [ ] Define `IRedirectRepository` interface
- [ ] Implement `PageRepositoryPrisma`
- [ ] Implement `RedirectRepositoryPrisma`
- [ ] Create `GetPageBySlugUseCase` (locale + slug resolution)
- [ ] Create `CheckRedirectUseCase` (redirect lookup)
- [ ] Create SSR redirect handler middleware
- [ ] Implement SSR routes:
  - [ ] `GET /:locale/:slug*` - Page rendering (with hierarchy)
  - [ ] `GET /releases/:tag/:locale/:slug*` - Release page rendering
- [ ] Create SSR page renderer component
- [ ] Create breadcrumb generation logic
- [ ] Create locale switcher component (SSR-compatible)
- [ ] Create header component with navigation
- [ ] Create footer component with version selector placeholder

### 3.3 Admin SPA Shell
- [ ] Create admin route structure:
  - [ ] `/admin` - Dashboard (redirect or default)
  - [ ] `/admin/dashboard` - Overview stats
  - [ ] `/admin/content` - Content management
  - [ ] `/admin/comments` - Comment moderation
  - [ ] `/admin/settings/*` - Settings tabs
  - [ ] `/admin/users` - User management
  - [ ] `/admin/tools` - Admin tools
- [ ] Create auth guard HOC/hook for admin routes
- [ ] Create sidebar navigation component
- [ ] Create top bar with user menu
- [ ] Create settings shell with tab navigation
- [ ] Create placeholder pages for each admin section
- [ ] Implement Google OAuth popup login flow
- [ ] Handle post-login redirect without scroll loss

### 3.4 Settings Infrastructure
- [ ] Create `Setting` domain entity with JSON validation
- [ ] Define `ISettingsRepository` interface
- [ ] Implement `SettingsRepositoryPrisma`
- [ ] Create `GetSettingsUseCase` (by group key)
- [ ] Create `UpdateSettingsUseCase` (with validation)
- [ ] Implement settings controller:
  - [ ] `GET /api/admin/settings/:group` - Get settings group
  - [ ] `PUT /api/admin/settings/:group` - Update settings group
- [ ] Create settings form components with inline validation

---

## Phase 4: GitHub Sync

### 4.1 GitHub Gateway
- [ ] Define `IGithubGateway` interface (clone, pull, commit, push, listFiles)
- [ ] Define `IGithubTagGateway` interface (createTag, listTags, checkoutTag)
- [ ] Implement `GithubGateway` with GitHub App authentication
- [ ] Implement PAT fallback authentication
- [ ] Create secure credential storage/retrieval
- [ ] Implement repository cloning to working directory
- [ ] Implement branch checkout and pull
- [ ] Implement file commit and push
- [ ] Implement tag operations

### 4.2 Content Source Settings
- [ ] Create settings UI for Content Source tab:
  - [ ] Repository URL input with validation
  - [ ] Branch selector
  - [ ] Base content folder path
  - [ ] Auth method toggle (GitHub App vs PAT)
  - [ ] GitHub App credentials inputs
  - [ ] PAT credential input (masked)
  - [ ] Test connection button with result display
- [ ] Implement test connection endpoint
- [ ] Implement connection status persistence

### 4.3 Sync Engine
- [ ] Create `SyncLog` domain entity
- [ ] Define `ISyncLogRepository` interface
- [ ] Implement `SyncLogRepositoryPrisma`
- [ ] Create Markdown frontmatter parser:
  - [ ] Extract `title`, `slug`, `locale`, `parent`
  - [ ] Extract optional `headerImage`, `summary`, `keywords`
  - [ ] Validate required fields
- [ ] Create `SyncFromGithubUseCase`:
  - [ ] Pull latest from configured branch
  - [ ] Scan content folder for Markdown files
  - [ ] Parse frontmatter from each file
  - [ ] Upsert Page and PageLocale records
  - [ ] Detect slug changes and create redirects
  - [ ] Update sync log with results
- [ ] Create `CommitPageEditUseCase`:
  - [ ] Update Markdown file content
  - [ ] Commit with descriptive message
  - [ ] Push to remote
  - [ ] Trigger re-index
- [ ] Implement sync controller:
  - [ ] `POST /api/admin/sync/trigger` - Manual sync trigger
  - [ ] `GET /api/admin/sync/status` - Current sync status
  - [ ] `GET /api/admin/sync/logs` - Sync history
- [ ] Create sync log viewer UI component

### 4.4 Content Management UI
- [ ] Create content list view (tree structure by hierarchy)
- [ ] Create content detail/edit view:
  - [ ] Title editing with live slug preview
  - [ ] Markdown editor (basic textarea or rich editor)
  - [ ] Parent selector (dropdown with hierarchy)
  - [ ] Locale tabs for multi-language
  - [ ] Header image upload/selection
  - [ ] Save button with commit flow
- [ ] Create content creation flow (new page)
- [ ] Implement inline URL preview on slug change

---

## Phase 5: Paragraph Anchors & Comments

### 5.1 Anchor Engine
- [ ] Document anchor algorithm in detail:
  - [ ] Text normalization rules (lowercase, strip markup, whitespace)
  - [ ] Hash function (SHA-256 truncated or similar)
  - [ ] Composite key: pageLocaleId + hash + position fallback
- [ ] Create Markdown block parser (split into paragraphs/sections)
- [ ] Create `Anchor` domain entity with stability rules
- [ ] Define `IAnchorRepository` interface
- [ ] Implement `AnchorRepositoryPrisma`
- [ ] Create `GenerateAnchorsUseCase`:
  - [ ] Parse Markdown into blocks
  - [ ] Normalize and hash each block
  - [ ] Match existing anchors by hash similarity
  - [ ] Create new anchors for unmatched blocks
  - [ ] Update positions for shifted content
- [ ] Integrate anchor generation into sync flow
- [ ] Create anchor reconciliation on content edit

### 5.2 Comment System Backend
- [ ] Create `CommentThread` domain entity
- [ ] Create `Comment` domain entity with validation
- [ ] Define `ICommentThreadRepository` interface
- [ ] Define `ICommentRepository` interface
- [ ] Implement `CommentThreadRepositoryPrisma`
- [ ] Implement `CommentRepositoryPrisma`
- [ ] Create `GetThreadByAnchorUseCase`
- [ ] Create `CreateCommentUseCase` (with user validation)
- [ ] Create `DeleteCommentUseCase` (author or admin)
- [ ] Create `GetCommentsForPageUseCase` (batch load)
- [ ] Implement comment controller:
  - [ ] `GET /api/pages/:pageLocaleId/comments` - All threads for page
  - [ ] `GET /api/comments/thread/:anchorId` - Single thread
  - [ ] `POST /api/comments/thread/:anchorId` - Add comment
  - [ ] `DELETE /api/comments/:commentId` - Remove comment

### 5.3 Comment UI (Public)
- [ ] Create anchor hover affordance (comment icon)
- [ ] Create comment thread panel/drawer component
- [ ] Create comment composer with login prompt
- [ ] Create comment display with author info
- [ ] Create thread loading states
- [ ] Implement async comment loading on anchor click
- [ ] Update URL fragment on anchor selection

### 5.4 Comment Moderation (Admin)
- [ ] Create comments list view with filters:
  - [ ] Filter by page
  - [ ] Filter by user
  - [ ] Filter by date range
- [ ] Create comment detail view with context
- [ ] Implement delete comment action
- [ ] Create bulk moderation actions

---

## Phase 6: Gemini Integration

### 6.1 Gemini Gateway
- [ ] Define `IGeminiGateway` interface
- [ ] Implement `GeminiGateway` with API client:
  - [ ] Summary generation method
  - [ ] Keywords extraction method
  - [ ] Rate limiting/retry logic
- [ ] Create secure API key storage/retrieval

### 6.2 SEO Generation
- [ ] Create AI settings UI:
  - [ ] Gemini API key input (masked)
  - [ ] Enable/disable toggle
  - [ ] Test connection button
- [ ] Create `GenerateSeoMetadataUseCase`:
  - [ ] Accept page content
  - [ ] Call Gemini for summary (if not locked)
  - [ ] Call Gemini for keywords (if not locked)
  - [ ] Return generated metadata
- [ ] Integrate SEO generation into:
  - [ ] Manual trigger per page
  - [ ] Bulk generation for all pages
  - [ ] Post-edit automatic generation (optional)
- [ ] Create "lock" toggle to prevent Gemini overwrite
- [ ] Create SEO preview in content editor

### 6.3 Meta Tags
- [ ] Generate meta description from summary
- [ ] Generate meta keywords from keywords array
- [ ] Add Open Graph tags for social sharing
- [ ] Add locale meta tags
- [ ] Add release version meta tag when applicable

---

## Phase 7: Releases System

### 7.1 Release Backend
- [ ] Create `Release` domain entity with validation
- [ ] Create `ReleasePageSnapshot` domain entity
- [ ] Define `IReleaseRepository` interface
- [ ] Implement `ReleaseRepositoryPrisma`
- [ ] Create `CreateReleaseUseCase`:
  - [ ] Validate release name/tag uniqueness
  - [ ] Create Git tag via gateway
  - [ ] Snapshot current PageLocale slugs
  - [ ] Store release metadata
- [ ] Create `GetReleasesUseCase` (list all)
- [ ] Create `GetReleaseByTagUseCase`
- [ ] Create `GetReleaseContentUseCase`:
  - [ ] Checkout tag content
  - [ ] Resolve slug from snapshot
  - [ ] Return content at release point
- [ ] Implement release controller:
  - [ ] `GET /api/releases` - List releases
  - [ ] `POST /api/admin/releases` - Create release
  - [ ] `GET /api/releases/:tag` - Release details

### 7.2 Release Rendering
- [ ] Update SSR release route handler
- [ ] Implement tag content checkout caching
- [ ] Create release-aware page resolver
- [ ] Add release badge to page header
- [ ] Create "viewing release" notice banner

### 7.3 Release UI
- [ ] Create version selector dropdown component
- [ ] Add version selector to footer
- [ ] Add version selector near page title (release view)
- [ ] Create releases admin page:
  - [ ] List existing releases
  - [ ] Create new release form (name, tag, description)
  - [ ] Release creation confirmation

---

## Phase 8: Frontend Completion

### 8.1 Responsive Layouts
- [ ] Implement mobile navigation (hamburger + drawer)
- [ ] Implement collapsible sidebar for admin
- [ ] Implement responsive breadcrumbs (truncation)
- [ ] Implement table-to-card transformation
- [ ] Test all breakpoints (320px, 600px, 900px, 1280px+)

### 8.2 Theming
- [ ] Implement theme toggle component (light/dark/auto)
- [ ] Implement system theme detection
- [ ] Persist theme preference (localStorage + cookie for SSR)
- [ ] Implement button shape selector (pill/rounded)
- [ ] Persist button shape preference
- [ ] Create admin theme settings UI

### 8.3 Storage Integration
- [ ] Define `IStorageGateway` interface
- [ ] Implement `S3StorageGateway`:
  - [ ] Generate presigned upload URLs
  - [ ] Generate presigned download URLs
  - [ ] List assets
- [ ] Create storage settings UI:
  - [ ] S3 endpoint input
  - [ ] Bucket name input
  - [ ] Access key input (masked)
  - [ ] Secret key input (masked)
  - [ ] Test connection button
- [ ] Create image upload component:
  - [ ] Drag-and-drop zone
  - [ ] Progress indicator
  - [ ] Preview after upload
- [ ] Create asset browser/picker
- [ ] Integrate upload into content editor

### 8.4 User Management
- [ ] Create users list view:
  - [ ] Display name, email, role, status
  - [ ] Search/filter functionality
- [ ] Create user detail view:
  - [ ] User info display
  - [ ] Role change dropdown (admin only)
  - [ ] Ban/unban toggle
  - [ ] Activity history
- [ ] Implement ban/unban confirmation modals
- [ ] Implement role change with confirmation

### 8.5 Admin Tools
- [ ] Create admin tools dashboard:
  - [ ] Manual sync trigger button
  - [ ] Clear cache button
  - [ ] Regenerate all anchors button
  - [ ] Bulk SEO generation button
- [ ] Create sync status display
- [ ] Create operation confirmation modals
- [ ] Create operation result feedback (toasts)

### 8.6 SEO & Accessibility
- [ ] Add skip links for keyboard navigation
- [ ] Ensure focus management in modals
- [ ] Add ARIA labels to interactive elements
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add alt text handling for images
- [ ] Create sitemap generation endpoint
- [ ] Create robots.txt serving

---

## Phase 9: Testing & Hardening

### 9.1 Unit Tests
- [ ] Test domain entities (validation, business rules)
- [ ] Test use cases (mocked repositories/gateways)
- [ ] Test anchor hashing algorithm
- [ ] Test Markdown frontmatter parser
- [ ] Test redirect resolution logic
- [ ] Test release snapshot logic
- [ ] Achieve >80% coverage on domain/application layers

### 9.2 Integration Tests
- [ ] Test repository implementations against test database
- [ ] Test gateway implementations with mocked external services
- [ ] Test auth flow end-to-end
- [ ] Test sync flow with mock GitHub
- [ ] Test comment CRUD operations

### 9.3 E2E Tests (Playwright)
- [ ] Test public page navigation
- [ ] Test locale switching
- [ ] Test redirect following
- [ ] Test release version switching
- [ ] Test login flow (OAuth popup)
- [ ] Test admin navigation
- [ ] Test content editing and save
- [ ] Test comment creation
- [ ] Test settings modification
- [ ] Test responsive layouts (multiple viewports)

### 9.4 Accessibility Testing
- [ ] Run axe-core on all pages
- [ ] Test keyboard-only navigation
- [ ] Test screen reader compatibility
- [ ] Fix identified accessibility issues

### 9.5 Performance & Security
- [ ] Add rate limiting to auth endpoints
- [ ] Add rate limiting to admin mutation endpoints
- [ ] Add CSRF protection to admin mutations
- [ ] Implement SSR response caching headers
- [ ] Implement redirect lookup caching
- [ ] Profile and optimize slow queries
- [ ] Security audit of OAuth implementation
- [ ] Security audit of file upload handling

### 9.6 Deployment
- [ ] Create production Docker build
- [ ] Create docker-compose.prod.yml
- [ ] Create Kubernetes manifests (Deployment, Service, Ingress)
- [ ] Create CI/CD pipeline configuration (GitHub Actions)
- [ ] Create deployment documentation
- [ ] Create rollback procedures
- [ ] Create monitoring/alerting setup guide

