import { createClient } from '@supabase/supabase-js';

// Access environment variables with fallback to provided credentials
// This ensures the app works immediately in the WebContainer environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xiunubzcwmkdkpqdytfj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdW51Ynpjd21rZGtwcWR5dGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMTI4MDIsImV4cCI6MjA4MDU4ODgwMn0.O9UIBB6bum0ZqymQbCPHkm4loG2C6A1sWJzbD0Knroo';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
