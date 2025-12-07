SHELL := /bin/bash
.DEFAULT_GOAL := help

PNPM ?= pnpm
PRISMA_SCHEMA ?= prisma/schema.prisma
TEST_DATABASE_URL ?=
DATABASE_URL ?=
DEV_SERVICES ?= api web admin

.PHONY: help launch interactive test verify migrate migrate-test check-pnpm ensure-schema

help:
@printf "LittleHelper helper targets:\n"
@printf "  make launch        # Install (if needed) and start dev servers (api/web/admin)\n"
@printf "  make interactive   # Alias for launch with verbose logging for local tinkering\n"
@printf "  make test          # Run workspace test suites via pnpm\n"
@printf "  make verify        # Production-style build to ensure assets compile\n"
@printf "  make migrate       # Apply Prisma migrations against DATABASE_URL\n"
@printf "  make migrate test  # Validate migrations against TEST_DATABASE_URL (or derived)\n"

check-pnpm:
@command -v $(PNPM) >/dev/null 2>&1 || { echo "pnpm is required (install via corepack enable)" >&2; exit 1; }

ensure-schema:
@if [ ! -f "$(PRISMA_SCHEMA)" ]; then \
echo "Prisma schema not found at $(PRISMA_SCHEMA)." >&2; \
exit 1; \
fi

launch: check-pnpm
@set -euo pipefail; \
if [ ! -f package.json ]; then \
echo "Workspace not scaffolded yet; add package.json and pnpm workspace config."; \
exit 1; \
fi; \
if [ "${SKIP_INSTALL:-0}" -ne 1 ]; then \
$(PNPM) install --recursive; \
fi; \
echo "Starting dev servers for $(DEV_SERVICES)..."; \
$(PNPM) --recursive --if-present run dev

interactive: check-pnpm
@VERBOSE_DEV=1 $(MAKE) launch

test: check-pnpm
@set -euo pipefail; \
if [ ! -f package.json ]; then \
echo "Workspace not scaffolded yet; add package.json before running tests."; \
exit 1; \
fi; \
$(PNPM) --recursive --if-present test

verify: check-pnpm
@set -euo pipefail; \
if [ ! -f package.json ]; then \
echo "Workspace not scaffolded yet; add package.json before verifying builds."; \
exit 1; \
fi; \
$(PNPM) install --frozen-lockfile --recursive; \
$(PNPM) --recursive --if-present run build || { echo "One or more build steps failed." >&2; exit 1; }

migrate: check-pnpm ensure-schema
@set -euo pipefail; \
if [ -z "$(DATABASE_URL)" ]; then \
echo "DATABASE_URL is required for migrations." >&2; \
exit 1; \
fi; \
DATABASE_URL="$(DATABASE_URL)" $(PNPM) exec prisma migrate dev --schema "$(PRISMA_SCHEMA)" --skip-seed

migrate-test: check-pnpm ensure-schema
@set -euo pipefail; \
TARGET_URL="$(TEST_DATABASE_URL)"; \
if [ -z "$$TARGET_URL" ]; then \
if [ -z "$(DATABASE_URL)" ]; then \
echo "Set TEST_DATABASE_URL or DATABASE_URL to derive test database." >&2; \
exit 1; \
fi; \
TARGET_URL="$(DATABASE_URL)_test"; \
fi; \
echo "Running migration validation against $$TARGET_URL"; \
DATABASE_URL="$$TARGET_URL" $(PNPM) exec prisma migrate deploy --schema "$(PRISMA_SCHEMA)" --skip-generate
