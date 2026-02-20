-- Test Restaurant Deletion with Cascading Deletes
-- This script verifies that deleting a restaurant removes all related data

-- 1. First, let's see what data exists before deletion
SELECT '=== RESTAURANTS BEFORE ===' as info;
SELECT id, name, email FROM restaurants;

SELECT '=== MENUS BEFORE ===' as info;
SELECT m.id, m.name, r.name as restaurant_name 
FROM menus m 
JOIN restaurants r ON m.restaurant_id = r.id;

SELECT '=== MENU ITEMS BEFORE ===' as info;
SELECT mi.id, mi.name, m.name as menu_name, r.name as restaurant_name
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id
JOIN restaurants r ON m.restaurant_id = r.id;

SELECT '=== ORDERS BEFORE ===' as info;
SELECT o.id, o.customer_name, o.total_amount, r.name as restaurant_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id;

SELECT '=== ORDER ITEMS BEFORE ===' as info;
SELECT oi.id, oi.quantity, oi.subtotal, o.customer_name, r.name as restaurant_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN restaurants r ON o.restaurant_id = r.id;

SELECT '=== RESERVATIONS BEFORE ===' as info;
SELECT res.id, res.customer_name, res.party_size, r.name as restaurant_name
FROM reservations res
JOIN restaurants r ON res.restaurant_id = r.id;

SELECT '=== INVENTORY BEFORE ===' as info;
SELECT i.id, i.item_name, i.quantity, r.name as restaurant_name
FROM inventory i
JOIN restaurants r ON i.restaurant_id = r.id;

-- 2. Delete a restaurant (this should cascade delete all related data)
-- WARNING: This will permanently delete data!
-- Uncomment the line below to actually delete a restaurant:
-- DELETE FROM restaurants WHERE name = 'Pizza Palace';

-- 3. Check what data exists after deletion (run this after the DELETE)
SELECT '=== RESTAURANTS AFTER ===' as info;
SELECT id, name, email FROM restaurants;

SELECT '=== MENUS AFTER ===' as info;
SELECT m.id, m.name, r.name as restaurant_name 
FROM menus m 
JOIN restaurants r ON m.restaurant_id = r.id;

SELECT '=== MENU ITEMS AFTER ===' as info;
SELECT mi.id, mi.name, m.name as menu_name, r.name as restaurant_name
FROM menu_items mi
JOIN menus m ON mi.menu_id = m.id
JOIN restaurants r ON m.restaurant_id = r.id;

SELECT '=== ORDERS AFTER ===' as info;
SELECT o.id, o.customer_name, o.total_amount, r.name as restaurant_name
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id;

SELECT '=== ORDER ITEMS AFTER ===' as info;
SELECT oi.id, oi.quantity, oi.subtotal, o.customer_name, r.name as restaurant_name
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN restaurants r ON o.restaurant_id = r.id;

SELECT '=== RESERVATIONS AFTER ===' as info;
SELECT res.id, res.customer_name, res.party_size, r.name as restaurant_name
FROM reservations res
JOIN restaurants r ON res.restaurant_id = r.id;

SELECT '=== INVENTORY AFTER ===' as info;
SELECT i.id, i.item_name, i.quantity, r.name as restaurant_name
FROM inventory i
JOIN restaurants r ON i.restaurant_id = r.id;
