
-- Table to store which tenants have the broker fee applied
CREATE TABLE public.tenant_broker_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_name)
);

ALTER TABLE public.tenant_broker_fees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tenant broker fees"
ON public.tenant_broker_fees
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Anyone can read tenant broker fees"
ON public.tenant_broker_fees
FOR SELECT
USING (true);
