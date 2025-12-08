# Phase 7: Releases System

## Prerequisites
- Phase 6 complete
- GitHub gateway working (tag operations)
- Content syncing functional

---

## 7.1 Domain Entities

### Entities to Create

| Entity | Location | Key Fields |
|--------|----------|------------|
| `Release` | `apps/api/src/domain/releases/` | id, tag, name, description, createdAt |
| `ReleasePageSnapshot` | same | id, releaseId, pageLocaleId, slugAtRelease, titleAtRelease |

**Validation rules:**
- Tag must be unique, alphanumeric with hyphens (e.g., `help-v1.0`, `v2.3.1`)
- Tag cannot be empty or contain spaces
- Name is human-readable display name
- Description is optional

---

## 7.2 Repository Layer

### Repository to Implement

| Repository | Implements | Key Methods |
|------------|------------|-------------|
| `ReleaseRepositoryPrisma` | `IReleaseRepository` | create, findByTag, findAll, delete, createSnapshot, getSnapshotByRelease |

**Interface methods:**
- `create(release)` → Create release record
- `findByTag(tag)` → Get release by tag string
- `findAll()` → List all releases, ordered by createdAt desc
- `delete(tag)` → Remove release and its snapshots
- `createSnapshot(releaseId, pageLocaleSnapshots[])` → Bulk create snapshots
- `getSnapshotByRelease(releaseId)` → Get all page snapshots for a release

---

## 7.3 Use Cases

### Use Cases to Create

| Use Case | Purpose |
|----------|---------|
| `CreateReleaseUseCase` | Validate tag uniqueness → create Git tag → snapshot current slugs → persist |
| `GetReleasesUseCase` | Return all releases with metadata |
| `GetReleaseByTagUseCase` | Return single release with snapshot data |
| `DeleteReleaseUseCase` | Remove release from DB (Git tag remains) |
| `GetReleaseContentUseCase` | Checkout tag content → resolve slug from snapshot → return Markdown |

**CreateReleaseUseCase flow:**
1. Validate tag format and uniqueness
2. Call `IGithubTagGateway.createTag(tag, message)`
3. Query all current PageLocale records
4. Create ReleasePageSnapshot for each (storing current slug, title)
5. Create Release record
6. Return created release

**GetReleaseContentUseCase flow:**
1. Find release by tag
2. Find snapshot entry for requested pageLocaleId
3. Call `IGithubTagGateway.checkoutTag(tag)` to get content at that point
4. Read Markdown file at stored path
5. Return content (uses slugAtRelease for URL, not current slug)

---

## 7.4 Controller Endpoints

### Endpoints to Create

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/releases` | Public | List all releases |
| `GET /api/releases/:tag` | Public | Get release metadata |
| `POST /api/admin/releases` | Admin | Create new release |
| `DELETE /api/admin/releases/:tag` | Admin | Delete release |

**Request/Response:**

`POST /api/admin/releases`:
```
Body: { tag: string, name: string, description?: string }
Response: { data: Release }
```

`GET /api/releases`:
```
Response: { data: Release[] }
```

---

## 7.5 SSR Release Routes

### Route Pattern
`GET /releases/:tag/:locale/:slug*`

**Resolution flow:**
1. Validate release exists by tag
2. Find snapshot for pageLocaleId matching locale + slug
3. Checkout tag content (use cached if available)
4. Render page with release content
5. Show release badge/banner

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `SSRReleaseRenderer` | `apps/api/src/interface/ssr/` | Handle release route rendering |
| `ReleaseContentResolver` | same | Resolve content from tag checkout |

**Caching:**
- Cache tag checkouts in temp directory
- Key: `release-{tag}`
- Invalidate on release delete

---

## 7.6 Release UI (Public)

### Components for `apps/web`

| Component | Purpose |
|-----------|---------|
| `VersionSelector` | Dropdown showing all releases + "Latest" |
| `ReleaseBadge` | Small badge showing current release version |
| `ReleaseNoticeBanner` | "Viewing version X.Y" banner at top |

**VersionSelector behavior:**
- Fetches `/api/releases` on mount
- Shows "Latest" as first option
- On select, navigates to `/releases/{tag}/{currentLocale}/{currentSlug}`
- If on release page, "Latest" navigates to `/` version

**Placement:**
- Version selector in footer (always visible)
- Version selector also near page title when viewing release
- Release badge in header when on release route

---

## 7.7 Release UI (Admin)

### Admin Page
Location: `apps/admin/src/pages/ReleasesPage.tsx`

**Features:**
- Table: tag, name, description, created date, page count
- Create button → modal form
- Delete button with confirmation

**Create Release Modal:**
- Tag input (validated: alphanumeric + hyphens)
- Name input
- Description textarea (optional)
- Submit creates release, shows success/error

---

## Verification Checklist

- [x] Release created with valid Git tag
- [x] Snapshot captures all current PageLocale slugs
- [x] Release page renders content at tag point
- [x] URL uses snapshot slug (not current slug)
- [x] Version selector shows all releases
- [x] Navigation between versions works
- [x] Release badge/banner displays correctly
- [x] Admin can list and create releases
- [x] Delete removes DB record (tag in Git preserved)

---

## File Structure After Phase 7

```
apps/api/src/
├── domain/releases/
│   ├── Release.ts
│   ├── ReleasePageSnapshot.ts
│   └── index.ts
├── application/usecases/releases/
│   ├── CreateReleaseUseCase.ts
│   ├── GetReleasesUseCase.ts
│   ├── GetReleaseByTagUseCase.ts
│   ├── DeleteReleaseUseCase.ts
│   ├── GetReleaseContentUseCase.ts
│   └── index.ts
├── application/ports/repositories/
│   └── IReleaseRepository.ts
├── infrastructure/repositories/
│   └── ReleaseRepositoryPrisma.ts
└── interface/
    ├── api/releases/
    │   ├── ReleaseController.ts
    │   └── index.ts
    └── ssr/
        ├── SSRReleaseRenderer.ts
        ├── ReleaseContentResolver.ts
        └── index.ts

apps/web/src/components/
├── VersionSelector.tsx
├── ReleaseBadge.tsx
└── ReleaseNoticeBanner.tsx

apps/admin/src/pages/
└── ReleasesPage.tsx
```

## Notes

- Git tags are permanent; deleting release only removes DB record
- Consider adding "compare releases" feature in future
- Snapshot stores slug at release time to handle post-release slug changes
- Tag checkout can be slow; implement caching strategy
