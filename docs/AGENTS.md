# AGENT INSTRUCTIONS

Scope: entire repository until another `AGENTS.md` overrides.

1. Follow the development phase order; `docs/IMPLEMENTATION_PLAN.md` contains tickboxes that must be updated as work progresses.
2. Prefer TypeScript with strict typing; no try/catch around imports.
3. Commit changes frequently with clear messages; keep HISTORY in git log, not in these docs.
4. When adding files, ensure paths are correct and documented when referenced.
5. Use SSR for public pages and CSR for admin as mandated in SPEC.
6. Adhere to accessibility (keyboard/focus) and responsive guidelines from `docs/UI_DESIGN.md`.
7. Update the implementation plan tickboxes whenever a phase completes.
8. Keep AGENT instructions in mind for PR messages if required; none specified beyond final summary/test format.
9. Use **pnpm** for all package management (install, scripts, workspace setup); do not use npm or yarn.
10. Prefer the provided Makefile targets (`launch`, `interactive`, `test`, `verify`, `migrate`, `migrate test`) for common workflows so commands stay reproducible across environments.
11. When refining UI or interaction patterns, consult the `skills` knowledge source if available to ground choices in strong frontend/UX guidance.
12. Architecture changes and new code must **strictly** align with the Clean Architecture standard defined in `docs/ARCHITECTURE.md`; domain logic stays pure (no framework/IO), use cases orchestrate via interfaces, controllers remain thin, and infrastructure remains swappable.
