-- Simple Table Verification Script
-- Check what's actually in each table for debugging

SELECT '=== USERS TABLE ===' as table_name;
SELECT id, email, name, role, created_at FROM users ORDER BY created_at;

SELECT '=== RESTAURANTS TABLE ===' as table_name;
SELECT id, name, address, phone, email, owner_id, created_at FROM restaurants ORDER BY created_at;

SELECT '=== MENUS TABLE ===' as table_name;
SELECT id, restaurant_id, name, created_at FROM menus ORDER BY created_at;

SELECT '=== MENU ITEMS TABLE ===' as table_name;
SELECT id, menu_id, name, price, availability FROM menu_items ORDER BY created_at;

SELECT '=== ORDERS TABLE ===' as table_name;
SELECT id, restaurant_id, customer_name, total_amount, status, created_at FROM orders ORDER BY created_at;

SELECT '=== RESERVATIONS TABLE ===' as table_name;
SELECT id, restaurant_id, customer_name, party_size, reservation_date, status FROM reservations ORDER BY created_at;

SELECT '=== INVENTORY TABLE ===' as table_name;
SELECT id, restaurant_id, item_name, quantity, unit FROM inventory ORDER BY last_updated;

-- Check relationships
SELECT '=== RESTAURANT COUNTS BY USER ===' as table_name;
SELECT 
    u.email as user_email,
    COUNT(r.id) as restaurant_count
FROM users u
LEFT JOIN restaurants r ON u.id = r.owner_id
GROUP BY u.id, u.email;
