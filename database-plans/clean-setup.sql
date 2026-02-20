-- Clean Setup Script - Handles existing policies
-- Run this in Supabase SQL Editor

-- 1. Update the admin user password with the correct hash
UPDATE users 
SET password_hash = '$2b$10$2Hb1wT3YpXkF5DZAJ6nXs.LBsJ9imwhzwpN4UHackQny3MwMyTAiO' 
WHERE email = 'micknick168@gmail.com';

-- 2. If user doesn't exist, create it
INSERT INTO users (email, password_hash, name, role) 
VALUES ('micknick168@gmail.com', '$2b$10$2Hb1wT3YpXkF5DZAJ6nXs.LBsJ9imwhzwpN4UHackQny3MwMyTAiO', 'Admin User', 'admin')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- 3. Verify the user was created and updated correctly
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

-- 4. Test query to make sure we can read users
SELECT COUNT(*) as user_count FROM users;

-- 5. Show all users (for verification)
SELECT id, email, name, role FROM users ORDER BY created_at;
