import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://emofviiywuhaxqoqowup.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2Z2aWl5d3VoYXhxb3Fvd3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mzk2NTEsImV4cCI6MjA2ODExNTY1MX0.6APrqMN6YD-_0OQR7jkmEzhZ7Ary0kMGdBRagU5ymhY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);