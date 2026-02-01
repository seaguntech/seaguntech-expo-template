-- Seed data for SQL
-- Runs automatically after 'supabase db reset'

-- Sample profile for the current user if exists
-- Note: This is usually handled by the trigger, but we can add more data here

-- Sample Tasks
INSERT INTO public.tasks (user_id, title, description, status, priority)
SELECT 
  id,
  'Welcome to Seaguntech!',
  'This is a sample task automatically created from seed.sql',
  'pending',
  'high'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.tasks (user_id, title, description, status, priority)
SELECT 
  id,
  'Explore Template Features',
  'Try creating a new task or updating your profile.',
  'in_progress',
  'medium'
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;
