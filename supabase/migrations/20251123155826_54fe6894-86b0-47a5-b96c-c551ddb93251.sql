-- Adicionar coluna catalog_url na tabela drivers
ALTER TABLE public.drivers 
ADD COLUMN catalog_url TEXT;

COMMENT ON COLUMN public.drivers.catalog_url IS 'URL específica da página de catálogo de animes (se diferente da URL principal)';