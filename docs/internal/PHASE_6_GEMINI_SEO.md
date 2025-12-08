# Phase 6: Gemini Integration

## Prerequisites
- Phase 5 complete
- Gemini API key for testing

---

## 6.1 Gemini Gateway

### Gateway to Implement

| Gateway | Implements | Purpose |
|---------|------------|---------|
| `GeminiGateway` | `IGeminiGateway` | Call Gemini API for summary/keywords generation |

**Methods:**
- `testConnection()` → Verify API key works
- `generateSummary(content: string)` → Return 1-2 sentence summary
- `generateKeywords(content: string)` → Return array of 5-10 keywords
- `generateSeoMetadata(content: string)` → Return {summary, keywords}

**Implementation notes:**
- Use `@google/generative-ai` npm package
- Model: `gemini-pro` or latest available
- Include rate limiting/retry logic (exponential backoff)
- Prompts should specify output format clearly

**Prompts:**
- Summary: "Summarize this documentation in 1-2 sentences for SEO meta description (max 160 chars): {content}"
- Keywords: "Extract 5-10 SEO keywords from this documentation as a JSON array: {content}"

---

## 6.2 AI Settings UI

### Admin Settings Tab: AI Integrations
Location: `apps/admin/src/pages/settings/AiSettings.tsx`

**Form fields:**
| Field | Type |
|-------|------|
| Gemini API Key | password input |
| Enable AI features | toggle |
| Auto-generate on sync | toggle |

**Actions:**
- "Test Connection" button → calls API to verify key
- Show success/error inline

---

## 6.3 SEO Generation

### Use Cases to Create

| Use Case | Purpose |
|----------|---------|
| `GenerateSeoMetadataUseCase` | Generate summary+keywords for single page, skip if locked |
| `BulkGenerateSeoUseCase` | Generate for all pages missing SEO or not locked |

**GenerateSeoMetadataUseCase flow:**
1. Check if page has `geminiLocked = true` → skip
2. Read Markdown content
3. Call Gemini gateway
4. Update PageLocale with summary + keywords

### Controller Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/admin/seo/generate/:pageLocaleId` | Generate for single page |
| `POST /api/admin/seo/generate-all` | Bulk generate (returns job status) |

### Integration Points
- After sync: optionally trigger generation if "auto-generate" enabled
- Manual trigger per page in editor
- Bulk trigger from Tools page

---

## 6.4 SEO Lock Feature

### PageLocale Field
Already exists: `geminiLocked: boolean`

**Behavior:**
- If locked, Gemini won't overwrite summary/keywords
- Admin can manually edit and lock
- Checkbox in page editor: "Lock SEO (prevent auto-generation)"

---

## 6.5 Meta Tags

### SSR Meta Tag Generation
Location: `apps/web/src/components/PageMeta.tsx`

**Tags to generate:**
```html
<title>{pageTitle} | {siteName}</title>
<meta name="description" content="{summary}">
<meta name="keywords" content="{keywords.join(', ')}">
<meta property="og:title" content="{pageTitle}">
<meta property="og:description" content="{summary}">
<meta property="og:type" content="article">
<meta property="og:locale" content="{locale}">
<meta name="article:modified_time" content="{updatedAt}">
<!-- If viewing release -->
<meta name="version" content="{releaseTag}">
```

### React Helmet or Document Head
- Use `react-helmet-async` for SSR-compatible head management
- Or use Vite SSR's built-in head handling

---

## Verification Checklist

- [ ] Gemini connection test works
- [ ] Summary generated is reasonable quality
- [ ] Keywords are relevant to content
- [ ] Locked pages are skipped
- [ ] Bulk generation processes all unlocked pages
- [ ] Meta tags render correctly in HTML
- [ ] Auto-generate on sync works when enabled

---

## File Structure After Phase 6

```
apps/api/src/
├── infrastructure/gateways/
│   ├── GeminiGateway.ts
│   └── index.ts
├── application/usecases/
│   └── seo/
│       ├── GenerateSeoMetadataUseCase.ts
│       ├── BulkGenerateSeoUseCase.ts
│       └── index.ts
└── interface/api/
    └── seo/
        ├── SeoController.ts
        └── index.ts

apps/admin/src/pages/settings/
└── AiSettings.tsx

apps/web/src/components/
└── PageMeta.tsx
```

## Dependencies to Add
```
apps/api: @google/generative-ai
apps/web: react-helmet-async
```
