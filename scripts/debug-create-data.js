// Debug script to create sample data with better error handling
const BASE_URL = 'http://localhost:3000';

// Admin credentials
const TEST_TOKEN = Buffer.from(JSON.stringify({ userId: 'be193222-ebb2-4fa8-9026-5fc61b90ac6d', email: 'micknick168@gmail.com', role: 'admin' })).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

async function debugCreateData() {
  console.log('🔍 Debug: Creating sample data with detailed logging...\n');
  
  try {
    // Step 1: Get existing restaurant
    console.log('📋 Step 1: Getting existing restaurant...');
    const restaurantsResponse = await fetch(`${BASE_URL}/api/restaurants`, { headers });
    
    if (!restaurantsResponse.ok) {
      console.error('❌ Failed to get restaurants:', restaurantsResponse.status, restaurantsResponse.statusText);
      const errorText = await restaurantsResponse.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const restaurants = await restaurantsResponse.json();
    console.log(`✅ Found ${restaurants.length} restaurants`);
    
    if (restaurants.length === 0) {
      console.error('❌ No restaurants found. Please create a restaurant first.');
      return;
    }
    
    const restaurant = restaurants[0];
    console.log(`📝 Using restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    
    const restaurantId = restaurant.id;
    
    // Step 2: Create menu
    console.log('\n📋 Step 2: Creating menu...');
    const menuData = {
      restaurant_id: restaurantId,
      name: 'Main Menu',
      description: 'Our delicious main menu'
    };
    
    console.log('Menu data:', JSON.stringify(menuData, null, 2));
    
    const menuResponse = await fetch(`${BASE_URL}/api/menus`, {
      method: 'POST',
      headers,
      body: JSON.stringify(menuData)
    });
    
    console.log(`Menu response status: ${menuResponse.status} ${menuResponse.statusText}`);
    
    if (!menuResponse.ok) {
      const errorText = await menuResponse.text();
      console.error('❌ Failed to create menu:', errorText);
      return;
    }
    
    const menu = await menuResponse.json();
    console.log(`✅ Menu created: ${menu.name} (ID: ${menu.id})`);
    
    const menuId = menu.id;
    
    // Step 3: Create menu items
    console.log('\n🍔 Step 3: Creating menu items...');
    const menuItems = [
      {
        menu_id: menuId,
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and onion',
        price: 12.99,
        category: 'Main',
        availability: true
      },
      {
        menu_id: menuId,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan and croutons',
        price: 8.99,
        category: 'Starter',
        availability: true
      }
    ];
    
    for (const item of menuItems) {
      console.log(`Creating menu item: ${item.name}`);
      const itemResponse = await fetch(`${BASE_URL}/api/menu-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item)
      });
      
      console.log(`Item response status: ${itemResponse.status} ${itemResponse.statusText}`);
      
      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`❌ Failed to create menu item ${item.name}:`, errorText);
        continue;
      }
      
      const createdItem = await itemResponse.json();
      console.log(`✅ Menu item created: ${createdItem.name} ($${createdItem.price})`);
    }
    
    // Step 4: Create inventory items
    console.log('\n📦 Step 4: Creating inventory items...');
    const inventoryItems = [
      {
        restaurant_id: restaurantId,
        item_name: 'Beef Patties',
        quantity: 50,
        unit: 'pcs',
        reorder_level: 20
      },
      {
        restaurant_id: restaurantId,
        item_name: 'Lettuce',
        quantity: 25,
        unit: 'lbs',
        reorder_level: 10
      }
    ];
    
    for (const item of inventoryItems) {
      console.log(`Creating inventory item: ${item.item_name}`);
      const itemResponse = await fetch(`${BASE_URL}/api/inventory`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item)
      });
      
      console.log(`Inventory response status: ${itemResponse.status} ${itemResponse.statusText}`);
      
      if (!itemResponse.ok) {
        const errorText = await itemResponse.text();
        console.error(`❌ Failed to create inventory item ${item.item_name}:`, errorText);
        continue;
      }
      
      const createdItem = await itemResponse.json();
      console.log(`✅ Inventory item created: ${createdItem.item_name} (${createdItem.quantity} ${createdItem.unit})`);
    }
    
    console.log('\n🎉 Debug data creation complete!');
    
  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

debugCreateData();
