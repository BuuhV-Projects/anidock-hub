-- Add indexed_data and indexing metadata to drivers table
ALTER TABLE public.drivers
ADD COLUMN IF NOT EXISTS indexed_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS source_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_animes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_indexed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment to explain the structure
COMMENT ON COLUMN public.drivers.indexed_data IS 'Stores the indexed anime data as JSON array. NULL if not indexed yet.';
COMMENT ON COLUMN public.drivers.source_url IS 'The URL that was used to generate the indexation.';
COMMENT ON COLUMN public.drivers.total_animes IS 'Total number of animes indexed. 0 if not indexed yet.';
COMMENT ON COLUMN public.drivers.last_indexed_at IS 'Timestamp of the last successful indexation.';