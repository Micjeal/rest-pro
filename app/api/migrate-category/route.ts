import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    console.log('[Migration] Starting category migration...')
    
    // First, let's try to add the column using raw SQL through the Supabase SQL editor
    // For now, we'll work with existing data and set categories manually
    
    // Fetch all menu items
    const { data: menuItems, error: fetchError } = await supabase
      .from('menu_items')
      .select('*')
    
    if (fetchError) {
      console.error('Error fetching menu items:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 })
    }
    
    console.log(`[Migration] Found ${menuItems?.length || 0} menu items`)
    
    // If we don't have category column, we'll need to handle this differently
    // For now, let's check if the column exists by trying to select it
    const { data: testSelect, error: testError } = await supabase
      .from('menu_items')
      .select('id, name, category')
      .limit(1)
    
    if (testError && testError.message.includes('column "category" does not exist')) {
      console.log('[Migration] Category column does not exist. Please run this SQL in Supabase dashboard:')
      console.log('ALTER TABLE menu_items ADD COLUMN category TEXT;')
      
      return NextResponse.json({
        error: 'Category column does not exist',
        message: 'Please run this SQL in your Supabase dashboard: ALTER TABLE menu_items ADD COLUMN category TEXT;',
        requiresManualSQL: true
      }, { status: 400 })
    }
    
    // Update existing menu items with categories based on their names
    const updates = []
    
    for (const item of menuItems || []) {
      let category = 'Other'
      const name = item.name.toLowerCase()
      
      if (name.includes('salad')) category = 'Salads'
      else if (name.includes('sandwich')) category = 'Sandwiches'
      else if (name.includes('soup')) category = 'Soups'
      else if (name.includes('salmon') || name.includes('tuna')) category = 'Seafood'
      else if (name.includes('steak') || name.includes('ribeye')) category = 'Steaks'
      else if (name.includes('roll') || name.includes('sushi')) category = 'Sushi'
      else if (name.includes('pizza')) category = 'Pizza'
      
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ category })
        .eq('id', item.id)
      
      if (updateError) {
        console.error(`Error updating item ${item.id}:`, updateError)
      } else {
        updates.push({ id: item.id, name: item.name, category })
      }
    }
    
    console.log(`[Migration] Updated ${updates.length} menu items with categories`)
    
    return NextResponse.json({ 
      message: 'Category migration completed successfully',
      updatedItems: updates.length,
      items: updates
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
