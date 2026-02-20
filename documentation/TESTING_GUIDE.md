# Restaurant Management System - Testing Guide

## Manual Testing Checklist

### Authentication & Access

#### Landing Page (`/`)
- [ ] Page loads without authentication
- [ ] "Get Started" button redirects to dashboard
- [ ] "Dashboard" button redirects to dashboard
- [ ] All feature cards display correctly
- [ ] Responsive design on mobile/tablet/desktop

#### Authentication Flow
- [ ] Click "Get Started" redirects to Supabase Auth
- [ ] OAuth login works correctly
- [ ] After login, redirected to `/dashboard`
- [ ] Session is maintained on page refresh
- [ ] Logout clears session and redirects to home

#### Protected Routes
- [ ] Direct access to `/dashboard` without auth redirects to login
- [ ] Direct access to `/dashboard/[id]` without auth redirects to login
- [ ] All protected routes work after authentication

---

### Restaurant Management

#### View Restaurants (`/dashboard`)
- [ ] Page loads showing "My Restaurants" title
- [ ] All user restaurants display in grid
- [ ] Loading state shows while fetching
- [ ] Empty state shows when no restaurants exist
- [ ] "Add Restaurant" button is visible
- [ ] Each restaurant card shows correct information

#### Create Restaurant (`/dashboard/new-restaurant`)
- [ ] Form loads correctly
- [ ] All form fields are present:
  - [ ] Restaurant Name (required)
  - [ ] Address (optional)
  - [ ] Phone Number (optional)
  - [ ] Email Address (optional)
- [ ] Form validation works:
  - [ ] Cannot submit without restaurant name
  - [ ] Email format validation works
- [ ] Submit button creates restaurant
- [ ] After creation, redirected to dashboard
- [ ] New restaurant appears in list
- [ ] Console shows `[API] POST restaurant` log

#### Restaurant Detail (`/dashboard/[id]`)
- [ ] Page loads with correct restaurant ID in URL
- [ ] Overview tab displays welcome message
- [ ] Quick stats section shows
- [ ] All 5 tabs are visible:
  - [ ] Overview
  - [ ] Menus
  - [ ] Orders
  - [ ] Reservations
  - [ ] Inventory
- [ ] Tab switching works correctly
- [ ] Breadcrumb navigation shows

---

### Menu Management

#### View Menus (`/dashboard/[id]`)
- [ ] Switch to "Menus" tab
- [ ] Menu list displays (or empty state)
- [ ] "Add Menu" button is visible
- [ ] Click menu opens menu detail page

#### Create Menu (`/dashboard/[id]/menus/new`)
- [ ] Form loads with correct restaurant ID
- [ ] Form fields present:
  - [ ] Menu Name (required)
  - [ ] Menu Description (optional)
- [ ] Form validation:
  - [ ] Cannot submit without menu name
  - [ ] Min 2 characters validation
- [ ] Submit creates menu
- [ ] Redirects to menu detail page
- [ ] Console shows `[API] POST menu` log

#### View Menu Items (`/dashboard/[id]/menus/[menuId]`)
- [ ] Menu detail page loads
- [ ] Menu name displays
- [ ] Menu items list displays (or empty state)
- [ ] "Add Item" button visible
- [ ] Item cards show:
  - [ ] Item name
  - [ ] Description
  - [ ] Price
  - [ ] Availability badge
- [ ] Edit/delete buttons present
- [ ] Availability toggle works

#### Create Menu Item (`/dashboard/[id]/menus/[menuId]/items/new`)
- [ ] Form loads correctly
- [ ] Form fields present:
  - [ ] Item Name (required)
  - [ ] Description (optional)
  - [ ] Price (required)
  - [ ] Availability toggle
- [ ] Form validation:
  - [ ] Cannot submit without name/price
  - [ ] Price must be positive
- [ ] Submit creates item
- [ ] Redirects back to menu detail
- [ ] New item appears in list
- [ ] Console shows `[API] POST menu item` log

#### Edit Menu Item
- [ ] Click edit on menu item
- [ ] Form pre-fills with current data
- [ ] Update values
- [ ] Submit updates item
- [ ] Changes reflect immediately
- [ ] Console shows `[API] PUT menu item` log

#### Delete Menu Item
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletion removes item
- [ ] Item disappears from list
- [ ] Console shows `[API] DELETE menu item` log

---

### Order Management

#### View Orders (`/dashboard/[id]/orders`)
- [ ] Orders tab loads
- [ ] "New Order" button visible
- [ ] Orders list displays (or empty state)
- [ ] Each order shows:
  - [ ] Customer name
  - [ ] Order date/time
  - [ ] Status badge
  - [ ] Total amount
  - [ ] Order items count

#### Create Order (`/dashboard/[id]/orders/new`)
- [ ] Form loads correctly
- [ ] Customer info section shows fields:
  - [ ] Customer Name (required)
  - [ ] Customer Phone (optional)
  - [ ] Customer Email (optional)
- [ ] Menu/Items selection:
  - [ ] Menu dropdown loads
  - [ ] Items dropdown shows items from menu
  - [ ] Can add multiple items
  - [ ] Quantity input works
  - [ ] Price calculation correct
- [ ] Notes textarea present
- [ ] Form validation:
  - [ ] Cannot submit without customer name
  - [ ] Cannot submit without items
  - [ ] Quantities must be positive
- [ ] Submit creates order
- [ ] Redirects to orders list
- [ ] New order appears
- [ ] Console shows `[API] POST order` and `[API] POST order item` logs

#### View Order Details
- [ ] Click on order
- [ ] Order detail view opens
- [ ] Shows all order information
- [ ] Lists all items with quantities and prices
- [ ] Total amount calculated correctly
- [ ] Status can be updated

---

### Reservations

#### View Reservations (`/dashboard/[id]/reservations`)
- [ ] Reservations tab loads
- [ ] "New Reservation" button visible
- [ ] Reservation list displays (or empty state)
- [ ] Each reservation shows:
  - [ ] Customer name
  - [ ] Party size
  - [ ] Reservation date/time
  - [ ] Status badge
  - [ ] Phone number

#### Create Reservation (`/dashboard/[id]/reservations/new`)
- [ ] Form loads correctly
- [ ] Form fields present:
  - [ ] Customer Name (required)
  - [ ] Customer Phone (required)
  - [ ] Customer Email (optional)
  - [ ] Party Size (required)
  - [ ] Reservation Date/Time (required)
  - [ ] Notes (optional)
- [ ] Date/time picker works:
  - [ ] Can select future dates
  - [ ] Can select times
  - [ ] Cannot select past dates
- [ ] Form validation:
  - [ ] All required fields validated
  - [ ] Party size 1-20 range
  - [ ] Phone format validation
- [ ] Submit creates reservation
- [ ] Redirects to reservations list
- [ ] New reservation appears
- [ ] Console shows `[API] POST reservation` log

#### Update Reservation Status
- [ ] Click on reservation
- [ ] Status dropdown shows options
- [ ] Change status
- [ ] Status updates immediately
- [ ] Console shows update log

---

### Inventory Management

#### View Inventory (`/dashboard/[id]/inventory`)
- [ ] Inventory tab loads
- [ ] "Add Item" button visible
- [ ] Inventory list displays (or empty state)
- [ ] Each item shows:
  - [ ] Item name
  - [ ] Current quantity
  - [ ] Unit type
  - [ ] Reorder level
  - [ ] Last updated date
  - [ ] Low-stock indicator (if applicable)

#### Create Inventory Item (`/dashboard/[id]/inventory/new`)
- [ ] Form loads correctly
- [ ] Form fields present:
  - [ ] Item Name (required)
  - [ ] Quantity (required)
  - [ ] Unit (optional, dropdown)
  - [ ] Reorder Level (optional)
- [ ] Form validation:
  - [ ] Cannot submit without name/quantity
  - [ ] Quantity must be non-negative
- [ ] Unit dropdown works:
  - [ ] Shows common units (lbs, oz, count, etc.)
- [ ] Submit creates item
- [ ] Redirects to inventory list
- [ ] New item appears
- [ ] Console shows `[API] POST inventory` log

#### Update Inventory Item
- [ ] Click edit on item
- [ ] Form pre-fills with current data
- [ ] Update quantity/reorder level
- [ ] Submit updates item
- [ ] Changes reflect immediately
- [ ] Console shows `[API] PUT inventory` log

#### Low-Stock Alerts
- [ ] Create item with quantity < reorder level
- [ ] Item displays with warning indicator
- [ ] Visual styling indicates low stock
- [ ] Tooltip explains the alert

#### Delete Inventory Item
- [ ] Click delete button
- [ ] Confirmation dialog appears
- [ ] Confirm deletion removes item
- [ ] Item disappears from list
- [ ] Console shows `[API] DELETE inventory` log

---

### Data Persistence

#### Session Persistence
- [ ] Create a restaurant
- [ ] Refresh the page
- [ ] Restaurant still exists
- [ ] Data persists correctly

#### Multiple Browsers/Devices
- [ ] Log in from different device
- [ ] Same data appears
- [ ] Changes sync across devices
- [ ] Logout from one device affects others

---

### Error Handling

#### Network Errors
- [ ] Disconnect network
- [ ] Try to load data
- [ ] Error message displays
- [ ] Console shows error logs

#### Invalid Data
- [ ] Try to submit invalid form data
- [ ] Validation error appears
- [ ] Form does not submit
- [ ] Clear error on input change

#### API Errors
- [ ] API returns error
- [ ] Toast notification shows error
- [ ] User can retry operation

---

### Responsive Design

#### Desktop (1920px+)
- [ ] All elements display correctly
- [ ] Grid layouts work
- [ ] Tables are readable
- [ ] Forms are properly spaced

#### Tablet (768px - 1024px)
- [ ] Grid becomes 2 columns
- [ ] All buttons accessible
- [ ] Forms are readable
- [ ] Navigation works

#### Mobile (375px - 480px)
- [ ] Grid becomes 1 column
- [ ] Hamburger menu works (if applicable)
- [ ] Forms are mobile-friendly
- [ ] All buttons are touchable
- [ ] No horizontal scroll

---

### Browser Compatibility

#### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Forms submit correctly

#### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Date/time picker works

#### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Styling displays correctly

#### Edge
- [ ] All features work
- [ ] All forms function

---

### Performance

#### Page Load Times
- [ ] Landing page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Detail pages load in < 2 seconds

#### Large Datasets
- [ ] 50+ restaurants load properly
- [ ] 100+ menu items load properly
- [ ] Large order history displays well
- [ ] Scrolling is smooth

---

### Console Logging

#### Debug Logs Visible
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for logs with these prefixes:
  - [ ] `[Dashboard]` - Dashboard page events
  - [ ] `[RestaurantsList]` - Component events
  - [ ] `[Hook]` - Hook execution logs
  - [ ] `[API]` - API endpoint logs
- [ ] No critical errors in console
- [ ] All async operations logged

---

## Automated Testing Examples

### Example Test Case 1: Create Restaurant
```javascript
describe('Restaurant Creation', () => {
  it('should create a new restaurant', async () => {
    // 1. Navigate to new-restaurant page
    // 2. Fill form with valid data
    // 3. Submit form
    // 4. Assert redirect to dashboard
    // 5. Assert new restaurant in list
  })
})
```

### Example Test Case 2: Order Creation
```javascript
describe('Order Creation', () => {
  it('should create order with items', async () => {
    // 1. Navigate to orders/new page
    // 2. Fill customer info
    // 3. Select menu and items
    // 4. Submit form
    // 5. Assert order in list
    // 6. Assert correct total calculation
  })
})
```

---

## Performance Testing Checklist

### Load Testing
- [ ] Application handles 100+ concurrent users
- [ ] API response times < 200ms
- [ ] Database queries optimized
- [ ] No memory leaks

### Stress Testing
- [ ] Rapid form submissions don't break app
- [ ] Large file uploads handled gracefully
- [ ] Concurrent API calls work correctly
- [ ] Session management under stress

---

## Security Testing

### Authentication
- [ ] Cannot access protected routes without auth
- [ ] Session cookies are HTTP-only
- [ ] CSRF protection in place
- [ ] XSS protection enabled

### Data Validation
- [ ] SQL injection not possible
- [ ] Input sanitization working
- [ ] File uploads validated
- [ ] API rate limiting effective

### Authorization
- [ ] Users can only see their own data
- [ ] Users cannot modify other users' data
- [ ] Admin functions protected
- [ ] Role-based access working

---

## Known Issues & Workarounds

### Issue: Form not submitting
**Workaround:** 
1. Check browser console for errors
2. Verify all required fields are filled
3. Check network tab for API failures
4. Refresh and try again

### Issue: Data not persisting
**Workaround:**
1. Check Supabase connection
2. Verify environment variables
3. Check browser's local storage/cookies
4. Clear cache and reload

---

## Test Result Template

```
Date: ___________
Tester: ___________
Environment: (Dev/Staging/Production)
Browser: ___________
OS: ___________

Features Tested:
- [ ] Authentication
- [ ] Restaurants
- [ ] Menus
- [ ] Orders
- [ ] Reservations
- [ ] Inventory

Issues Found:
1. ___________
2. ___________

Passed: ___/___
Failed: ___/___
```

---

## Continuous Testing

### Pre-Deployment Checklist
- [ ] All critical features tested
- [ ] No console errors
- [ ] API endpoints responding
- [ ] Database schema correct
- [ ] Environment variables set
- [ ] Staging deployment successful
- [ ] Performance metrics acceptable

### Post-Deployment Checklist
- [ ] Production URLs working
- [ ] User authentication working
- [ ] Data loading correctly
- [ ] No spike in error logs
- [ ] Performance metrics normal
- [ ] User feedback positive

---

**Last Updated:** January 2024
