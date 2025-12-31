-- Add INSERT policy for organizations (allows authenticated users to create organizations)
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Also need to allow users to insert their own role when creating an organization
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());