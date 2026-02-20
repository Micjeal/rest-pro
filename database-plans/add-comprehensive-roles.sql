-- Add Comprehensive Restaurant Staff Roles
-- This script expands the user roles to include all restaurant positions

-- First, let's modify the users table to accept the new roles
-- We need to drop the existing check constraint and add a new one

-- Drop the existing role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new comprehensive role constraint
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN (
    -- Management Roles
    'admin', 
    'manager', 
    'owner',
    
    -- Kitchen Staff
    'head_chef', 
    'sous_chef', 
    'line_cook', 
    'prep_cook', 
    'dishwasher', 
    'kitchen_helper',
    
    -- Front of House Staff
    'server', 
    'host', 
    'bartender', 
    'busser', 
    'runner',
    
    -- Support Staff
    'cashier', 
    'barista', 
    'waiter', 
    'waitress',
    
    -- Specialized Roles
    'sommelier', 
    'pastry_chef', 
    'grill_cook', 
    'fry_cook',
    
    -- Management & Operations
    'general_manager', 
    'assistant_manager', 
    'shift_manager',
    
    -- Other Staff
    'delivery_driver', 
    'cleaner', 
    'security'
  ));

-- Create a roles table for better role management
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_management_role BOOLEAN DEFAULT FALSE,
  is_kitchen_role BOOLEAN DEFAULT FALSE,
  is_front_of_house BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert comprehensive restaurant roles
INSERT INTO roles (name, display_name, description, category, permissions, is_management_role, is_kitchen_role, is_front_of_house) VALUES
-- Management Roles
('admin', 'System Administrator', 'Full system access and user management', 'Management', '{"can_manage_users": true, "can_manage_restaurants": true, "can_view_all_data": true, "can_system_settings": true}', true, false, false),
('owner', 'Restaurant Owner', 'Owns one or more restaurants, full control over their properties', 'Management', '{"can_manage_restaurants": true, "can_manage_staff": true, "can_view_financials": true, "can_manage_menus": true}', true, false, false),
('general_manager', 'General Manager', 'Oversees all restaurant operations', 'Management', '{"can_manage_staff": true, "can_view_financials": true, "can_manage_inventory": true, "can_manage_orders": true}', true, false, false),
('assistant_manager', 'Assistant Manager', 'Assists general manager with daily operations', 'Management', '{"can_manage_staff": false, "can_view_financials": true, "can_manage_inventory": true, "can_manage_orders": true}', true, false, false),
('manager', 'Manager', 'Manages specific areas of restaurant operations', 'Management', '{"can_manage_staff": false, "can_view_financials": false, "can_manage_inventory": true, "can_manage_orders": true}', true, false, false),
('shift_manager', 'Shift Manager', 'Manages specific shifts and daily operations', 'Management', '{"can_manage_staff": false, "can_view_financials": false, "can_manage_inventory": false, "can_manage_orders": true}', true, false, false),

-- Kitchen Staff
('head_chef', 'Head Chef', 'Leads kitchen team and menu development', 'Kitchen', '{"can_manage_menu": true, "can_manage_kitchen_staff": true, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('sous_chef', 'Sous Chef', 'Second in command in kitchen', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('line_cook', 'Line Cook', 'Prepares food items on specific stations', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('prep_cook', 'Prep Cook', 'Prepares ingredients and stations', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": false, "can_update_order_status": false}', false, true, false),
('grill_cook', 'Grill Cook', 'Specializes in grilled items', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('fry_cook', 'Fry Cook', 'Specializes in fried items', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('pastry_chef', 'Pastry Chef', 'Creates desserts and baked goods', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": true, "can_update_order_status": true}', false, true, false),
('dishwasher', 'Dishwasher', 'Maintains kitchen cleanliness and dishes', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": false, "can_update_order_status": false}', false, true, false),
('kitchen_helper', 'Kitchen Helper', 'Assists with basic kitchen tasks', 'Kitchen', '{"can_manage_menu": false, "can_manage_kitchen_staff": false, "can_view_orders": false, "can_update_order_status": false}', false, true, false),

-- Front of House Staff
('server', 'Server', 'Takes orders and serves customers', 'Front of House', '{"can_take_orders": true, "can_manage_tables": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('waiter', 'Waiter', 'Male serving staff', 'Front of House', '{"can_take_orders": true, "can_manage_tables": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('waitress', 'Waitress', 'Female serving staff', 'Front of House', '{"can_take_orders": true, "can_manage_tables": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('host', 'Host', 'Greets guests and manages seating', 'Front of House', '{"can_manage_reservations": true, "can_manage_tables": true, "can_view_orders": false, "can_process_payments": false}', false, false, true),
('bartender', 'Bartender', 'Prepares drinks and manages bar area', 'Front of House', '{"can_take_orders": true, "can_manage_bar": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('barista', 'Barista', 'Prepares coffee and beverages', 'Front of House', '{"can_take_orders": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('sommelier', 'Sommelier', 'Wine specialist and service', 'Front of House', '{"can_manage_wine_list": true, "can_take_orders": true, "can_process_payments": true, "can_view_menu": true}', false, false, true),
('busser', 'Busser', 'Clears tables and assists servers', 'Front of House', '{"can_manage_tables": false, "can_view_orders": false, "can_process_payments": false}', false, false, true),
('runner', 'Runner', 'Delivers food from kitchen to tables', 'Front of House', '{"can_manage_tables": false, "can_view_orders": true, "can_process_payments": false}', false, false, true),

-- Support Staff
('cashier', 'Cashier', 'Handles payments and customer checkout', 'Support', '{"can_process_payments": true, "can_view_orders": true, "can_manage_cash_drawer": true}', false, false, true),

-- Other Staff
('delivery_driver', 'Delivery Driver', 'Delivers orders to customers', 'Other', '{"can_view_orders": true, "can_update_delivery_status": true}', false, false, false),
('cleaner', 'Cleaner', 'Maintains restaurant cleanliness', 'Other', '{}', false, false, false),
('security', 'Security', 'Ensures restaurant safety and security', 'Other', '{}', false, false, false);

-- Create staff assignments table to track which staff work at which restaurants
CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  hire_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  termination_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  hourly_rate NUMERIC(8, 2),
  salary NUMERIC(10, 2),
  schedule JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, restaurant_id, role, termination_date)
);

-- Create shifts table for staff scheduling
CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  staff_assignment_id UUID NOT NULL REFERENCES staff_assignments(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view roles" ON roles FOR SELECT USING (true);

-- RLS Policies for staff_assignments
CREATE POLICY "Users can view staff assignments for their restaurants" ON staff_assignments FOR SELECT
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

CREATE POLICY "Users can insert staff assignments for their restaurants" ON staff_assignments FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

CREATE POLICY "Users can update staff assignments for their restaurants" ON staff_assignments FOR UPDATE
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

-- RLS Policies for shifts
CREATE POLICY "Users can view shifts for their restaurants" ON shifts FOR SELECT
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

CREATE POLICY "Users can insert shifts for their restaurants" ON shifts FOR INSERT
WITH CHECK (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

CREATE POLICY "Users can update shifts for their restaurants" ON shifts FOR UPDATE
USING (
  restaurant_id IN (
    SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
  )
);

-- Sample staff assignments for existing users
INSERT INTO staff_assignments (user_id, restaurant_id, role, hourly_rate) VALUES
-- Assign existing users to restaurants with appropriate roles
((SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'owner', 0.00),
((SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'owner', 0.00),
((SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'owner', 0.00),
((SELECT id FROM users WHERE email = 'manager@restaurant.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'general_manager', 25.00),
((SELECT id FROM users WHERE email = 'cashier@restaurant.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'cashier', 15.00);

-- Create some sample staff users with different roles
-- Note: Using the same password hash for demo purposes (password: 'password123')
INSERT INTO users (email, password_hash, name, role) VALUES
-- Kitchen Staff
('chef@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Gordon Ramsay', 'head_chef'),
('souschef@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Julia Child', 'sous_chef'),
('linecook1@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Mike Smith', 'line_cook'),

-- Front of House Staff
('server1@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Sarah Johnson', 'server'),
('host1@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Emily Davis', 'host'),
('bartender1@gardenbistro.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'James Wilson', 'bartender'),

-- Sushi Paradise Staff
('sushichef@sushiparadise.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Jiro Ono', 'head_chef'),
('server2@sushiparadise.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Lisa Chen', 'server'),

-- Pizza Palace Staff
('pizzachef@pizzapalace.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Mario Pizza', 'head_chef'),
('delivery1@pizzapalace.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Tony Delivery', 'delivery_driver');

-- Assign the new staff to restaurants
INSERT INTO staff_assignments (user_id, restaurant_id, role, hourly_rate) VALUES
-- Garden Bistro Staff
((SELECT id FROM users WHERE email = 'chef@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'head_chef', 30.00),
((SELECT id FROM users WHERE email = 'souschef@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'sous_chef', 22.00),
((SELECT id FROM users WHERE email = 'linecook1@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'line_cook', 18.00),
((SELECT id FROM users WHERE email = 'server1@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'server', 12.00),
((SELECT id FROM users WHERE email = 'host1@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'host', 11.00),
((SELECT id FROM users WHERE email = 'bartender1@gardenbistro.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'bartender', 15.00),

-- Sushi Paradise Staff
((SELECT id FROM users WHERE email = 'sushichef@sushiparadise.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'head_chef', 35.00),
((SELECT id FROM users WHERE email = 'server2@sushiparadise.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'server', 13.00),

-- Pizza Palace Staff
((SELECT id FROM users WHERE email = 'pizzachef@pizzapalace.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'head_chef', 28.00),
((SELECT id FROM users WHERE email = 'delivery1@pizzapalace.com' LIMIT 1), 
 (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'delivery_driver', 16.00);

-- Create a view for easy staff management
CREATE OR REPLACE VIEW staff_directory AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.role as user_role,
  r.display_name as role_display,
  r.description as role_description,
  r.category as role_category,
  sa.restaurant_id,
  rest.name as restaurant_name,
  sa.hourly_rate,
  sa.salary,
  sa.hire_date,
  sa.is_active,
  CASE 
    WHEN r.is_management_role THEN 'Management'
    WHEN r.is_kitchen_role THEN 'Kitchen'
    WHEN r.is_front_of_house THEN 'Front of House'
    ELSE 'Other'
  END as department
FROM users u
JOIN staff_assignments sa ON u.id = sa.user_id
JOIN restaurants rest ON sa.restaurant_id = rest.id
JOIN roles r ON u.role = r.name
WHERE sa.termination_date IS NULL;

-- Create a function to get staff by restaurant and role
CREATE OR REPLACE FUNCTION get_restaurant_staff(p_restaurant_id UUID, p_role TEXT DEFAULT NULL)
RETURNS TABLE (
  staff_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  role_display TEXT,
  hourly_rate NUMERIC,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    r.display_name,
    sa.hourly_rate,
    sa.is_active
  FROM users u
  JOIN staff_assignments sa ON u.id = sa.user_id
  JOIN roles r ON u.role = r.name
  WHERE sa.restaurant_id = p_restaurant_id
    AND sa.termination_date IS NULL
    AND (p_role IS NULL OR u.role = p_role)
  ORDER BY r.is_management_role DESC, r.display_name, u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON staff_assignments TO authenticated;
GRANT SELECT ON shifts TO authenticated;
GRANT SELECT ON staff_directory TO authenticated;
GRANT EXECUTE ON FUNCTION get_restaurant_staff TO authenticated;

COMMIT;
