# Interface & UI Implementation Plan

## Overview
This document provides pixel-perfect specifications for implementing LittleHelper's user interface. Follow these guidelines exactly to ensure visual consistency and optimal usability.

---

## 1. Layout Grid System

### Base Grid
- **Container max-width:** 1280px
- **Gutter:** 24px (mobile: 16px)
- **Columns:** 12-column grid

### Content Width Guidelines

| Context | Max Width | Reason |
|---------|-----------|--------|
| Article body | 720px (45rem) | Optimal reading line length (66-80 chars) |
| Admin forms | 600px | Comfortable form scanning |
| Full-width sections | 100% | Headers, footers, banners |
| Cards in grid | Fluid within columns | Responsive behavior |

---

## 2. Public Site Layout

### Header

```
+------------------------------------------------------------------+
| [Logo]                    [Search]   [Locale] [Theme] [Login]    |
+------------------------------------------------------------------+
Height: 64px
Padding: 0 24px (mobile: 0 16px)
Background: var(--color-bg-primary)
Border-bottom: 1px solid var(--color-border)
Position: sticky, top: 0, z-index: 100
```

**Element specifications:**

| Element | Size | Position | Notes |
|---------|------|----------|-------|
| Logo | 32px height | Left, vertically centered | Link to home |
| Search | 240px width | Center-right, 16px gap from locale | Placeholder for future |
| Locale switcher | Auto width | 16px gap from theme | Dropdown, current locale shown |
| Theme toggle | 40px button | 16px gap from login | Icon button |
| Login button | Auto width | Right edge | Text + avatar when logged in |

**Mobile (<600px):**
- Logo left, hamburger right
- Search hidden (in drawer)
- Locale, theme, login in drawer

### Breadcrumbs

```
+------------------------------------------------------------------+
| Home > Category > Subcategory > Current Page                      |
+------------------------------------------------------------------+
Height: 48px
Padding: 12px 24px
Background: var(--color-bg-secondary)
Font-size: 14px
Color: var(--color-text-secondary)
```

**Behavior:**
- Each item is a link except current (plain text)
- Separator: " > " (or chevron icon)
- Current page: font-weight 600, color: text-primary
- Mobile: First item + "..." + last 2 items

### Page Header

```
+------------------------------------------------------------------+
|                                                                    |
|  [Header Image - optional, 16:9 aspect ratio, max 400px height]   |
|                                                                    |
+------------------------------------------------------------------+
|  Page Title                                          [Release v2] |
|  Last updated: Dec 8, 2025                                        |
+------------------------------------------------------------------+
```

**Specifications:**

| Element | Style |
|---------|-------|
| Header image | width: 100%, max-height: 400px, object-fit: cover |
| Title | font-size: 2.5rem (40px), font-weight: 700, margin-bottom: 8px |
| Release badge | position: absolute, top-right of title block, pill shape |
| Metadata | font-size: 14px, color: text-secondary |

### Content Body

```
+------------------------------------------------------------------+
|                                                                    |
|  [Subpage List - if configured above]                             |
|                                                                    |
|  Paragraph text with comfortable line height and optimal          |
|  measure for readability. Hover shows comment icon.       [icon]  |
|                                                                    |
|  Another paragraph with anchor support...                 [icon]  |
|                                                                    |
|  ## Heading Level 2                                               |
|                                                                    |
|  More content...                                                  |
|                                                                    |
|  [Subpage List - if configured below]                             |
|                                                                    |
+------------------------------------------------------------------+
```

**Typography:**

| Element | Size | Line Height | Weight |
|---------|------|-------------|--------|
| Body text | 18px | 1.75 (31.5px) | 400 |
| h1 | 40px | 1.2 | 700 |
| h2 | 32px | 1.3 | 600 |
| h3 | 24px | 1.4 | 600 |
| h4 | 20px | 1.5 | 600 |
| Code inline | 16px | inherit | 400, monospace |
| Code block | 14px | 1.5 | 400, monospace |

**Paragraph anchor hover:**
- Icon appears 8px right of paragraph edge
- Icon: comment bubble, 20px, color: text-muted
- Hover: color: accent
- Shows count badge if comments exist

### Subpage List

```
+------------------------------------------+
| Related Pages                            |
+------------------------------------------+
| > Getting Started                        |
| > Installation Guide                     |
| > Configuration                          |
+------------------------------------------+
```

**Specifications:**
- Background: var(--color-bg-secondary)
- Border-radius: 8px
- Padding: 16px
- Margin: 24px 0
- List items: 12px vertical gap
- Arrow icon before each item
- Hover: background slightly darker, text: accent

### Footer

```
+------------------------------------------------------------------+
| [Logo]     Docs  |  Releases  |  About     [Version: v2.1] [EN]  |
|            GitHub |  Contact                                      |
+------------------------------------------------------------------+
| © 2025 Company Name                                               |
+------------------------------------------------------------------+
Height: auto (min 120px)
Padding: 32px 24px
Background: var(--color-bg-secondary)
Border-top: 1px solid var(--color-border)
```

**Version selector:**
- Dropdown showing: "Latest", "v2.1", "v2.0", "v1.0"
- Width: 120px
- Position: right side of footer links

---

## 3. Comment System UI

### Anchor Hover State

```
Paragraph text continues here and the comment     [💬 3]
icon appears when hovering or focusing.
```

**Icon specifications:**
- Position: absolute, right: -32px from content edge
- Visible on: hover, focus-within, or has comments
- Badge: red circle, 16px, white text, shows count
- Click opens drawer

### Comment Drawer

```
                                    +----------------------------+
                                    | Comments (3)          [X]  |
                                    +----------------------------+
                                    | Paragraph preview...       |
                                    +----------------------------+
                                    |                            |
                                    | [Avatar] John Doe          |
                                    | 2 hours ago                |
                                    | This is really helpful,    |
                                    | thanks for the clear       |
                                    | explanation!               |
                                    |                     [DEL]  |
                                    +----------------------------+
                                    | [Avatar] Jane Smith        |
                                    | 1 day ago                  |
                                    | Could you add an example?  |
                                    +----------------------------+
                                    |                            |
                                    | [Write a comment...]       |
                                    |                            |
                                    | [Post Comment]             |
                                    +----------------------------+
```

**Drawer specifications:**

| Property | Value |
|----------|-------|
| Width | 400px (mobile: 100%) |
| Position | fixed, right: 0, top: 0, bottom: 0 |
| Background | var(--color-bg-primary) |
| Shadow | -4px 0 12px rgba(0,0,0,0.1) |
| z-index | 200 |
| Animation | slide in from right, 200ms ease-out |

**Comment item:**
- Avatar: 32px circle
- Name: 14px, font-weight 600
- Time: 12px, color: text-muted
- Body: 14px, line-height 1.5
- Delete: icon button, visible only for author/admin
- Separator: 1px border-bottom

**Composer:**
- Textarea: 100% width, min-height 80px, resize vertical
- Button: primary style, right-aligned
- If not logged in: show "Login to comment" link instead

---

## 4. Admin Layout

### Shell Structure

```
+--------+----------------------------------------------------------+
| Sidebar|  Top Bar                                        [User]   |
|        +----------------------------------------------------------+
| [Logo] |                                                          |
|        |  Content Area                                            |
| Dash   |                                                          |
| Content|                                                          |
| Comment|                                                          |
| Setting|                                                          |
| Users  |                                                          |
| Tools  |                                                          |
|        |                                                          |
+--------+----------------------------------------------------------+
```

**Sidebar specifications:**

| State | Width | Content |
|-------|-------|---------|
| Expanded (>1280px) | 240px | Icon + label |
| Collapsed (900-1280px) | 64px | Icon only + tooltip |
| Hidden (<900px) | 0 | In hamburger drawer |

**Sidebar item:**
- Height: 48px
- Padding: 12px 16px
- Icon: 20px, 12px gap to label
- Active: background: accent at 10% opacity, left border 3px accent
- Hover: background: bg-tertiary

**Top bar:**
- Height: 64px
- Padding: 0 24px
- Contains: Page title (left), Actions (right), User menu (far right)

### Admin Page Templates

#### List Page (Content, Users, Comments)

```
+----------------------------------------------------------+
| Page Title                           [Search] [+ Create]  |
+----------------------------------------------------------+
| Filters: [All v] [Date Range v]            Showing 1-10   |
+----------------------------------------------------------+
| | Title        | Locale | Updated   | Status | Actions | |
| |--------------|--------|-----------|--------|---------|  |
| | Getting...   | EN     | 2h ago    | Draft  | [Edit]  | |
| | Install...   | EN, FR | 1d ago    | Pub    | [Edit]  | |
+----------------------------------------------------------+
| [< Prev]  1  2  3  ...  10  [Next >]                      |
+----------------------------------------------------------+
```

**Table specifications:**
- Header: background: bg-secondary, font-weight 600, 14px
- Row: height 56px, border-bottom 1px
- Hover: background: bg-secondary at 50%
- Actions: icon buttons, 8px gap

#### Detail/Edit Page

```
+----------------------------------------------------------+
| < Back to List                                            |
+----------------------------------------------------------+
| Page Title                                    [Save] [Del]|
+----------------------------------------------------------+
|                                                           |
| [Tab: EN] [Tab: FR] [+ Add Locale]                       |
|                                                           |
| Title *                                                   |
| [Getting Started with LittleHelper________________]       |
|                                                           |
| Slug                                                      |
| [getting-started_______________] Preview: /en/getting-... |
|                                                           |
| Parent Category                                           |
| [Documentation________________________v]                  |
|                                                           |
| Content                                                   |
| +-------------------------------------------------------+ |
| | # Getting Started                                     | |
| |                                                       | |
| | Welcome to LittleHelper...                           | |
| +-------------------------------------------------------+ |
|                                                           |
| SEO Settings                                              |
| Summary                               [Lock] [Regenerate] |
| [Auto-generated summary text here..._________________]    |
|                                                           |
+----------------------------------------------------------+
```

**Form field specifications:**

| Element | Style |
|---------|-------|
| Label | 14px, font-weight 500, margin-bottom 4px |
| Input | height 40px, padding 8px 12px, border-radius 6px |
| Textarea | min-height 120px, resize vertical |
| Helper text | 12px, color: text-muted, margin-top 4px |
| Error text | 12px, color: danger, margin-top 4px |
| Required indicator | red asterisk after label |

### Settings Page

```
+----------------------------------------------------------+
| Settings                                                  |
+----------------------------------------------------------+
| [General] [Content] [Storage] [AI] [Advanced]            |
+----------------------------------------------------------+
|                                                           |
| Site Name *                                               |
| [LittleHelper Documentation_______________________]       |
| The name displayed in the header and page titles          |
|                                                           |
| Default Locale *                                          |
| [English (en)_____________________________v]              |
| The default language for new visitors                     |
|                                                           |
| ---------------------------------------------------       |
|                                                           |
| Repository URL                               [ENV LOCKED] |
| [https://github.com/org/repo_____________] (locked icon)  |
| Configured via environment variable                       |
|                                                           |
|                                     [Test Connection]     |
|                                                           |
+----------------------------------------------------------+
|                                           [Save Changes]  |
+----------------------------------------------------------+
```

**Tab navigation:**
- Height: 48px
- Border-bottom: 2px solid border
- Active tab: border-bottom 2px accent, font-weight 600
- Tab hover: background: bg-secondary

**ENV locked field:**
- Input: disabled, background: bg-tertiary
- Lock icon before label
- Helper text: "Configured via environment variable"

---

## 5. Component Specifications

### Buttons

```
Primary:   [████████████]  bg: accent, text: white
Secondary: [░░░░░░░░░░░░]  bg: transparent, border: border, text: primary
Danger:    [▓▓▓▓▓▓▓▓▓▓▓▓]  bg: danger, text: white
Ghost:     [ text only  ]  bg: transparent, text: accent
```

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm | 32px | 8px 12px | 14px |
| md | 40px | 10px 16px | 14px |
| lg | 48px | 12px 24px | 16px |

**States:**
- Hover: darken background 10%
- Active: darken background 20%
- Disabled: opacity 0.5, cursor not-allowed
- Loading: show spinner, disable click

**Shape (controlled by CSS variable):**
- Rounded: border-radius 6px
- Pill: border-radius 9999px

### Form Inputs

```
Normal:    +---------------------------+
           | Placeholder text          |
           +---------------------------+

Focus:     +===========================+  (accent border)
           | User input                |
           +===========================+

Error:     +---------------------------+  (red border)
           | Invalid input             |
           +---------------------------+
           ⚠ Error message here

Disabled:  +---------------------------+  (grey background)
           | Locked value              |
           +---------------------------+
```

| State | Border | Background |
|-------|--------|------------|
| Normal | 1px border | bg-primary |
| Hover | 1px border (darker) | bg-primary |
| Focus | 2px accent | bg-primary |
| Error | 2px danger | bg-primary |
| Disabled | 1px border | bg-tertiary |

### Modals

```
+===============================================+
|  Modal Title                            [X]  |
+----------------------------------------------+
|                                              |
|  Modal content goes here. This can be        |
|  a form, confirmation message, or any        |
|  other content.                              |
|                                              |
+----------------------------------------------+
|                      [Cancel]  [Confirm]     |
+===============================================+
```

**Specifications:**
- Width: 480px (small), 640px (medium), 800px (large)
- Max-height: 80vh
- Border-radius: 12px
- Shadow: 0 20px 40px rgba(0,0,0,0.2)
- Backdrop: rgba(0,0,0,0.5)
- Animation: fade in backdrop, scale in modal

**Header:**
- Padding: 16px 24px
- Border-bottom: 1px solid border
- Title: 18px, font-weight 600

**Body:**
- Padding: 24px
- Overflow: auto (if content exceeds)

**Footer:**
- Padding: 16px 24px
- Border-top: 1px solid border
- Buttons: right-aligned, 12px gap

### Toasts

```
+------------------------------------------+
| [✓] Changes saved successfully      [X]  |
+------------------------------------------+
```

**Specifications:**
- Position: fixed, top: 24px, right: 24px
- Width: 360px
- Padding: 16px
- Border-radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Animation: slide in from right, fade out on dismiss

**Types (left icon and left border):**
- Success: green check, green left border
- Error: red X, red left border
- Warning: amber triangle, amber left border
- Info: blue i, blue left border

### Badges

```
[Published]  [Draft]  [Admin]  [3]
```

| Type | Background | Text |
|------|------------|------|
| Success | green 10% | green |
| Warning | amber 10% | amber |
| Danger | red 10% | red |
| Neutral | grey 10% | grey |
| Count | accent | white |

**Specifications:**
- Padding: 4px 8px
- Border-radius: 4px (or 9999px for count)
- Font-size: 12px
- Font-weight: 500

### Loading States

**Skeleton:**
```
+------------------------------------------+
| [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] |
| [░░░░░░░░░░░░░]                          |
| [░░░░░░░░░░░░░░░░░░░░░░░░]               |
+------------------------------------------+
```
- Background: bg-tertiary
- Animation: shimmer effect (gradient moving left to right)
- Match layout of content being loaded

**Spinner:**
- Size: 20px (inline), 40px (page)
- Color: accent
- Animation: rotate 1s linear infinite

**Button loading:**
- Replace text with spinner
- Keep button width stable
- Disable interactions

---

## 6. Responsive Breakpoints

### Breakpoint Definitions

| Name | Range | Target |
|------|-------|--------|
| xs | 0-599px | Mobile portrait |
| sm | 600-899px | Mobile landscape, small tablet |
| md | 900-1279px | Tablet, small laptop |
| lg | 1280px+ | Desktop |

### Layout Changes by Breakpoint

**xs (0-599px):**
- Single column layout
- Hamburger menu replaces header nav
- Full-width cards
- Tables become cards
- Sidebar hidden (in drawer)
- Footer stacked vertically
- Touch targets minimum 44px

**sm (600-899px):**
- Two-column grid where appropriate
- Hamburger menu still active
- Tables remain (horizontal scroll if needed)
- Sidebar hidden (in drawer)

**md (900-1279px):**
- Full header navigation visible
- Admin sidebar collapsed (icon rail)
- Three-column grid for cards
- Tables full width

**lg (1280px+):**
- Full layout as designed
- Admin sidebar expanded
- Four-column grid for cards
- Maximum content width enforced

---

## 7. Animation & Transitions

### Timing Functions

| Use Case | Duration | Easing |
|----------|----------|--------|
| Hover states | 150ms | ease |
| Expanding/collapsing | 200ms | ease-out |
| Modal open | 200ms | ease-out |
| Modal close | 150ms | ease-in |
| Page transitions | 300ms | ease-in-out |
| Toast enter | 300ms | ease-out |
| Toast exit | 200ms | ease-in |

### Specific Animations

**Drawer slide:**
```css
.drawer-enter { transform: translateX(100%); }
.drawer-enter-active { transform: translateX(0); transition: transform 200ms ease-out; }
.drawer-exit { transform: translateX(0); }
.drawer-exit-active { transform: translateX(100%); transition: transform 150ms ease-in; }
```

**Modal scale:**
```css
.modal-enter { opacity: 0; transform: scale(0.95); }
.modal-enter-active { opacity: 1; transform: scale(1); transition: all 200ms ease-out; }
```

**Skeleton shimmer:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 8. Accessibility Specifications

### Focus Indicators

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

- Never remove focus outlines
- Ensure 3:1 contrast against background
- Use `focus-visible` to avoid showing on click

### Touch Targets

- Minimum size: 44x44px
- Spacing between targets: minimum 8px
- Clickable area can exceed visual bounds

### Color Contrast Requirements

| Element | Minimum Ratio |
|---------|---------------|
| Body text | 4.5:1 |
| Large text (18px+ bold, 24px+ normal) | 3:1 |
| UI components (buttons, inputs) | 3:1 |
| Focus indicators | 3:1 |
| Icons (informational) | 3:1 |

### Screen Reader Considerations

- All images: meaningful alt text or `alt=""`
- Icon buttons: `aria-label`
- Loading states: `aria-busy="true"`
- Expanded/collapsed: `aria-expanded`
- Current page: `aria-current="page"`
- Error messages: `aria-live="polite"`

---

## 9. Dark Mode Specifications

### Color Mapping

| Token | Light | Dark |
|-------|-------|------|
| bg-primary | #ffffff | #1a1a1a |
| bg-secondary | #f8f9fa | #2d2d2d |
| bg-tertiary | #e9ecef | #3d3d3d |
| text-primary | #212529 | #f8f9fa |
| text-secondary | #6c757d | #adb5bd |
| text-muted | #adb5bd | #6c757d |
| border | #dee2e6 | #495057 |
| accent | #2563eb | #3b82f6 |

### Images in Dark Mode

- Consider `filter: brightness(0.9)` for images
- Ensure diagrams work in both modes
- Logo should have dark mode variant if needed

### Shadows in Dark Mode

```css
[data-theme="light"] {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}
```

---

## 10. Implementation Checklist

### Layout
- [ ] 12-column grid system implemented
- [ ] Container max-widths correct
- [ ] All breakpoints working
- [ ] Spacing scale consistent

### Public Site
- [ ] Header sticky, correct height
- [ ] Breadcrumbs truncate on mobile
- [ ] Content body has correct measure
- [ ] Anchor hover icons positioned correctly
- [ ] Comment drawer slides smoothly
- [ ] Footer version selector works
- [ ] Mobile drawer navigation works

### Admin
- [ ] Sidebar collapses correctly at breakpoints
- [ ] Top bar shows correct content
- [ ] Tables transform to cards on mobile
- [ ] Forms have correct field spacing
- [ ] Settings tabs work
- [ ] ENV locked fields styled correctly

### Components
- [ ] Buttons have all variants and sizes
- [ ] Inputs have all states
- [ ] Modals animate correctly
- [ ] Toasts stack and auto-dismiss
- [ ] Badges have all types
- [ ] Loading skeletons match content

### Theming
- [ ] Light mode complete
- [ ] Dark mode complete
- [ ] Auto mode detects system preference
- [ ] Theme persists across sessions
- [ ] Button shape setting works

### Accessibility
- [ ] Focus indicators visible
- [ ] Touch targets adequate
- [ ] Color contrast verified
- [ ] Screen reader tested
- [ ] Keyboard navigation complete

---

## Quick Reference: Z-Index Scale

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Base | 0 | Page content |
| Sticky | 100 | Header, admin top bar |
| Dropdown | 150 | Menus, selects |
| Drawer | 200 | Comment drawer, mobile nav |
| Modal backdrop | 250 | Modal overlay |
| Modal | 300 | Modal content |
| Toast | 400 | Notifications |
| Tooltip | 500 | Tooltips |
