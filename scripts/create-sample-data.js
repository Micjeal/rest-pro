// Create sample restaurant and data for testing
const BASE_URL = 'http://localhost:3000';

// Admin credentials
const TEST_TOKEN = Buffer.from(JSON.stringify({ userId: 'be193222-ebb2-4fa8-9026-5fc61b90ac6d', email: 'micknick168@gmail.com', role: 'admin' })).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

async function createSampleData() {
  console.log('🚀 Creating sample data for testing...\n');
  
  try {
    // Create restaurant
    console.log('📝 Creating restaurant...');
    const restaurantResponse = await fetch(`${BASE_URL}/api/restaurants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Restaurant',
        address: '123 Main St, Test City, TC 12345',
        phone: '+1 (555) 123-4567',
        email: 'test@restaurant.com',
        cuisine_type: 'American',
        description: 'A test restaurant for API verification'
      })
    });
    
    const restaurant = await restaurantResponse.json();
    console.log(`✅ Restaurant created: ${restaurant.name} (ID: ${restaurant.id})`);
    
    const restaurantId = restaurant.id;
    
    // Create menu
    console.log('\n📋 Creating menu...');
    const menuResponse = await fetch(`${BASE_URL}/api/menus`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        restaurant_id: restaurantId,
        name: 'Main Menu',
        description: 'Our delicious main menu'
      })
    });
    
    const menu = await menuResponse.json();
    console.log(`✅ Menu created: ${menu.name} (ID: ${menu.id})`);
    
    const menuId = menu.id;
    
    // Create menu items
    console.log('\n🍔 Creating menu items...');
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
      },
      {
        menu_id: menuId,
        name: 'Coca Cola',
        description: 'Refreshing cola drink',
        price: 2.99,
        category: 'Beverage',
        availability: true
      },
      {
        menu_id: menuId,
        name: 'Chocolate Cake',
        description: 'Decadent chocolate layer cake',
        price: 6.99,
        category: 'Dessert',
        availability: true
      }
    ];
    
    for (const item of menuItems) {
      const itemResponse = await fetch(`${BASE_URL}/api/menu-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item)
      });
      
      const createdItem = await itemResponse.json();
      console.log(`✅ Menu item created: ${createdItem.name} ($${createdItem.price})`);
    }
    
    // Create inventory items
    console.log('\n📦 Creating inventory items...');
    const inventoryItems = [
      {
        restaurant_id: restaurantId,
        name: 'Beef Patties',
        quantity: 50,
        unit: 'pcs',
        reorder_level: 20,
        supplier: 'Meat Supplier Inc'
      },
      {
        restaurant_id: restaurantId,
        name: 'Lettuce',
        quantity: 25,
        unit: 'lbs',
        reorder_level: 10,
        supplier: 'Fresh Produce Co'
      },
      {
        restaurant_id: restaurantId,
        name: 'Coca Cola',
        quantity: 100,
        unit: 'bottles',
        reorder_level: 30,
        supplier: 'Beverage Distributor'
      }
    ];
    
    for (const item of inventoryItems) {
      const itemResponse = await fetch(`${BASE_URL}/api/inventory`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item)
      });
      
      const createdItem = await itemResponse.json();
      console.log(`✅ Inventory item created: ${createdItem.name} (${createdItem.quantity} ${createdItem.unit})`);
    }
    
    console.log('\n🎉 Sample data creation complete!');
    console.log(`Restaurant ID: ${restaurantId}`);
    console.log(`Menu ID: ${menuId}`);
    console.log('\nYou can now test the full application with this data.');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

createSampleData();
