-- Safe Role Migration Script
-- This script safely migrates existing users to new role system without violating constraints

-- Step 1: Create a backup of existing users
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Step 2: Check existing roles
SELECT DISTINCT role FROM users;

-- Step 3: Create a temporary mapping table for role transitions
CREATE TEMPORARY TABLE role_mapping (
  old_role TEXT,
  new_role TEXT
);

-- Insert role mappings for existing roles
INSERT INTO role_mapping (old_role, new_role) VALUES
-- Keep existing roles as they are
('admin', 'admin'),
('manager', 'manager'), 
('cashier', 'cashier'),
('chef', 'head_chef'),  -- Map 'chef' to 'head_chef'

-- If there are any other unexpected roles, map them to appropriate defaults
ON CONFLICT (old_role) DO NOTHING;

-- Step 4: Update existing users to use new role names
UPDATE users 
SET role = COALESCE(
  (SELECT new_role FROM role_mapping WHERE old_role = users.role),
  'cashier'  -- Default fallback for any unmapped roles
)
WHERE role IN (SELECT old_role FROM role_mapping);

-- Step 5: Handle any users with roles not in our mapping
UPDATE users 
SET role = 'cashier' 
WHERE role NOT IN (
  'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
  'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
  'pastry_chef', 'dishwasher', 'kitchen_helper',
  'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
  'busser', 'runner',
  'cashier', 'delivery_driver', 'cleaner', 'security'
);

-- Step 6: Now safely update the constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN (
    -- Management Roles
    'admin', 'owner', 'general_manager', 'assistant_manager', 'manager', 'shift_manager',
    
    -- Kitchen Staff  
    'head_chef', 'sous_chef', 'line_cook', 'prep_cook', 'grill_cook', 'fry_cook', 
    'pastry_chef', 'dishwasher', 'kitchen_helper',
    
    -- Front of House Staff
    'server', 'waiter', 'waitress', 'host', 'bartender', 'barista', 'sommelier', 
    'busser', 'runner',
    
    -- Support Staff
    'cashier', 'delivery_driver', 'cleaner', 'security'
  ));

-- Step 7: Verify the migration
SELECT 
  role, 
  COUNT(*) as user_count,
  STRING_AGG(DISTINCT email, ', ') as sample_emails
FROM users 
GROUP BY role 
ORDER BY role;

-- Step 8: Create the role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_name TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  can_view_dashboard BOOLEAN DEFAULT FALSE,
  can_manage_users BOOLEAN DEFAULT FALSE,
  can_manage_restaurants BOOLEAN DEFAULT FALSE,
  can_manage_staff BOOLEAN DEFAULT FALSE,
  can_view_financials BOOLEAN DEFAULT FALSE,
  can_manage_inventory BOOLEAN DEFAULT FALSE,
  can_manage_menus BOOLEAN DEFAULT FALSE,
  can_take_orders BOOLEAN DEFAULT FALSE,
  can_view_orders BOOLEAN DEFAULT FALSE,
  can_update_order_status BOOLEAN DEFAULT FALSE,
  can_process_payments BOOLEAN DEFAULT FALSE,
  can_manage_tables BOOLEAN DEFAULT FALSE,
  can_manage_reservations BOOLEAN DEFAULT FALSE,
  can_manage_bar BOOLEAN DEFAULT FALSE,
  can_manage_wine_list BOOLEAN DEFAULT FALSE,
  can_access_kitchen BOOLEAN DEFAULT FALSE,
  can_access_pos BOOLEAN DEFAULT FALSE,
  can_view_reports BOOLEAN DEFAULT FALSE,
  can_manage_shifts BOOLEAN DEFAULT FALSE,
  can_access_admin_panel BOOLEAN DEFAULT FALSE
);

-- Insert roles with their specific access permissions
INSERT INTO role_permissions (role_name, display_name, category, 
  can_view_dashboard, can_manage_users, can_manage_restaurants, can_manage_staff, can_view_financials,
  can_manage_inventory, can_manage_menus, can_take_orders, can_view_orders, can_update_order_status,
  can_process_payments, can_manage_tables, can_manage_reservations, can_manage_bar, can_manage_wine_list,
  can_access_kitchen, can_access_pos, can_view_reports, can_manage_shifts, can_access_admin_panel) VALUES

-- MANAGEMENT ROLES
('admin', 'System Administrator', 'Management', 
  TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),

('owner', 'Restaurant Owner', 'Management', 
  TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE),

('general_manager', 'General Manager', 'Management', 
  TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE),

('assistant_manager', 'Assistant Manager', 'Management', 
  TRUE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE),

('manager', 'Manager', 'Management', 
  TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE),

('shift_manager', 'Shift Manager', 'Management', 
  TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE),

-- KITCHEN STAFF
('head_chef', 'Head Chef', 'Kitchen', 
  TRUE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE),

('sous_chef', 'Sous Chef', 'Kitchen', 
  TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),

('line_cook', 'Line Cook', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

('prep_cook', 'Prep Cook', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

('grill_cook', 'Grill Cook', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

('fry_cook', 'Fry Cook', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

('pastry_chef', 'Pastry Chef', 'Kitchen', 
  TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE),

('dishwasher', 'Dishwasher', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

('kitchen_helper', 'Kitchen Helper', 'Kitchen', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE),

-- FRONT OF HOUSE STAFF
('server', 'Server', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('waiter', 'Waiter', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('waitress', 'Waitress', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('host', 'Host', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),

('bartender', 'Bartender', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('barista', 'Barista', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('sommelier', 'Sommelier', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE),

('busser', 'Busser', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),

('runner', 'Runner', 'Front of House', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),

-- SUPPORT STAFF
('cashier', 'Cashier', 'Support', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, FALSE),

('delivery_driver', 'Delivery Driver', 'Support', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),

('cleaner', 'Cleaner', 'Support', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE),

('security', 'Security', 'Support', 
  FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for role permissions
CREATE POLICY "All authenticated users can view role permissions" ON role_permissions FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON role_permissions TO authenticated;

-- Final verification
SELECT 'Migration completed successfully' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(DISTINCT role) FROM users) as unique_roles;

COMMIT;
