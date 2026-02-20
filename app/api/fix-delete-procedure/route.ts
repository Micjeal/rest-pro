/**
 * @fileoverview Fix Delete Procedure API Route
 * Drops and recreates the delete_restaurant_safely function
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log('[Fix] Dropping and recreating delete procedure...')

    // Drop the existing function first
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: 'DROP FUNCTION IF EXISTS delete_restaurant_safely(uuid);' 
    })

    if (dropError) {
      console.log('[Fix] Function may not exist, continuing...', dropError)
    }

    // Create the new function
    const createSQL = `
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
    `

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createSQL 
    })

    if (createError) {
      console.error('[Fix] Error creating procedure:', createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    console.log('[Fix] Delete procedure fixed successfully')

    return NextResponse.json({
      message: 'Delete restaurant procedure fixed successfully',
      success: true
    })

  } catch (error) {
    console.error('[Fix] Unexpected error:', error)
    return NextResponse.json({ error: 'Failed to fix delete procedure' }, { status: 500 })
  }
}
