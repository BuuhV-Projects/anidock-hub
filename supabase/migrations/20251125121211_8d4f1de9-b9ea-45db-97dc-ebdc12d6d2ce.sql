-- Create watch_history table for premium users
CREATE TABLE public.watch_history (
  id BIGSERIAL PRIMARY KEY,
  public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anime_title TEXT NOT NULL,
  anime_cover TEXT,
  anime_source_url TEXT NOT NULL,
  episode_title TEXT,
  episode_number INTEGER NOT NULL,
  episode_url TEXT NOT NULL,
  driver_id BIGINT REFERENCES public.drivers(id) ON DELETE SET NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watch history"
ON public.watch_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watch history"
ON public.watch_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
ON public.watch_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history"
ON public.watch_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_watch_history_user_anime ON public.watch_history(user_id, anime_source_url);
CREATE INDEX idx_watch_history_watched_at ON public.watch_history(user_id, watched_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_watch_history_updated_at
BEFORE UPDATE ON public.watch_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to keep only last episode per anime
CREATE UNIQUE INDEX idx_watch_history_user_anime_unique ON public.watch_history(user_id, anime_source_url);