
-- Modify handle_new_user trigger to:
-- 1. Insert internal notifications for all super admins
-- 2. Call notify-new-signup edge function via pg_net

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
  _supabase_url TEXT;
  _service_role_key TEXT;
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
  -- This will NOT block the signup even if it fails
  _supabase_url := current_setting('app.settings.supabase_url', true);
  _service_role_key := current_setting('app.settings.service_role_key', true);

  -- Only call if settings are configured
  IF _supabase_url IS NOT NULL AND _supabase_url != '' AND _service_role_key IS NOT NULL AND _service_role_key != '' THEN
    PERFORM net.http_post(
      url := _supabase_url || '/functions/v1/notify-new-signup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _service_role_key
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'full_name', NEW.raw_user_meta_data ->> 'full_name',
        'created_at', NEW.created_at
      )
    );
  END IF;

  RETURN NEW;
END;
$function$;
