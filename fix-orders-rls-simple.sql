-- Alternative: Simplified RLS Fix for Orders Table
-- Use this if the complex policy doesn't work

-- 1. Check current RLS status
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'orders';

-- 2. Temporarily disable RLS to test if that's the issue
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 3. If tests pass, enable RLS with simple policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for users" ON public.orders;
DROP POLICY IF EXISTS "Users can select their restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert orders in their restaurants" ON public.orders;
DROP POLICY IF EXISTS "Users can update their restaurant orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete their restaurant orders" ON public.orders;

-- 5. Create simple permissive policies that allow all authenticated users
CREATE POLICY "allow_all_select"
ON public.orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_all_insert"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_all_update"
ON public.orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_delete"
ON public.orders FOR DELETE
TO authenticated
USING (true);

-- 6. Also allow anonymous (for service role operations)
CREATE POLICY "allow_all_select_anon"
ON public.orders FOR SELECT
TO anon
USING (true);

CREATE POLICY "allow_all_insert_anon"
ON public.orders FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "allow_all_update_anon"
ON public.orders FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_delete_anon"
ON public.orders FOR DELETE
TO anon
USING (true);

-- 7. Verify
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;
