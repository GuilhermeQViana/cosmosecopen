
-- Item 4: Save email to profiles via trigger update
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _super_admin RECORD;
  _full_name TEXT;
  _message TEXT;
  _service_key TEXT;
BEGIN
  -- Insert profile with email
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

  -- Prepare notification data
  _full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Sem nome');
  _message := 'Nome: ' || _full_name || ' | Cadastrado em: ' || to_char(NEW.created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI');

  -- Insert internal notification for each super admin
  FOR _super_admin IN SELECT user_id FROM public.super_admins LOOP
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      _super_admin.user_id,
      '👤 Novo cadastro: ' || NEW.email,
      _message,
      'info',
      '/configuracoes'
    );
  END LOOP;

  -- Item 6: Wrap http_post in exception handler + validate secret
  BEGIN
    _service_key := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1);
    
    IF _service_key IS NOT NULL THEN
      PERFORM net.http_post(
        url := 'https://tsuzjyejcwbzmsheclsp.supabase.co/functions/v1/notify-new-signup',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _service_key
        ),
        body := jsonb_build_object(
          'email', NEW.email,
          'full_name', NEW.raw_user_meta_data ->> 'full_name',
          'created_at', NEW.created_at
        )
      );
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Never block user signup due to notification failure
    NULL;
  END;

  RETURN NEW;
END;
$function$;

-- Item 4: Add email column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;

-- Backfill existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Item 10: Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
