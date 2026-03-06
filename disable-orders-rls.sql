-- Nuclear Option: Disable RLS completely on orders table
-- Use this if RLS policies are causing persistent issues
-- WARNING: Only use for development/testing, not production without authentication

-- 1. Disable RLS on orders table (removes all security policies)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';

-- 3. Check if there are any policies still attached
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'orders';

-- Note: After disabling RLS, Supabase auth will still protect the table,
-- but you won't have row-level policies. Make sure your API enforces
-- proper authorization at the application level.
