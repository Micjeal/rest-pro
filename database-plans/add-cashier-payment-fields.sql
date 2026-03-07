-- Add Cashier Name and Payment Method to Orders Table
-- This migration adds missing fields for proper receipt tracking

-- 1. Add cashier_name field to track which staff member processed the order
ALTER TABLE orders 
ADD COLUMN cashier_name TEXT,
ADD COLUMN payment_method TEXT DEFAULT 'cash';

-- 2. Update existing orders to have default values
UPDATE orders 
SET cashier_name = 'System',
    payment_method = 'cash' 
WHERE cashier_name IS NULL;

-- 3. Add index for performance optimization
CREATE INDEX IF NOT EXISTS idx_orders_cashier ON orders(cashier_name);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- 4. Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
  AND column_name IN ('cashier_name', 'payment_method')
ORDER BY column_name;
