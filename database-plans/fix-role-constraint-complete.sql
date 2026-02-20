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

-- If you have specific invalid roles, update them individually:
-- UPDATE users SET role = 'admin' WHERE role = 'your-invalid-role-here';

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

-- Step 4: If no rows returned from Step 3, then run the constraint creation
-- (Copy this part only after confirming no invalid roles remain)

-- First, update the users table to include all roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
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
