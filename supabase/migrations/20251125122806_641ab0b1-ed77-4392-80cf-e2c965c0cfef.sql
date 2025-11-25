-- Rename user_roles table to user_subscriptions
ALTER TABLE public.user_roles RENAME TO user_subscriptions;

-- Update the handle_new_user function to use user_subscriptions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile with nickname from metadata
  INSERT INTO public.profiles (user_id, display_name, nickname)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'nickname'
  );
  
  -- Assign free role by default
  INSERT INTO public.user_subscriptions (user_id, role)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$function$;

-- Update has_role function to use user_subscriptions
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

-- Update get_user_role function to use user_subscriptions
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
      WHEN 'premium_plus' THEN 3
      WHEN 'premium' THEN 2
      WHEN 'free' THEN 1
    END DESC
  LIMIT 1
$function$;