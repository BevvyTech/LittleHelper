# Phase 8: Frontend Completion

## Prerequisites
- Phase 7 complete
- All backend APIs functional
- Component library basics in place
- Follow `docs/internal/INTERFACE_PLAN.md` for pixel-perfect UI guidance

---

## 8.1 Responsive Layouts

### Mobile Navigation (Public)

**Components:**
| Component | Purpose |
|-----------|---------|
| `Header` + `MobileDrawer` | Slim header with hamburger, logo, theme toggle |
| `DrawerOverlay` | Semi-transparent backdrop, closes drawer on tap |

**Behavior:**
- Hamburger icon visible below 900px breakpoint
- Drawer slides in from left (transform: translateX)
- Contains: nav links, locale switcher, login/user menu
- Overlay closes drawer on tap
- Focus trap inside drawer when open
- Close on Escape key

### Mobile Navigation (Admin)

**Components:**
| Component | Purpose |
|-----------|---------|
| `Sidebar` (collapsible) | Sidebar that collapses to icons-only or drawer |
| `MobileAdminHeader` | Top bar with hamburger for collapsed sidebar |

**Behavior:**
- Below 900px: sidebar becomes overlay drawer
- 900-1279px: sidebar collapses to icon-only rail (40px wide)
- 1280px+: full sidebar (240px wide)
- Tooltip on hover for icon-only state

### Responsive Breadcrumbs

**Behavior:**
- Full path shown on desktop
- On mobile (<600px): show first item, ellipsis, last 2 items
- Clicking ellipsis expands full path in dropdown

### Table-to-Card Transformation

**Pattern:**
- Tables remain tables above 600px
- Below 600px: each row becomes a card
- Card shows key fields as label:value pairs
- Actions move to card footer

---

## 8.2 Theming System

### Theme Toggle Component

**States:**
- Light (sun icon)
- Dark (moon icon)
- Auto/System (half-sun-half-moon icon)

**Implementation:**
- Three-state toggle button or dropdown
- Stores preference in localStorage key: `theme-preference`
- Also sets cookie `theme` for SSR initial render
- On auto: listens to `prefers-color-scheme` media query

### CSS Variables Structure

```
:root {
  /* Base colors - light mode defaults */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  --color-text-primary: #212529;
  --color-text-secondary: #6c757d;
  --color-text-muted: #adb5bd;
  --color-border: #dee2e6;
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;

  /* Semantic colors */
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #2563eb;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', Monaco, monospace;

  /* Button shape */
  --button-radius: 6px; /* or 9999px for pill */
}

[data-theme="dark"] {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #3d3d3d;
  --color-text-primary: #f8f9fa;
  --color-text-secondary: #adb5bd;
  --color-text-muted: #6c757d;
  --color-border: #495057;
}
```

### Button Shape Selector

**Options:**
- Rounded (6px border-radius)
- Pill (9999px border-radius)

**Storage:** localStorage key `button-shape`, applied via CSS variable

---

## 8.3 Storage Integration

### Gateway to Implement

| Gateway | Implements | Purpose |
|---------|------------|---------|
| `LocalStorageGateway` | `IStorageGateway` | File system storage |
| `S3StorageGateway` | `IStorageGateway` | S3-compatible storage |

**Interface methods:**
- `upload(file, path)` → Upload file, return public URL
- `getPresignedUploadUrl(path)` → For S3 direct uploads
- `delete(path)` → Remove file
- `list(prefix)` → List files in path

### Storage Settings UI

Location: `apps/web/src/admin/pages/settings/StorageSettings.tsx`

**Form fields:**
| Field | Type | Validation |
|-------|------|------------|
| Storage Type | radio (Local/S3) | Required |
| Local Path | text | Required if Local |
| S3 Endpoint | text | URL format, required if S3 |
| S3 Bucket | text | Required if S3 |
| S3 Region | text | Required if S3 |
| Access Key | password | Required if S3 |
| Secret Key | password | Required if S3 |
| Public URL Prefix | text | URL format |
| Secure Mode | toggle | - |

**Actions:**
- Test Connection button
- Show env-override indicator if applicable

### Image Upload Component

| Component | Purpose |
|-----------|---------|
| `ImageUploader` | Drag-drop zone with preview |
| `UploadProgress` | Progress bar during upload |
| `AssetBrowser` | Modal to browse/select existing assets |

**ImageUploader behavior:**
1. Drag file or click to select
2. Validate file type (images only) and size (<10MB)
3. Show preview thumbnail
4. Upload via presigned URL (S3) or direct POST (local)
5. Return asset URL for Markdown insertion

---

## 8.4 User Management

### Admin Page
Location: `apps/web/src/admin/pages/UsersPage.tsx`

**Table columns:**
| Column | Content |
|--------|---------|
| Avatar | User profile image |
| Name | Display name |
| Email | Email address |
| Role | Badge (Admin/User) |
| Status | Badge (Active/Banned) |
| Last Login | Relative time |
| Actions | Role change, Ban/Unban |

**Filters:**
- Search by name/email
- Filter by role
- Filter by status

### User Actions

**Role change:**
- Dropdown: Admin / User
- Confirmation modal: "Change {name}'s role to {role}?"
- Cannot demote self

**Ban/Unban:**
- Toggle button with confirmation
- Modal: "Ban {name}? They will be unable to login or comment."
- Banned users show visual indicator in table

---

## 8.5 Admin Tools

### Admin Page
Location: `apps/web/src/admin/pages/ToolsPage.tsx`

**Tool Cards:**

| Tool | Description | Action |
|------|-------------|--------|
| Sync from GitHub | Pull latest content from repository | Trigger Sync |
| Regenerate Anchors | Recompute all paragraph anchors | Regenerate |
| Bulk SEO Generation | Generate AI metadata for all pages | Generate All |
| Clear Cache | Clear SSR and content cache | Clear |

**Each card contains:**
- Icon
- Title
- Description
- Action button
- Last run timestamp (if applicable)
- Status indicator

**Confirmation pattern:**
- Click action → Confirmation modal
- Modal shows what will happen
- On confirm → Show loading state
- On complete → Toast notification

### Sync Status Component

| Component | Purpose |
|-----------|---------|
| `SyncStatusBadge` | Shows current sync state (Idle/Running/Error) |
| `SyncLogTable` | History of sync operations |
| `SyncLogDetail` | Expandable error details |

---

## 8.6 Accessibility

### Skip Links

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<a href="#navigation" class="skip-link">Skip to navigation</a>
```

**Styling:** Visually hidden until focused, then positioned fixed at top

### Focus Management

**Modals:**
- Focus first focusable element on open
- Trap focus within modal
- Return focus to trigger on close

**Drawers:**
- Same as modals
- Close on Escape

**Route changes:**
- Focus main heading on navigation
- Announce page title to screen readers

### ARIA Labels

| Element | Required ARIA |
|---------|---------------|
| Icon buttons | `aria-label` describing action |
| Toggle buttons | `aria-pressed` state |
| Expandable sections | `aria-expanded` state |
| Loading states | `aria-busy="true"` |
| Error messages | `aria-live="polite"` |

### Color Contrast

- All text must meet WCAG AA (4.5:1 for body, 3:1 for large text)
- Focus indicators must be visible in both themes
- Don't rely on color alone for status (use icons too)

---

## Verification Checklist

### Responsive
- [x] Mobile nav drawer works on public site
- [x] Admin sidebar collapses correctly
- [x] Breadcrumbs truncate on mobile
- [x] Tables become cards on mobile
- [x] All breakpoints tested (320, 600, 900, 1280)

### Theming
- [x] Light/Dark/Auto modes work
- [x] Theme persists across sessions
- [x] SSR renders correct initial theme
- [x] Button shapes apply globally

### Storage
- [x] Local upload works
- [x] S3 upload via presigned URL works
- [x] Asset browser shows uploaded files
- [x] Uploaded images display in content

### Users
- [x] User list displays correctly
- [x] Role change works with confirmation
- [x] Ban/Unban works with confirmation
- [x] Cannot demote own admin role

### Tools
- [x] Manual sync triggers correctly
- [x] Anchor regeneration works
- [x] Bulk SEO generation works
- [x] Status shows after operations

### Accessibility
- [x] Skip links work
- [x] Focus trapped in modals
- [x] All images have alt text
- [x] Color contrast passes WCAG AA
- [x] Keyboard navigation works throughout

---

## File Structure After Phase 8

```
apps/web/src/
├── components/
│   ├── Header.tsx (mobile ready)
│   ├── MobileDrawer.tsx
│   ├── DrawerOverlay.tsx
│   ├── ThemeToggle.tsx
│   └── ResponsiveBreadcrumbs.tsx

apps/web/src/admin/
├── components/
│   ├── Sidebar.tsx (collapsible)
│   ├── MobileAdminHeader.tsx
│   ├── ImageUploader.tsx
│   ├── UploadProgress.tsx
│   ├── AssetBrowser.tsx
│   ├── SyncStatusBadge.tsx
│   ├── SyncLogTable.tsx
│   ├── ThemeToggle.tsx
│   └── ConfirmModal.tsx
├── pages/
│   ├── UsersPage.tsx
│   ├── ToolsPage.tsx
│   └── settings/
│       └── StorageSettings.tsx

apps/api/src/
├── application/ports/gateways/
│   └── IStorageGateway.ts
└── infrastructure/gateways/
    ├── LocalStorageGateway.ts
    └── S3StorageGateway.ts

packages/ui/src/
├── components/
│   └── SkipLink.tsx
├── theme.ts
└── styles/
    └── variables.css (updated with full theme)
```
