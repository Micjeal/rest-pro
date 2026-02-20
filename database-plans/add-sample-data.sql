-- Add Sample Restaurants for micknick168@gmail.com User
-- This script creates test restaurants for the current admin user

-- First, get the user ID for micknick168@gmail.com
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User micknick168@gmail.com not found';
    END IF;
    
    -- Insert sample restaurants
    INSERT INTO restaurants (name, address, phone, email, owner_id) VALUES
    ('Demo Restaurant 1', '123 Main Street, New York, NY 10001', '(555) 123-4567', 'demo1@restaurant.com', user_uuid),
    ('Demo Restaurant 2', '456 Oak Avenue, Los Angeles, CA 90001', '(555) 234-5678', 'demo2@restaurant.com', user_uuid),
    ('Test Cafe', '789 Elm Street, Chicago, IL 60007', '(555) 345-6789', 'test@cafe.com', user_uuid)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample restaurants added for user %', user_uuid;
END $$;

-- Verify the restaurants were added
SELECT 'Restaurants added for micknick168@gmail.com:' as info;
SELECT id, name, address, phone, email, owner_id FROM restaurants 
WHERE owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1);

-- Add sample menus for the first restaurant
INSERT INTO menus (restaurant_id, name, description) 
SELECT id, 'Lunch Menu', 'Fresh and healthy lunch options'
FROM restaurants 
WHERE name = 'Demo Restaurant 1' 
AND owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO menus (restaurant_id, name, description) 
SELECT id, 'Dinner Menu', 'Elegant dinner selections'
FROM restaurants 
WHERE name = 'Demo Restaurant 1' 
AND owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add some sample menu items
INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT m.id, 'Caesar Salad', 'Crisp romaine lettuce with parmesan', 12.99, true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE m.name = 'Lunch Menu' 
AND r.name = 'Demo Restaurant 1'
AND r.owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT m.id, 'Grilled Chicken', 'Herb-marinated chicken breast', 14.99, true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE m.name = 'Lunch Menu' 
AND r.name = 'Demo Restaurant 1'
AND r.owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, name, description, price, availability)
SELECT m.id, 'Steak', '12oz ribeye with vegetables', 28.99, true
FROM menus m
JOIN restaurants r ON m.restaurant_id = r.id
WHERE m.name = 'Dinner Menu' 
AND r.name = 'Demo Restaurant 1'
AND r.owner_id = (SELECT id FROM users WHERE email = 'micknick168@gmail.com' LIMIT 1)
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT 'Sample data setup completed!' as status;
