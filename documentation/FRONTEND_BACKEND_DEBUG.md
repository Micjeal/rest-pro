# 🔍 Frontend-Backend Data Mismatch Debugging Guide

## **Problem:**
Frontend is showing different data than what's in the database.

## **🔍 Root Cause Analysis:**

### **1. User Data Mismatch**
- **Sample Data**: Created for `admin@restaurant.com`
- **Your Login**: `micknick168@gmail.com`
- **Result**: No restaurants found for your user

### **2. API vs Database Fields**
- **Frontend Expects**: `id, name, address, phone, email, created_at`
- **Database Has**: ✅ All these fields exist
- **API Returns**: ✅ All these fields (with enhanced logging)

## **🛠️ Solutions Applied:**

### **✅ Enhanced API Logging**
The API now logs:
```javascript
[API] User ID from token: [uuid]
[API] Fetching restaurants for user: [uuid]
[API] Found restaurants: [number]
[API] Restaurant data: [full JSON]
```

### **✅ Sample Data Script**
Created `add-sample-data.sql` to add restaurants for your user:
```sql
-- Adds 3 restaurants for micknick168@gmail.com
-- Includes sample menus and menu items
```

## **🚀 Immediate Steps:**

### **Step 1: Add Sample Data**
Run this SQL script:
```bash
psql -d your_database -f add-sample-data.sql
```

### **Step 2: Check Browser Console**
1. **Login** as `micknick168@gmail.com`
2. **Open Dev Tools** → Console tab
3. **Look for these logs:**
   ```
   [Hook] Fetching from /api/restaurants
   [API] User ID from token: [uuid]
   [API] Fetching restaurants for user: [uuid]
   [API] Found restaurants: 3
   [API] Restaurant data: [{...}]
   [RestaurantsList] Loaded 3 restaurants
   ```

### **Step 3: Verify Token Storage**
In browser console, check:
```javascript
localStorage.getItem('auth_token')     // Should be base64 string
localStorage.getItem('userRole')        // Should be "admin"
```

## **🔧 Debugging Checklist:**

### **✅ API Working?**
- [ ] Status 200 (not 401)
- [ ] Returns array of restaurants
- [ ] Each restaurant has: id, name, address, phone, email

### **✅ Frontend Receiving?**
- [ ] useRestaurants() hook receives data
- [ ] RestaurantsList component renders items
- [ ] RestaurantCard receives all props

### **✅ Data Matching?**
- [ ] API returns same fields as frontend expects
- [ ] No undefined/null values in required fields
- [ ] Correct number of restaurants displayed

## **🚨 If Still Not Working:**

### **Check 1: User ID Mismatch**
```sql
SELECT id, email, role FROM users WHERE email = 'micknick168@gmail.com';
```

### **Check 2: Restaurant Ownership**
```sql
SELECT id, name, owner_id FROM restaurants WHERE owner_id = [your_user_id];
```

### **Check 3: Token Decoding**
In browser console:
```javascript
const token = localStorage.getItem('auth_token');
const decoded = JSON.parse(atob(token));
console.log('Decoded token:', decoded);
```

## **📁 Key Files:**
- `app/api/restaurants/route.ts` - Enhanced with logging
- `add-sample-data.sql` - Sample data for your user
- `hooks/use-restaurants.ts` - Frontend data fetching
- `components/restaurants-list.tsx` - Frontend display

Run the sample data script first, then check the console logs! 🎯
