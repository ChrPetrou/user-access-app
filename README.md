# User Access App

A small Next.js app with three roles (IT, manager, user), an in-memory data store, a users directory and a paginated client table. The focus is **who may do what, enforced on the server**.

## How to run it

Requires Node 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other commands: `npm run build` (production build, also type-checks), `npm run lint`, `npx tsc --noEmit`.

Data lives in memory and is re-seeded on every server start. Editing `src/lib/seed.ts` needs a dev-server restart (the store is cached on `globalThis` to survive hot reloads).

## Seeded accounts

Every account uses the password **`Password123!`**

| Name | Email | Role | Status | Manager | Notes |
| --- | --- | --- | --- | --- | --- |
| Ivan Petrenko | ivan.it@example.com | IT | active | — | scenarios 10–12 |
| Iryna Koval | iryna.it@example.com | IT | active | — | the second IT account (rule 4) |
| Anna Shevchenko | anna.manager@example.com | manager | active | — | four direct reports |
| Bohdan Melnyk | bohdan.manager@example.com | manager | active | — | manages Dmytro and Halyna |
| Maksym Bondar | maksym.manager@example.com | manager | active | — | no direct reports |
| Dana Kravets | dana.manager@example.com | manager | **deactivated** | — | cannot log in |
| Olena Tkachenko | olena.user@example.com | user | active | Anna | scenario 12 |
| Petro Lysenko | petro.user@example.com | user | active | Anna |  |
| Sofia Moroz | sofia.user@example.com | user | active | Anna |  |
| Yurii Savchenko | yurii.user@example.com | user | active | Anna |  |
| Dmytro Boyko | dmytro.user@example.com | user | active | Bohdan | reports to a different manager than Anna |
| Halyna Rudenko | halyna.user@example.com | user | **deactivated** | Bohdan | already deactivated |
| Taras Marchenko | taras.user@example.com | user | active | Dana | his manager is deactivated |
| Kateryna Polishchuk | kateryna.user@example.com | user | active | — | unassigned |

Plus **1,200 generated clients** (about 26% churned), produced by a seeded generator so client 42 is the same record after every restart.

## Auth approach, and how rule 5 works

**Server-side sessions with an httpOnly cookie.**

- `POST /api/login` checks the email and password (scrypt hash, constant-time compare, same error for unknown email / wrong password / deactivated account), creates a random session id (`crypto.randomUUID()`), stores `{ userId, expiresAt }` in memory and sets it as an `httpOnly`, `SameSite=lax` cookie. Logging in again deletes the previous session.
- `POST /api/logout` deletes the session and the cookie.
- The cookie holds **only the session id** — no role, no name, nothing that can go stale.

**Why not a JWT:** a JWT carries the user's role and status inside the token, so a deactivated user's token stays valid until it expires. Revoking it immediately needs a server-side lookup anyway — at which point a plain session is simpler.

**Rule 5:** every request goes through `getCurrentUser()` in `src/lib/session.ts`, which reads the cookie, finds the session, then **looks the user up fresh in the store and requires `status === 'active'`**. Nothing about the user is cached between requests (Next's `cacheComponents` is off for this reason). So when IT deactivates someone, their very next request — page or API — gets `401` / a redirect to `/login`, with the same cookie they already had.

Passwords: the brief says hashing isn't required. It is done anyway (`node:crypto` scrypt with a per-user salt) because it was a few lines and keeps passwords out of the `User` object — credentials live in a separate map, so a `User` sent to the browser can never contain one.

## Where permission decisions are made

1. **`src/lib/roles.ts`** — `rolePermissions` maps each role to its permissions; `hasPermission(role, permission)`. The only file that lists roles.
2. **`src/lib/policy.ts`** — every decision about an actor (and target): `canCreateUser`, `canEditProfile` (any user vs. own direct reports, never self), `canChangeRole` / `canChangeStatus` (never self), `canViewContent`, `canAccessUserManagement`, `canHaveReports`.
3. **`src/lib/users.ts`** — `updateUser` and `createUser` apply the policy per field that was sent, plus the invariants: rule 4 (never zero active IT), unique email, `managerId` must point to someone who can have reports. `listUsers` filters with `canEditProfile`.
4. **`src/lib/session.ts`** — `requireCurrentUser(check)`: not logged in → `/login`, check fails → 403 page. Every private page calls it with its policy check.
5. **API route handlers** — `GET /api/users` (`canAccessUserManagement`) and `GET /api/clients` (`canViewContent`); `PATCH`/`POST /api/users` delegate to the service above.

UI-only (cosmetic, re-checked by the server): the sidebar link list in `(private)/layout.tsx`, and which fields/buttons `/manage-users` shows — those are computed on the server from the same `policy.ts` functions and passed to the client as booleans.

## API

| Method | Path | Who | Notes |
| --- | --- | --- | --- |
| POST | `/api/login` | anyone | `{ email, password }` → sets session cookie, returns `home` (landing page per role) |
| POST | `/api/logout` | logged in |  |
| GET | `/api/users?page&limit` | IT (all), manager (direct reports) | paginated |
| POST | `/api/users` | IT | `{ fullName, email, password, role, managerId }` → `201` |
| PATCH | `/api/users/{id}` | per field, see rules | `{ fullName?, email?, role?, status? }` |
| GET | `/api/clients?page&limit&search&status&country` | manager, user | filtered first (`search` matches name, company or email), then paginated: `limit` defaults to 20, capped at 100 |

Status codes: `400` invalid body (Yup schema, unknown keys rejected — no mass assignment) · `401` not logged in · `403` logged in but not allowed · `404` unknown id · `409` conflicts with current state (last active IT, email already in use).

## Design decisions

- **403 vs 409.** Deactivating yourself is `403` (rule 3: you're never allowed). Deactivating or demoting the **last active IT** is `409` (you'd be allowed, but the current state forbids it). The rule-4 check runs before the self check, so in scenario 11 Ivan's second attempt fails with a different reason. Only actors who could change status/role at all see the 409; others get the plain 403.
- **No partial updates.** Every check runs before anything is written: a request that changes a name _and_ a forbidden field changes nothing.
- **Managers can edit deactivated direct reports' name/email** — the brief scopes manager edits by `managerId`, not by status.
- **A user whose manager is deactivated** (Taras) keeps working normally; only IT can edit him until he is reassigned.
- **Demoting a manager who still has reports** is allowed; their reports keep the `managerId` but nobody can edit them as a manager anymore. With more time this would either be blocked (409) or reassign the reports.
- **Pages call `lib/` directly; client components call the API.** Server components never `fetch` their own API (no cookie, relative URLs fail). The browser only ever receives one page of clients.
- **Role landing pages** (`roleHome` in `roles.ts`): IT → `/manage-users`, manager and user → `/content`.

## Adding a fourth role

Edit `src/lib/roles.ts` only: add the name to `ROLES`, its permissions to `rolePermissions`, and its landing page to `roleHome` (both `Record<Role, …>`, so forgetting one is a compile error). Seed an account to try it. See `AGENTS.md` for the full checklist.

## What I'd do with another four hours

1. **Automated tests for rules 1–6** (Vitest): unit tests on `policy.ts` and `users.ts` for every rule, plus a few HTTP-level tests for the scenarios — currently they are verified by scripted `curl` runs.
2. **Handle demoting a manager who still has reports** (block with 409 or reassign).
3. **Sorting** on the client table (filters are done), kept in the URL like the filters (`?sort=name&dir=desc`).
4. **Audit trail** of who changed what, shown on `/manage-users`.
5. Loading and error states (`loading.tsx`, `error.tsx`), and expired-session cleanup.

## AI use

Built with Claude Code as a reviewer and mentor (see `AGENTS.md` / `CLAUDE.md`). I wrote the permission and data layer — roles, policy, services, API routes, pagination — myself with review; UI scaffolding, styling and the seed data were AI-assisted so the time went into the graded parts.
