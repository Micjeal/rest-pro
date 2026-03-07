-- Link existing orders to real users from the users table
-- This script updates orders to have proper staff_id references

-- First, let's see what users we have available
SELECT id, name, email, role, created_at 
FROM users 
ORDER BY created_at;

-- Update orders that have cashier_name matching user names
-- Link orders to actual user IDs based on cashier name
UPDATE orders 
SET staff_id = u.id,
    cashier_name = u.name || ' (' || u.role || ')'
FROM users u
WHERE LOWER(TRIM(orders.cashier_name)) = LOWER(TRIM(u.name))
AND orders.staff_id IS NULL;

-- For orders without specific cashier assignments, assign to Mick (the cashier)
UPDATE orders 
SET staff_id = (
  SELECT id 
  FROM users 
  WHERE email = 'mugishamicheal24@gmail.com' -- Mick the Cashier
  LIMIT 1
),
cashier_name = (
  SELECT name || ' (' || role || ')' 
  FROM users 
  WHERE email = 'mugishamicheal24@gmail.com' -- Mick the Cashier
  LIMIT 1
)
WHERE staff_id IS NULL;

-- Show the results of our updates
SELECT 
  o.id,
  o.customer_name,
  o.cashier_name,
  o.staff_id,
  u.name as linked_user_name,
  u.role as linked_user_role,
  u.email as linked_user_email,
  o.payment_method,
  o.total_amount,
  o.created_at
FROM orders o
LEFT JOIN users u ON o.staff_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;

-- Summary of updates
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN staff_id IS NOT NULL THEN 1 END) as orders_with_staff_id,
  COUNT(CASE WHEN staff_id IS NULL THEN 1 END) as orders_without_staff_id,
  COUNT(CASE WHEN cashier_name LIKE '%(%' THEN 1 END) as orders_with_role_info
FROM orders;
