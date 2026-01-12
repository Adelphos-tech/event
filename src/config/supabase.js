import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database health check failed:', error);
      return { healthy: false, error: error.message };
    }
    
    console.log('✅ Supabase database connected');
    return { healthy: true };
  } catch (error) {
    console.error('Database health check error:', error);
    return { healthy: false, error: error.message };
  }
};

// Export for backward compatibility
export default supabase;
// Build timestamp: 1768203032
