-- Script para permitir que novos "Tipos de Imóvel" sejam cadastrados pelo admin
-- Execute este script no SQL Editor do Supabase

-- A tabela properties tem uma CHECK constraint em "propertyType" que trava os valores
-- em uma lista fixa (Casa, Apartamento, Condomínio, Comercial, Terreno, Sobrado).
-- Isso impede que o admin cadastre novos tipos pela tela de gerenciamento.

-- Descobrir o nome exato da constraint antes de remover
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.properties'::regclass
  AND pg_get_constraintdef(oid) ILIKE '%propertyType%';

-- Remover a constraint (nome padrão gerado pelo Postgres para esta coluna)
DO $$
BEGIN
    ALTER TABLE public.properties DROP CONSTRAINT "properties_propertyType_check";
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Verificar que a constraint foi removida (a query abaixo deve retornar 0 linhas)
SELECT conname
FROM pg_constraint
WHERE conrelid = 'public.properties'::regclass
  AND pg_get_constraintdef(oid) ILIKE '%propertyType%';
