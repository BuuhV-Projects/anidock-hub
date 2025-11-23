-- Add nickname column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Create unique index for nickname (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_nickname_unique 
ON public.profiles (LOWER(nickname));

-- Update handle_new_user function to include nickname
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with nickname from metadata
  INSERT INTO public.profiles (user_id, display_name, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'nickname'
  );
  
  -- Assign free role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;