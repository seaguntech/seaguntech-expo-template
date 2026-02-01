import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from root .env.local (local dev) or .env (production)
const envPath = path.resolve(process.cwd(), '.env.local')
const fallbackPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: require('fs').existsSync(envPath) ? envPath : fallbackPath })

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seed() {
  console.log('🌱 Starting TypeScript seeding...')

  try {
    // 1. Get the first user to assign data
    const {
      data: { users },
      error: userError,
    } = await supabase.auth.admin.listUsers()

    if (userError) throw userError

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create a user first via the app or dashboard.')
      return
    }

    const targetUser = users[0]
    console.log(`👤 Seeding data for user: ${targetUser.email}`)

    // 2. Add sample data via API if needed (e.g., complex logic that SQL can't handle easily)
    const { error: taskError } = await supabase.from('tasks').upsert([
      {
        user_id: targetUser.id,
        title: '🚀 Complete Supabase Setup',
        description: 'You have successfully run the seed script from TypeScript!',
        status: 'completed',
        priority: 'urgent',
      },
    ])

    if (taskError) throw taskError

    console.log('✅ TypeScript seeding completed successfully!')
  } catch (err) {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  }
}

seed()
