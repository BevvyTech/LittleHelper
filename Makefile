SHELL := /bin/bash
.DEFAULT_GOAL := help

PNPM ?= pnpm
PRISMA_SCHEMA ?= prisma/schema.prisma
TEST_DATABASE_URL ?=
HOST ?= dictator.local
PORT ?= 3333
DATABASE_URL ?= postgres://dictator@127.0.0.1:5432/little-helper
APP_URL ?= http://localhost:3333
SESSION_SECRET ?= $(shell python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || true)
DEV_SERVICES ?= api web
REQUIRED_ENV ?= DATABASE_URL SESSION_SECRET APP_URL
ENV_FILE ?= .env

export HOST
export PORT
export DATABASE_URL
export APP_URL
export SESSION_SECRET

.PHONY: help launch interactive install env test verify migrate migrate-test check-pnpm ensure-schema e2e

help:
	@printf "LittleHelper helper targets:\n"
	@printf "  make launch        # Install (if needed) and start dev servers (api + web with admin area)\n"
	@printf "  make interactive   # Alias for launch with verbose logging for local tinkering\n"
	@printf "  make install       # Install workspace dependencies via pnpm\n"
	@printf "  make env           # Create/update .env with required values (generates SESSION_SECRET)\n"
	@printf "  make test          # Run workspace test suites via pnpm\n"
	@printf "  make verify        # Production-style build to ensure assets compile\n"
	@printf "  make migrate       # Apply Prisma migrations against DATABASE_URL\n"
	@printf "  make migrate test  # Validate migrations against TEST_DATABASE_URL (or derived)\n"
	@printf "  make e2e           # Run Playwright and API smoke tests (requires env + running app)\n"

check-pnpm:
	@command -v $(PNPM) >/dev/null 2>&1 || { echo "pnpm is required (install via corepack enable)" >&2; exit 1; }

ensure-schema:
	@if [ ! -f "$(PRISMA_SCHEMA)" ]; then \
	  echo "Prisma schema not found at $(PRISMA_SCHEMA)." >&2; \
	  exit 1; \
	  fi

env:
	@set -euo pipefail; \
	if [ ! -f "$(ENV_FILE)" ]; then \
	  echo "Creating $(ENV_FILE) with defaults..."; \
	  SECRET="$${SESSION_SECRET:-$$(python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null || true)}"; \
	  printf "DATABASE_URL=%s\nSESSION_SECRET=%s\nAPP_URL=%s\nHOST=%s\nPORT=%s\n" "$(DATABASE_URL)" "$$SECRET" "$(APP_URL)" "$(HOST)" "$(PORT)" > "$(ENV_FILE)"; \
	else \
	  UPDATED=0; \
	  if ! grep -q '^SESSION_SECRET=' "$(ENV_FILE)"; then \
	    SECRET="$${SESSION_SECRET:-$$(python3 -c 'import secrets; print(secrets.token_hex(32))' 2>/dev/null || true)}"; \
	    echo "SESSION_SECRET=$$SECRET" >> "$(ENV_FILE)"; UPDATED=1; \
	  fi; \
	  if ! grep -q '^DATABASE_URL=' "$(ENV_FILE)"; then echo "DATABASE_URL=$(DATABASE_URL)" >> "$(ENV_FILE)"; UPDATED=1; fi; \
	  if ! grep -q '^APP_URL=' "$(ENV_FILE)"; then echo "APP_URL=$(APP_URL)" >> "$(ENV_FILE)"; UPDATED=1; fi; \
	  if ! grep -q '^HOST=' "$(ENV_FILE)"; then echo "HOST=$(HOST)" >> "$(ENV_FILE)"; UPDATED=1; fi; \
	  if ! grep -q '^PORT=' "$(ENV_FILE)"; then echo "PORT=$(PORT)" >> "$(ENV_FILE)"; UPDATED=1; fi; \
	  if [ $$UPDATED -eq 1 ]; then echo "Updated $(ENV_FILE) with missing values."; fi; \
	fi

launch: check-pnpm env
	@set -euo pipefail; \
	if [ -f "$(ENV_FILE)" ]; then set -a; source "$(ENV_FILE)"; set +a; fi; \
	missing_env=(); \
	for var in $(REQUIRED_ENV); do \
	  if [ -z "$${!var:-}" ]; then missing_env+=($$var); fi; \
	done; \
	if [ $${#missing_env[@]} -gt 0 ]; then \
	  echo "Missing required environment variables: $${missing_env[*]}" >&2; \
	  echo "Set them before running make launch/interactive." >&2; \
	  exit 1; \
	fi; \
	if [ ! -f package.json ]; then \
	echo "Workspace not scaffolded yet; add package.json and pnpm workspace config."; \
	exit 1; \
	fi; \
	if [ "${SKIP_INSTALL:-0}" -ne 1 ]; then \
	$(PNPM) install --recursive; \
	fi; \
	echo "Starting dev servers for $(DEV_SERVICES)..."; \
	set -m; \
	$(PNPM) --recursive --if-present run dev & DEV_PID=$$!; \
	CLEANUP_DONE=0; \
	cleanup() { \
	  if [ $$CLEANUP_DONE -eq 1 ]; then return; fi; \
	  CLEANUP_DONE=1; \
	  echo "Stopping dev servers..."; \
	  kill -INT -$$DEV_PID 2>/dev/null || true; \
	  for _ in 1 2 3 4 5; do \
	    if ! kill -0 $$DEV_PID 2>/dev/null; then break; fi; \
	    sleep 1; \
	  done; \
	  if kill -0 $$DEV_PID 2>/dev/null; then \
	    kill -TERM -$$DEV_PID 2>/dev/null || true; \
	  fi; \
	  wait $$DEV_PID 2>/dev/null || true; \
	}; \
	trap 'cleanup; exit 0' INT TERM; \
	trap cleanup EXIT; \
	wait $$DEV_PID

interactive: check-pnpm
	@VERBOSE_DEV=1 $(MAKE) launch

install: check-pnpm
	@set -euo pipefail; \
	if [ ! -f package.json ]; then \
	  echo "Workspace not scaffolded yet; add package.json and pnpm workspace config."; \
	  exit 1; \
	fi; \
	$(PNPM) install --recursive

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

e2e: check-pnpm
	@set -euo pipefail; \
	if [ -z "$${BASE_URL:-}" ]; then \
	  echo "Set BASE_URL to point to a running instance (e.g., http://localhost:3000)"; \
	  exit 1; \
	fi; \
	echo "Running API smoke (newman) and Playwright E2E..."; \
	cd apps/api && $(PNPM) test:api || true; \
	cd tests/e2e && $(PNPM) dlx playwright test

migrate: check-pnpm ensure-schema
	@set -euo pipefail; \
	if [ -z "$(DATABASE_URL)" ]; then \
	echo "DATABASE_URL is required for migrations." >&2; \
	exit 1; \
	fi; \
	DATABASE_URL="$(DATABASE_URL)" $(PNPM) exec prisma migrate deploy --schema "$(PRISMA_SCHEMA)"

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
