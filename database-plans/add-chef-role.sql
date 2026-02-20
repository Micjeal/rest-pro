-- Add chef role to users table constraint
-- This script updates the existing CHECK constraint to include the chef role

-- First, drop the existing constraint
ALTER TABLE users DROP CONSTRAINT users_role_check;

-- Then add the new constraint with chef role included
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'manager', 'cashier', 'chef'));

-- Optional: Add a comment to document the change
COMMENT ON COLUMN users.role IS 'User role: admin, manager, cashier, or chef';
