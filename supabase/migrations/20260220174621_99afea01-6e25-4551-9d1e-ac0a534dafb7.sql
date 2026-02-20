
-- Recreate handle_new_user with hardcoded Supabase URL and using vault/secrets via pg_net
-- The service role key is read from a postgres secret config variable set at the session level
-- Since ALTER DATABASE is not allowed, we embed the URL and read the service key from secrets

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
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

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

  -- Call notify-new-signup edge function asynchronously via pg_net
  -- Uses the Supabase service_role_key from the vault secret
  PERFORM net.http_post(
    url := 'https://tsuzjyejcwbzmsheclsp.supabase.co/functions/v1/notify-new-signup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
    ),
    body := jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.raw_user_meta_data ->> 'full_name',
      'created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$function$;
