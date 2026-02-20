-- Query to find users with invalid roles that violate the constraint
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

-- After identifying the problematic rows, you can update them with:
-- UPDATE users SET role = 'admin' WHERE id = 'your-user-id-here';

-- Or if you want to see all distinct roles currently in the database:
SELECT DISTINCT role FROM users ORDER BY role;
