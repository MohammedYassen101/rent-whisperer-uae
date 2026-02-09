
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  unit_number TEXT NOT NULL,
  building TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Tenant records table
CREATE TABLE public.tenant_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_name TEXT NOT NULL,
  company_name TEXT DEFAULT '',
  building_name TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  unit_type TEXT NOT NULL,
  annual_rent NUMERIC NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  visit_count INTEGER NOT NULL DEFAULT 1,
  last_visit TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_records ENABLE ROW LEVEL SECURITY;

-- App settings table
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Insert default rent increase setting
INSERT INTO public.app_settings (key, value)
VALUES ('rent_increase', '{"enabled": false, "percentage": 5}'::jsonb);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies for maintenance_requests
CREATE POLICY "Anyone can submit maintenance requests" ON public.maintenance_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view maintenance requests" ON public.maintenance_requests
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can update maintenance requests" ON public.maintenance_requests
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete maintenance requests" ON public.maintenance_requests
  FOR DELETE TO authenticated USING (public.is_admin());

-- RLS Policies for feedback
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Admins can delete feedback" ON public.feedback
  FOR DELETE TO authenticated USING (public.is_admin());

-- RLS Policies for tenant_records
CREATE POLICY "Admins can manage tenant records" ON public.tenant_records
  FOR ALL TO authenticated USING (public.is_admin());

-- RLS Policies for app_settings
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE TO authenticated USING (public.is_admin());
