-- Fix the specific user with invalid role 'micheal'
UPDATE users SET role = 'line_cook' WHERE email = 'mugishamicheal@gmail.com';

-- Or if you want to update by ID:
UPDATE users SET role = 'line_cook' WHERE id = '534c4c3d-b2af-4ae6-9fdd-d63ea2aecb41';

-- Check for any other users with the 'micheal' role
SELECT id, email, role FROM users WHERE role = 'micheal';

-- Then verify no more invalid roles exist
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
