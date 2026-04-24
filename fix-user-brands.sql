CREATE POLICY user_brands_update_own
ON public.user_brands
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
