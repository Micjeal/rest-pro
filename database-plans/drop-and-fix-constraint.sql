-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Fix the user with invalid role 'micheal'
UPDATE users SET role = 'line_cook' WHERE email = 'mugishamicheal@gmail.com';

-- Step 3: Verify the fix worked
SELECT id, email, role FROM users WHERE email = 'mugishamicheal@gmail.com';

-- Step 4: Check for any other invalid roles
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

-- Step 5: Re-add the constraint (only if Step 4 returns no rows)
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
