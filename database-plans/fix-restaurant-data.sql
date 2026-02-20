-- Fix Restaurant and Order Foreign Key Issues
-- Run this script in your Supabase SQL Editor

-- First, let's check if users exist and create sample users if needed
INSERT INTO users (email, password_hash, name, role) 
VALUES 
  ('micknick168@gmail.com', '$2b$10$2Hb1wT3YpXkF5DZAJ6nXs.LBsJ9imwhzwpN4UHackQny3MwMyTAiO', 'Restaurant Admin', 'admin'),
  ('manager@restaurant.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Restaurant Manager', 'manager'),
  ('cashier@restaurant.com', '$2b$10$K8ZpdrjwzUWSTmtyYoNb6uj1.kNc3RQHQ3p3qNIYFvXJhBczQ1ZKa', 'Restaurant Cashier', 'cashier')
ON CONFLICT (email) DO NOTHING;

-- Create sample restaurants if they don't exist
INSERT INTO restaurants (name, address, phone, email, owner_id) 
SELECT 
  'The Garden Bistro', 
  '123 Main Street, New York, NY 10001', 
  '(555) 123-4567', 
  'info@gardenbistro.com', 
  u.id
FROM users u 
WHERE u.email = 'micknick168@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM restaurants r WHERE r.name = 'The Garden Bistro'
)
LIMIT 1;

INSERT INTO restaurants (name, address, phone, email, owner_id) 
SELECT 
  'Sushi Paradise', 
  '456 Oak Avenue, Los Angeles, CA 90001', 
  '(555) 234-5678', 
  'hello@sushiparadise.com', 
  u.id
FROM users u 
WHERE u.email = 'micknick168@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM restaurants r WHERE r.name = 'Sushi Paradise'
)
LIMIT 1;

INSERT INTO restaurants (name, address, phone, email, owner_id) 
SELECT 
  'Pizza Palace', 
  '789 Elm Street, Chicago, IL 60007', 
  '(555) 345-6789', 
  'orders@pizzapalace.com', 
  u.id
FROM users u 
WHERE u.email = 'micknick168@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM restaurants r WHERE r.name = 'Pizza Palace'
)
LIMIT 1;

-- Create sample menus for each restaurant
INSERT INTO menus (restaurant_id, name, description)
SELECT 
  r.id, 
  'Lunch Menu', 
  'Fresh and healthy lunch options'
FROM restaurants r 
WHERE r.name = 'The Garden Bistro'
AND NOT EXISTS (
  SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.name = 'Lunch Menu'
);

INSERT INTO menus (restaurant_id, name, description)
SELECT 
  r.id, 
  'Dinner Menu', 
  'Elegant dinner selections'
FROM restaurants r 
WHERE r.name = 'The Garden Bistro'
AND NOT EXISTS (
  SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.name = 'Dinner Menu'
);

INSERT INTO menus (restaurant_id, name, description)
SELECT 
  r.id, 
  'Sushi Menu', 
  'Traditional and fusion sushi'
FROM restaurants r 
WHERE r.name = 'Sushi Paradise'
AND NOT EXISTS (
  SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.name = 'Sushi Menu'
);

INSERT INTO menus (restaurant_id, name, description)
SELECT 
  r.id, 
  'Pizza Menu', 
  'Authentic Italian pizzas'
FROM restaurants r 
WHERE r.name = 'Pizza Palace'
AND NOT EXISTS (
  SELECT 1 FROM menus m WHERE m.restaurant_id = r.id AND m.name = 'Pizza Menu'
);

-- Create sample menu items
INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT 
  m.id, 
  'Caesar Salad', 
  'Crisp romaine lettuce with parmesan cheese and croutons', 
  12.99, 
  true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'The Garden Bistro' AND m.name = 'Lunch Menu'
AND NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = 'Caesar Salad' AND mi.menu_id = m.id
);

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT 
  m.id, 
  'Grilled Chicken Sandwich', 
  'Herb-marinated chicken breast with avocado', 
  14.99, 
  true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'The Garden Bistro' AND m.name = 'Lunch Menu'
AND NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = 'Grilled Chicken Sandwich' AND mi.menu_id = m.id
);

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT 
  m.id, 
  'Grilled Salmon', 
  'Atlantic salmon with lemon butter sauce', 
  24.99, 
  true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'The Garden Bistro' AND m.name = 'Dinner Menu'
AND NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = 'Grilled Salmon' AND mi.menu_id = m.id
);

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT 
  m.id, 
  'California Roll', 
  'Crab, avocado, and cucumber', 
  8.99, 
  true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Sushi Paradise' AND m.name = 'Sushi Menu'
AND NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = 'California Roll' AND mi.menu_id = m.id
);

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT 
  m.id, 
  'Margherita Pizza', 
  'Fresh mozzarella, basil, and tomato sauce', 
  12.99, 
  true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE r.name = 'Pizza Palace' AND m.name = 'Pizza Menu'
AND NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.name = 'Margherita Pizza' AND mi.menu_id = m.id
);

-- Create sample inventory items
INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level)
SELECT 
  r.id, 
  'Romaine Lettuce', 
  25, 
  'heads', 
  10
FROM restaurants r 
WHERE r.name = 'The Garden Bistro'
AND NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.restaurant_id = r.id AND i.item_name = 'Romaine Lettuce'
);

INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level)
SELECT 
  r.id, 
  'Fresh Tuna', 
  30, 
  'lbs', 
  10
FROM restaurants r 
WHERE r.name = 'Sushi Paradise'
AND NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.restaurant_id = r.id AND i.item_name = 'Fresh Tuna'
);

INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level)
SELECT 
  r.id, 
  'Mozzarella Cheese', 
  60, 
  'lbs', 
  20
FROM restaurants r 
WHERE r.name = 'Pizza Palace'
AND NOT EXISTS (
  SELECT 1 FROM inventory i WHERE i.restaurant_id = r.id AND i.item_name = 'Mozzarella Cheese'
);

-- Verify data was created
SELECT 'Restaurants Created:' as status, COUNT(*) as count FROM restaurants;
SELECT 'Menus Created:' as status, COUNT(*) as count FROM menus;
SELECT 'Menu Items Created:' as status, COUNT(*) as count FROM menu_items;
SELECT 'Inventory Items Created:' as status, COUNT(*) as count FROM inventory;

-- Show restaurant IDs for reference
SELECT 
  'Restaurant IDs (use these for testing):' as info,
  id,
  name,
  email
FROM restaurants;

-- Enable RLS policies if they were disabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create/update RLS policies for restaurants to allow authenticated users to see their own restaurants
CREATE POLICY "Users can view their own restaurants" ON restaurants
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own restaurants" ON restaurants
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own restaurants" ON restaurants
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own restaurants" ON restaurants
  FOR DELETE USING (owner_id = auth.uid());

-- Create/update RLS policies for orders
CREATE POLICY "Users can view orders for their restaurants" ON orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert orders for their restaurants" ON orders
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update orders for their restaurants" ON orders
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete orders for their restaurants" ON orders
  FOR DELETE USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

COMMIT;
