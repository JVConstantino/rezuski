-- Revert RLS policies to original baseline defined in databaseMigration.ts
-- Run this script in Supabase SQL Editor connected to your project
-- Baseline:
-- - Public SELECT access for: categories, amenities, brokers, properties, resources, property_type_translations
-- - Admin full access for authenticated users (auth.role() = 'authenticated') on: profiles, applications, tenants, conversations, messages, ai_configs, storage_configs

-- 0) Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_type_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_configs ENABLE ROW LEVEL SECURITY;

-- 1) Drop permissive development/testing policies introduced recently
DO $$
BEGIN
  -- Common permissive policy names
  -- Properties
  DROP POLICY IF EXISTS "Allow all operations for development" ON public.properties;
  DROP POLICY IF EXISTS "Allow all access" ON public.properties;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.properties;
  DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.properties; -- if previously added by fix script
  DROP POLICY IF EXISTS "Allow public read access" ON public.properties; -- revert to baseline name

  -- Categories
  DROP POLICY IF EXISTS "Allow all access" ON public.categories;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.categories;

  -- Amenities
  DROP POLICY IF EXISTS "Allow all access" ON public.amenities;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.amenities;

  -- Brokers
  DROP POLICY IF EXISTS "Allow all access" ON public.brokers;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.brokers;

  -- Resources
  DROP POLICY IF EXISTS "Allow all access" ON public.resources;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.resources;

  -- Property type translations
  DROP POLICY IF EXISTS "Allow all access" ON public.property_type_translations;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.property_type_translations;

  -- Profiles
  DROP POLICY IF EXISTS "Allow all access" ON public.profiles;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.profiles;

  -- Applications
  DROP POLICY IF EXISTS "Allow all access" ON public.applications;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.applications;

  -- Tenants
  DROP POLICY IF EXISTS "Allow all access" ON public.tenants;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.tenants;

  -- Conversations
  DROP POLICY IF EXISTS "Allow all access" ON public.conversations;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.conversations;

  -- Messages
  DROP POLICY IF EXISTS "Allow all access" ON public.messages;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.messages;

  -- Storage configs
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.storage_configs;
  DROP POLICY IF EXISTS "Allow anonymous read access" ON public.storage_configs;
  DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.storage_configs; -- will restore baseline naming afterwards

  -- AI configs
  DROP POLICY IF EXISTS "Allow all access" ON public.ai_configs;
  DROP POLICY IF EXISTS "Allow all access for testing" ON public.ai_configs;
END$$;

-- 2) Restore original baseline policies
-- Public read policies
DROP POLICY IF EXISTS "Public read access" ON public.categories;
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.amenities;
CREATE POLICY "Public read access" ON public.amenities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.brokers;
CREATE POLICY "Public read access" ON public.brokers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.properties;
CREATE POLICY "Public read access" ON public.properties FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.resources;
CREATE POLICY "Public read access" ON public.resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON public.property_type_translations;
CREATE POLICY "Public read access" ON public.property_type_translations FOR SELECT USING (true);

-- Admin full access for authenticated users
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Admin full access" ON public.profiles FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.applications;
CREATE POLICY "Admin full access" ON public.applications FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.tenants;
CREATE POLICY "Admin full access" ON public.tenants FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.conversations;
CREATE POLICY "Admin full access" ON public.conversations FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.messages;
CREATE POLICY "Admin full access" ON public.messages FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.ai_configs;
CREATE POLICY "Admin full access" ON public.ai_configs FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access" ON public.storage_configs;
CREATE POLICY "Admin full access" ON public.storage_configs FOR ALL USING (auth.role() = 'authenticated');

-- 3) Verify
SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;