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
  - [x] `src/application/usecases/` - Use case orchestrators
  - [x] `src/application/ports/repositories/` - Repository interfaces
  - [x] `src/application/ports/gateways/` - Gateway interfaces
  - [ ] `src/application/dto/` - Data transfer objects
  - [x] `src/infrastructure/repositories/` - Prisma implementations
  - [x] `src/infrastructure/gateways/` - External service implementations
  - [x] `src/infrastructure/prisma/` - Prisma client setup
  - [x] `src/interface/api/` - REST controllers
  - [x] `src/interface/ssr/` - SSR renderers
  - [x] `src/server/middlewares/` - Fastify middleware
  - [x] `src/server/routes.ts` - Route registration
- [x] Configure Prisma client generation and connection
- [x] Create configuration loader (env vars with validation)
- [x] Set up health check endpoint (`GET /healthz`)
- [x] Set up structured logging with Pino
- [x] Create base error handling middleware

### 2.5 App: `apps/web` (SSR Public + Admin area)
- [x] Initialize package.json with dev/build scripts
- [x] Set up Vite SSR configuration
- [ ] Create React SSR entry points (client + server)
- [x] Set up routing structure for public pages
- [x] Create base layout component with header/footer
- [x] Create placeholder home page
- [x] Create admin shell layout (sidebar, top bar, content area) under `/admin`
- [x] Create placeholder admin dashboard page
- [x] Integrate with `packages/ui` components across public + admin

### 2.7 Docker & DevOps
- [x] Create multi-stage Dockerfile (install, build, runtime)
- [x] Create docker-compose.yml for local development (app + postgres)
- [ ] Verify Makefile targets work with scaffolded structure

---

## Phase 3: SSR Router & Admin Shell

### 3.1 Authentication Foundation
- [x] Create `User` domain entity with validation rules
- [x] Create `Session` domain entity with expiry logic
- [x] Define `IUserRepository` interface
- [x] Define `ISessionRepository` interface
- [x] Define `IOAuthGateway` interface
- [x] Implement `UserRepositoryPrisma`
- [x] Implement `SessionRepositoryPrisma`
- [x] Implement `OAuthGoogleGateway` (Google OAuth flow)
- [x] Create `AuthenticateUserUseCase` (OAuth callback handling)
- [x] Create `GetCurrentUserUseCase` (session validation)
- [x] Create `LogoutUserUseCase` (session invalidation)
- [x] Implement auth controller with routes:
  - [x] `GET /auth/google` - Initiate OAuth flow
  - [x] `GET /auth/google/callback` - Handle OAuth callback
  - [x] `POST /auth/logout` - End session
  - [x] `GET /auth/me` - Get current user
- [x] Create auth middleware for protected routes
- [x] Create session cookie handling (signed, httpOnly, secure)

### 3.2 SSR Public Routes
- [x] Create `Page` domain entity
- [x] Create `PageLocale` domain entity with slug validation
- [x] Create `Redirect` domain entity
- [x] Define `IPageRepository` interface
- [x] Define `IRedirectRepository` interface
- [x] Implement `PageRepositoryPrisma`
- [x] Implement `RedirectRepositoryPrisma`
- [x] Create `GetPageBySlugUseCase` (locale + slug resolution)
- [x] Create `CheckRedirectUseCase` (redirect lookup)
- [x] Create SSR redirect handler middleware
- [x] Implement SSR routes:
  - [x] `GET /:locale/:slug*` - Page rendering (with hierarchy)
  - [x] `GET /releases/:tag/:locale/:slug*` - Release page rendering
- [ ] Create SSR page renderer component
- [x] Create breadcrumb generation logic
- [x] Create locale switcher component (SSR-compatible)
- [x] Create header component with navigation
- [x] Create footer component with version selector placeholder

### 3.3 Admin SPA Shell
- [x] Create admin route structure:
  - [x] `/admin` - Dashboard (redirect or default)
  - [x] `/admin/dashboard` - Overview stats
  - [x] `/admin/content` - Content management
  - [x] `/admin/comments` - Comment moderation
  - [x] `/admin/settings/*` - Settings tabs
  - [x] `/admin/users` - User management
  - [x] `/admin/tools` - Admin tools
- [x] Create auth guard HOC/hook for admin routes
- [x] Create sidebar navigation component
- [x] Create top bar with user menu
- [x] Create settings shell with tab navigation
- [x] Create placeholder pages for each admin section
- [x] Implement Google OAuth popup login flow
- [x] Handle post-login redirect without scroll loss

### 3.4 Settings Infrastructure
- [x] Create `Setting` domain entity with JSON validation
- [x] Define `ISettingsRepository` interface
- [x] Implement `SettingsRepositoryPrisma`
- [x] Create `GetSettingsUseCase` (by group key)
- [x] Create `UpdateSettingsUseCase` (with validation)
- [x] Implement settings controller:
  - [x] `GET /api/admin/settings/:group` - Get settings group
  - [x] `PUT /api/admin/settings/:group` - Update settings group
- [x] Create settings form components with inline validation

---

## Phase 4: GitHub Sync

### 4.1 GitHub Gateway
- [x] Define `IGithubGateway` interface (clone, pull, commit, push, listFiles)
- [x] Define `IGithubTagGateway` interface (createTag, listTags, checkoutTag)
- [x] Implement `GithubGateway` with GitHub App authentication
- [x] Implement PAT fallback authentication
- [x] Create secure credential storage/retrieval
- [x] Implement repository cloning to working directory
- [x] Implement branch checkout and pull
- [x] Implement file commit and push
- [x] Implement tag operations

### 4.2 Content Source Settings
- [x] Create settings UI for Content Source tab:
  - [x] Repository URL input with validation
  - [x] Branch selector
  - [x] Base content folder path
  - [x] Auth method toggle (GitHub App vs PAT)
  - [x] GitHub App credentials inputs
  - [x] PAT credential input (masked)
  - [x] Test connection button with result display
- [x] Implement test connection endpoint
- [x] Implement connection status persistence

### 4.3 Sync Engine
- [x] Create `SyncLog` domain entity
- [x] Define `ISyncLogRepository` interface
- [x] Implement `SyncLogRepositoryPrisma`
- [x] Create Markdown frontmatter parser:
  - [x] Extract `title`, `slug`, `locale`, `parent`
  - [x] Extract optional `headerImage`, `summary`, `keywords`
  - [x] Validate required fields
- [x] Create `SyncFromGithubUseCase`:
  - [x] Pull latest from configured branch
  - [x] Scan content folder for Markdown files
  - [x] Parse frontmatter from each file
  - [x] Upsert Page and PageLocale records
  - [x] Detect slug changes and create redirects
  - [x] Update sync log with results
- [x] Create `CommitPageEditUseCase`:
  - [x] Update Markdown file content
  - [x] Commit with descriptive message
  - [x] Push to remote
  - [ ] Trigger re-index
- [x] Implement sync controller:
  - [x] `POST /api/admin/sync/trigger` - Manual sync trigger
  - [x] `GET /api/admin/sync/status` - Current sync status
  - [x] `GET /api/admin/sync/logs` - Sync history
- [x] Create sync log viewer UI component

### 4.4 Content Management UI
- [x] Create content list view (tree structure by hierarchy)
- [x] Create content detail/edit view:
  - [x] Title editing with live slug preview
  - [x] Markdown editor (basic textarea or rich editor)
  - [x] Parent selector (dropdown with hierarchy)
  - [x] Locale tabs for multi-language
  - [x] Header image upload/selection
  - [x] Save button with commit flow
- [x] Create content creation flow (new page)
- [x] Implement inline URL preview on slug change

---

## Phase 5: Paragraph Anchors & Comments

### 5.1 Anchor Engine
- [x] Document anchor algorithm in detail:
  - [x] Text normalization rules (lowercase, strip markup, whitespace)
  - [x] Hash function (SHA-256 truncated or similar)
  - [x] Composite key: pageLocaleId + hash + position fallback
- [x] Create Markdown block parser (split into paragraphs/sections)
- [x] Create `Anchor` domain entity with stability rules
- [x] Define `IAnchorRepository` interface
- [x] Implement `AnchorRepositoryPrisma`
- [x] Create `GenerateAnchorsUseCase`:
  - [x] Parse Markdown into blocks
  - [x] Normalize and hash each block
  - [x] Match existing anchors by hash similarity
  - [x] Create new anchors for unmatched blocks
  - [x] Update positions for shifted content
- [x] Integrate anchor generation into sync flow
- [x] Create anchor reconciliation on content edit

### 5.2 Comment System Backend
- [x] Create `CommentThread` domain entity
- [x] Create `Comment` domain entity with validation
- [x] Define `ICommentThreadRepository` interface
- [x] Define `ICommentRepository` interface
- [x] Implement `CommentThreadRepositoryPrisma`
- [x] Implement `CommentRepositoryPrisma`
- [x] Create `GetThreadByAnchorUseCase`
- [x] Create `CreateCommentUseCase` (with user validation)
- [x] Create `DeleteCommentUseCase` (author or admin)
- [x] Create `GetCommentsForPageUseCase` (batch load)
- [x] Implement comment controller:
  - [x] `GET /api/pages/:pageLocaleId/comments` - All threads for page
  - [x] `GET /api/comments/thread/:anchorId` - Single thread
  - [x] `POST /api/comments/thread/:anchorId` - Add comment
  - [x] `DELETE /api/comments/:commentId` - Remove comment

### 5.3 Comment UI (Public)
- [x] Create anchor hover affordance (comment icon)
- [x] Create comment thread panel/drawer component
- [x] Create comment composer with login prompt
- [x] Create comment display with author info
- [x] Create thread loading states
- [x] Implement async comment loading on anchor click
- [x] Update URL fragment on anchor selection

### 5.4 Comment Moderation (Admin)
- [x] Create comments list view with filters:
  - [x] Filter by page
  - [x] Filter by user
  - [x] Filter by date range
- [x] Create comment detail view with context
- [x] Implement delete comment action
- [x] Create bulk moderation actions

---

## Phase 6: Gemini Integration

### 6.1 Gemini Gateway
- [x] Define `IGeminiGateway` interface
- [x] Implement `GeminiGateway` with API client:
  - [x] Summary generation method
  - [x] Keywords extraction method
  - [x] Rate limiting/retry logic
- [x] Create secure API key storage/retrieval

### 6.2 SEO Generation
- [x] Create AI settings UI:
  - [x] Gemini API key input (masked)
  - [x] Enable/disable toggle
  - [x] Test connection button
- [x] Create `GenerateSeoMetadataUseCase`:
  - [x] Accept page content
  - [x] Call Gemini for summary (if not locked)
  - [x] Call Gemini for keywords (if not locked)
  - [x] Return generated metadata
- [x] Integrate SEO generation into:
  - [x] Manual trigger per page
  - [x] Bulk generation for all pages
  - [x] Post-edit automatic generation (optional)
- [x] Create "lock" toggle to prevent Gemini overwrite
- [x] Create SEO preview in content editor

### 6.3 Meta Tags
- [x] Generate meta description from summary
- [x] Generate meta keywords from keywords array
- [x] Add Open Graph tags for social sharing
- [x] Add locale meta tags
- [x] Add release version meta tag when applicable

---

## Phase 7: Releases System

### 7.1 Release Backend
- [x] Create `Release` domain entity with validation
- [x] Create `ReleasePageSnapshot` domain entity
- [x] Define `IReleaseRepository` interface
- [x] Implement `ReleaseRepositoryPrisma`
- [x] Create `CreateReleaseUseCase`:
  - [x] Validate release name/tag uniqueness
  - [x] Create Git tag via gateway
  - [x] Snapshot current PageLocale slugs
  - [x] Store release metadata
- [x] Create `GetReleasesUseCase` (list all)
- [x] Create `GetReleaseByTagUseCase`
- [x] Create `GetReleaseContentUseCase`:
  - [x] Checkout tag content
  - [x] Resolve slug from snapshot
  - [x] Return content at release point
- [x] Implement release controller:
  - [x] `GET /api/releases` - List releases
  - [x] `POST /api/admin/releases` - Create release
  - [x] `GET /api/releases/:tag` - Release details

### 7.2 Release Rendering
- [x] Update SSR release route handler
- [x] Implement tag content checkout caching
- [x] Create release-aware page resolver
- [x] Add release badge to page header
- [x] Create "viewing release" notice banner

### 7.3 Release UI
- [x] Create version selector dropdown component
- [x] Add version selector to footer
- [x] Add version selector near page title (release view)
- [x] Create releases admin page:
  - [x] List existing releases
  - [x] Create new release form (name, tag, description)
  - [x] Release creation confirmation

---

## Phase 8: Frontend Completion

### 8.1 Responsive Layouts
- [x] Implement mobile navigation (hamburger + drawer)
- [x] Implement collapsible sidebar for admin
- [x] Implement responsive breadcrumbs (truncation)
- [x] Implement table-to-card transformation
- [x] Test all breakpoints (320px, 600px, 900px, 1280px+)

### 8.2 Theming
- [x] Implement theme toggle component (light/dark/auto)
- [x] Implement system theme detection
- [x] Persist theme preference (localStorage + cookie for SSR)
- [x] Implement button shape selector (pill/rounded)
- [x] Persist button shape preference
- [x] Create admin theme settings UI

### 8.3 Storage Integration
- [x] Define `IStorageGateway` interface
- [x] Implement `S3StorageGateway`:
  - [x] Generate presigned upload URLs
  - [x] Generate presigned download URLs
  - [x] List assets
- [x] Create storage settings UI:
  - [x] S3 endpoint input
  - [x] Bucket name input
  - [x] Access key input (masked)
  - [x] Secret key input (masked)
  - [x] Test connection button
- [x] Create image upload component:
  - [x] Drag-and-drop zone
  - [x] Progress indicator
  - [x] Preview after upload
- [x] Create asset browser/picker
- [x] Integrate upload into content editor

### 8.4 User Management
- [x] Create users list view:
  - [x] Display name, email, role, status
  - [x] Search/filter functionality
- [x] Create user detail view:
  - [x] User info display
  - [x] Role change dropdown (admin only)
  - [x] Ban/unban toggle
  - [x] Activity history
- [x] Implement ban/unban confirmation modals
- [x] Implement role change with confirmation

### 8.5 Admin Tools
- [x] Create admin tools dashboard:
  - [x] Manual sync trigger button
  - [x] Clear cache button
  - [x] Regenerate all anchors button
  - [x] Bulk SEO generation button
- [x] Create sync status display
- [x] Create operation confirmation modals
- [x] Create operation result feedback (toasts)

### 8.6 SEO & Accessibility
- [x] Add skip links for keyboard navigation
- [x] Ensure focus management in modals
- [x] Add ARIA labels to interactive elements
- [x] Ensure color contrast meets WCAG AA
- [x] Add alt text handling for images
- [x] Create sitemap generation endpoint
- [x] Create robots.txt serving

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
