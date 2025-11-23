-- Create indexes table for storing anime indexations
CREATE TABLE public.indexes (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  driver_id BIGINT REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  total_animes INTEGER NOT NULL DEFAULT 0,
  metadata JSONB,
  index_data JSONB NOT NULL, -- Array of animes with episodes
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_indexes_user_id ON public.indexes(user_id);
CREATE INDEX idx_indexes_driver_id ON public.indexes(driver_id);
CREATE INDEX idx_indexes_source_url ON public.indexes(source_url);

-- Enable RLS
ALTER TABLE public.indexes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for indexes
CREATE POLICY "Users can view their own indexes"
  ON public.indexes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public indexes"
  ON public.indexes FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own indexes"
  ON public.indexes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own indexes"
  ON public.indexes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own indexes"
  ON public.indexes FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_indexes_updated_at
  BEFORE UPDATE ON public.indexes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();