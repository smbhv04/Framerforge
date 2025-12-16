# FramerForge

Constraint-driven AI that generates production-ready Framer Code Components and Code Overrides. It enforces Framer annotations, property controls, default exports, and performance rules before returning a response.

## Tech
- Next.js (App Router) + Tailwind 4
- Supabase (generation counts)
- Free AI providers (Groq or OpenRouter)
- Simple email/anon identity with admin allowlist bypass

## Setup
1) Install deps
```bash
npm install
```

2) Env (copy `env.sample` → `.env.local`)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=            # or OPENROUTER_API_KEY
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=FramerForge
ADMIN_EMAIL_ALLOWLIST=owner@yourdomain.com
ADMIN_USER_IDS=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3) Supabase table
```sql
create table if not exists public.generation_usage (
  user_id text primary key,
  used int not null default 0,
  updated_at timestamptz default now()
);
```

4) Run locally
```bash
npm run dev
# http://localhost:3000
```

## API contract
`POST /api/generate`
```json
{ "prompt": "string", "email": "optional", "userId": "optional" }
```
- Admins (allowlist) skip limits.
- Public users: 10 total generations; returns `{result, remaining, used, isAdmin}`.
- AI is retried once if validation fails. If still invalid, the API returns 422 with an error message.
