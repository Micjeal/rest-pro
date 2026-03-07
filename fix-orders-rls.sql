-- Fix RLS Policy for Orders Table
-- Run this in Supabase SQL Editor to allow order updates

-- 1. First, let's check existing policies
-- SELECT * FROM pg_policies WHERE tablename = 'orders';

-- 2. Drop problematic policies if they exist
DROP POLICY IF EXISTS "Enable read access for users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for users" ON public.orders;
DROP POLICY IF EXISTS "Enable delete for users" ON public.orders;

-- 3. Disable RLS temporarily to check table structure
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- 4. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Create new comprehensive policies

-- SELECT policy - allow users to read orders from their restaurants
CREATE POLICY "Users can select their restaurant orders"
ON public.orders FOR SELECT
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.staff 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- INSERT policy - allow users to create orders
CREATE POLICY "Users can insert orders in their restaurants"
ON public.orders FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id FROM public.staff 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE policy - allow users to update orders without conflict constraint
CREATE POLICY "Users can update their restaurant orders"
ON public.orders FOR UPDATE
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.staff 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  restaurant_id IN (
    SELECT restaurant_id FROM public.staff 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- DELETE policy - allow users to delete orders
CREATE POLICY "Users can delete their restaurant orders"
ON public.orders FOR DELETE
USING (
  restaurant_id IN (
    SELECT restaurant_id FROM public.staff 
    WHERE user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon;

-- 7. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'orders' 
ORDER BY policyname;
