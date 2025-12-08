# Phase 9: Testing & Hardening

## Prerequisites
- All phases 1-8 complete
- Application fully functional
- Test frameworks installed (Vitest, Playwright)

---

## 9.1 Unit Tests

### Test Framework
- **Vitest** for unit and integration tests
- **@testing-library/react** for component tests
- Coverage target: >80% on domain and application layers

### Domain Entity Tests

| Test File | What to Test |
|-----------|--------------|
| `User.test.ts` | Email validation, role assignment, ban logic |
| `Session.test.ts` | Expiry calculation, validity checks |
| `Page.test.ts` | Slug generation, parent hierarchy |
| `PageLocale.test.ts` | Locale validation, slug uniqueness per locale |
| `Anchor.test.ts` | Hash generation, ID format |
| `Comment.test.ts` | Body validation (min/max length), author required |
| `Release.test.ts` | Tag format validation, uniqueness |
| `Redirect.test.ts` | Slug transformation rules |
| `Setting.test.ts` | JSON validation, group key format |

**Test patterns for entities:**
```
describe('EntityName', () => {
  describe('create', () => {
    it('creates valid entity with correct data')
    it('throws on invalid field X')
    it('throws on missing required field Y')
  })
  describe('businessMethod', () => {
    it('returns expected result for valid input')
    it('handles edge case Z')
  })
})
```

### Use Case Tests

| Test File | What to Test |
|-----------|--------------|
| `AuthenticateUserUseCase.test.ts` | OAuth code exchange, user creation, session creation |
| `GetCurrentUserUseCase.test.ts` | Valid session returns user, expired session throws |
| `SyncFromGithubUseCase.test.ts` | File parsing, upsert logic, redirect creation |
| `GenerateAnchorsUseCase.test.ts` | Block extraction, hash stability, reconciliation |
| `CreateCommentUseCase.test.ts` | Thread creation, comment validation |
| `CreateReleaseUseCase.test.ts` | Tag creation, snapshot generation |
| `GenerateSeoMetadataUseCase.test.ts` | API call, lock respect, result mapping |

**Test patterns for use cases:**
```
describe('UseCaseName', () => {
  // Mock all dependencies
  const mockRepository = { findById: vi.fn(), create: vi.fn() }
  const mockGateway = { callExternal: vi.fn() }

  beforeEach(() => { vi.clearAllMocks() })

  it('executes successfully with valid input')
  it('throws ValidationError on invalid input')
  it('calls repository with correct parameters')
  it('handles gateway failure gracefully')
})
```

### Algorithm Tests

| Test File | What to Test |
|-----------|--------------|
| `AnchorGenerator.test.ts` | Text normalization, hash consistency |
| `AnchorReconciler.test.ts` | Exact match, fuzzy match, orphan detection |
| `MarkdownBlockParser.test.ts` | Block extraction, position assignment |
| `FrontmatterParser.test.ts` | Required fields, optional fields, malformed input |
| `SlugGenerator.test.ts` | Special character handling, uniqueness |

**Anchor hash test cases:**
- Same text produces same hash
- Different text produces different hash
- Whitespace normalization (multiple spaces → single)
- Case normalization (uppercase → lowercase)
- Punctuation stripped for hash, preserved for display
- pageLocaleId prefix included in hash input

---

## 9.2 Integration Tests

### Repository Tests

**Setup:** Use test database (separate from dev)

| Test File | What to Test |
|-----------|--------------|
| `UserRepositoryPrisma.test.ts` | CRUD operations, unique email constraint |
| `PageRepositoryPrisma.test.ts` | Hierarchy queries, locale relations |
| `AnchorRepositoryPrisma.test.ts` | Upsert, orphan marking, cleanup |
| `CommentRepositoryPrisma.test.ts` | Thread relations, cascade delete |
| `ReleaseRepositoryPrisma.test.ts` | Snapshot creation, tag uniqueness |

**Test patterns for repositories:**
```
describe('RepositoryName', () => {
  beforeAll(async () => { await setupTestDatabase() })
  afterAll(async () => { await teardownTestDatabase() })
  beforeEach(async () => { await clearTables() })

  it('creates record and returns with ID')
  it('finds record by ID')
  it('returns null for non-existent ID')
  it('updates existing record')
  it('deletes record')
  it('handles unique constraint violation')
})
```

### Gateway Tests

**Setup:** Mock external services or use test accounts

| Test File | What to Test |
|-----------|--------------|
| `GithubGateway.test.ts` | Clone, pull, commit, push (mocked) |
| `GeminiGateway.test.ts` | API call format, response parsing, rate limit handling |
| `S3StorageGateway.test.ts` | Presigned URL generation, upload, delete |
| `OAuthGoogleGateway.test.ts` | Token exchange, profile fetch |

### API Integration Tests

| Test File | What to Test |
|-----------|--------------|
| `auth.integration.test.ts` | Full OAuth flow (mocked provider) |
| `comments.integration.test.ts` | Create, read, delete comments |
| `sync.integration.test.ts` | Trigger sync, check results |
| `releases.integration.test.ts` | Create release, fetch release content |

---

## 9.3 E2E Tests (Playwright)

### Test Structure

```
tests/
├── e2e/
│   ├── public/
│   │   ├── navigation.spec.ts
│   │   ├── locale-switching.spec.ts
│   │   ├── redirects.spec.ts
│   │   ├── releases.spec.ts
│   │   └── comments.spec.ts
│   ├── admin/
│   │   ├── login.spec.ts
│   │   ├── content-management.spec.ts
│   │   ├── settings.spec.ts
│   │   ├── users.spec.ts
│   │   └── tools.spec.ts
│   └── responsive/
│       ├── mobile-nav.spec.ts
│       └── admin-sidebar.spec.ts
```

### Automation Artifacts Added
- **API smoke (Postman/newman)**: `tests/api/littlehelper.postman_collection.json` with env template `tests/api/newman.env.example.json` (copy to `tests/api/newman.env.json` for local runs). Run with `pnpm test:api` in `apps/api` or `make e2e` at repo root.
- **Playwright scaffold**: `tests/e2e/playwright.config.ts`, sample specs in `tests/e2e/public/navigation.spec.ts` and `tests/e2e/admin/login.spec.ts`. Requires `BASE_URL` env; run via `pnpm dlx playwright test` inside `tests/e2e` or `make e2e`.
- **Make target**: `make e2e` validates `BASE_URL`, then runs Newman + Playwright (app must be running). `make launch`/`make interactive` already guard for required envs (`DATABASE_URL`, `SESSION_SECRET`, `APP_URL`).

### Public Site Tests

| Test | Steps |
|------|-------|
| Navigation | Visit home → click link → verify page loads → check breadcrumbs |
| Locale switching | Visit page → change locale → verify URL changes → verify content changes |
| Redirects | Visit old URL → verify 301 redirect → verify new URL loads |
| Release viewing | Visit latest → select release → verify URL includes tag → verify content is release version |
| Comments (view) | Visit page → hover paragraph → verify comment icon appears |
| Comments (create) | Login → click anchor → type comment → submit → verify appears |

### Admin Tests

| Test | Steps |
|------|-------|
| Login flow | Click login → complete OAuth popup → verify redirected to admin |
| Content list | Login → navigate to content → verify pages listed |
| Content edit | Open page → edit title → save → verify saved |
| Settings | Navigate to settings → change value → save → reload → verify persisted |
| User management | Navigate to users → change role → confirm → verify changed |
| Sync trigger | Navigate to tools → click sync → verify status updates |

### Responsive Tests

| Test | Viewport | Steps |
|------|----------|-------|
| Mobile nav | 375x667 | Open hamburger → verify drawer → navigate → verify closes |
| Mobile admin | 375x667 | Verify sidebar hidden → open via hamburger → navigate |
| Tablet admin | 768x1024 | Verify sidebar collapsed to rail → hover shows tooltip |
| Desktop admin | 1440x900 | Verify full sidebar visible |

---

## 9.4 Accessibility Tests

### Automated (axe-core)

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/en/getting-started');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

**Run on:**
- Home page
- Content page
- Release page
- Admin dashboard
- Admin settings
- All modals (login, confirm, etc.)

### Manual Tests

| Test | How to Verify |
|------|---------------|
| Keyboard nav (public) | Tab through entire page, verify all interactive elements reachable |
| Keyboard nav (admin) | Tab through sidebar, forms, tables |
| Focus visible | Verify focus outline visible on all focusable elements |
| Skip links | Tab from start, verify skip link appears, verify it works |
| Screen reader | Test with VoiceOver/NVDA, verify page structure announced |
| Modal focus trap | Open modal, Tab, verify focus stays in modal |
| Color contrast | Run contrast checker on all text/background combinations |

---

## 9.5 Security Hardening

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /auth/*` | 10 requests/minute per IP |
| `POST /api/comments` | 20 requests/minute per user |
| `POST /api/admin/*` | 60 requests/minute per user |
| `POST /api/admin/sync/*` | 5 requests/minute (global) |

**Implementation:**
- Use `@fastify/rate-limit` plugin
- Store counts in memory (or Redis for multi-instance)
- Return 429 with `Retry-After` header

### CSRF Protection

**Implementation:**
- Generate CSRF token on session creation
- Store in session, send to client via cookie or response
- Require token in header for all POST/PUT/DELETE to `/api/admin/*`
- Validate token matches session

### Input Validation

| Input | Validation |
|-------|------------|
| Slug | Alphanumeric, hyphens, max 100 chars |
| Email | Valid email format |
| Comment body | 1-5000 chars, sanitize HTML |
| Markdown | Sanitize on render (allow safe subset) |
| File upload | Check MIME type, max 10MB |
| API key inputs | No logging, mask in responses |

### Security Headers

```typescript
// Helmet configuration
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.github.com"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
})
```

---

## 9.6 Performance

### Caching Strategy

| Resource | Cache Strategy |
|----------|----------------|
| SSR pages | CDN cache 5 min, stale-while-revalidate |
| API responses | No cache (dynamic) |
| Static assets | Immutable, 1 year |
| Release content | CDN cache 1 hour |
| Redirects lookup | In-memory, refresh on sync |

### Database Optimization

| Query | Optimization |
|-------|--------------|
| Page by slug | Index on (locale, slug) |
| Comments by page | Index on pageLocaleId |
| Anchors by page | Index on pageLocaleId |
| User by email | Unique index |
| Redirect lookup | Index on (locale, oldSlug) |

### Query Monitoring

- Log slow queries (>100ms)
- Add explain analyze for complex queries
- Monitor connection pool usage

---

## 9.7 Deployment

### Production Docker Build

**Dockerfile optimizations:**
- Multi-stage build (deps → build → runtime)
- Use node:20-alpine for small image
- Non-root user
- Health check included

### Environment Variables Checklist

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | 32+ char random string |
| `GOOGLE_CLIENT_ID` | Yes | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth client secret |
| `APP_URL` | Yes | Public URL of application |
| `GITHUB_*` | No* | Repository credentials |
| `GEMINI_API_KEY` | No* | AI features |
| `S3_*` | No* | S3 storage |

*Required if feature used

### Health Checks

| Endpoint | Checks |
|----------|--------|
| `GET /healthz` | App responding |
| `GET /healthz/ready` | DB connected, GitHub accessible |

### CI/CD Pipeline

**Stages:**
1. Install dependencies (pnpm install --frozen-lockfile)
2. Lint (pnpm lint)
3. Type check (pnpm typecheck)
4. Unit tests (pnpm test)
5. Build (pnpm build)
6. E2E tests (against preview deploy)
7. Deploy to production

---

## Verification Checklist

### Automation
- [x] API smoke suite (Newman) defined
- [x] Playwright scaffold present
- [x] Make target to orchestrate API + E2E checks
- [ ] CI stage running these suites

### Unit Tests
- [ ] All domain entities have tests
- [ ] All use cases have tests
- [ ] Anchor algorithm thoroughly tested
- [ ] Coverage >80% on domain/application

### Integration Tests
- [ ] All repositories tested against real DB
- [ ] Gateway tests pass with mocks
- [ ] API endpoints return expected responses

### E2E Tests
- [ ] Public navigation works
- [ ] Locale switching works
- [ ] Redirects work
- [ ] Login flow works
- [ ] Content editing works
- [ ] Comment creation works

### Accessibility
- [ ] axe-core passes on all pages
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] Color contrast verified

### Security
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] All inputs validated
- [ ] Security headers set

### Performance
- [ ] Caching headers configured
- [ ] Database indexes created
- [ ] No N+1 queries
- [ ] Slow query logging enabled

### Deployment
- [ ] Docker build works
- [ ] All env vars documented
- [ ] Health checks pass
- [ ] CI/CD pipeline green

---

## File Structure After Phase 9

```
tests/
├── unit/
│   ├── domain/
│   │   ├── User.test.ts
│   │   ├── Page.test.ts
│   │   ├── Anchor.test.ts
│   │   └── ...
│   ├── usecases/
│   │   ├── AuthenticateUserUseCase.test.ts
│   │   ├── SyncFromGithubUseCase.test.ts
│   │   └── ...
│   └── algorithms/
│       ├── AnchorGenerator.test.ts
│       └── MarkdownBlockParser.test.ts
├── integration/
│   ├── repositories/
│   │   ├── UserRepositoryPrisma.test.ts
│   │   └── ...
│   ├── gateways/
│   │   ├── GithubGateway.test.ts
│   │   └── ...
│   └── api/
│       ├── auth.integration.test.ts
│       └── ...
├── e2e/
│   ├── public/
│   ├── admin/
│   └── responsive/
└── setup/
    ├── test-db.ts
    └── mocks/

.github/workflows/
├── ci.yml (updated with full pipeline)
└── deploy.yml
```

## Dependencies to Add

```
devDependencies:
  vitest
  @testing-library/react
  @playwright/test
  @axe-core/playwright
  @fastify/rate-limit (production dep)
```
