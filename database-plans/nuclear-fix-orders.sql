-- Nuclear Fix: Disable RLS completely and verify update works
-- Run this if the simple RLS fix didn't work

-- 1. Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 2. Test a direct update to verify it works
UPDATE public.orders 
SET status = 'pending', updated_at = NOW() 
WHERE id = (SELECT id FROM public.orders LIMIT 1);

-- 3. If test succeeds, you can now enable RLS with proper policies
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'orders';

-- Check if updates work now
SELECT id, status, updated_at FROM public.orders LIMIT 5;
