-- Clean up dummy data in orders table
-- This script updates existing dummy data with proper information

-- Update orders with "System" as cashier to use actual user names if possible
UPDATE orders 
SET cashier_name = 'Not assigned' 
WHERE cashier_name = 'System' OR cashier_name IS NULL;

-- Update orders with "Unknown" payment method to be more descriptive
UPDATE orders 
SET payment_method = 'Not specified' 
WHERE payment_method = 'Unknown' OR payment_method IS NULL;

-- Update orders with "Walk-in Customer" to be more descriptive
UPDATE orders 
SET customer_name = 'No customer name provided' 
WHERE customer_name = 'Walk-in Customer' OR customer_name IS NULL OR customer_name = '';

-- Add sample cashier assignments for demonstration (optional)
-- This assigns some existing orders to sample cashiers for testing
UPDATE orders 
SET cashier_name = 'John Cashier' 
WHERE cashier_name = 'Not assigned' 
AND id IN (
  SELECT id FROM orders 
  WHERE cashier_name = 'Not assigned' 
  LIMIT 5
);

UPDATE orders 
SET cashier_name = 'Jane Cashier' 
WHERE cashier_name = 'Not assigned' 
AND id IN (
  SELECT id FROM orders 
  WHERE cashier_name = 'Not assigned' 
  LIMIT 5
);

-- Verify the cleanup
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN cashier_name = 'Not assigned' THEN 1 END) as unassigned_cashier,
  COUNT(CASE WHEN payment_method = 'Not specified' THEN 1 END) as unspecified_payment,
  COUNT(CASE WHEN customer_name = 'No customer name provided' THEN 1 END) as no_customer_name
FROM orders;

-- Show sample of updated data
SELECT 
  id,
  customer_name,
  cashier_name,
  payment_method,
  total_amount,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
