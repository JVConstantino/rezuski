-- Simple fix for storage_configs RLS policy issue
-- Copy and paste this into your Supabase SQL Editor

-- Option 1: Allow all operations for testing (RECOMMENDED for development)
DROP POLICY IF EXISTS "Admin full access" ON public.storage_configs;
CREATE POLICY "Allow all access for testing" ON public.storage_configs 
    FOR ALL 
    USING (true);

-- Option 2: More secure approach (for production)
-- DROP POLICY IF EXISTS "Admin full access" ON public.storage_configs;
-- CREATE POLICY "Allow anonymous read access" ON public.storage_configs FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users full access" ON public.storage_configs FOR ALL USING (auth.role() = 'authenticated');

-- Verify the policy was created
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'storage_configs';