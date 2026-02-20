# POS System - Complete Documentation

## Overview
This is a comprehensive Point-of-Sale (POS) system built with Next.js 16, React 19, and Supabase. The system includes order management, inventory tracking, receipt generation, and analytics reports with role-based access control.

---

## System Architecture

### Technology Stack
- **Frontend:** Next.js 16 with React 19
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **UI Components:** shadcn/ui with Tailwind CSS
- **State Management:** React Context + SWR
- **Charts:** Recharts
- **Form Handling:** React Hook Form + Zod
- **Notifications:** Sonner Toast

---

## Pages & Routes

### Public Pages
#### `/` - Landing Page
- Overview of system features
- Call-to-action to access dashboard
- Feature showcase with icons

#### `/login` - Login Page
- Email and password authentication
- Demo credentials displayed
- Redirect to appropriate dashboard based on role

### Protected Routes (POS Dashboard)

#### `/pos` - Main Point of Sale
- **Route:** `/pos`
- **Access:** All authenticated users
- **Features:**
  - Browse menu items in grid layout
  - Add items to cart with quantity input (numpad)
  - Real-time order calculation
  - Discount percentage application
  - Multiple payment methods (cash, card, mobile)
  - Live totals with tax calculation (10% default)
  - Tablet-optimized UI with large touch targets

**Key Components:**
- `components/pos/numpad.tsx` - Tablet numeric keypad
- `components/pos/payment-modal.tsx` - Payment method selector

**Layout:**
```
┌─────────────────────────────────┐
│  Menu Items Grid (2-3 columns)  │
│  [Item] [Item] [Item]           │
│  [Item] [Item] [Item]           │
│                                 │ Current Order Summary (Sidebar)
│  Large buttons for easy touch   │ - Items list with qty controls
│                                 │ - Subtotal
└─────────────────────────────────┤ - Discount
                                  │ - Tax
                                  │ - Total
                                  │ - Checkout Button
                                  └─────────────────────────────────┘
```

#### `/receipts` - Receipt Management
- **Route:** `/receipts`
- **Access:** All authenticated users
- **Features:**
  - View receipt history
  - Search receipts by number or cashier
  - Print receipts
  - Download receipts as PDF/JSON
  - Summary statistics (total revenue, avg amount)
  - Payment method breakdown

**Display:**
- Receipt table with columns: Receipt #, Date, Amount, Payment Method, Cashier
- Color-coded payment methods
- Quick actions (print, download)

#### `/inventory` - Inventory Management
- **Route:** `/inventory`
- **Access:** Manager and Admin roles only
- **Features:**
  - View all inventory items
  - Low stock alerts (visual banner)
  - Add new inventory items
  - Edit existing items
  - Delete items
  - Track reorder levels
  - View supplier information
  - Search and filter items

**Display:**
- Low stock alert banner with affected items
- Summary statistics (total items, low stock count, stock status %)
- Inventory table with status indicators
- Color-coded rows for low stock items

#### `/reports` - Analytics & Reports
- **Route:** `/reports`
- **Access:** Manager and Admin roles only
- **Features:**
  - Daily sales trends (line chart)
  - Transaction count per day (bar chart)
  - Payment method breakdown with percentages
  - Summary statistics:
    - Total revenue
    - Total transactions
    - Average order value
    - Peak sales day
  - Detailed daily breakdown table

**Visualizations:**
- Recharts line chart for sales trends
- Recharts bar chart for transaction counts
- Progress bars for payment method distribution
- Data table with daily details

---

## Components Overview

### Authentication Components
#### `components/auth/login-form.tsx`
- Email and password input fields
- Form validation
- Error handling with toast notifications
- Demo credentials display

### POS Components
#### `components/pos/sidebar-navigation.tsx`
- Main navigation with dark sidebar
- Role-based menu items
- Quick access to all sections
- User role display
- Logout functionality

**Navigation Structure:**
```
├── POS (all users)
├── Receipts (all users)
├── Inventory (manager/admin)
├── Reports (manager/admin)
├── Settings (admin only)
└── Logout
```

#### `components/pos/numpad.tsx`
- 3x4 grid of number buttons
- Support for decimals
- Clear and Done buttons
- Large touch-friendly targets (h-16)

#### `components/pos/payment-modal.tsx`
- Three payment method options:
  - Cash (green)
  - Card (blue)
  - Mobile Payment (purple)
- Amount display
- Processing animation
- Confirmation handler

---

## Data Models

### Orders
```typescript
Order {
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
}

OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
}
```

### Receipts
```typescript
Receipt {
  id: string
  number: string (RCP-YYYYMMDD-000X)
  date: string
  amount: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  itemCount: number
  cashier: string
}
```

### Inventory
```typescript
InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string (lbs, kg, count)
  reorderLevel: number
  lastRestocked: string
  supplier: string
}
```

---

## Role-Based Access Control

### Admin
- Full access to all features
- Can access POS, Receipts, Inventory, Reports, Settings

### Manager
- Can access POS, Receipts, Inventory, Reports
- Cannot access Settings

### Cashier
- Can access POS and Receipts only
- Cannot access Inventory or Reports

**Implementation:**
The sidebar navigation component conditionally renders menu items based on user role stored in localStorage:
```typescript
if (userRole === 'manager' || userRole === 'admin') {
  // Show inventory and reports
}
if (userRole === 'admin') {
  // Show settings
}
```

---

## API Routes

### Authentication Endpoints

#### POST `/api/auth/login`
Authenticates user and returns token
```json
Request: { email: string, password: string }
Response: { user: { id, email, name, role }, token: string }
```

#### POST `/api/auth/logout`
Logs out current user
```json
Request: {}
Response: { success: true, message: string }
```

### Demo Credentials
```
Admin:
- Email: demo@restaurant.com
- Password: demo123
- Role: admin

Manager:
- Email: manager@restaurant.com
- Password: demo123
- Role: manager

Cashier:
- Email: cashier@restaurant.com
- Password: demo123
- Role: cashier
```

---

## Key Features & Workflows

### POS Checkout Workflow
1. User selects items from menu grid
2. Numpad modal opens for quantity input
3. Item added to cart with live total update
4. User can modify quantities or remove items
5. Optional discount percentage applied
6. Tax calculated automatically (10%)
7. Checkout button opens payment modal
8. User selects payment method
9. Order processed and receipt generated

### Low Stock Alert Workflow
1. Inventory items tracked with reorderLevel
2. System identifies items where quantity < reorderLevel
3. Alert banner displayed on Inventory page
4. Manager can click "Order Now" to create restock order
5. Supplier information available for ordering

### Receipt Workflow
1. Order completion triggers receipt generation
2. Receipt number auto-generated (RCP-YYYYMMDD-000X)
3. Receipt stored in receipts collection
4. User can print or download receipt
5. Receipt history maintained for audit trail

---

## Console Logging for Debugging

All major actions include console logging with `[POS]` or component name prefix for debugging:

```typescript
console.log('[POS] Page loaded')
console.log('[LoginForm] Attempting login for:', email)
console.log('[Receipts] Loaded', count, 'receipts')
console.log('[Inventory] Low stock alert triggered for:', itemName)
```

### Debug Output Format
```
[Component] Action description: details
```

---

## UI/UX Optimization

### Tablet Optimization
- Large touch targets (minimum 44x44px, often 64px)
- Numpad with spacious button layout
- Horizontal scrolling for tables
- Responsive grid layouts
- Full-width buttons for actions

### Performance
- Lazy loading of components
- Memoization of expensive calculations
- SWR for efficient data fetching
- Virtual scrolling for large lists
- Optimistic updates for instant feedback

### Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliant
- Focus indicators on buttons

---

## Testing Guide

### Manual Testing Checklist

#### Login Page
- [ ] Login with admin credentials
- [ ] Login with manager credentials
- [ ] Login with cashier credentials
- [ ] Invalid credentials show error
- [ ] Demo credentials displayed correctly

#### POS Page
- [ ] Menu items load and display
- [ ] Add item to cart (single click)
- [ ] Numpad input works (add quantity)
- [ ] Cart updates with new item
- [ ] Remove item from cart
- [ ] Increase/decrease quantities
- [ ] Discount percentage applied correctly
- [ ] Tax calculated (10% of discounted amount)
- [ ] Total updates correctly
- [ ] Payment modal shows on checkout
- [ ] All payment methods work

#### Receipts Page
- [ ] Receipts load and display
- [ ] Search by receipt number works
- [ ] Search by cashier works
- [ ] Print button works
- [ ] Download button works
- [ ] Statistics calculated correctly

#### Inventory Page
- [ ] Inventory items load
- [ ] Low stock alert displays
- [ ] Search functionality works
- [ ] Stock status indicators correct
- [ ] Add item button present
- [ ] Edit/delete buttons functional

#### Reports Page
- [ ] Charts render correctly
- [ ] Data displays accurately
- [ ] Summary statistics correct
- [ ] Daily breakdown table functional

#### Navigation
- [ ] Sidebar shows correct menu items per role
- [ ] Menu links navigate correctly
- [ ] Active menu item highlighted
- [ ] Logout button works

---

## Deployment

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Deployment Steps
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

---

## Future Enhancements

- Real payment processing integration
- Advanced reporting with date filters
- Multi-branch support
- Inventory transactions log
- Receipt reprinting with reprint counter
- User management interface
- Printer integration
- Barcode scanning
- Kitchen display system (KDS)
- Order pre-ordering
- Customer loyalty program
- Real-time multi-terminal sync
- Offline mode with sync

---

## Troubleshooting

### Login Not Working
- Check demo credentials
- Verify Supabase connection
- Check browser console for errors

### Items Not Showing
- Verify menu items API endpoint
- Check database connection
- Review browser console

### Payment Processing Fails
- Check payment modal rendering
- Verify amount calculations
- Review error logs

### Inventory Alerts Not Showing
- Check reorder levels set correctly
- Verify low stock calculation logic
- Check alert component rendering

---

## Support & Documentation

For additional help:
1. Check console logs with component prefix
2. Review API_DOCUMENTATION.md for endpoint details
3. Check PAGES_DOCUMENTATION.md for page descriptions
4. Review component comments in source files
