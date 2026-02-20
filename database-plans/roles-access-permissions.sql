-- Restaurant Roles and Access Permissions
-- This query defines all restaurant roles and what they can access based on their responsibilities

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

-- Create comprehensive roles and permissions table
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

-- Create a view to easily check what each role can access
CREATE OR REPLACE VIEW role_access_matrix AS
SELECT 
  role_name,
  display_name,
  category,
  CASE WHEN can_view_dashboard THEN '✓' ELSE '✗' END as dashboard,
  CASE WHEN can_manage_users THEN '✓' ELSE '✗' END as manage_users,
  CASE WHEN can_manage_restaurants THEN '✓' ELSE '✗' END as manage_restaurants,
  CASE WHEN can_manage_staff THEN '✓' ELSE '✗' END as manage_staff,
  CASE WHEN can_view_financials THEN '✓' ELSE '✗' END as financials,
  CASE WHEN can_manage_inventory THEN '✓' ELSE '✗' END as inventory,
  CASE WHEN can_manage_menus THEN '✓' ELSE '✗' END as menus,
  CASE WHEN can_take_orders THEN '✓' ELSE '✗' END as take_orders,
  CASE WHEN can_view_orders THEN '✓' ELSE '✗' END as view_orders,
  CASE WHEN can_update_order_status THEN '✓' ELSE '✗' END as update_orders,
  CASE WHEN can_process_payments THEN '✓' ELSE '✗' END as payments,
  CASE WHEN can_manage_tables THEN '✓' ELSE '✗' END as tables,
  CASE WHEN can_manage_reservations THEN '✓' ELSE '✗' END as reservations,
  CASE WHEN can_manage_bar THEN '✓' ELSE '✗' END as bar,
  CASE WHEN can_manage_wine_list THEN '✓' ELSE '✗' END as wine_list,
  CASE WHEN can_access_kitchen THEN '✓' ELSE '✗' END as kitchen,
  CASE WHEN can_access_pos THEN '✓' ELSE '✗' END as pos,
  CASE WHEN can_view_reports THEN '✓' ELSE '✗' END as reports,
  CASE WHEN can_manage_shifts THEN '✓' ELSE '✗' END as shifts,
  CASE WHEN can_access_admin_panel THEN '✓' ELSE '✗' END as admin_panel
FROM role_permissions
ORDER BY category, role_name;

-- Function to check if a user has specific permission
CREATE OR REPLACE FUNCTION has_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  permission_value BOOLEAN;
BEGIN
  -- Get the user's role
  SELECT role INTO user_role FROM users WHERE id = p_user_id;
  
  -- Return false if user not found
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check the specific permission based on the permission name
  CASE p_permission
    WHEN 'view_dashboard' THEN 
      SELECT can_view_dashboard INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_users' THEN 
      SELECT can_manage_users INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_restaurants' THEN 
      SELECT can_manage_restaurants INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_staff' THEN 
      SELECT can_manage_staff INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'view_financials' THEN 
      SELECT can_view_financials INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_inventory' THEN 
      SELECT can_manage_inventory INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_menus' THEN 
      SELECT can_manage_menus INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'take_orders' THEN 
      SELECT can_take_orders INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'view_orders' THEN 
      SELECT can_view_orders INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'update_order_status' THEN 
      SELECT can_update_order_status INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'process_payments' THEN 
      SELECT can_process_payments INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_tables' THEN 
      SELECT can_manage_tables INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_reservations' THEN 
      SELECT can_manage_reservations INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_bar' THEN 
      SELECT can_manage_bar INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_wine_list' THEN 
      SELECT can_manage_wine_list INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'access_kitchen' THEN 
      SELECT can_access_kitchen INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'access_pos' THEN 
      SELECT can_access_pos INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'view_reports' THEN 
      SELECT can_view_reports INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'manage_shifts' THEN 
      SELECT can_manage_shifts INTO permission_value FROM role_permissions WHERE role_name = user_role;
    WHEN 'access_admin_panel' THEN 
      SELECT can_access_admin_panel INTO permission_value FROM role_permissions WHERE role_name = user_role;
    ELSE 
      RETURN FALSE;
  END CASE;
  
  RETURN COALESCE(permission_value, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for role permissions (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view role permissions" ON role_permissions FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON role_permissions TO authenticated;
GRANT SELECT ON role_access_matrix TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission TO authenticated;

COMMIT;
