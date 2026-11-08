<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# User Access App — rules for agents

Next.js 16 App Router, TypeScript strict (+ `noUncheckedIndexedAccess`), in-memory data. Three roles (IT, manager, user). The point of this codebase is **who may do what, enforced on the server**.

## Commands

- `npm run dev` — dev server on :3000. Seed logins: see README (all `Password123!`).
- `npm run build` — production build (also type-checks).
- `npx tsc --noEmit` and `npm run lint` — must both pass before you finish.

## Where things live

```
src/lib/roles.ts       ROLES, permissions, rolePermissions, hasPermission. The ONLY file that lists roles.
src/lib/policy.ts      can*(actor, target?) → boolean. Pure: no store, no Next imports, no I/O.
src/lib/users.ts       listUsers / updateUser: validation → policy → invariants (rule 4, unique email) → write.
                       Returns { ok } | { ok: false, status, error }; never throws for rule failures.
src/lib/pagination.ts  paginate() clamps page/limit (default 20, max 100). Every list goes through it.
src/lib/session.ts     cookie → session → fresh user; requireCurrentUser(check) for pages. Only lib file that imports next/*.
src/lib/store.ts       in-memory Maps on globalThis. Only lib/ services read or write it.
src/app/api/**         thin handlers: getCurrentUser (401) → validate body (400) → service → status from result.
src/app/(private)/**   server-component pages; each calls requireCurrentUser(<policy check>) itself.
src/components/**      presentational only — no lib/policy, no store, no permission logic.
```

Import direction: `app` → `lib`, `app` → `components`. Never `lib` → `app`/`components`. Pages and route handlers never import `store.ts`.

## Rules an agent will be tempted to break

- **Permission checks belong in `policy.ts` / `users.ts`.** Hiding a button or filtering the sidebar is cosmetic; the API is called directly in grading.
- **Never write role strings inline** (`role === 'manager'`). Ask `hasPermission(role, '<permission>')` or a `can*` from `policy.ts`. Role names appear only in `roles.ts` and `seed.ts`.
- **Never trust the request body.** Validate with the Yup schema (`.noUnknown().strict()`) before calling a service; never spread raw input into a stored user.
- **Lists are paginated on the server.** API and pages return `paginate(...)` output; never send a full collection to the browser or slice in React.
- **Each page guards itself.** `(private)/layout.tsx` does not re-run on client navigation, so a check there does not protect child pages.
- **Status codes come from the `HttpStatus` enum in `src/lib/http.ts`** — never a bare number. 401 not logged in · 403 logged in but not allowed · 404 unknown id · 409 conflicts with current state (last active IT, duplicate email) · 400 invalid body.

## Counter-intuitive on first contact

- **Roles are not hierarchical.** IT has no `view content pages` → IT gets 403 on `/content`. That is correct; do not "fix" it.
- **Two edit permissions.** `edit name/email` = any user; `edit name/email of own reports` = only `target.managerId === actor.id`, never self, never other managers.
- **Rule 4 is checked before the self check** in `updateUser`, so the last active IT deactivating/demoting themself gets 409 ("at least one active IT account"), not 403. Only actors whose role _could_ change status/role see the 409; others get 403.
- **Deactivation is immediate** because `getCurrentUser` re-reads the user on every request. Never cache the user (no user data in the cookie, no `'use cache'` on user lookups; `cacheComponents` is off for this reason).
- **Server components call `lib/` directly**; only client components `fetch('/api/...')`. A server-side `fetch` to our own API has no cookie and a relative URL fails.
- **Next 16:** `params` / `searchParams` are Promises; `forbidden()` needs `experimental.authInterrupts` (already on); there is no middleware/proxy.
- **The store lives on `globalThis`**: after editing `seed.ts`, restart the dev server.

## Adding a fourth role

1. `src/lib/roles.ts`: add the name to `ROLES`, its permissions to `rolePermissions`, and its landing page to `roleHome` (both are `Record<Role, …>`, so a missing entry is a compile error).
2. If it needs a new capability, add a string to `permissions` and one `can*` function in `policy.ts`; use it from the service/page.
3. `src/lib/seed.ts`: add one account; list it in the README.
4. Nothing else should change — sidebar, pages, API and validation read `ROLES` / permissions. If you find yourself writing the new role's name anywhere else, stop: that is the bug.
5. `npx tsc --noEmit` and `npm run lint`; then log in as each seeded role (README) and re-check rules 1–6 against the API.
