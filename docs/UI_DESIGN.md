# UI Design Guidelines

## Design Principles
- **Readable first**: Long-form docs use generous line height, 66-80ch measure, serif/sans pairing, and strong contrast in both light and dark modes.
- **Mobile-first**: Layouts adapt gracefully from 320px upward. Navigation collapses to hamburger with slide-in drawer.
- **Accessibility**: WCAG AA contrast, focus-visible outlines, skip links, keyboard-friendly modals/comments.
- **Consistency**: Shared component library for both SSR pages and admin SPA. Button styles selectable (pill vs rounded) via settings.
- **Feedback**: Inline validation, status badges for sync/test actions, non-blocking toasts for saves.
- **Single-surface discipline**: Public docs and the `/admin` console share one modern interface; avoid extra chrome or pages outside the INTERFACE_PLAN.

## Layouts
### Public Help Page (SSR)
- Header: logo, search (future hook), locale switcher, theme toggle (if enabled), login button.
- Breadcrumbs under header.
- Optional header image full-width responsive with aspect ratio preservation.
- Title block with metadata (last updated, release tag if applicable).
- Subpage list placement configurable (above or below content but never above page header).
- Content body: Markdown-rendered typography with anchor hovers and paragraph comment affordances (hover icon / focus button).
- Comment drawer/modal per paragraph with thread list and composer.
- Footer: version dropdown (Latest + releases), locale switcher, links to admin (if authorized).

### Admin Shell (CSR)
- Persistent sidebar with tabs: Dashboard, Content, Comments, Settings, Users, Admin Tools.
- Top bar: search/quick actions, user menu, status indicators.
- Forms use two-column layout on desktop, single column on mobile.
- Settings tabs with descriptions beneath labels; inline validation messages.
- Modals for Google login (popup), destructive confirms (ban/unban, delete comment), and sync actions.

## Theming
- Modes: light, dark, auto (system). Admin may lock mode; otherwise user can toggle.
- Button shapes: pill vs rounded; applied globally via CSS variables.
- Typography: system sans for UI, readable serif for article body. Scale uses responsive clamp.
- Code blocks with copy button; links underlined on focus/hover.

## Components
- **Breadcrumbs**: auto-generated from hierarchy.
- **Locale Switcher**: dropdown/segmented control; persists preference per user/session.
- **Version Selector**: dropdown in footer and near title for release view.
- **Comment Anchors**: icon appears on hover/focus; clicking opens thread panel.
- **Sync Log Viewer**: table with status badges and expandable error details.
- **Settings Forms**: grouped by tabs with helper text and validation states.

## Error Handling & Notifications

### Inline Form Errors
- Display directly below the invalid field
- Red text color with error icon
- Clear message explaining the issue and how to fix
- Field border turns red when invalid
- Errors clear automatically when user starts correcting

### Alert System
Four semantic alert types with distinct colors:

| Type | Color | Use Case |
|------|-------|----------|
| `danger` | Red (#DC2626) | Critical errors, failed operations, destructive confirmations |
| `warning` | Amber (#D97706) | Non-blocking issues, deprecation notices, potential problems |
| `success` | Green (#059669) | Successful operations, confirmations |
| `info` | Blue (#2563EB) | Informational messages, tips, neutral notifications |

### Alert Display Modes

**Toast notifications** (transient):
- Appear in top-right corner, stacked
- Auto-dismiss after 5 seconds (configurable)
- Manual dismiss via close button
- Used for: success messages, info tips
- Max 3 visible at once; older ones queued

**Banner alerts** (persistent):
- Full-width bar at top of content area
- Requires explicit dismissal
- Used for: warnings requiring acknowledgment, system status
- Can include action buttons

**Modal dialogs** (blocking):
- Centered overlay with backdrop
- Must be acknowledged to proceed
- Used for: critical errors, destructive action confirmations
- Include clear action buttons (Cancel / Confirm)

### Env-Controlled Field States
When a setting is configured via environment variable:
- Input field is disabled (greyed out)
- Label shows lock icon
- Helper text: "Configured via environment variable"
- Value shown as masked (for secrets) or visible (for non-sensitive)

## States & Empty Views
- Loading skeletons for content and settings.
- Empty states with CTAs for no comments, no releases, or missing content.
- Error boundaries with retry actions; redirect notice banner when 301 applied.

## Responsiveness
- Breakpoints (suggested): 0-599, 600-899, 900-1279, 1280+.
- Sidebar collapses to drawer under 900px; breadcrumbs collapse to truncated trail.
- Tables transform to cards on small screens.

## Interaction Details
- Login button triggers popup OAuth; on success, parent refreshes state without losing scroll.
- Anchor links update URL fragment without full reload; comments loaded asynchronously.
- Inline edit of title/slug with debounce and validation; preview of final URL.
