-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'chef')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menus table
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  availability BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  party_size INTEGER NOT NULL,
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT,
  reorder_level INTEGER DEFAULT 10,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (users can only see/update their own profile)
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::UUID);

-- RLS Policies for restaurants (owner can only see their own)
CREATE POLICY "Users can view their own restaurants"
  ON restaurants FOR SELECT
  USING (owner_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can insert their own restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (owner_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can update their own restaurants"
  ON restaurants FOR UPDATE
  USING (owner_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY "Users can delete their own restaurants"
  ON restaurants FOR DELETE
  USING (owner_id = current_setting('app.current_user_id', true)::UUID);

-- RLS Policies for menus
CREATE POLICY "Users can view menus of their restaurants"
  ON menus FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can insert menus for their restaurants"
  ON menus FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can update menus of their restaurants"
  ON menus FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can delete menus of their restaurants"
  ON menus FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- RLS Policies for menu_items
CREATE POLICY "Users can view menu items of their restaurants"
  ON menu_items FOR SELECT
  USING (
    menu_id IN (
      SELECT id FROM menus WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

CREATE POLICY "Users can insert menu items for their restaurants"
  ON menu_items FOR INSERT
  WITH CHECK (
    menu_id IN (
      SELECT id FROM menus WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

CREATE POLICY "Users can update menu items of their restaurants"
  ON menu_items FOR UPDATE
  USING (
    menu_id IN (
      SELECT id FROM menus WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

CREATE POLICY "Users can delete menu items of their restaurants"
  ON menu_items FOR DELETE
  USING (
    menu_id IN (
      SELECT id FROM menus WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

-- RLS Policies for orders
CREATE POLICY "Users can view orders of their restaurants"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can insert orders for their restaurants"
  ON orders FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can update orders of their restaurants"
  ON orders FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view order items of their restaurants"
  ON order_items FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

CREATE POLICY "Users can insert order items for their restaurants"
  ON order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

-- RLS Policies for reservations
CREATE POLICY "Users can view reservations of their restaurants"
  ON reservations FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can insert reservations for their restaurants"
  ON reservations FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can update reservations of their restaurants"
  ON reservations FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- RLS Policies for inventory
CREATE POLICY "Users can view inventory of their restaurants"
  ON inventory FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can insert inventory for their restaurants"
  ON inventory FOR INSERT
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

CREATE POLICY "Users can update inventory of their restaurants"
  ON inventory FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- Sample Data Insertions
-- Insert sample users first
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@restaurant.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Restaurant Admin', 'admin'),
('manager@restaurant.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Restaurant Manager', 'manager'),
('cashier@restaurant.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Restaurant Cashier', 'cashier');

-- Insert sample restaurants
INSERT INTO restaurants (name, address, phone, email, owner_id) VALUES
('The Garden Bistro', '123 Main Street, New York, NY 10001', '(555) 123-4567', 'info@gardenbistro.com', (SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1)),
('Sushi Paradise', '456 Oak Avenue, Los Angeles, CA 90001', '(555) 234-5678', 'hello@sushiparadise.com', (SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1)),
('Pizza Palace', '789 Elm Street, Chicago, IL 60007', '(555) 345-6789', 'orders@pizzapalace.com', (SELECT id FROM users WHERE email = 'admin@restaurant.com' LIMIT 1));

-- Insert sample menus
INSERT INTO menus (restaurant_id, name, description) VALUES
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Lunch Menu', 'Fresh and healthy lunch options'),
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Dinner Menu', 'Elegant dinner selections'),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Sushi Menu', 'Traditional and fusion sushi'),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Pizza Menu', 'Authentic Italian pizzas');

-- Insert sample menu items
INSERT INTO menu_items (menu_id, name, description, price, availability) VALUES
-- Garden Bistro Lunch
((SELECT id FROM menus WHERE name = 'Lunch Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1) LIMIT 1), 'Caesar Salad', 'Crisp romaine lettuce with parmesan cheese and croutons', 12.99, true),
((SELECT id FROM menus WHERE name = 'Lunch Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1) LIMIT 1), 'Grilled Chicken Sandwich', 'Herb-marinated chicken breast with avocado', 14.99, true),
((SELECT id FROM menus WHERE name = 'Lunch Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1) LIMIT 1), 'Tomato Soup', 'Creamy tomato basil soup with croutons', 8.99, true),
-- Garden Bistro Dinner
((SELECT id FROM menus WHERE name = 'Dinner Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1) LIMIT 1), 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce', 24.99, true),
((SELECT id FROM menus WHERE name = 'Dinner Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1) LIMIT 1), 'Ribeye Steak', '12oz ribeye with roasted vegetables', 32.99, true),
-- Sushi Paradise
((SELECT id FROM menus WHERE name = 'Sushi Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1) LIMIT 1), 'California Roll', 'Crab, avocado, and cucumber', 8.99, true),
((SELECT id FROM menus WHERE name = 'Sushi Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1) LIMIT 1), 'Spicy Tuna Roll', 'Fresh tuna with spicy mayo', 10.99, true),
((SELECT id FROM menus WHERE name = 'Sushi Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1) LIMIT 1), 'Dragon Roll', 'Eel, cucumber, and avocado with tobiko', 14.99, true),
-- Pizza Palace
((SELECT id FROM menus WHERE name = 'Pizza Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1) LIMIT 1), 'Margherita Pizza', 'Fresh mozzarella, basil, and tomato sauce', 12.99, true),
((SELECT id FROM menus WHERE name = 'Pizza Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1) LIMIT 1), 'Pepperoni Pizza', 'Classic pepperoni with mozzarella', 14.99, true),
((SELECT id FROM menus WHERE name = 'Pizza Menu' AND restaurant_id = (SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1) LIMIT 1), 'Vegetarian Pizza', 'Bell peppers, mushrooms, onions, and olives', 13.99, true);

-- Insert sample orders
INSERT INTO orders (restaurant_id, customer_name, customer_phone, customer_email, status, total_amount, notes) VALUES
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'John Smith', '(555) 111-2222', 'john.smith@email.com', 'completed', 27.98, 'No onions please'),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Emily Johnson', '(555) 333-4444', 'emily.j@email.com', 'confirmed', 24.97, 'Extra wasabi'),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Michael Brown', '(555) 555-6666', 'michael.b@email.com', 'preparing', 27.98, 'Well done crust');

-- Insert sample order items
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) VALUES
-- John Smith's order (Garden Bistro)
((SELECT id FROM orders WHERE customer_name = 'John Smith' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Caesar Salad' LIMIT 1), 1, 12.99, 12.99),
((SELECT id FROM orders WHERE customer_name = 'John Smith' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Grilled Chicken Sandwich' LIMIT 1), 1, 14.99, 14.99),
-- Emily Johnson's order (Sushi Paradise)
((SELECT id FROM orders WHERE customer_name = 'Emily Johnson' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'California Roll' LIMIT 1), 1, 8.99, 8.99),
((SELECT id FROM orders WHERE customer_name = 'Emily Johnson' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Spicy Tuna Roll' LIMIT 1), 1, 10.99, 10.99),
((SELECT id FROM orders WHERE customer_name = 'Emily Johnson' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Dragon Roll' LIMIT 1), 1, 14.99, 14.99),
-- Michael Brown's order (Pizza Palace)
((SELECT id FROM orders WHERE customer_name = 'Michael Brown' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Margherita Pizza' LIMIT 1), 1, 12.99, 12.99),
((SELECT id FROM orders WHERE customer_name = 'Michael Brown' LIMIT 1), 
 (SELECT id FROM menu_items WHERE name = 'Pepperoni Pizza' LIMIT 1), 1, 14.99, 14.99);

-- Insert sample reservations
INSERT INTO reservations (restaurant_id, customer_name, customer_phone, customer_email, party_size, reservation_date, status, notes) VALUES
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Sarah Davis', '(555) 777-8888', 'sarah.d@email.com', 4, '2026-02-20 19:00:00+00', 'confirmed', 'Anniversary dinner'),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Robert Wilson', '(555) 999-0000', 'robert.w@email.com', 2, '2026-02-21 20:30:00+00', 'confirmed', 'Window seat preferred'),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Lisa Anderson', '(555) 222-3333', 'lisa.a@email.com', 6, '2026-02-22 18:00:00+00', 'confirmed', 'Birthday party - kids friendly table');

-- Insert sample inventory items
INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level) VALUES
-- Garden Bistro inventory
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Romaine Lettuce', 25, 'heads', 10),
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Chicken Breast', 40, 'lbs', 15),
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Salmon Fillet', 20, 'lbs', 8),
((SELECT id FROM restaurants WHERE name = 'The Garden Bistro' LIMIT 1), 'Olive Oil', 5, 'gallons', 2),
-- Sushi Paradise inventory
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Fresh Tuna', 30, 'lbs', 10),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Rice', 50, 'lbs', 20),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Nori Sheets', 200, 'sheets', 50),
((SELECT id FROM restaurants WHERE name = 'Sushi Paradise' LIMIT 1), 'Wasabi', 10, 'tubes', 3),
-- Pizza Palace inventory
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Mozzarella Cheese', 60, 'lbs', 20),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Pizza Dough', 100, 'units', 30),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Tomato Sauce', 15, 'gallons', 5),
((SELECT id FROM restaurants WHERE name = 'Pizza Palace' LIMIT 1), 'Pepperoni', 25, 'lbs', 8);
