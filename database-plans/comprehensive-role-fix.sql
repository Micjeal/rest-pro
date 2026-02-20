-- Step 1: Drop the constraint to allow updates
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Show all current roles to see what we're working with
SELECT DISTINCT role FROM users ORDER BY role;

-- Step 3: Update all invalid roles to valid ones
-- Common problematic role mappings
UPDATE users SET role = 'admin' WHERE role IN ('administrator', 'superadmin', 'root', 'micheal');
UPDATE users SET role = 'manager' WHERE role IN ('staff', 'employee', 'worker', 'supervisor');
UPDATE users SET role = 'cashier' WHERE role IN ('pos_user', 'checkout', 'clerk');
UPDATE users SET role = 'server' WHERE role IN ('waitstaff', 'serving', 'wait_person');
UPDATE users SET role = 'line_cook' WHERE role IN ('cook', 'chef', 'kitchen_staff');
UPDATE users SET role = 'host' WHERE role IN ('greeter', 'receptionist', 'front_desk');
UPDATE users SET role = 'bartender' WHERE role IN ('bar_staff', 'barkeep');

-- Step 4: Check for any remaining NULL or empty roles
UPDATE users SET role = 'cashier' WHERE role IS NULL OR role = '' OR role = 'null';

-- Step 5: Show any remaining problematic roles
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

-- Step 6: If Step 5 returns no rows, re-add the constraint
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

-- Step 7: Verify the constraint was added successfully
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'users'::regclass AND conname = 'users_role_check';
