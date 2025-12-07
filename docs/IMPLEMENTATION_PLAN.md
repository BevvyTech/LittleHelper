# Implementation Plan

Tickboxes must be updated as phases complete. Follow mandated order.

## Phase Checklist
- [x] Produce SPEC.md
- [x] Produce AGENTS.md
- [x] Produce ARCHITECTURE.md
- [x] Produce IMPLEMENTATION_PLAN.md
- [x] Produce UI_DESIGN.md
- [x] Produce prisma/schema.prisma
- [ ] Scaffold project structure
- [ ] Implement SSR router + admin CSR shell
- [ ] Implement GitHub sync
- [ ] Implement paragraph anchor engine
- [ ] Implement Gemini integration
- [ ] Implement releases system
- [ ] Build full frontend
- [ ] Testing

## Work Breakdown
1. **Documentation (done)**
   - Capture spec, architecture, UI guidelines, schema plan, and task checklist.

2. **Scaffolding**
   - Initialize package structure: backend (Fastify), shared types, frontend SSR + admin CSR via Vite, Dockerfile, lint/test configs, **pnpm** workspace with lockfile.
   - Apply the Clean Architecture layout from `docs/ARCHITECTURE.md` (domain/usecases/interface adapters/server/frontend) so domain code stays framework-agnostic.
   - Set up base routes, placeholder pages, and configuration loader.
   - Add Makefile wiring to wrap pnpm scripts for `launch`, `interactive`, `test`, `verify`, and Prisma migrations.

3. **SSR Router & Admin Shell**
   - Public SSR routes for locale/slug, redirects, release paths; render minimal templates with placeholder data.
   - Admin SPA shell with routing for settings, content, comments, users; integrate auth guard.

4. **GitHub Sync**
   - Implement repo settings storage, connector service (clone, pull, commit, push), test connection endpoint, sync logs, manual re-index triggers.

5. **Paragraph Anchors & Comments**
   - Markdown parser producing stable anchors; DB persistence and reconciliation; comment thread APIs and UI affordances.

6. **Gemini Integration**
   - Service for summary/keywords generation with toggles; apply during edit/publish workflows.

7. **Releases System**
   - Tag creation, snapshot storage, release rendering using tagged content; version switcher UI.

8. **Frontend Completion**
   - Finalize responsive layouts, theming, settings UI, admin tools, SEO metadata, login modal flow, uploads.

9. **Testing & Hardening**
   - Vitest unit tests, Playwright e2e for SSR/admin flows, accessibility linting, migration scripts, and deployment manifests.

