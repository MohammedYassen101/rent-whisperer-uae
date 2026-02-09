
-- Fix tenant_records: replace restrictive ALL policy with permissive granular policies
DROP POLICY IF EXISTS "Admins can manage tenant records" ON public.tenant_records;

CREATE POLICY "Admins can select tenant records"
  ON public.tenant_records FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert tenant records"
  ON public.tenant_records FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update tenant records"
  ON public.tenant_records FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete tenant records"
  ON public.tenant_records FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Allow anonymous inserts for tenant record tracking (upsert from public calculator)
CREATE POLICY "Anyone can insert tenant records"
  ON public.tenant_records FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update tenant records"
  ON public.tenant_records FOR UPDATE
  TO anon
  USING (true);

-- Fix maintenance_requests: replace restrictive policies with permissive
DROP POLICY IF EXISTS "Anyone can submit maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Admins can view maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Admins can update maintenance requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Admins can delete maintenance requests" ON public.maintenance_requests;

CREATE POLICY "Anyone can submit maintenance requests"
  ON public.maintenance_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view maintenance requests"
  ON public.maintenance_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update maintenance requests"
  ON public.maintenance_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete maintenance requests"
  ON public.maintenance_requests FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Fix feedback: replace restrictive policies with permissive
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can delete feedback" ON public.feedback;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete feedback"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Fix user_roles: replace restrictive ALL policy with permissive
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Fix app_settings: replace restrictive policies with permissive
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;

CREATE POLICY "Anyone can read settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin());
