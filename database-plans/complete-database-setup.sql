-- Complete Database Setup for Restaurant Management System
-- Run this script to set up all necessary functions and policies

-- 1. Create user context function for RLS
CREATE OR REPLACE FUNCTION set_user_id(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_user_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_id(UUID) TO service_role;

-- 2. Add Missing DELETE Policies for RLS
-- These policies ensure users can delete data within their restaurant scope

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can delete orders of their restaurants" ON orders;
DROP POLICY IF EXISTS "Users can delete order items of their restaurants" ON order_items;
DROP POLICY IF EXISTS "Users can delete reservations of their restaurants" ON reservations;
DROP POLICY IF EXISTS "Users can delete inventory of their restaurants" ON inventory;

-- RLS Policies for orders (missing delete policy)
CREATE POLICY "Users can delete orders of their restaurants"
  ON orders FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- RLS Policies for order_items (missing delete policy)
CREATE POLICY "Users can delete order items of their restaurants"
  ON order_items FOR DELETE
  USING (
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
      )
    )
  );

-- RLS Policies for reservations (missing delete policy)
CREATE POLICY "Users can delete reservations of their restaurants"
  ON reservations FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- RLS Policies for inventory (missing delete policy)
CREATE POLICY "Users can delete inventory of their restaurants"
  ON inventory FOR DELETE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- 3. Create safe restaurant deletion function
CREATE OR REPLACE FUNCTION delete_restaurant_safely(restaurant_uuid UUID)
RETURNS TABLE(
  deleted_restaurant BOOLEAN,
  deleted_menus INTEGER,
  deleted_menu_items INTEGER,
  deleted_orders INTEGER,
  deleted_order_items INTEGER,
  deleted_reservations INTEGER,
  deleted_inventory_items INTEGER
) AS $$
DECLARE
  menu_count INTEGER;
  menu_item_count INTEGER;
  order_count INTEGER;
  order_item_count INTEGER;
  reservation_count INTEGER;
  inventory_count INTEGER;
BEGIN
  -- Check if restaurant exists and belongs to current user
  IF NOT EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = restaurant_uuid 
    AND owner_id = current_setting('app.current_user_id', true)::UUID
  ) THEN
    RAISE EXCEPTION 'Restaurant not found or access denied';
  END IF;
  
  -- Count what will be deleted (for logging/confirmation)
  SELECT COUNT(*) INTO menu_count FROM menus WHERE restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO menu_item_count FROM menu_items mi 
  JOIN menus m ON mi.menu_id = m.id WHERE m.restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO order_count FROM orders WHERE restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO order_item_count FROM order_items oi 
  JOIN orders o ON oi.order_id = o.id WHERE o.restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO reservation_count FROM reservations WHERE restaurant_id = restaurant_uuid;
  SELECT COUNT(*) INTO inventory_count FROM inventory WHERE restaurant_id = restaurant_uuid;
  
  -- Delete the restaurant (cascading will handle the rest)
  DELETE FROM restaurants WHERE id = restaurant_uuid;
  
  -- Return results
  RETURN QUERY SELECT 
    true as deleted_restaurant,
    menu_count as deleted_menus,
    menu_item_count as deleted_menu_items,
    order_count as deleted_orders,
    order_item_count as deleted_order_items,
    reservation_count as deleted_reservations,
    inventory_count as deleted_inventory_items;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create deletion summary function
CREATE OR REPLACE FUNCTION get_restaurant_deletion_summary(restaurant_uuid UUID)
RETURNS TABLE(
  restaurant_name TEXT,
  menus_count INTEGER,
  menu_items_count INTEGER,
  orders_count INTEGER,
  order_items_count INTEGER,
  reservations_count INTEGER,
  inventory_items_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.name as restaurant_name,
    (SELECT COUNT(*) FROM menus WHERE restaurant_id = restaurant_uuid) as menus_count,
    (SELECT COUNT(*) FROM menu_items mi 
     JOIN menus m ON mi.menu_id = m.id WHERE m.restaurant_id = restaurant_uuid) as menu_items_count,
    (SELECT COUNT(*) FROM orders WHERE restaurant_id = restaurant_uuid) as orders_count,
    (SELECT COUNT(*) FROM order_items oi 
     JOIN orders o ON oi.order_id = o.id WHERE o.restaurant_id = restaurant_uuid) as order_items_count,
    (SELECT COUNT(*) FROM reservations WHERE restaurant_id = restaurant_uuid) as reservations_count,
    (SELECT COUNT(*) FROM inventory WHERE restaurant_id = restaurant_uuid) as inventory_items_count
  FROM restaurants r 
  WHERE r.id = restaurant_uuid 
  AND r.owner_id = current_setting('app.current_user_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for the new functions
GRANT EXECUTE ON FUNCTION delete_restaurant_safely(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_restaurant_safely(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_restaurant_deletion_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_restaurant_deletion_summary(UUID) TO service_role;

-- 5. Verify setup
SELECT 'Database setup completed successfully!' as status,
       'Functions and policies created' as description;
