# UI Design Guidelines

## Design Principles
- **Readable first**: Long-form docs use generous line height, 66-80ch measure, serif/sans pairing, and strong contrast in both light and dark modes.
- **Mobile-first**: Layouts adapt gracefully from 320px upward. Navigation collapses to hamburger with slide-in drawer.
- **Accessibility**: WCAG AA contrast, focus-visible outlines, skip links, keyboard-friendly modals/comments.
- **Consistency**: Shared component library for both SSR pages and admin SPA. Button styles selectable (pill vs rounded) via settings.
- **Feedback**: Inline validation, status badges for sync/test actions, non-blocking toasts for saves.

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

