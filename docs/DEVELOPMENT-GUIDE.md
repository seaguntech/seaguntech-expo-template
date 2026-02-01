# Development Guide - Seaguntech Expo Template

> [!NOTE]
> Complete guide for setting up and developing the application with Supabase local and cloud environments.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Local Development](#local-development)
4. [Cloud Production](#cloud-production)
5. [Daily Workflow](#daily-workflow)
6. [Common Commands](#common-commands)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- ✅ **Node.js** (v18+) & **pnpm**
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- ✅ **Supabase CLI**
  ```bash
  brew install supabase/tap/supabase
  ```

### Verify Installation

```bash
node --version    # v18+
pnpm --version    # 8+
docker --version  # 20+
supabase --version
```

---

## Initial Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd seaguntech-expo-template
pnpm install
```

### 2. Environment Files

Create 2 files:

#### `.env` (Cloud Production)

```bash
# Supabase Cloud
EXPO_PUBLIC_SUPABASE_URL=https://qeyzcabruwwulbhqakhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # From Dashboard → Settings → API
SUPABASE_PROJECT_REF=qeyzcabruwwulbhqakhy

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=test_hcJytqymRCNFdlHLddtthPIXWKR
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=test_hcJytqymRCNFdlHLddtthPIXWKR

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Other services...
```

#### `.env.local` (Local Development)

```bash
# Local Supabase (from `supabase status`)
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### 3. Gitignore

Ensure `.gitignore` includes:

```bash
.env
.env.local
.env*.local
```

---

## Local Development

### Step 1: Start Docker Desktop

1. Open **Docker Desktop** app
2. Wait for the Docker icon in the menu bar to turn green (running)
3. Verify:
   ```bash
   docker ps
   ```

### Step 2: Start Supabase Local

```bash
supabase start
```

**First run:** Pulls ~2-3GB images (5-10 minutes)
**Subsequent runs:** Takes only 5-10 seconds

**Important Output:**

```
Studio URL: http://127.0.0.1:54323
API URL: http://127.0.0.1:54321
anon key: sb_publishable_...
service_role key: sb_secret_...
```

### Step 3: Apply Migrations

```bash
supabase db reset
```

This command will:

- ✅ Drop the old database
- ✅ Create a new database
- ✅ Apply all migrations
- ✅ Automatically run `seed.sql`

### Step 4: Create Test User

**Option A: Via Studio (Recommended)**

1. Open http://localhost:54323
2. Go to **Authentication** → **Users** → **Add user**
3. Email: `test@example.com`, Password: `Test123456!`
4. ✅ Enable **Auto Confirm User**
5. Click **Create user**

**Option B: Via SQL**

```sql
-- Go to Studio → SQL Editor
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated', 'authenticated',
  'test@example.com',
  crypt('Test123456!', gen_salt('bf')),
  now(), now(), now()
);
```

### Step 5: Seed Data

```bash
pnpm supabase:seed
```

**Output:**

```
🌱 Starting TypeScript seeding...
👤 Seeding data for user: test@example.com
✅ TypeScript seeding completed successfully!
```

### Step 6: Run App

```bash
pnpm start
```

The app will connect to the local Supabase (`.env.local`)

---

## Cloud Production

### Step 1: Login Supabase CLI

```bash
supabase login
```

Browser will open → Login → Return to terminal

### Step 2: Link Project

```bash
supabase link --project-ref qeyzcabruwwulbhqakhy
```

Enter database password when prompted.

### Step 3: Push Migrations

```bash
pnpm supabase:migrate
# Or: supabase db push
```

Migrations will be applied to the cloud database.

### Step 4: Create Cloud User

**Option A: Via Dashboard**

1. Go to https://supabase.com/dashboard/project/qeyzcabruwwulbhqakhy
2. Navigate to **Authentication** → **Users** → **Add user**
3. Enter email/password → **Create user**

**Option B: Via App**

- Run production build of the app
- Sign up for a new account

### Step 5: Seed Cloud Data

```bash
# Temporarily rename .env.local
mv .env.local .env.local.backup

# Seed (will use .env - cloud keys)
pnpm supabase:seed

# Restore .env.local
mv .env.local.backup .env.local
```

### Step 6: Verify

- Dashboard → Table Editor → `tasks`
- Verify data has been seeded

---

## Daily Workflow

### Development Flow

```bash
# 1. Start local Supabase (if not running)
supabase start

# 2. Start app with local DB
pnpm start

# 3. Code & test...

# 4. When DB needs reset
supabase db reset

# 5. Stop when finished
supabase stop
```

### Creating New Migrations

```bash
# 1. Create migration file
supabase migration new add_new_feature

# 2. Edit file in supabase/migrations/
# 3. Test locally
supabase db reset

# 4. Push to cloud when ready
pnpm supabase:migrate
```

### Switching Environments

**Local Development:**

```bash
# Ensure .env.local exists
pnpm start
# → Connects to http://127.0.0.1:54321
```

**Cloud Testing:**

```bash
# Temporarily rename .env.local
mv .env.local .env.local.backup
pnpm start
# → Connects to cloud

# Restore
mv .env.local.backup .env.local
```

---

## Common Commands

### Supabase Local

| Command                         | Description                  |
| ------------------------------- | ---------------------------- |
| `supabase start`                | Start local Supabase         |
| `supabase stop`                 | Stop local Supabase          |
| `supabase status`               | View status & keys           |
| `supabase db reset`             | Reset DB + migrations + seed |
| `supabase migration list`       | List migrations              |
| `supabase migration new [name]` | Create new migration         |

### Supabase Cloud

| Command                             | Description                     |
| ----------------------------------- | ------------------------------- |
| `supabase login`                    | CLI Login                       |
| `supabase link --project-ref [ref]` | Link with cloud project         |
| `pnpm supabase:migrate`             | Push migrations to cloud        |
| `supabase db remote commit`         | Create migration from remote DB |

### App Development

| Command              | Description                |
| -------------------- | -------------------------- |
| `pnpm start`         | Start Expo dev server      |
| `pnpm android`       | Run on Android             |
| `pnpm ios`           | Run on iOS                 |
| `pnpm test`          | Run tests                  |
| `pnpm lint`          | Lint code                  |
| `pnpm supabase:seed` | Seed data (local or cloud) |

---

## Troubleshooting

### ❌ Docker daemon not running

**Error:**

```
Cannot connect to the Docker daemon at unix:///Users/.../.docker/run/docker.sock
```

**Solution:**

```bash
# Open Docker Desktop
open -a Docker

# Wait 10-15 seconds, verify
docker ps
```

---

### ❌ Missing SUPABASE_SERVICE_ROLE_KEY

**Error:**

```
❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env
```

**Solution:**

1. Get key from Dashboard → Settings → API → `service_role`
2. Add to `.env`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```
3. Restart terminal

---

### ❌ No users found

**Error:**

```
⚠️ No users found. Please create a user first via the app or dashboard.
```

**Solution:**

- Create user via Studio (http://localhost:54323)
- Or via Dashboard (cloud)
- Verify: Authentication → Users

---

### ❌ Migration order error

**Error:**

```
ERROR: relation "public.tasks" does not exist
```

**Cause:** Migrations running in wrong order (based on timestamp)

**Solution:**

```bash
# Rename migration to fix order
mv supabase/migrations/20250130_old.sql \
   supabase/migrations/20250202_new.sql

# Reset
supabase db reset
```

---

### ❌ Extension errors

**Error:**

```
ERROR: function uuid_generate_v4() does not exist
```

**Solution:**

- Use `gen_random_uuid()` instead of `uuid_generate_v4()`
- `gen_random_uuid()` is built-in Postgres 13+, no extension needed

---

### ⚠️ Warning: SUPABASE_AUTH_EXTERNAL_APPLE_SECRET

**Warning:**

```
WARN: environment variable is unset: SUPABASE_AUTH_EXTERNAL_APPLE_SECRET
```

**Solution:**

- This is a safe warning, can be ignored
- Apple/Google OAuth are disabled for local dev
- Only needs to be enabled when deploying production

---

## File Structure

```
seaguntech-expo-template/
├── .env                    # Cloud production keys (gitignored)
├── .env.local              # Local development keys (gitignored)
├── supabase/
│   ├── config.toml         # Supabase CLI config
│   ├── seed.sql            # SQL seed data (auto-run)
│   ├── migrations/         # Database migrations
│   │   ├── 20250202000000_init_supabase.sql
│   │   └── 20250202000001_add_performance_indexes.sql
│   ├── scripts/
│   │   └── seed.ts         # TypeScript seed script
│   ├── functions/          # Edge Functions
│   └── templates/          # Email templates
├── docs/
│   ├── DEVELOPMENT-GUIDE.md     # This file
│   └── SUPABASE-SEED-PLAN.md    # Detailed Supabase guide
└── package.json
```

---

## Best Practices

### ✅ DO

1. **Always test locally first** before pushing to cloud
2. **Commit migrations** to Git
3. **Backup before seeding production**
4. **Use RLS policies** for all tables
5. **Version control** all schema changes
6. **Test migrations** with `supabase db reset`

### ❌ DON'T

1. **Do not commit `.env` or `.env.local`** to Git
2. **Do not skip migrations** - run in order
3. **Do not edit applied migrations** - create new ones
4. **Do not seed production data** - only dev/staging
5. **Do not disable RLS** unless absolutely necessary
6. **Do not use service_role key** on client-side

---

## Quick Reference

### Environment Variables

| Variable                        | Local                    | Cloud                    | Purpose                 |
| ------------------------------- | ------------------------ | ------------------------ | ----------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | `http://127.0.0.1:54321` | `https://...supabase.co` | API endpoint            |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...`     | `eyJhbGci...`            | Public key              |
| `SUPABASE_SERVICE_ROLE_KEY`     | `sb_secret_...`          | `eyJhbGci...`            | Admin key (server-only) |

### URLs

| Service  | Local                                                   | Cloud                                    |
| -------- | ------------------------------------------------------- | ---------------------------------------- |
| Studio   | http://localhost:54323                                  | https://supabase.com/dashboard           |
| API      | http://localhost:54321                                  | https://qeyzcabruwwulbhqakhy.supabase.co |
| Database | postgresql://postgres:postgres@localhost:54322/postgres | Via Dashboard                            |

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Expo Docs:** https://docs.expo.dev
- **Project Docs:** `docs/SUPABASE-SEED-PLAN.md`

---

## Checklist

### Initial Setup

- [ ] Docker Desktop installed & running
- [ ] Supabase CLI installed
- [ ] `.env` configured with cloud keys
- [ ] `.env.local` configured with local keys
- [ ] Dependencies installed (`pnpm install`)

### Local Development

- [ ] `supabase start` successful
- [ ] Migrations applied (`supabase db reset`)
- [ ] Test user created
- [ ] Data seeded (`pnpm supabase:seed`)
- [ ] App running (`pnpm start`)

### Cloud Production

- [ ] Logged in (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] Migrations pushed (`pnpm supabase:migrate`)
- [ ] Cloud user created
- [ ] Cloud data seeded

---

**Last Updated:** 2026-02-01
**Version:** 1.0.0
