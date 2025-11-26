-- Create app_versions table to store application version information
CREATE TABLE IF NOT EXISTS public.app_versions (
  id SERIAL PRIMARY KEY,
  version VARCHAR(20) NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT,
  download_url TEXT,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read app versions (public information)
CREATE POLICY "Anyone can view app versions"
ON public.app_versions
FOR SELECT
USING (true);

-- Only authenticated admins can insert/update versions (for future admin panel)
CREATE POLICY "Only admins can manage versions"
ON public.app_versions
FOR ALL
USING (false);

-- Create index on version for faster lookups
CREATE INDEX idx_app_versions_version ON public.app_versions(version);
CREATE INDEX idx_app_versions_release_date ON public.app_versions(release_date DESC);

-- Insert initial version
INSERT INTO public.app_versions (version, description, is_critical)
VALUES ('1.0.0', 'Versão inicial do AniDock', false);