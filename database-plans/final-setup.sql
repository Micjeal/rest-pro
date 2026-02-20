-- Final Setup Script for Supabase SQL Editor
-- Run this AFTER running fix-auth-complete.sql

-- 1. Update the admin user password with the correct hash
UPDATE users 
SET password_hash = '$2b$10$2Hb1wT3YpXkF5DZAJ6nXs.LBsJ9imwhzwpN4UHackQny3MwMyTAiO' 
WHERE email = 'micknick168@gmail.com';

-- 2. Verify the user was created and updated correctly
SELECT 
    id, 
    email, 
    name, 
    role, 
    created_at,
    CASE 
        WHEN password_hash = '$2b$10$2Hb1wT3YpXkF5DZAJ6nXs.LBsJ9imwhzwpN4UHackQny3MwMyTAiO' 
        THEN 'Password hash updated correctly'
        ELSE 'Password hash needs update'
    END as password_status
FROM users 
WHERE email = 'micknick168@gmail.com';

-- 3. Check if RLS policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('users', 'restaurants', 'menus', 'menu_items', 'orders', 'reservations', 'inventory')
ORDER BY tablename, policyname;

-- 4. Test query to make sure we can read users
SELECT COUNT(*) as user_count FROM users;

-- 5. Show all users (for verification)
SELECT id, email, name, role FROM users ORDER BY created_at;
