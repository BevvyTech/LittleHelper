# LittleHelper Tailwind Template

Standalone Tailwind (CDN) templates for the public docs surface and the in-app admin (/admin) in a single experience. Components are labeled so wiring to the real React/SSR app is straightforward.

## Files / Pages
- `index.html` – Public home/marketing surface with hero, stats, notices, and footer selectors.
- `docs-page.html` – SSR-style doc page with breadcrumbs, locale/version selectors, anchors + inline comments drawer, subpages, and metadata.
- `release.html` – Release view with tag selector, snapshot table, redirects review, and publish controls.
- `admin-dashboard.html` – Admin shell + overview cards, sync log, alerts, quick actions.
- `admin-content.html` – Content tree, frontmatter/editor panels, SEO + redirect controls.
- `admin-comments.html` – Moderation queue with filters, detail panel, abuse handling.
- `admin-settings.html` – Settings tabs (General, Content Source, Storage, AI, User Mgmt, Admin Tools) with env-locked fields.
- `admin-users.html` – User/role management, bans, invite/export controls.
- `admin-tools.html` – Ops utilities for releases, sync, SEO bulk, asset migration, health checks.

## Shared assets
- `assets/base.css` – Fonts, glass/gradient helpers, component tags, toast + modal styling.
- `assets/base.js` – Theme toggle, drawer/sidebar toggles, tab behavior, toast helper (used by `data-demo-toast`).

## Component markers
Each major block is labeled with an HTML comment and/or `data-component` attribute (e.g., `<!-- component: release timeline -->`, `data-component="comment-drawer"`). Swap the static HTML with real components while keeping those hooks.

## Spec-aligned placeholders
- GitHub source: repo URL, branch, base folder, GitHub App vs PAT fields, “configured via environment” states.
- Storage: local vs S3 fields, secure asset toggle, bucket/endpoint/public URL, asset path hint `/ {pageId}/{timestamp}-{filename}`.
- SEO/AI: Gemini API key, summary/keywords toggles, regenerate + lock actions.
- Releases: tag picker, snapshot table with per-locale slugs, redirect review list, publish/draft actions.
- Comments: anchor IDs, locale badges, moderation statuses, abuse flags, inline thread drawer on docs page.
- Users: roles (admin/user), ban/unban, invite/export, Google SSO emphasis.

## How to view / adapt
Open any HTML file directly in the browser; Tailwind loads via CDN. Adjust brand palette or typography by editing the `tailwind.config` block at the top of each page or by updating `assets/base.css`. Replace `data-demo-toast` buttons with real calls to your notification system, and wire `data-action` buttons (`toggle-theme`, `toggle-sidebar`, `toggle-drawer`, `open-modal`) to app logic.
