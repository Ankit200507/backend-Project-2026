# TerraLedger Implementation Tracker

Status legend: `DONE`, `IN_PROGRESS`, `PENDING`, `BLOCKED`

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 0. Baseline audit | DONE | Captured initial compile/lint/runtime issues and flow mismatch. |
| 1. P0 security containment | DONE | Removed client role-switch; added server session auth + middleware RBAC. |
| 2. Canonical contracts + backend structure | DONE | Introduced typed DTO/contracts and service-layer API handling. |
| 3. Auth complete + user model hardening | DONE | Added login/logout/me endpoints, role field, password hashing helper, admin bootstrap script. |
| 4. Property flow integration (DB -> API -> FE) | DONE | Refactored CRUD contracts and frontend mapping/contexts to API-backed flow. |
| 5. Remove web3 and mock remnants | DONE | Deleted `mockData`, removed blockchain/hash semantics from UI/types. |
| 6. Hardening + final verification | DONE | `tsc`, `lint`, and production `build` all passing. |

## Completed Work Log

### Security and RBAC (`DONE`)
- Added signed HttpOnly session cookie model:
  - `src/server/auth/session.ts`
  - `src/server/auth/guards.ts`
- Added auth API endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Added route protection middleware:
  - Protected pages require session
  - Admin routes (`/dashboard`, `/register-property`) require admin role
- Removed client-side role switching from UI and auth context.

### Backend simplification and service layer (`DONE`)
- Added service layer:
  - `src/server/services/propertyService.ts`
  - `src/server/services/userService.ts`
- Added canonical property API contract mapper:
  - `src/server/contracts/property.ts`
- Refactored `/api/properties` and `/api/properties/[id]` to:
  - enforce auth/admin guards
  - return consistent DTO shapes
  - resolve/create owners server-side during property create/update.

### Data model and bootstrap (`DONE`)
- Updated user model with explicit `role: 'admin' | 'user'`.
- Added password hashing utilities (`src/server/auth/password.ts`).
- Added admin bootstrap script:
  - `scripts/bootstrap-admin.mjs`
  - `npm run bootstrap:admin`
- Disabled API seed route for no-seed policy.

### Frontend DB/API integration (`DONE`)
- Replaced mock auth/session behavior with server-driven auth context (`/api/auth/me`).
- Replaced registry context fallback behavior; no mock fallback remains.
- Rebuilt key pages for API-backed rendering and clean role behavior:
  - `/dashboard` (admin-focused)
  - `/map`
  - `/properties`
  - `/properties/[id]`
  - `/my-properties`
  - `/register-property`
  - `/login`, `/forbidden`, `/`
- Updated shared types to unified contracts (`src/types/index.ts`).
- Added frontend property mapping layer (`src/lib/propertyMapper.ts`).

### Mock/Web3 removal (`DONE`)
- Deleted `src/lib/mockData.ts`.
- Removed all imports/usages of mock constants.
- Removed blockchain/hash wording and fields from active frontend contracts and pages.

## Validation Evidence

- TypeScript: `npx tsc --noEmit` -> PASS
- Lint: `npm run lint` -> PASS
- Build: `npm run build` -> PASS

## Remaining Backlog (Not Done Yet)

| Item | Status | Reason |
|---|---|---|
| CSRF token protection on auth-changing requests | PENDING | Recommended hardening step for cookie-based auth. |
| Login rate limiting / lockout policy | PENDING | Recommended for brute-force protection. |
| Session revocation store (DB-backed invalidation) | PENDING | Current signed cookie sessions are stateless. |
| Automated integration test suite for auth + RBAC | PENDING | Manual verification completed; tests not added yet. |

