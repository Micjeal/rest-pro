-- Complete Sample Data for All Restaurant Tables
-- This script populates all tables with realistic test data
-- Ensures proper foreign key relationships

-- First, get the user ID for micknick168@gmail.com
DO $$
DECLARE
    user_uuid UUID;
    restaurant1_uuid UUID;
    restaurant2_uuid UUID;
    restaurant3_uuid UUID;
    menu1_uuid UUID;
    menu2_uuid UUID;
    menu3_uuid UUID;
    menu4_uuid UUID;
BEGIN
    -- Get user ID
    SELECT id INTO user_uuid FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User micknick168@gmail.com not found';
    END IF;
    
    -- Insert restaurants
    INSERT INTO restaurants (name, address, phone, email, owner_id) VALUES
    ('Demo Restaurant 1', '123 Main Street, New York, NY 10001', '(555) 123-4567', 'demo1@restaurant.com', user_uuid),
    ('Demo Restaurant 2', '456 Oak Avenue, Los Angeles, CA 90001', '(555) 234-5678', 'demo2@restaurant.com', user_uuid),
    ('Test Cafe', '789 Elm Street, Chicago, IL 60007', '(555) 345-6789', 'test@cafe.com', user_uuid);
    
    -- Get the restaurant IDs that were just inserted
    SELECT id INTO restaurant1_uuid FROM restaurants WHERE name = 'Demo Restaurant 1' AND owner_id = user_uuid LIMIT 1;
    SELECT id INTO restaurant2_uuid FROM restaurants WHERE name = 'Demo Restaurant 2' AND owner_id = user_uuid LIMIT 1;
    SELECT id INTO restaurant3_uuid FROM restaurants WHERE name = 'Test Cafe' AND owner_id = user_uuid LIMIT 1;
    
    -- Insert menus for each restaurant
    -- Restaurant 1 Menus
    INSERT INTO menus (restaurant_id, name, description) VALUES
    (restaurant1_uuid, 'Lunch Menu', 'Fresh and healthy lunch options'),
    (restaurant1_uuid, 'Dinner Menu', 'Elegant dinner selections');
    
    -- Get the menu IDs that were just inserted
    SELECT id INTO menu1_uuid FROM menus WHERE name = 'Lunch Menu' AND restaurant_id = restaurant1_uuid LIMIT 1;
    SELECT id INTO menu2_uuid FROM menus WHERE name = 'Dinner Menu' AND restaurant_id = restaurant1_uuid LIMIT 1;
    
    -- Restaurant 2 Menus
    INSERT INTO menus (restaurant_id, name, description) VALUES
    (restaurant2_uuid, 'Sushi Menu', 'Traditional and fusion sushi'),
    (restaurant2_uuid, 'Drinks Menu', 'Beverages and cocktails');
    
    -- Get the menu IDs for restaurant 2
    SELECT id INTO menu3_uuid FROM menus WHERE name = 'Sushi Menu' AND restaurant_id = restaurant2_uuid LIMIT 1;
    
    -- Restaurant 3 Menus
    INSERT INTO menus (restaurant_id, name, description) VALUES
    (restaurant3_uuid, 'Pizza Menu', 'Authentic Italian pizzas');
    
    -- Get the menu ID for restaurant 3
    SELECT id INTO menu4_uuid FROM menus WHERE name = 'Pizza Menu' AND restaurant_id = restaurant3_uuid LIMIT 1;
    
    -- Insert menu items for each menu
    -- Restaurant 1 - Lunch Menu
    INSERT INTO menu_items (menu_id, name, description, price, availability) VALUES
    (menu1_uuid, 'Caesar Salad', 'Crisp romaine lettuce with parmesan cheese and croutons', 12.99, true),
    (menu1_uuid, 'Grilled Chicken Sandwich', 'Herb-marinated chicken breast with avocado', 14.99, true),
    (menu1_uuid, 'Tomato Soup', 'Creamy tomato basil soup with croutons', 8.99, true),
    (menu1_uuid, 'Club Sandwich', 'Turkey, bacon, lettuce, tomato on toasted bread', 13.99, true);
    
    -- Restaurant 1 - Dinner Menu
    INSERT INTO menu_items (menu_id, name, description, price, availability) VALUES
    (menu2_uuid, 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce', 24.99, true),
    (menu2_uuid, 'Ribeye Steak', '12oz ribeye with roasted vegetables', 32.99, true),
    (menu2_uuid, 'Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 18.99, true),
    (menu2_uuid, 'Chocolate Cake', 'Rich chocolate cake with raspberry sauce', 9.99, true);
    
    -- Restaurant 2 - Sushi Menu
    INSERT INTO menu_items (menu_id, name, description, price, availability) VALUES
    (menu3_uuid, 'California Roll', 'Crab, avocado, and cucumber', 8.99, true),
    (menu3_uuid, 'Spicy Tuna Roll', 'Fresh tuna with spicy mayo', 10.99, true),
    (menu3_uuid, 'Dragon Roll', 'Eel, cucumber, and avocado with tobiko', 14.99, true),
    (menu3_uuid, 'Tempura Uramaki', 'Crispy tempura rolls with assorted fillings', 12.99, true);
    
    -- Restaurant 3 - Pizza Menu
    INSERT INTO menu_items (menu_id, name, description, price, availability) VALUES
    (menu4_uuid, 'Margherita Pizza', 'Fresh mozzarella, basil, and tomato sauce', 12.99, true),
    (menu4_uuid, 'Pepperoni Pizza', 'Classic pepperoni with mozzarella', 14.99, true),
    (menu4_uuid, 'Vegetarian Pizza', 'Bell peppers, mushrooms, onions, and olives', 13.99, true),
    (menu4_uuid, 'Quattro Stagioni', 'Four seasons pizza with assorted toppings', 16.99, true);
    
    -- Insert sample orders
    INSERT INTO orders (restaurant_id, customer_name, customer_phone, customer_email, status, total_amount, notes) VALUES
    (restaurant1_uuid, 'John Smith', '(555) 111-2222', 'john.smith@email.com', 'completed', 27.98, 'No onions please'),
    (restaurant1_uuid, 'Emily Johnson', '(555) 333-4444', 'emily.j@email.com', 'confirmed', 24.97, 'Extra wasabi'),
    (restaurant2_uuid, 'Michael Brown', '(555) 555-6666', 'michael.b@email.com', 'preparing', 34.97, 'Spicy level: medium'),
    (restaurant3_uuid, 'Sarah Davis', '(555) 777-8888', 'sarah.d@email.com', 'pending', 27.98, 'Well done crust');
    
    -- Insert order items
    INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal) 
    SELECT 
        o.id as order_id,
        mi.id as menu_item_id,
        CASE 
            WHEN mi.name LIKE '%Salad%' THEN 1
            WHEN mi.name LIKE '%Sandwich%' THEN 1
            WHEN mi.name LIKE '%Soup%' THEN 1
            ELSE 2
        END as quantity,
        mi.price as unit_price,
        CASE 
            WHEN mi.name LIKE '%Salad%' THEN mi.price * 1
            WHEN mi.name LIKE '%Sandwich%' THEN mi.price * 1
            WHEN mi.name LIKE '%Soup%' THEN mi.price * 1
            ELSE mi.price * 2
        END as subtotal
    FROM orders o
    JOIN menu_items mi ON (
        (o.restaurant_id = restaurant1_uuid AND mi.name IN ('Caesar Salad', 'Grilled Chicken Sandwich', 'Tomato Soup')) OR
        (o.restaurant_id = restaurant2_uuid AND mi.name IN ('California Roll', 'Spicy Tuna Roll')) OR
        (o.restaurant_id = restaurant3_uuid AND mi.name IN ('Margherita Pizza', 'Pepperoni Pizza'))
    )
    WHERE o.customer_name IN ('John Smith', 'Emily Johnson', 'Michael Brown');
    
    -- Insert reservations
    INSERT INTO reservations (restaurant_id, customer_name, customer_phone, customer_email, party_size, reservation_date, status, notes) VALUES
    (restaurant1_uuid, 'Robert Wilson', '(555) 999-0000', 'robert.w@email.com', 2, '2026-02-20 19:00:00+00', 'confirmed', 'Anniversary dinner'),
    (restaurant1_uuid, 'Lisa Anderson', '(555) 222-3333', 'lisa.a@email.com', 4, '2026-02-21 20:30:00+00', 'confirmed', 'Birthday party'),
    (restaurant2_uuid, 'David Martinez', '(555) 444-5555', 'david.m@email.com', 3, '2026-02-22 18:00:00+00', 'confirmed', 'Window seat preferred'),
    (restaurant3_uuid, 'Jennifer Taylor', '(555) 666-7777', 'jennifer.t@email.com', 6, '2026-02-23 19:30:00+00', 'confirmed', 'Kids friendly table');
    
    -- Insert inventory items for each restaurant
    -- Restaurant 1 Inventory
    INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level) VALUES
    (restaurant1_uuid, 'Romaine Lettuce', 25, 'heads', 10),
    (restaurant1_uuid, 'Chicken Breast', 40, 'lbs', 15),
    (restaurant1_uuid, 'Salmon Fillet', 20, 'lbs', 8),
    (restaurant1_uuid, 'Olive Oil', 5, 'gallons', 2),
    (restaurant1_uuid, 'Bread', 30, 'loaves', 10);
    
    -- Restaurant 2 Inventory
    INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level) VALUES
    (restaurant2_uuid, 'Fresh Tuna', 30, 'lbs', 10),
    (restaurant2_uuid, 'Rice', 50, 'lbs', 20),
    (restaurant2_uuid, 'Nori Sheets', 200, 'sheets', 50),
    (restaurant2_uuid, 'Wasabi', 10, 'tubes', 3),
    (restaurant2_uuid, 'Soy Sauce', 15, 'bottles', 5);
    
    -- Restaurant 3 Inventory
    INSERT INTO inventory (restaurant_id, item_name, quantity, unit, reorder_level) VALUES
    (restaurant3_uuid, 'Mozzarella Cheese', 60, 'lbs', 20),
    (restaurant3_uuid, 'Pizza Dough', 100, 'units', 30),
    (restaurant3_uuid, 'Tomato Sauce', 15, 'gallons', 5),
    (restaurant3_uuid, 'Pepperoni', 25, 'lbs', 8),
    (restaurant3_uuid, 'Pizza Flour', 80, 'lbs', 25);
    
    RAISE NOTICE 'Complete sample data added for user %', user_uuid;
END $$;

-- Verification queries
SELECT '=== SAMPLE DATA VERIFICATION ===' as status;
SELECT 'Users:' as table_info, COUNT(*) as count FROM users WHERE email = 'micknick168@gmail.com';
SELECT 'Restaurants:' as table_info, COUNT(*) as count FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com');
SELECT 'Menus:' as table_info, COUNT(*) as count FROM menus WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com'));
SELECT 'Menu Items:' as table_info, COUNT(*) as count FROM menu_items WHERE menu_id IN (SELECT id FROM menus WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com')));
SELECT 'Orders:' as table_info, COUNT(*) as count FROM orders WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com'));
SELECT 'Reservations:' as table_info, COUNT(*) as count FROM reservations WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com'));
SELECT 'Inventory Items:' as table_info, COUNT(*) as count FROM inventory WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com'));

SELECT 'Sample data setup completed!' as final_status;
