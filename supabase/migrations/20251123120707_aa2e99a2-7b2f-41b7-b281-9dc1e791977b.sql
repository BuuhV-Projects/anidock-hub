-- Create drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  config JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_domain ON public.drivers(domain);
CREATE INDEX IF NOT EXISTS idx_drivers_public ON public.drivers(is_public) WHERE is_public = true;

-- RLS Policies
CREATE POLICY "Users can view their own drivers"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public drivers"
  ON public.drivers FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can create their own drivers"
  ON public.drivers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drivers"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drivers"
  ON public.drivers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create animes table
CREATE TABLE IF NOT EXISTS public.animes (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  driver_id BIGINT REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  alternative_titles TEXT[],
  synopsis TEXT,
  cover_url TEXT,
  banner_url TEXT,
  source_url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.animes ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_animes_user_id ON public.animes(user_id);
CREATE INDEX IF NOT EXISTS idx_animes_driver_id ON public.animes(driver_id);
CREATE INDEX IF NOT EXISTS idx_animes_title ON public.animes USING gin(to_tsvector('portuguese', title));

-- RLS Policies
CREATE POLICY "Users can view their own animes"
  ON public.animes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own animes"
  ON public.animes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own animes"
  ON public.animes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own animes"
  ON public.animes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  anime_id BIGINT REFERENCES public.animes(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT,
  source_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(anime_id, episode_number)
);

-- Enable RLS
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create index
CREATE INDEX IF NOT EXISTS idx_episodes_anime_id ON public.episodes(anime_id);

-- RLS Policies (inherit from anime's user_id)
CREATE POLICY "Users can view episodes of their animes"
  ON public.episodes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.animes
      WHERE animes.id = episodes.anime_id
      AND animes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create episodes for their animes"
  ON public.episodes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.animes
      WHERE animes.id = episodes.anime_id
      AND animes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update episodes of their animes"
  ON public.episodes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.animes
      WHERE animes.id = episodes.anime_id
      AND animes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete episodes of their animes"
  ON public.episodes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.animes
      WHERE animes.id = episodes.anime_id
      AND animes.user_id = auth.uid()
    )
  );

-- Update updated_at trigger for drivers
CREATE TRIGGER update_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at trigger for animes
CREATE TRIGGER update_animes_updated_at
  BEFORE UPDATE ON public.animes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at trigger for episodes
CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();