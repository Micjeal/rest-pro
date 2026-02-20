// Simple API testing script
// Run with: node test-apis.js

const BASE_URL = 'http://localhost:3000';

// Mock authentication token (base64 encoded JSON)
const TEST_TOKEN = Buffer.from(JSON.stringify({ userId: 'be193222-ebb2-4fa8-9026-5fc61b90ac6d', email: 'micknick168@gmail.com', role: 'admin' })).toString('base64');

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TEST_TOKEN}`
};

async function testAPI(name, url, method = 'GET', body = null) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    
    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    
    console.log(`✅ ${name}: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      if (Array.isArray(data)) {
        console.log(`   📊 Found ${data.length} items`);
      } else if (data && typeof data === 'object') {
        console.log(`   📦 Found object with keys: ${Object.keys(data).join(', ')}`);
      }
    } else {
      console.log(`   ❌ Error: ${data.error || 'Unknown error'}`);
    }
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Integration Tests...\n');
  
  const results = [];
  
  // Test restaurants API
  results.push(await testAPI('Restaurants API', '/api/restaurants'));
  
  // Test menus API (need a restaurant ID first)
  const restaurantResult = results[0];
  if (restaurantResult.success && restaurantResult.data.length > 0) {
    const restaurantId = restaurantResult.data[0].id;
    
    results.push(await testAPI('Menus API', `/api/menus?restaurantId=${restaurantId}`));
    
    // Test menu items API (need a menu ID)
    const menusResult = results[results.length - 1];
    if (menusResult.success && menusResult.data.length > 0) {
      const menuId = menusResult.data[0].id;
      results.push(await testAPI('Menu Items API', `/api/menu-items?menuId=${menuId}`));
    }
    
    // Test inventory API
    results.push(await testAPI('Inventory API', `/api/inventory?restaurantId=${restaurantId}`));
    
    // Test orders API
    results.push(await testAPI('Orders API', `/api/orders?restaurantId=${restaurantId}`));
    
    // Test analytics API
    results.push(await testAPI('Analytics API', `/api/analytics?restaurantId=${restaurantId}`));
    
    // Test settings API
    results.push(await testAPI('Settings API', `/api/settings?restaurantId=${restaurantId}`));
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`✅ Passed: ${successCount}/${totalCount}`);
  console.log(`❌ Failed: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 All API endpoints are working correctly!');
  } else {
    console.log('\n⚠️  Some API endpoints need attention.');
  }
}

runTests().catch(console.error);
