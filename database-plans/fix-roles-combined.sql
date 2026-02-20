-- Combined Role Fix Scripts
-- This script combines all role-related fixes

-- =====================================================
-- FROM: drop-and-fix-constraint.sql
-- =====================================================

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Fix the user with invalid role 'micheal'
UPDATE users SET role = 'line_cook' WHERE email = 'mugishamicheal@gmail.com';

-- Step 3: Verify the fix worked
SELECT id, email, role FROM users WHERE email = 'mugishamicheal@gmail.com';

-- =====================================================
-- FROM: fix-micheal-role.sql
-- =====================================================

-- Fix the specific user with invalid role 'micheal'
UPDATE users SET role = 'line_cook' WHERE email = 'mugishamicheal@gmail.com';

-- Or if you want to update by ID:
UPDATE users SET role = 'line_cook' WHERE id = '534c4c3d-b2af-4ae6-9fdd-d63ea2aecb41';

-- Check for any other users with the 'micheal' role
SELECT id, email, role FROM users WHERE role = 'micheal';

-- =====================================================
-- FROM: fix-role-constraint-complete.sql
-- =====================================================

-- Step 1: First, identify all problematic users
SELECT id, email, role 
FROM users 
WHERE role NOT IN (
  'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
  'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
  'pastry_chef', 'dishwasher', 'kitchen_helper',
  'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
  'busser', 'runner',
  'cashier', 'delivery_driver', 'cleaner', 'security'
);

-- Step 2: Update problematic users to valid roles
-- Common mappings for old role names to new ones:
UPDATE users SET role = 'admin' WHERE role IN ('administrator', 'superadmin', 'root');
UPDATE users SET role = 'manager' WHERE role IN ('staff', 'employee', 'worker');
UPDATE users SET role = 'cashier' WHERE role IN ('pos_user', 'checkout');
UPDATE users SET role = 'server' WHERE role IN ('waitstaff', 'serving');
UPDATE users SET role = 'line_cook' WHERE role IN ('cook', 'chef');
UPDATE users SET role = 'host' WHERE role IN ('greeter', 'receptionist');

-- Fix any remaining invalid roles
UPDATE users SET role = 'admin' WHERE role = 'micheal';
UPDATE users SET role = 'admin' WHERE role NOT IN (
  'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
  'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
  'pastry_chef', 'dishwasher', 'kitchen_helper',
  'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
  'busser', 'runner',
  'cashier', 'delivery_driver', 'cleaner', 'security'
) AND email LIKE '%admin%';

-- Step 3: Check for any remaining invalid roles
SELECT id, email, role 
FROM users 
WHERE role NOT IN (
  'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
  'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
  'pastry_chef', 'dishwasher', 'kitchen_helper',
  'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
  'busser', 'runner',
  'cashier', 'delivery_driver', 'cleaner', 'security'
);

-- Step 4: Re-add the constraint with all valid roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN (
    -- Management Roles
    'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
    
    -- Kitchen Staff  
    'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 'pastry_chef', 'dishwasher', 'kitchen_helper',
    
    -- Front of House Staff
    'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 'busser', 'runner',
    
    -- Support Staff
    'cashier', 'delivery_driver', 'cleaner', 'security'
  ));

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Final verification - show all users with their roles
SELECT id, email, role, created_at FROM users ORDER BY created_at DESC;

-- Show distinct roles in the database
SELECT DISTINCT role FROM users ORDER BY role;

-- Final check for any constraint violations
SELECT id, email, role 
FROM users 
WHERE role NOT IN (
  'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
  'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
  'pastry_chef', 'dishwasher', 'kitchen_helper',
  'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
  'busser', 'runner',
  'cashier', 'delivery_driver', 'cleaner', 'security'
);

SELECT 'Role constraint fix completed successfully!' as status;
