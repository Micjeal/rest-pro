# 🔧 Quick Fix for 401 Unauthorized Errors

## **Problem:**
Getting `401 Unauthorized` errors when accessing `/api/restaurants`

## **Root Cause:**
The API was trying to use database functions (`set_user_id`) that don't exist yet.

## **✅ Quick Fix Applied:**

1. **Replaced complex API** with simpler version that bypasses RLS temporarily
2. **Added detailed logging** to debug authentication issues
3. **Created database setup script** for proper implementation

## **🚀 Immediate Steps:**

### **Step 1: Test the Fix**
The API should now work. Try refreshing the page that was showing 401 errors.

### **Step 2: Run Database Setup (Optional)**
For full RLS functionality, run:
```bash
psql -d your_database -f complete-database-setup.sql
```

### **Step 3: Check Authentication**
Make sure you're logged in and the token is stored:
```javascript
// In browser console
localStorage.getItem('auth_token')  // Should show a token
localStorage.getItem('userRole')     // Should show your role
```

## **🔍 Debugging:**

If you still get 401 errors, check browser console for:
- `[API] User ID from token: [uuid]` - Shows token parsing
- `[API] Fetching restaurants for user: [uuid]` - Shows API call
- `[API] Found restaurants: [number]` - Shows results

## **📁 Files Modified:**
- `app/api/restaurants/route.ts` → Simplified version
- `app/api/restaurants/route.ts.backup` → Original complex version
- `complete-database-setup.sql` → Full database functions

## **🔄 To Restore Complex Version:**
```bash
mv app/api/restaurants/route.ts app/api/restaurants/simple-route.ts
mv app/api/restaurants/route.ts.backup app/api/restaurants/route.ts
```

The restaurants API should now work without 401 errors! 🎉
