# Database Schema Documentation

This document describes the database schema for the Seaguntech Expo Template.

## Entity Relationship Diagram

```
┌─────────────────────┐     ┌─────────────────────┐
│     auth.users      │     │      profiles       │
│─────────────────────│     │─────────────────────│
│ id (PK)             │◄────│ id (PK, FK)         │
│ email               │     │ email (UNIQUE)      │
│ ...                 │     │ display_name        │
└─────────────────────┘     │ first_name          │
         │                  │ last_name           │
         │                  │ avatar_url          │
         │                  │ bio                 │
         │                  │ phone               │
         │                  │ created_at          │
         │                  │ updated_at          │
         │                  └─────────────────────┘
         │
         │  ┌─────────────────────┐
         │  │       tasks         │
         │  │─────────────────────│
         ├──│ user_id (FK)        │
         │  │ id (PK)             │
         │  │ title               │
         │  │ description         │
         │  │ status              │
         │  │ priority            │
         │  │ due_date            │
         │  │ completed_at        │
         │  │ tags[]              │
         │  │ order               │
         │  │ created_at          │
         │  │ updated_at          │
         │  └─────────────────────┘
         │
         │  ┌─────────────────────┐
         │  │    push_tokens      │
         │  │─────────────────────│
         ├──│ user_id (FK)        │
         │  │ id (PK)             │
         │  │ token               │
         │  │ platform            │
         │  │ created_at          │
         │  │ updated_at          │
         │  └─────────────────────┘
         │  UNIQUE(user_id, token)
         │
         │  ┌─────────────────────┐
         │  │   subscriptions     │
         │  │─────────────────────│
         ├──│ user_id (FK, NOT NULL)│
         │  │ id (PK)             │
         │  │ stripe_customer_id  │
         │  │ stripe_subscription_id│
         │  │ status              │
         │  │ current_period_end  │
         │  │ cancel_at_period_end│
         │  │ created_at          │
         │  │ updated_at          │
         │  └─────────────────────┘
         │
         │  ┌─────────────────────┐
         │  │ notification_logs   │
         │  │─────────────────────│
         └──│ user_id (FK)        │
            │ id (PK)             │
            │ title               │
            │ body                │
            │ data                │
            │ status              │
            │ created_at          │
            └─────────────────────┘

┌─────────────────────┐     ┌─────────────────────┐
│    payment_logs     │     │    invoice_logs     │
│─────────────────────│     │─────────────────────│
│ id (PK)             │     │ id (PK)             │
│ stripe_payment_     │     │ stripe_invoice_id   │
│   intent_id         │     │ stripe_subscription_│
│ amount              │     │   id                │
│ currency            │     │ amount_paid         │
│ status              │     │ amount_due          │
│ error_message       │     │ currency            │
│ metadata            │     │ status              │
│ created_at          │     │ created_at          │
└─────────────────────┘     └─────────────────────┘
```

## Tables

### profiles

User profile information, linked 1:1 with `auth.users`.

| Column       | Type        | Constraints             | Description                           |
| ------------ | ----------- | ----------------------- | ------------------------------------- |
| id           | uuid        | PK, FK → auth.users     | User ID (same as auth.users.id)       |
| email        | text        | UNIQUE                  | User email (mirrors auth.users.email) |
| display_name | text        |                         | Display name for UI                   |
| first_name   | text        |                         | First name                            |
| last_name    | text        |                         | Last name                             |
| avatar_url   | text        |                         | URL to avatar image                   |
| bio          | text        |                         | User biography                        |
| phone        | text        |                         | Phone number                          |
| created_at   | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp                    |
| updated_at   | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp                 |

**Trigger**: Automatically created when user signs up via `handle_new_user()`.

### tasks

User tasks with status, priority, and ordering.

| Column       | Type        | Constraints                                                  | Description           |
| ------------ | ----------- | ------------------------------------------------------------ | --------------------- |
| id           | uuid        | PK, DEFAULT gen_random_uuid()                                | Task ID               |
| user_id      | uuid        | NOT NULL, FK → auth.users                                    | Owner user ID         |
| title        | text        | NOT NULL                                                     | Task title            |
| description  | text        |                                                              | Task description      |
| status       | text        | CHECK IN ('pending', 'in_progress', 'completed', 'canceled') | Task status           |
| priority     | text        | CHECK IN ('low', 'medium', 'high', 'urgent')                 | Priority level        |
| due_date     | timestamptz |                                                              | Due date              |
| completed_at | timestamptz |                                                              | Completion timestamp  |
| tags         | text[]      | DEFAULT '{}'                                                 | Array of tags         |
| order        | integer     | DEFAULT 0                                                    | Sort order            |
| created_at   | timestamptz | NOT NULL, DEFAULT now()                                      | Creation timestamp    |
| updated_at   | timestamptz | NOT NULL, DEFAULT now()                                      | Last update timestamp |

### push_tokens

Expo push notification tokens for mobile devices.

| Column     | Type        | Constraints                        | Description           |
| ---------- | ----------- | ---------------------------------- | --------------------- |
| id         | uuid        | PK, DEFAULT gen_random_uuid()      | Token record ID       |
| user_id    | uuid        | NOT NULL, FK → auth.users          | Owner user ID         |
| token      | text        | NOT NULL                           | Expo push token       |
| platform   | text        | CHECK IN ('ios', 'android', 'web') | Device platform       |
| created_at | timestamptz | NOT NULL, DEFAULT now()            | Creation timestamp    |
| updated_at | timestamptz | NOT NULL, DEFAULT now()            | Last update timestamp |

**Unique Constraint**: `(user_id, token)` - Allows multiple devices per user.

### subscriptions

Stripe subscription records.

| Column                 | Type        | Constraints                                                           | Description                |
| ---------------------- | ----------- | --------------------------------------------------------------------- | -------------------------- |
| id                     | uuid        | PK, DEFAULT gen_random_uuid()                                         | Subscription record ID     |
| user_id                | uuid        | NOT NULL, FK → auth.users                                             | Subscriber user ID         |
| stripe_customer_id     | text        |                                                                       | Stripe customer ID         |
| stripe_subscription_id | text        | UNIQUE                                                                | Stripe subscription ID     |
| status                 | text        | CHECK IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete') | Subscription status        |
| current_period_end     | timestamptz |                                                                       | Current billing period end |
| cancel_at_period_end   | boolean     | DEFAULT false                                                         | Will cancel at period end  |
| created_at             | timestamptz | NOT NULL, DEFAULT now()                                               | Creation timestamp         |
| updated_at             | timestamptz | NOT NULL, DEFAULT now()                                               | Last update timestamp      |

### payment_logs

Payment intent logging for Stripe payments.

| Column                   | Type        | Constraints                   | Description                 |
| ------------------------ | ----------- | ----------------------------- | --------------------------- |
| id                       | uuid        | PK, DEFAULT gen_random_uuid() | Log entry ID                |
| stripe_payment_intent_id | text        |                               | Stripe PaymentIntent ID     |
| amount                   | integer     |                               | Amount in cents             |
| currency                 | text        |                               | Currency code (e.g., 'usd') |
| status                   | text        |                               | Payment status              |
| error_message            | text        |                               | Error message if failed     |
| metadata                 | jsonb       |                               | Additional metadata         |
| created_at               | timestamptz | NOT NULL, DEFAULT now()       | Creation timestamp          |

### invoice_logs

Invoice logging for Stripe subscriptions.

| Column                 | Type        | Constraints                   | Description                |
| ---------------------- | ----------- | ----------------------------- | -------------------------- |
| id                     | uuid        | PK, DEFAULT gen_random_uuid() | Log entry ID               |
| stripe_invoice_id      | text        |                               | Stripe invoice ID          |
| stripe_subscription_id | text        |                               | Associated subscription ID |
| amount_paid            | integer     |                               | Amount paid in cents       |
| amount_due             | integer     |                               | Amount due in cents        |
| currency               | text        |                               | Currency code              |
| status                 | text        |                               | Invoice status             |
| created_at             | timestamptz | NOT NULL, DEFAULT now()       | Creation timestamp         |

### notification_logs

Push notification logging.

| Column     | Type        | Constraints                   | Description             |
| ---------- | ----------- | ----------------------------- | ----------------------- |
| id         | uuid        | PK, DEFAULT gen_random_uuid() | Log entry ID            |
| user_id    | uuid        | FK → auth.users               | Recipient user ID       |
| title      | text        |                               | Notification title      |
| body       | text        |                               | Notification body       |
| data       | jsonb       |                               | Additional data payload |
| status     | text        |                               | Delivery status         |
| created_at | timestamptz | NOT NULL, DEFAULT now()       | Creation timestamp      |

## Row Level Security (RLS) Policies

All user-facing tables have RLS enabled. Policies follow the principle of least privilege.

### profiles

| Policy                             | Operation | Rule              |
| ---------------------------------- | --------- | ----------------- |
| Users can view their own profile   | SELECT    | `auth.uid() = id` |
| Users can update their own profile | UPDATE    | `auth.uid() = id` |
| Users can insert their own profile | INSERT    | `auth.uid() = id` |

### tasks

| Policy                           | Operation | Rule                   |
| -------------------------------- | --------- | ---------------------- |
| Users can view their own tasks   | SELECT    | `auth.uid() = user_id` |
| Users can create their own tasks | INSERT    | `auth.uid() = user_id` |
| Users can update their own tasks | UPDATE    | `auth.uid() = user_id` |
| Users can delete their own tasks | DELETE    | `auth.uid() = user_id` |

### push_tokens

| Policy                                 | Operation | Rule                   |
| -------------------------------------- | --------- | ---------------------- |
| Users can view their own push tokens   | SELECT    | `auth.uid() = user_id` |
| Users can insert their own push tokens | INSERT    | `auth.uid() = user_id` |
| Users can update their own push tokens | UPDATE    | `auth.uid() = user_id` |
| Users can delete their own push tokens | DELETE    | `auth.uid() = user_id` |

### subscriptions

| Policy                                 | Operation | Rule                   |
| -------------------------------------- | --------- | ---------------------- |
| Users can view their own subscriptions | SELECT    | `auth.uid() = user_id` |

Note: Subscriptions are managed by Stripe webhooks, not directly by users.

### notification_logs

| Policy                                     | Operation | Rule                   |
| ------------------------------------------ | --------- | ---------------------- |
| Users can view their own notification logs | SELECT    | `auth.uid() = user_id` |

## Indexes

### Performance Indexes

| Table         | Index                                    | Columns                | Purpose                        |
| ------------- | ---------------------------------------- | ---------------------- | ------------------------------ |
| tasks         | tasks_user_id_idx                        | user_id                | User task lookup               |
| tasks         | tasks_status_idx                         | status                 | Filter by status               |
| tasks         | tasks_due_date_idx                       | due_date               | Sort/filter by due date        |
| tasks         | tasks_user_status_idx                    | (user_id, status)      | Composite for filtered queries |
| tasks         | tasks_user_priority_idx                  | (user_id, priority)    | Priority-based queries         |
| push_tokens   | push_tokens_token_idx                    | token                  | Token lookup                   |
| subscriptions | subscriptions_user_id_idx                | user_id                | User subscription lookup       |
| subscriptions | subscriptions_stripe_customer_id_idx     | stripe_customer_id     | Stripe customer lookup         |
| subscriptions | subscriptions_stripe_subscription_id_idx | stripe_subscription_id | Stripe subscription lookup     |
| profiles      | profiles_updated_at_idx                  | updated_at DESC        | Recent updates                 |

### Partial Indexes

| Table         | Index                    | Condition                | Purpose                     |
| ------------- | ------------------------ | ------------------------ | --------------------------- |
| tasks         | tasks_pending_idx        | WHERE status = 'pending' | Fast pending task queries   |
| subscriptions | subscriptions_active_idx | WHERE status = 'active'  | Active subscription queries |

## Triggers

### Updated At Triggers

All mutable tables have triggers to automatically update `updated_at`:

- `handle_profiles_updated_at`
- `handle_tasks_updated_at`
- `handle_push_tokens_updated_at`
- `handle_subscriptions_updated_at`

### User Signup Trigger

`on_auth_user_created` - Creates a profile record when a new user signs up.

## Storage Buckets

### avatars

- **Public**: Yes
- **Purpose**: User avatar images

**Policies**:

- Anyone can view avatars
- Users can upload/update/delete their own avatars (folder: `{user_id}/`)

## Functions

### handle_new_user()

Creates a profile when a new user signs up.

```sql
-- Triggered by: INSERT on auth.users
-- Security: DEFINER
```

### handle_updated_at()

Updates the `updated_at` timestamp on row update.

```sql
-- Triggered by: UPDATE on various tables
-- Security: INVOKER
```
