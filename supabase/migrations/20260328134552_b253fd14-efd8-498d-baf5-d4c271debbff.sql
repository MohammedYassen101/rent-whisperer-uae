
-- 1. Validation helper function
CREATE OR REPLACE FUNCTION public.validate_text_input(input TEXT, max_length INT)
RETURNS BOOLEAN
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  RETURN (
    input IS NOT NULL AND
    char_length(trim(input)) > 0 AND
    char_length(input) <= max_length
  );
END;
$$;

-- 2. Feedback validation trigger
CREATE OR REPLACE FUNCTION public.validate_feedback_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.validate_text_input(NEW.tenant_name, 100) THEN
    RAISE EXCEPTION 'Invalid tenant name';
  END IF;
  IF NEW.comment IS NOT NULL AND char_length(NEW.comment) > 1000 THEN
    RAISE EXCEPTION 'Comment too long';
  END IF;
  NEW.tenant_name := regexp_replace(trim(NEW.tenant_name), '[<>]', '', 'g');
  IF NEW.comment IS NOT NULL THEN
    NEW.comment := regexp_replace(trim(NEW.comment), '[<>]', '', 'g');
  END IF;
  IF NEW.company_name IS NOT NULL THEN
    NEW.company_name := regexp_replace(trim(NEW.company_name), '[<>]', '', 'g');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_feedback_before_insert
  BEFORE INSERT ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.validate_feedback_trigger();

-- 3. Maintenance requests validation trigger
CREATE OR REPLACE FUNCTION public.validate_maintenance_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.validate_text_input(NEW.tenant_name, 100) THEN
    RAISE EXCEPTION 'Invalid tenant name';
  END IF;
  IF NOT public.validate_text_input(NEW.description, 1000) THEN
    RAISE EXCEPTION 'Invalid description';
  END IF;
  IF NOT public.validate_text_input(NEW.unit_number, 20) THEN
    RAISE EXCEPTION 'Invalid unit number';
  END IF;
  IF NOT public.validate_text_input(NEW.building, 100) THEN
    RAISE EXCEPTION 'Invalid building';
  END IF;
  NEW.tenant_name := regexp_replace(trim(NEW.tenant_name), '[<>]', '', 'g');
  NEW.description := regexp_replace(trim(NEW.description), '[<>]', '', 'g');
  NEW.unit_number := regexp_replace(trim(NEW.unit_number), '[<>]', '', 'g');
  NEW.building := regexp_replace(trim(NEW.building), '[<>]', '', 'g');
  IF NEW.company_name IS NOT NULL THEN
    NEW.company_name := regexp_replace(trim(NEW.company_name), '[<>]', '', 'g');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_maintenance_before_insert
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_maintenance_trigger();

-- 4. Tenant records validation trigger
CREATE OR REPLACE FUNCTION public.validate_tenant_record_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT public.validate_text_input(NEW.tenant_name, 100) THEN
    RAISE EXCEPTION 'Invalid tenant name';
  END IF;
  IF NOT public.validate_text_input(NEW.unit_number, 20) THEN
    RAISE EXCEPTION 'Invalid unit number';
  END IF;
  IF NOT public.validate_text_input(NEW.building_name, 100) THEN
    RAISE EXCEPTION 'Invalid building name';
  END IF;
  NEW.tenant_name := regexp_replace(trim(NEW.tenant_name), '[<>]', '', 'g');
  NEW.unit_number := regexp_replace(trim(NEW.unit_number), '[<>]', '', 'g');
  NEW.building_name := regexp_replace(trim(NEW.building_name), '[<>]', '', 'g');
  IF NEW.company_name IS NOT NULL THEN
    NEW.company_name := regexp_replace(trim(NEW.company_name), '[<>]', '', 'g');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_tenant_record_before_insert
  BEFORE INSERT ON public.tenant_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_record_trigger();

CREATE TRIGGER validate_tenant_record_before_update
  BEFORE UPDATE ON public.tenant_records
  FOR EACH ROW EXECUTE FUNCTION public.validate_tenant_record_trigger();

-- 5. Restrict app_settings read to authenticated users only
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;

CREATE POLICY "Authenticated users can read settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (true);
