-- Test Data: Add sample orders with cashier and payment method info
-- This will help verify that the new fields are working correctly

-- Insert test orders with different payment methods and cashiers
INSERT INTO orders (
  id, restaurant_id, customer_name, customer_phone, total_amount, 
  status, notes, payment_method, cashier_name, created_at, updated_at
) VALUES 
  (
    gen_random_uuid(),
    (SELECT id FROM restaurants LIMIT 1),
    'Test Customer 1',
    '555-0001',
    25.99,
    'completed',
    'Test order with cash payment',
    'cash',
    'John Cashier',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM restaurants LIMIT 1),
    'Test Customer 2', 
    '555-0002',
    45.50,
    'completed',
    'Test order with card payment',
    'card',
    'Jane Cashier',
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM restaurants LIMIT 1),
    'Test Customer 3',
    '555-0003',
    15.75,
    'completed',
    'Test order with mobile payment',
    'mobile',
    'Bob Cashier',
    NOW(),
    NOW()
  );

-- Verify the test data was inserted
SELECT 
  id, 
  customer_name, 
  payment_method, 
  cashier_name,
  total_amount,
  created_at 
FROM orders 
WHERE customer_name LIKE 'Test Customer%' 
ORDER BY created_at DESC;
