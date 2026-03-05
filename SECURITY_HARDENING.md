# Security Hardening Checklist

This project now blocks unauthenticated access to sensitive API routes, disables production source maps, and adds baseline security headers.

## Component Theft Deterrence (Best Effort)

Client-side component source code cannot be made fully invisible in a browser. This project now adds:

- server-side host allowlist enforcement in middleware (`ALLOWED_APP_HOSTS` / `NEXT_PUBLIC_ALLOWED_APP_HOSTS`),
- client-side runtime guards for proprietary UI components (Spline, Globe, Liquid Button, User Presence Avatar, Halo Button, Loader, Fluid Cursor).

If the app is copied to a different domain without updating these allowlists, protected components will not render.

### Recommended Host Settings

Set one or both environment variables:

- `ALLOWED_APP_HOSTS=steppay.co,www.steppay.co,steppay.vercel.app`
- `NEXT_PUBLIC_ALLOWED_APP_HOSTS=steppay.co,www.steppay.co,steppay.vercel.app`

To finish database hardening in Supabase, run the SQL below in the Supabase SQL Editor for your project.

```sql
-- 1) Enforce row-level security on merchants.
alter table if exists public.merchants enable row level security;

-- 2) Remove broad grants, then grant only what authenticated users need.
revoke all on table public.merchants from anon;
revoke all on table public.merchants from authenticated;
grant select, insert, update on table public.merchants to authenticated;

-- 3) Ensure StepTag uniqueness at the database level.
create unique index if not exists merchants_step_tag_unique_idx
  on public.merchants (step_tag);

-- 4) Recreate strict owner-only policies.
drop policy if exists merchants_select_own on public.merchants;
create policy merchants_select_own
  on public.merchants
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists merchants_insert_own on public.merchants;
create policy merchants_insert_own
  on public.merchants
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists merchants_update_own on public.merchants;
create policy merchants_update_own
  on public.merchants
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5) Optional: block all table access for anon on every public table.
do $$
declare t record;
begin
  for t in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('revoke all on table public.%I from anon;', t.tablename);
  end loop;
end $$;
```

## Important Notes

- Frontend code cannot be fully hidden from users in a web app. Browsers must receive client JavaScript to render the UI.
- What you can and should hide is:
  - source maps,
  - secrets (service keys, private API keys),
  - database access beyond strict row-level permissions.
