-- Populate Inventory with Menu Items
-- This script creates inventory items based on existing menu items
-- Links inventory to menu items for better stock management

-- First, let's see what menu items we have
SELECT 'Starting inventory population...' as status;

-- Insert inventory items based on existing menu items
-- Each menu item becomes an inventory item with initial stock
INSERT INTO inventory (
    restaurant_id,
    item_name,
    quantity,
    unit,
    reorder_level,
    last_updated
)
SELECT 
    m.restaurant_id,
    mi.name as item_name,
    CASE 
        WHEN mi.price < 10 THEN 100  -- High stock for cheap items
        WHEN mi.price < 20 THEN 50   -- Medium stock for mid-range items
        WHEN mi.price < 50 THEN 25   -- Lower stock for expensive items
        ELSE 10  -- Low stock for very expensive items
    END as quantity,
    CASE 
        WHEN mi.name LIKE '%Salad%' OR mi.name LIKE '%Drink%' OR mi.name LIKE '%Juice%' THEN 'pieces'
        WHEN mi.name LIKE '%Chicken%' OR mi.name LIKE '%Beef%' OR mi.name LIKE '%Steak%' THEN 'kg'
        WHEN mi.name LIKE '%Rice%' OR mi.name LIKE '%Pasta%' THEN 'kg'
        WHEN mi.name LIKE '%Bread%' OR mi.name LIKE '%Sandwich%' THEN 'pieces'
        ELSE 'units' 
    END as unit,
    CASE 
        WHEN mi.price < 10 THEN 20   -- Reorder when stock drops to 20
        WHEN mi.price < 20 THEN 10   -- Reorder when stock drops to 10
        WHEN mi.price < 50 THEN 5    -- Reorder when stock drops to 5
        ELSE 2    -- Reorder when stock drops to 2
    END as reorder_level,
    CURRENT_TIMESTAMP as last_updated
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id  -- Fixed: Join through menus to get restaurant_id
WHERE mi.availability = true;

-- Add some specific inventory items with manual stock levels
INSERT INTO inventory (
    restaurant_id,
    item_name,
    quantity,
    unit,
    reorder_level,
    last_updated
)
SELECT 
    m.restaurant_id,
    'Tomatoes' as item_name,
    50 as quantity,
    'kg' as unit,
    10 as reorder_level,
    CURRENT_TIMESTAMP as last_updated
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id  -- Fixed: Join through menus to get restaurant_id
WHERE mi.name = 'Caesar Salad' AND mi.availability = true;

INSERT INTO inventory (
    restaurant_id,
    item_name,
    quantity,
    unit,
    reorder_level,
    last_updated
)
SELECT 
    m.restaurant_id,
    'Lettuce' as item_name,
    30 as quantity,
    'kg' as unit,
    8 as reorder_level,
    CURRENT_TIMESTAMP as last_updated
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id  -- Fixed: Join through menus to get restaurant_id
WHERE mi.name = 'Caesar Salad' AND mi.availability = true;

INSERT INTO inventory (
    restaurant_id,
    item_name,
    quantity,
    unit,
    reorder_level,
    last_updated
)
SELECT 
    m.restaurant_id,
    'Chicken Breast' as item_name,
    25 as quantity,
    'kg' as unit,
    15 as reorder_level,
    CURRENT_TIMESTAMP as last_updated
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id  -- Fixed: Join through menus to get restaurant_id
WHERE mi.name = 'Grilled Chicken' AND mi.availability = true;

INSERT INTO inventory (
    restaurant_id,
    item_name,
    quantity,
    unit,
    reorder_level,
    last_updated
)
SELECT 
    m.restaurant_id,
    'Ribeye Steak' as item_name,
    15 as quantity,
    'kg' as unit,
    8 as reorder_level,
    CURRENT_TIMESTAMP as last_updated
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id  -- Fixed: Join through menus to get restaurant_id
WHERE mi.name = 'Steak' AND mi.availability = true;

-- Show summary of what was created
SELECT 
    'Inventory population completed!' as status,
    COUNT(*) as items_created,
    COUNT(DISTINCT restaurant_id) as restaurants_updated
FROM inventory;

-- Optional: Create a view to show inventory with menu item details
CREATE OR REPLACE VIEW inventory_menu_items AS
SELECT 
    i.id as inventory_id,
    i.item_name,
    i.quantity,
    i.unit,
    i.reorder_level,
    i.last_updated,
    mi.id as menu_item_id,
    mi.name as menu_item_name,
    mi.description as menu_item_description,
    mi.price as menu_item_price,
    mi.availability as menu_item_availability,
    m.name as menu_name,
    r.name as restaurant_name
FROM inventory i
LEFT JOIN menu_items mi ON i.item_name = mi.name
LEFT JOIN menus m ON mi.menu_id = m.id
LEFT JOIN restaurants r ON m.restaurant_id = r.id;
