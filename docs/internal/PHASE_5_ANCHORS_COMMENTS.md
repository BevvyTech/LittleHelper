# Phase 5: Paragraph Anchors & Comments

## Prerequisites
- Phase 4 complete (content syncing)
- Pages with content in database

---

## 5.1 Anchor Engine

### Algorithm Summary (from ARCHITECTURE.md)

1. **Block Extraction**: Parse Markdown AST, extract top-level blocks (paragraphs, headings, code blocks, lists, blockquotes)
2. **Text Normalization**: Strip markdown formatting, lowercase, collapse whitespace, remove punctuation
3. **Hash Generation**: `SHA-256(pageLocaleId + ":" + normalizedText)` truncated to 16 chars
4. **Anchor ID**: `"p-" + hash`

### Reconciliation on Content Update
- Exact match by hash → reuse anchor
- Fuzzy match (±3 positions, >80% text similarity) → reuse anchor
- No match → create new anchor
- Orphaned anchors: mark with `orphanedAt` timestamp, keep 30 days

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `MarkdownBlockParser` | `apps/api/src/infrastructure/markdown/` | Parse MD into blocks, return array of {type, content, position} |
| `AnchorGenerator` | same | Normalize text, compute hash, generate anchor ID |
| `AnchorReconciler` | same | Compare new anchors with existing, handle matching/orphaning |

### Repository to Implement

| Repository | Key Methods |
|------------|-------------|
| `AnchorRepositoryPrisma` | findByPageLocaleId, findByHash, upsertMany, markOrphaned, deleteOrphanedOlderThan |

### Use Case to Create

| Use Case | Purpose |
|----------|---------|
| `GenerateAnchorsUseCase` | Parse content → generate anchors → reconcile with existing → persist |

**Integration:** Call after sync and after content edit

---

## 5.2 Comment System Backend

### Repositories to Implement

| Repository | Key Methods |
|------------|-------------|
| `CommentThreadRepositoryPrisma` | findByAnchorId, findByPageLocaleId, create |
| `CommentRepositoryPrisma` | findByThreadId, create, delete, countByThread |

### Use Cases to Create

| Use Case | Purpose |
|----------|---------|
| `GetThreadByAnchorUseCase` | Get or create thread for anchor, return with comments |
| `CreateCommentUseCase` | Validate body, create comment in thread |
| `DeleteCommentUseCase` | Check author or admin, delete comment |
| `GetCommentsForPageUseCase` | Batch load all threads+comments for a page |

### Controller to Create

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET /api/pages/:pageLocaleId/comments` | Public | All threads for page |
| `GET /api/comments/thread/:anchorId` | Public | Single thread with comments |
| `POST /api/comments` | Authenticated | Create comment (body: anchorId, pageLocaleId, body) |
| `DELETE /api/comments/:id` | Authenticated | Delete own comment |
| `DELETE /api/admin/comments/:id` | Admin | Delete any comment |

---

## 5.3 Comment UI (Public)

### Components to Create for `apps/web`

| Component | Purpose |
|-----------|---------|
| `AnchorHover` | Icon that appears on paragraph hover, shows comment count badge |
| `CommentDrawer` | Side panel/drawer showing thread for selected anchor |
| `CommentThread` | List of comments with author info and timestamps |
| `CommentComposer` | Text input + submit button, shows login prompt if not authenticated |
| `CommentItem` | Single comment with avatar, name, time, body, delete button (if owner) |

### Behavior
- Hover on paragraph → show comment icon
- Click icon → open drawer, load thread async
- URL fragment updates to `#p-{hash}` on selection
- On page load, if fragment exists, scroll to paragraph and open drawer

### State Management
- `useComments` hook: load comments for page, grouped by anchorId
- `useCommentThread` hook: load/create single thread, add/delete comments

---

## 5.4 Comment Moderation (Admin)

### Admin Comments Page
Location: `apps/admin/src/pages/CommentsPage.tsx`

**Features:**
- Table view: comment body (truncated), author, page, date, actions
- Filters: by page, by user, date range
- Click row → expand to see full comment in context
- Delete button with confirmation modal
- Bulk select + delete

### API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/comments` | List all comments with pagination, filters |
| `GET /api/admin/comments/:id` | Get comment with context (page, thread) |

---

## Verification Checklist

### Anchors
- [ ] Parsing extracts correct blocks from Markdown
- [ ] Hashes are consistent for same content
- [ ] Anchor IDs are stable after minor edits
- [ ] Orphaned anchors are marked correctly
- [ ] Anchors regenerate on sync

### Comments
- [ ] Thread created on first comment
- [ ] Comments saved with author info
- [ ] Author can delete own comments
- [ ] Admin can delete any comment
- [ ] Comments load correctly on page

### UI
- [ ] Hover affordance appears on paragraphs
- [ ] Drawer opens with correct thread
- [ ] New comments appear immediately
- [ ] URL fragment updates
- [ ] Deep linking to anchor works

---

## File Structure After Phase 5

```
apps/api/src/
├── infrastructure/markdown/
│   ├── MarkdownBlockParser.ts
│   ├── AnchorGenerator.ts
│   ├── AnchorReconciler.ts
│   └── index.ts
├── infrastructure/repositories/
│   ├── AnchorRepositoryPrisma.ts
│   ├── CommentThreadRepositoryPrisma.ts
│   ├── CommentRepositoryPrisma.ts
│   └── index.ts
├── application/usecases/
│   ├── anchors/
│   │   ├── GenerateAnchorsUseCase.ts
│   │   └── index.ts
│   └── comments/
│       ├── GetThreadByAnchorUseCase.ts
│       ├── CreateCommentUseCase.ts
│       ├── DeleteCommentUseCase.ts
│       ├── GetCommentsForPageUseCase.ts
│       └── index.ts
└── interface/api/
    └── comments/
        ├── CommentsController.ts
        └── index.ts

apps/web/src/
├── components/
│   ├── AnchorHover.tsx
│   ├── CommentDrawer.tsx
│   ├── CommentThread.tsx
│   ├── CommentComposer.tsx
│   └── CommentItem.tsx
└── hooks/
    ├── useComments.ts
    └── useCommentThread.ts

apps/admin/src/pages/
└── CommentsPage.tsx (update)
```

## Dependencies to Add
```
apps/api: unified, remark-parse (Markdown AST parsing)
apps/web: (none new)
```
