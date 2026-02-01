-- Initial Supabase Schema for Seaguntech Expo Template
-- Run with: supabase db push

-- Enable necessary extensions in public schema
-- Note: gen_random_uuid() is built-in to Postgres 13+, no uuid-ossp needed
create extension if not exists "pgcrypto" with schema public cascade;

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- TASKS TABLE
-- ============================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'canceled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  tags text[] default '{}',
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Policies for tasks
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Index for better query performance
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_due_date_idx on public.tasks(due_date);

-- ============================================
-- PUSH TOKENS TABLE
-- ============================================
create table if not exists public.push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  token text not null,
  platform text check (platform in ('ios', 'android', 'web')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.push_tokens enable row level security;

-- Policies for push_tokens
create policy "Users can view their own push tokens"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push tokens"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push tokens"
  on public.push_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push tokens"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Index for stripe lookups
create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);

-- ============================================
-- PAYMENT LOGS TABLE
-- ============================================
create table if not exists public.payment_logs (
  id uuid default gen_random_uuid() primary key,
  stripe_payment_intent_id text,
  amount integer,
  currency text,
  status text,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INVOICE LOGS TABLE
-- ============================================
create table if not exists public.invoice_logs (
  id uuid default gen_random_uuid() primary key,
  stripe_invoice_id text,
  stripe_subscription_id text,
  amount_paid integer,
  amount_due integer,
  currency text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- NOTIFICATION LOGS TABLE
-- ============================================
create table if not exists public.notification_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  title text,
  body text,
  data jsonb,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.notification_logs enable row level security;

-- Policies for notification_logs
create policy "Users can view their own notification logs"
  on public.notification_logs for select
  using (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.handle_updated_at();

create trigger handle_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute procedure public.handle_updated_at();

create trigger handle_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
