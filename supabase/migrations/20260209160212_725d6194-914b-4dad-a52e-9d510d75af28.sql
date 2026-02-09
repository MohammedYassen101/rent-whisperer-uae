
-- Allow authenticated users to read their own role (needed for admin check on login)
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
