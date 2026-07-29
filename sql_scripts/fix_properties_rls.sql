-- Fix RLS policies for properties table
-- Run this SQL in your Supabase SQL Editor

-- Check current policies for properties table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'properties';

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Public read access" ON public.properties;
DROP POLICY IF EXISTS "Admin full access" ON public.properties;

-- Create comprehensive RLS policies for properties table

-- 1. Allow public read access (for property listings)
CREATE POLICY "Allow public read access" ON public.properties 
    FOR SELECT 
    USING (true);

-- 2. Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated users full access" ON public.properties 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 3. Alternative: Allow anonymous admin operations (if you need admin without auth)
-- Uncomment the following policy if needed:
-- CREATE POLICY "Allow anonymous admin operations" ON public.properties 
--     FOR ALL 
--     USING (true);

-- 4. For development/testing: Allow all operations (TEMPORARY - use with caution)
-- If you want to temporarily allow all operations for testing:
-- DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
-- DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.properties;
-- CREATE POLICY "Allow all access for testing" ON public.properties 
--     FOR ALL 
--     USING (true);

-- Verify the policies were created correctly
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'properties'
ORDER BY policyname;

-- Test UPDATE operation (replace with actual property ID)
-- UPDATE properties SET youtubeUrl = null WHERE id = 'your-property-id-here';