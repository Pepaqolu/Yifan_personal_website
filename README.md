# Yifan.world + China Desk

Yifan.world is the public personal-brand site. China Desk is its private, invite-only client operating workspace, built with Next.js, TypeScript, Tailwind CSS, Motion, Supabase, and Vercel.

## Product surfaces

- `/`, `/desk`, and `/desk/demo` remain public.
- `/desk/login` handles invited-account sign-in and password recovery.
- `/desk/app/*` is the organization-isolated client workspace.
- `/admin/*` is restricted to `ADMIN` profiles and is Yifan's operating workspace.

The public demo continues to use fictional data and never reads private tables.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL, publishable key, service-role key, and trusted site URL.
3. Run `supabase/migrations/202609010001_china_desk_foundation.sql` with the Supabase CLI or SQL editor.
4. For local demo records, run `supabase/seed.sql`.
5. Add `http://localhost:3000/auth/callback` and `https://yifan.world/auth/callback` to Supabase Auth redirect URLs.

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`, commit `.env.local`, or use it in a Client Component.

## Database and authorization

Each client is an `organization`. Membership lives in `organization_members`. Every client-data row carries `organization_id`.

Postgres Row Level Security is enabled on every exposed product table:

- Clients can select only rows belonging to one of their organizations.
- Client research access is limited to `COMPLETED` reports.
- Clients can insert requests only for their own organization and only as themselves.
- Admin write policies require the caller's `profiles.role` to be `ADMIN`.
- Internal competitor and partner notes live in separate admin-only tables.
- Research attachments use a private storage bucket with organization-prefixed paths.

Authorization is repeated inside every Server Action. Navigation visibility is never treated as security.

## Authentication architecture

Supabase Auth sessions are stored in secure cookies through `@supabase/ssr`. `src/proxy.ts` refreshes tokens; protected layouts perform the authoritative server-side role and membership checks. Public self-registration does not exist.

Supported flows:

- Invite-only sign-in
- Sign-out
- Password reset and secure password update
- Admin-issued client invitations
- Persistent cookie-backed sessions

## Create the first admin

Create the user in Supabase Auth, then run this in the SQL editor using the user's UUID:

```sql
update public.profiles
set role = 'ADMIN', first_name = 'Yifan'
where id = 'AUTH_USER_UUID';
```

Alternatively, after applying the seed SQL, configure the `SEED_*` variables from `.env.example` and run:

```bash
pnpm seed:users
```

This creates one fictional admin and one fictional client account for local development. Never reuse seed passwords in production.

## Invite a client

1. Sign in as an admin.
2. Open `/admin/clients` and create the organization workspace.
3. Open the client workspace.
4. Use **Invite a client member**.

The invitation creates the Auth user, a `CLIENT` profile, and the organization membership. The client sets a password through the secure email callback.

## Local development

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Without Supabase environment variables, public routes still run and `/desk/login` displays a configuration-safe error instead of exposing secrets.

## Vercel deployment

The project now uses the Vercel Next.js runtime rather than static export because protected pages require server-side cookies and authorization.

1. Add the four non-seed variables from `.env.example` to Vercel Production and Preview environments.
2. Set `NEXT_PUBLIC_SITE_URL=https://yifan.world` in Production.
3. Deploy from `main`.
4. Confirm the Supabase production redirect allowlist contains the production callback URL.

No payments, AI calls, scraping, automated monitoring, or public registration are included in this foundation.
