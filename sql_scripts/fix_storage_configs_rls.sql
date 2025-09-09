-- Fix RLS policies for storage_configs table
-- Run this SQL in your Supabase SQL Editor

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Admin full access" ON public.storage_configs;

-- Create more specific policies for storage_configs

-- 1. Allow anonymous users to read storage configurations (needed for the app to function)
CREATE POLICY "Allow anonymous read access" ON public.storage_configs 
    FOR SELECT 
    USING (true);

-- 2. Allow authenticated users to manage storage configurations
CREATE POLICY "Allow authenticated users full access" ON public.storage_configs 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 3. If you need anonymous users to be able to add/modify storage configs (for admin without auth)
-- Uncomment the following policy:
-- CREATE POLICY "Allow anonymous admin operations" ON public.storage_configs 
--     FOR ALL 
--     USING (true);

-- Alternative: If you want to allow anonymous users full access temporarily while testing
-- You can replace all policies with this single one:
-- DROP POLICY IF EXISTS "Allow anonymous read access" ON public.storage_configs;
-- DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.storage_configs;
-- CREATE POLICY "Allow all access for testing" ON public.storage_configs 
--     FOR ALL 
--     USING (true);

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'storage_configs';