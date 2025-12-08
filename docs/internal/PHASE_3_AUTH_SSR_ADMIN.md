# Phase 3: SSR Router & Admin Shell

## Prerequisites
- Phase 2 complete
- PostgreSQL running
- Prisma migrations applied

---

## 3.1 Authentication Foundation

### Use Cases to Create

| Use Case | Location | Purpose | Dependencies |
|----------|----------|---------|--------------|
| `AuthenticateUserUseCase` | `apps/api/src/application/usecases/auth/` | Exchange OAuth code → find/create user → create session → return token | IUserRepository, ISessionRepository, IOAuthGateway |
| `GetCurrentUserUseCase` | same | Validate session token → return user data | IUserRepository, ISessionRepository |
| `LogoutUserUseCase` | same | Delete session by token | ISessionRepository |

### Gateway to Implement

| Gateway | Location | Purpose |
|---------|----------|---------|
| `OAuthGoogleGateway` | `apps/api/src/infrastructure/gateways/` | Implements `IOAuthGateway` - Google OAuth flow (auth URL, token exchange, user info fetch) |

**Google OAuth endpoints:**
- Auth: `https://accounts.google.com/o/oauth2/v2/auth`
- Token: `https://oauth2.googleapis.com/token`
- UserInfo: `https://www.googleapis.com/oauth2/v2/userinfo`

### Controller to Create

| Controller | Location | Routes |
|------------|----------|--------|
| `AuthController` | `apps/api/src/interface/api/auth/` | `GET /auth/google` (redirect to Google), `GET /auth/google/callback` (handle callback, set cookie), `GET /auth/me` (current user), `POST /auth/logout` (clear session) |

### Middleware to Create

| Middleware | Location | Purpose |
|------------|----------|---------|
| `authMiddleware` | `apps/api/src/server/middlewares/` | Extract session cookie → validate → attach `request.user` or 401 |
| `adminMiddleware` | same | Check `request.user.isAdmin()` or 403 |

### Wiring
- [x] Update `routes.ts` to register auth controller
- [x] Update `server.ts` to pass config to routes
- [x] Session cookie name: `lh_session`, httpOnly, secure in prod, sameSite=lax

---

## 3.2 SSR Public Routes

### Use Cases to Create

| Use Case | Location | Purpose |
|----------|----------|---------|
| `GetPageBySlugUseCase` | `apps/api/src/application/usecases/content/` | Resolve page by locale+slug, build breadcrumbs by traversing parent chain |
| `CheckRedirectUseCase` | same | Check if oldSlug has redirect entry, return newSlug if exists |

### Repositories to Implement

| Repository | Implements | Key Methods |
|------------|------------|-------------|
| `PageRepositoryPrisma` | `IPageRepository` | findById, findByShortId, findChildren, findRoots, create, update, delete |
| `PageLocaleRepositoryPrisma` | `IPageLocaleRepository` | findById, findByPageId, findBySlug(locale, slug), findAll, create, update, delete |
| `RedirectRepositoryPrisma` | `IRedirectRepository` | findByOldSlug(locale, slug), findAll, create, delete |

### SSR Route Handler
- [x] Create redirect check middleware - runs before page resolution, returns 301 if redirect exists
- [x] Page route: `GET /:locale/:slug*` - resolve page, return 404 if not found
- [x] Release route: `GET /releases/:tag/:locale/:slug*` - placeholder for Phase 7

---

## 3.3 Admin SPA Shell

### React Hooks to Create

| Hook | Location | Purpose |
|------|----------|---------|
| `useAuth` | `apps/admin/src/hooks/` | Context provider + hook. State: user, isLoading, isAuthenticated, isAdmin. Methods: login (popup), logout, refreshUser |

### Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `AuthGuard` | `apps/admin/src/components/` | Wrap routes - show loading skeleton while checking auth, show login prompt if not authenticated, show access denied if not admin |
| `LoginPrompt` | same or inline | "Sign in with Google" button that calls `useAuth().login()` |

### Updates Required
- [x] Wrap `App.tsx` with `AuthProvider`
- [x] Wrap routes with `AuthGuard`
- [x] Update `TopBar` to show user avatar, name, dropdown menu with logout

### Login Flow
1. User clicks "Sign in with Google"
2. Popup opens to `/auth/google`
3. Google redirects back to `/auth/google/callback`
4. Callback sets cookie, closes popup (or redirects)
5. Parent window detects popup closed, calls `refreshUser()`

---

## 3.4 Settings Infrastructure

### Repository to Implement

| Repository | Implements | Key Methods |
|------------|------------|-------------|
| `SettingsRepositoryPrisma` | `ISettingsRepository` | findByKey(key), upsert(key, data) |

### Use Cases to Create

| Use Case | Purpose |
|----------|---------|
| `GetSettingsUseCase` | Get settings by group key, return empty object if not found |
| `UpdateSettingsUseCase` | Validate against Zod schema for that group, upsert to DB |

**Setting group keys:** `general`, `content-source`, `storage`, `ai`

### Controller to Create

| Controller | Routes |
|------------|--------|
| `SettingsController` | `GET /api/admin/settings/:group`, `PUT /api/admin/settings/:group`, `GET /api/admin/settings/env-status` |

**env-status response:** Object showing which settings are controlled by env vars (boolean for each field)

---

## Verification Checklist

### Auth Flow
- [ ] `/auth/google` redirects to Google
- [ ] Callback creates user + session, sets cookie
- [ ] `/auth/me` returns user when authenticated
- [ ] `/auth/logout` clears session and cookie
- [ ] Protected routes return 401 without cookie
- [ ] Admin routes return 403 for non-admin users

### SSR
- [ ] `/:locale/:slug` returns page data
- [ ] Old slugs return 301 redirect
- [ ] Missing pages return 404

### Admin
- [ ] Unauthenticated users see login prompt
- [ ] Authenticated non-admins see access denied
- [ ] User menu shows avatar and logout option
- [ ] Settings endpoints work with validation

---

## File Structure After Phase 3

```
apps/api/src/
├── application/usecases/
│   ├── auth/
│   │   ├── AuthenticateUserUseCase.ts
│   │   ├── GetCurrentUserUseCase.ts
│   │   ├── LogoutUserUseCase.ts
│   │   └── index.ts
│   ├── content/
│   │   ├── GetPageBySlugUseCase.ts
│   │   ├── CheckRedirectUseCase.ts
│   │   └── index.ts
│   └── settings/
│       ├── GetSettingsUseCase.ts
│       ├── UpdateSettingsUseCase.ts
│       └── index.ts
├── infrastructure/
│   ├── gateways/
│   │   ├── OAuthGoogleGateway.ts
│   │   └── index.ts
│   └── repositories/
│       ├── ... (existing)
│       ├── PageRepositoryPrisma.ts
│       ├── PageLocaleRepositoryPrisma.ts
│       ├── RedirectRepositoryPrisma.ts
│       ├── SettingsRepositoryPrisma.ts
│       └── index.ts
├── interface/api/
│   ├── auth/
│   │   ├── AuthController.ts
│   │   └── index.ts
│   └── settings/
│       ├── SettingsController.ts
│       └── index.ts
└── server/middlewares/
    ├── authMiddleware.ts
    └── index.ts

apps/admin/src/
├── hooks/
│   ├── useAuth.ts
│   └── index.ts
├── components/
│   ├── AuthGuard.tsx
│   ├── Sidebar.tsx (update)
│   └── TopBar.tsx (update)
└── App.tsx (update)
```
