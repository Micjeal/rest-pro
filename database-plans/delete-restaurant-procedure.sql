-- Delete Restaurant Safely Procedure
-- This procedure safely deletes a restaurant and all its associated data
-- Uses proper cascading deletes to maintain data integrity

CREATE OR REPLACE FUNCTION delete_restaurant_safely(restaurant_uuid UUID)
RETURNS TABLE (
    deleted_restaurant BIGINT,
    deleted_menus BIGINT,
    deleted_menu_items BIGINT,
    deleted_orders BIGINT,
    deleted_order_items BIGINT,
    deleted_reservations BIGINT,
    deleted_inventory_items BIGINT
) AS $$
DECLARE
    v_deleted_restaurant BIGINT := 0;
    v_deleted_menus BIGINT := 0;
    v_deleted_menu_items BIGINT := 0;
    v_deleted_orders BIGINT := 0;
    v_deleted_order_items BIGINT := 0;
    v_deleted_reservations BIGINT := 0;
    v_deleted_inventory_items BIGINT := 0;
BEGIN
    -- Check if restaurant exists
    IF NOT EXISTS (SELECT 1 FROM restaurants WHERE id = restaurant_uuid) THEN
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Delete order items first (child records)
    DELETE FROM order_items 
    WHERE order_id IN (
        SELECT id FROM orders WHERE restaurant_id = restaurant_uuid
    );
    GET DIAGNOSTICS v_deleted_order_items = ROW_COUNT;
    
    -- Delete orders
    DELETE FROM orders WHERE restaurant_id = restaurant_uuid;
    GET DIAGNOSTICS v_deleted_orders = ROW_COUNT;
    
    -- Delete menu items first (child records)
    DELETE FROM menu_items 
    WHERE menu_id IN (
        SELECT id FROM menus WHERE restaurant_id = restaurant_uuid
    );
    GET DIAGNOSTICS v_deleted_menu_items = ROW_COUNT;
    
    -- Delete menus
    DELETE FROM menus WHERE restaurant_id = restaurant_uuid;
    GET DIAGNOSTICS v_deleted_menus = ROW_COUNT;
    
    -- Delete reservations
    DELETE FROM reservations WHERE restaurant_id = restaurant_uuid;
    GET DIAGNOSTICS v_deleted_reservations = ROW_COUNT;
    
    -- Delete inventory items
    DELETE FROM inventory WHERE restaurant_id = restaurant_uuid;
    GET DIAGNOSTICS v_deleted_inventory_items = ROW_COUNT;
    
    -- Finally delete the restaurant
    DELETE FROM restaurants WHERE id = restaurant_uuid;
    GET DIAGNOSTICS v_deleted_restaurant = ROW_COUNT;
    
    -- Return the deletion summary
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION delete_restaurant_safely(UUID) TO authenticated;

-- Test the procedure (optional)
-- SELECT * FROM delete_restaurant_safely('your-restaurant-id-here');
