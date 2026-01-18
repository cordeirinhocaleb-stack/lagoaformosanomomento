-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop generic/old policies that might conflict or be too restrictive
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create robust Admin Update Policy
CREATE POLICY "Admins can update users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Desenvolvedor', 'Editor-Chefe', 'Admin')
)
WITH CHECK (
  (SELECT role FROM public.users WHERE id = auth.uid()) IN ('Desenvolvedor', 'Editor-Chefe', 'Admin')
);

-- Ensure authenticated users have Update permission on the table
GRANT UPDATE ON public.users TO authenticated;
