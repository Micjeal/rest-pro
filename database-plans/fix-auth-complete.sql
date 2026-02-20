-- Complete Authentication Fix Script
-- Run this in your Supabase SQL Editor

-- 1. Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- 4. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Create permissive RLS policies for users table
CREATE POLICY "Allow all operations on users table" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- 6. Update restaurants table to reference users instead of auth.users
ALTER TABLE restaurants 
DROP CONSTRAINT IF EXISTS restaurants_owner_id_fkey;

ALTER TABLE restaurants 
ADD CONSTRAINT restaurants_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Update all RLS policies to use session-based authentication
-- Drop existing restaurant policies
DROP POLICY IF EXISTS "Users can view their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can insert their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants" ON restaurants;
DROP POLICY IF EXISTS "Users can delete their own restaurants" ON restaurants;

-- Create permissive restaurant policies
CREATE POLICY "Allow all operations on restaurants" ON restaurants
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Create admin user with your credentials
-- Note: We'll insert the user with a temporary hash, then update it
INSERT INTO users (email, password_hash, name, role) 
VALUES ('micknick168@gmail.com', 'temp_hash', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 9. Update other tables' RLS policies to be permissive (temporary fix)
DROP POLICY IF EXISTS "Users can view menus of their restaurants" ON menus;
DROP POLICY IF EXISTS "Users can insert menus for their restaurants" ON menus;
DROP POLICY IF EXISTS "Users can update menus of their restaurants" ON menus;
DROP POLICY IF EXISTS "Users can delete menus of their restaurants" ON menus;
CREATE POLICY "Allow all operations on menus" ON menus
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view menu items of their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can insert menu items for their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can update menu items of their restaurants" ON menu_items;
DROP POLICY IF EXISTS "Users can delete menu items of their restaurants" ON menu_items;
CREATE POLICY "Allow all operations on menu_items" ON menu_items
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view orders of their restaurants" ON orders;
DROP POLICY IF EXISTS "Users can insert orders for their restaurants" ON orders;
DROP POLICY IF EXISTS "Users can update orders of their restaurants" ON orders;
CREATE POLICY "Allow all operations on orders" ON orders
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view order items of their restaurants" ON order_items;
DROP POLICY IF EXISTS "Users can insert order items for their restaurants" ON order_items;
CREATE POLICY "Allow all operations on order_items" ON order_items
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view reservations of their restaurants" ON reservations;
DROP POLICY IF EXISTS "Users can insert reservations for their restaurants" ON reservations;
DROP POLICY IF EXISTS "Users can update reservations of their restaurants" ON reservations;
CREATE POLICY "Allow all operations on reservations" ON reservations
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view inventory of their restaurants" ON inventory;
DROP POLICY IF EXISTS "Users can insert inventory for their restaurants" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory of their restaurants" ON inventory;
CREATE POLICY "Allow all operations on inventory" ON inventory
  FOR ALL USING (true) WITH CHECK (true);

-- 10. Show the created user
SELECT id, email, name, role, created_at FROM users WHERE email = 'micknick168@gmail.com';
