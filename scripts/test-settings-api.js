// Test script for settings API
// Run this in the browser console on the settings page

async function testSettingsAPI() {
  const token = localStorage.getItem('auth_token');
  const restaurantId = '972b16d6-d3e1-4638-8ca8-1c3f04119696'; // Use first restaurant ID
  
  if (!token) {
    console.error('No auth token found');
    return;
  }

  console.log('Testing Settings API...');
  
  // Test GET
  try {
    console.log('Testing GET /api/settings...');
    const getResponse = await fetch(`/api/settings?restaurantId=${restaurantId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (getResponse.ok) {
      const settings = await getResponse.json();
      console.log('✅ GET successful:', settings);
    } else {
      console.error('❌ GET failed:', getResponse.status, getResponse.statusText);
    }
  } catch (error) {
    console.error('❌ GET error:', error);
  }

  // Test PUT
  try {
    console.log('Testing PUT /api/settings...');
    const testSettings = {
      restaurant: {
        name: 'Test Restaurant Name',
        address: '123 Test Street',
        phone: '(555) 123-4567',
        email: 'test@restaurant.com',
        taxRate: 9.0,
        currency: 'UGX'
      },
      pos: {
        receiptHeader: 'Test Header',
        receiptFooter: 'Test Footer',
        autoPrintReceipts: true,
        showTaxBreakdown: false,
        allowDiscounts: true,
        maxDiscountPercent: 20
      },
      system: {
        backupEnabled: false,
        backupFrequency: 'weekly',
        notificationEmail: 'test@example.com',
        maintenanceMode: true,
        debugMode: false
      },
      security: {
        sessionTimeout: 60,
        requirePasswordForRefunds: false,
        requirePasswordForDiscounts: false,
        allowStaffLogin: false
      }
    };

    const putResponse = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        restaurantId: restaurantId,
        ...testSettings
      })
    });
    
    if (putResponse.ok) {
      const updatedSettings = await putResponse.json();
      console.log('✅ PUT successful:', updatedSettings);
    } else {
      console.error('❌ PUT failed:', putResponse.status, putResponse.statusText);
      const errorText = await putResponse.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ PUT error:', error);
  }
}

// Run the test
testSettingsAPI();
