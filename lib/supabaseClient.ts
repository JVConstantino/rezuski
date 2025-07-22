import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = 'https://emofviiywuhaxqoqowup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtb2Z2aWl5d3VoYXhxb3Fvd3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1Mzk2NTEsImV4cCI6MjA2ODExNTY1MX0.6APrqMN6YD-_0OQR7jkmEzhZ7Ary0kMGdBRagU5ymhY';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);