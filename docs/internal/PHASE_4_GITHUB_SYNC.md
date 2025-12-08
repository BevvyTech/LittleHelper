# Phase 4: GitHub Sync

## Prerequisites
- Phase 3 complete (auth working)
- GitHub credentials (PAT or App) ready for testing

---

## 4.1 GitHub Gateway

### Gateways to Implement

| Gateway | Implements | Purpose |
|---------|------------|---------|
| `GithubGateway` | `IGithubGateway` | Clone repo, pull, list files, read/write files, commit, push |
| `GithubTagGateway` | `IGithubTagGateway` | Create tag, list tags, checkout tag, push tag |

**Implementation notes:**
- Use `simple-git` npm package for Git operations
- Support two auth methods: PAT (token in URL) or GitHub App (generate installation token)
- Clone to `.github-repos/{repo-name}/` directory
- For GitHub App: use `@octokit/app` to generate installation access tokens

### Configuration Loading
- Read from env vars first, fall back to DB settings
- Env vars: `GITHUB_AUTH_METHOD`, `GITHUB_PAT`, `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_REPO_URL`, `GITHUB_BRANCH`, `GITHUB_CONTENT_PATH`

---

## 4.2 Content Source Settings UI

### Admin Settings Tab: Content Source
Location: `apps/admin/src/pages/settings/ContentSourceSettings.tsx`

**Form fields:**
| Field | Type | Validation |
|-------|------|------------|
| Repository URL | text input | Valid GitHub URL |
| Branch | text input | Default: "main" |
| Content folder path | text input | Default: "docs" |
| Auth method | radio: PAT / GitHub App | Required |
| PAT | password input | Show only if PAT selected |
| App ID | text input | Show only if App selected |
| App Private Key | textarea | Show only if App selected |
| Installation ID | text input | Show only if App selected |

**Actions:**
- "Test Connection" button → calls `POST /api/admin/sync/test-connection`
- Show success/error result inline
- Fields disabled if corresponding env var is set (show "Configured via environment")

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/admin/sync/test-connection` | Test GitHub connection with current settings, return success/error |

---

## 4.3 Sync Engine

### Domain Entity

| Entity | Location | Fields |
|--------|----------|--------|
| `SyncLog` | `apps/api/src/domain/content/` | id, status (RUNNING/SUCCESS/FAILURE), message, details (JSON), startedAt, finishedAt |

### Repository to Implement

| Repository | Key Methods |
|------------|-------------|
| `SyncLogRepositoryPrisma` | create, update, findLatest, findAll(pagination) |

### Markdown Parser
Location: `apps/api/src/infrastructure/markdown/`

**FrontmatterParser class:**
- Parse YAML frontmatter from Markdown files
- Extract: `title`, `slug`, `locale`, `parent` (required), `headerImage`, `summary`, `keywords` (optional)
- Validate required fields, return structured object or errors

### Use Cases to Create

| Use Case | Purpose |
|----------|---------|
| `SyncFromGithubUseCase` | Pull repo → scan content folder → parse each .md file → upsert Page/PageLocale → detect slug changes → create redirects → update SyncLog |
| `CommitPageEditUseCase` | Write content to .md file → commit with message → push → trigger re-sync |

**SyncFromGithubUseCase flow:**
1. Create SyncLog with status=RUNNING
2. Pull latest from branch
3. List all .md files in content folder
4. For each file: parse frontmatter, validate
5. Match to existing pages by file path or create new
6. If slug changed: create redirect from old→new
7. Update SyncLog with results

**CommitPageEditUseCase flow:**
1. Read current file
2. Replace content (preserve frontmatter structure)
3. Git add + commit with message
4. Git push
5. Optionally trigger sync

### Controller to Create

| Controller | Routes |
|------------|--------|
| `SyncController` | `POST /api/admin/sync/trigger`, `GET /api/admin/sync/status`, `GET /api/admin/sync/logs` |

---

## 4.4 Content Management UI

### Admin Content Page
Location: `apps/admin/src/pages/ContentPage.tsx`

**Views:**
1. **Tree view** - hierarchical list of pages with expand/collapse
2. **Detail view** - edit single page

### Components to Create

| Component | Purpose |
|-----------|---------|
| `PageTree` | Recursive tree component showing page hierarchy |
| `PageTreeItem` | Single item with expand toggle, title, locale badges, actions |
| `PageEditor` | Form for editing page: title, slug (with live URL preview), parent selector, locale tabs, Markdown editor, header image picker |

### API Endpoints Needed

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/pages` | List all pages as tree structure |
| `GET /api/admin/pages/:id` | Get page with all locales |
| `POST /api/admin/pages` | Create new page |
| `PUT /api/admin/pages/:id` | Update page metadata |
| `PUT /api/admin/pages/:id/content` | Update Markdown content (triggers Git commit) |
| `DELETE /api/admin/pages/:id` | Delete page |

---

## Verification Checklist

- [ ] Test connection works with PAT
- [ ] Test connection works with GitHub App
- [ ] Manual sync pulls and parses all .md files
- [ ] Pages created/updated correctly in DB
- [ ] Slug changes create redirects
- [ ] Sync log shows history
- [ ] Content tree displays correctly
- [ ] Page editor saves changes
- [ ] Edits commit and push to GitHub

---

## File Structure After Phase 4

```
apps/api/src/
├── application/usecases/
│   └── sync/
│       ├── SyncFromGithubUseCase.ts
│       ├── CommitPageEditUseCase.ts
│       └── index.ts
├── infrastructure/
│   ├── gateways/
│   │   ├── GithubGateway.ts
│   │   ├── GithubTagGateway.ts
│   │   └── index.ts
│   ├── markdown/
│   │   ├── FrontmatterParser.ts
│   │   └── index.ts
│   └── repositories/
│       ├── SyncLogRepositoryPrisma.ts
│       └── index.ts
├── interface/api/
│   ├── sync/
│   │   ├── SyncController.ts
│   │   └── index.ts
│   └── pages/
│       ├── PagesController.ts
│       └── index.ts

apps/admin/src/
├── pages/
│   ├── ContentPage.tsx (update)
│   └── settings/
│       └── ContentSourceSettings.tsx
└── components/
    ├── PageTree.tsx
    ├── PageTreeItem.tsx
    └── PageEditor.tsx
```

## Dependencies to Add
```
apps/api: simple-git, @octokit/app (optional), gray-matter (frontmatter parsing)
```
