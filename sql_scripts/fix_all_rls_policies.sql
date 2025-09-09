-- Script completo para corrigir todas as políticas RLS
-- Execute este SQL no Supabase SQL Editor

-- 1. CORRIGIR POLÍTICAS DA TABELA PROPERTIES
-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Public read access" ON public.properties;
DROP POLICY IF EXISTS "Admin full access" ON public.properties;
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.properties;

-- Criar políticas completas para properties
CREATE POLICY "Allow public read access" ON public.properties 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow all operations for development" ON public.properties 
    FOR ALL 
    USING (true);

-- 2. CORRIGIR POLÍTICAS DE OUTRAS TABELAS PRINCIPAIS
-- Categories
DROP POLICY IF EXISTS "Public read access" ON public.categories;
CREATE POLICY "Allow all access" ON public.categories FOR ALL USING (true);

-- Amenities
DROP POLICY IF EXISTS "Public read access" ON public.amenities;
CREATE POLICY "Allow all access" ON public.amenities FOR ALL USING (true);

-- Brokers
DROP POLICY IF EXISTS "Public read access" ON public.brokers;
CREATE POLICY "Allow all access" ON public.brokers FOR ALL USING (true);

-- Resources
DROP POLICY IF EXISTS "Public read access" ON public.resources;
CREATE POLICY "Allow all access" ON public.resources FOR ALL USING (true);

-- Property type translations
DROP POLICY IF EXISTS "Public read access" ON public.property_type_translations;
CREATE POLICY "Allow all access" ON public.property_type_translations FOR ALL USING (true);

-- Profiles
DROP POLICY IF EXISTS "Admin full access" ON public.profiles;
CREATE POLICY "Allow all access" ON public.profiles FOR ALL USING (true);

-- Applications
DROP POLICY IF EXISTS "Admin full access" ON public.applications;
CREATE POLICY "Allow all access" ON public.applications FOR ALL USING (true);

-- Tenants
DROP POLICY IF EXISTS "Admin full access" ON public.tenants;
CREATE POLICY "Allow all access" ON public.tenants FOR ALL USING (true);

-- Conversations
DROP POLICY IF EXISTS "Admin full access" ON public.conversations;
CREATE POLICY "Allow all access" ON public.conversations FOR ALL USING (true);

-- Messages
DROP POLICY IF EXISTS "Admin full access" ON public.messages;
CREATE POLICY "Allow all access" ON public.messages FOR ALL USING (true);

-- 3. VERIFICAR TODAS AS POLÍTICAS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. TESTAR OPERAÇÕES BÁSICAS
-- Teste de SELECT (deve funcionar)
SELECT COUNT(*) as total_properties FROM public.properties;

-- Teste de INSERT (deve funcionar)
-- INSERT INTO public.properties (title, address, neighborhood, city, state, zipCode, description, purpose, propertyType, status, images, amenities, priceHistory) 
-- VALUES ('Teste', 'Endereço Teste', 'Bairro', 'Cidade', 'Estado', '00000-000', 'Descrição', 'RENT', 'APARTMENT', 'AVAILABLE', '[]', '[]', '[]');

-- Teste de UPDATE (deve funcionar)
-- UPDATE public.properties SET description = 'Atualizado' WHERE title = 'Teste';

-- Teste de DELETE (deve funcionar)
-- DELETE FROM public.properties WHERE title = 'Teste';

SELECT 'Políticas RLS atualizadas com sucesso!' as status;