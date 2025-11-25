-- Remove premium_plus from the enum and update functions
-- First, update any existing premium_plus users to premium
UPDATE public.user_subscriptions 
SET role = 'premium'::app_role 
WHERE role = 'premium_plus'::app_role;

-- Drop functions that depend on the enum
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- Drop and recreate the enum without premium_plus
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('free', 'premium');

-- Update the table to use the new enum
ALTER TABLE public.user_subscriptions 
  ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Drop the old enum
DROP TYPE app_role_old;

-- Recreate the has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Recreate the get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_subscriptions
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'premium' THEN 2
      WHEN 'free' THEN 1
    END DESC
  LIMIT 1
$function$;