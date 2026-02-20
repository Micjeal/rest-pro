# Restaurant Management System - Quick Reference Guide

## 🚀 Quick Start

### Environment Setup
```bash
# Install dependencies
pnpm install

# Create .env.local file with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run development server
pnpm dev

# Open http://localhost:3000
```

---

## 📋 Core Endpoints

### Restaurants
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/restaurants` | Get all user's restaurants |
| POST | `/api/restaurants` | Create new restaurant |

### Menus
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/menus?restaurantId=<id>` | Get restaurant's menus |
| POST | `/api/menus` | Create new menu |

### Menu Items
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/menu-items?menuId=<id>` | Get menu items |
| POST | `/api/menu-items` | Create menu item |
| PUT | `/api/menu-items` | Update menu item |
| DELETE | `/api/menu-items?id=<id>` | Delete menu item |

### Orders
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/orders?restaurantId=<id>` | Get orders |
| POST | `/api/orders` | Create order |

### Order Items
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/order-items?orderId=<id>` | Get order items |
| POST | `/api/order-items` | Add item to order |
| DELETE | `/api/order-items?id=<id>` | Remove item from order |

### Reservations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/reservations?restaurantId=<id>` | Get reservations |
| POST | `/api/reservations` | Create reservation |

### Inventory
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/inventory?restaurantId=<id>` | Get inventory items |
| POST | `/api/inventory` | Create inventory item |
| PUT | `/api/inventory` | Update inventory item |
| DELETE | `/api/inventory?id=<id>` | Delete inventory item |

---

## 🗺️ Core Routes

### Public Routes
- `/` - Landing page
- `/auth/auth-code-error` - Auth error page

### Protected Routes
- `/dashboard` - My restaurants list
- `/dashboard/new-restaurant` - Create restaurant
- `/dashboard/[id]` - Restaurant dashboard
- `/dashboard/[id]/menus/new` - Create menu
- `/dashboard/[id]/menus/[menuId]` - Menu detail & items
- `/dashboard/[id]/menus/[menuId]/items/new` - Create menu item
- `/dashboard/[id]/orders` - Orders list
- `/dashboard/[id]/orders/new` - Create order
- `/dashboard/[id]/reservations` - Reservations list
- `/dashboard/[id]/reservations/new` - Create reservation
- `/dashboard/[id]/inventory` - Inventory list
- `/dashboard/[id]/inventory/new` - Add inventory item

---

## 📦 Core Data Models

### Restaurant
```typescript
{
  id: string (uuid)
  name: string
  address?: string
  phone?: string
  email?: string
  owner_id: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Menu
```typescript
{
  id: string
  restaurant_id: string
  name: string
  description?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### MenuItem
```typescript
{
  id: string
  menu_id: string
  name: string
  description?: string
  price: decimal
  availability: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Order
```typescript
{
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone?: string
  customer_email?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_amount: decimal
  notes?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### OrderItem
```typescript
{
  id: string
  order_id: string
  menu_item_id: string
  quantity: integer
  unit_price: decimal
  subtotal: decimal
  created_at: timestamp
}
```

### Reservation
```typescript
{
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  party_size: integer
  reservation_date: timestamp
  status: 'confirmed' | 'cancelled' | 'completed' | 'no-show'
  notes?: string
  created_at: timestamp
  updated_at: timestamp
}
```

### InventoryItem
```typescript
{
  id: string
  restaurant_id: string
  item_name: string
  quantity: integer
  unit?: string
  reorder_level: integer
  last_updated: timestamp
}
```

---

## 🎣 Custom Hooks

### useRestaurants()
```typescript
const { restaurants, isLoading, error, mutate } = useRestaurants()
// Fetches user's restaurants from /api/restaurants
```

### useMenus()
```typescript
const { menus, isLoading, error } = useMenus(restaurantId)
// Fetches menus for a restaurant
```

### useOrders()
```typescript
const { orders, isLoading, error } = useOrders(restaurantId)
// Fetches orders for a restaurant
```

### useReservations()
```typescript
const { reservations, isLoading, error } = useReservations(restaurantId)
// Fetches reservations for a restaurant
```

### useInventory()
```typescript
const { items, isLoading, error } = useInventory(restaurantId)
// Fetches inventory items for a restaurant
```

### useMenuItems()
```typescript
const { items, isLoading, error } = useMenuItems(menuId)
// Fetches items in a menu
```

---

## 🧩 Key Components

### Layout
- `DashboardHeader` - Navigation and user menu

### Restaurant Management
- `RestaurantsList` - List of restaurants
- `RestaurantCard` - Individual restaurant
- `RestaurantForm` - Create/edit restaurant

### Menu Management
- `MenuList` - List of menus
- `MenuForm` - Create/edit menu
- `MenuItemsList` - List of menu items
- `MenuItemForm` - Create/edit menu item

### Orders
- `OrdersList` - List of orders
- `OrderForm` - Create order with items

### Reservations
- `ReservationsList` - List of reservations
- `ReservationForm` - Create reservation

### Inventory
- `InventoryList` - List of inventory items
- `InventoryForm` - Create/edit inventory item

---

## 🐛 Debugging

### Enable Logging
Logs automatically appear in console with prefixes:
- `[Dashboard]` - Dashboard page
- `[RestaurantsList]` - Component events
- `[Hook]` - Hook execution
- `[API]` - API operations

### Check API Calls
In browser DevTools Network tab:
- Look for `/api/*` requests
- Check Status: should be 200/201 for success
- Check Response for returned data
- Check Console for any error logs

### Common Issues

**"Unauthorized" Error**
→ Check if user is authenticated
→ Verify Supabase session

**"API returned 400"**
→ Check request payload format
→ Verify all required fields
→ Check console for detailed error

**Data not updating**
→ Check network request in DevTools
→ Verify API response
→ Check Supabase connection

---

## 📝 Form Validation Rules

### Restaurant Form
- Name: required, min 2 chars
- Email: valid email format (if provided)
- Phone: valid phone format (if provided)

### Menu Form
- Name: required, min 2 chars
- Description: optional

### Menu Item Form
- Name: required, min 2 chars
- Price: required, must be positive
- Availability: boolean toggle

### Order Form
- Customer Name: required
- Items: required, at least 1
- Quantities: must be positive integers

### Reservation Form
- Name: required
- Phone: required, valid format
- Party Size: required, 1-20
- Date/Time: required, must be future date
- Email: valid format (if provided)

### Inventory Form
- Item Name: required, min 2 chars
- Quantity: required, non-negative
- Unit: optional
- Reorder Level: optional, must be less than quantity

---

## 🔐 Authentication

### OAuth Flow
1. User clicks "Get Started"
2. Redirected to Supabase Auth
3. User authenticates with provider
4. Redirected to `/auth/callback`
5. Session established
6. User can access protected routes

### Session Management
- Sessions stored in HTTP-only cookies
- Automatic validation on protected routes
- No manual token management needed

---

## 📊 Database Schema Files

- Main schema: `/scripts/01-create-tables.sql`
- Tables: restaurants, menus, menu_items, orders, order_items, reservations, inventory

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set
- [ ] Database schema created
- [ ] API endpoints tested
- [ ] Forms validated
- [ ] No console errors
- [ ] Responsive design checked

### Vercel Deployment
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy branch
- [ ] Test in staging
- [ ] Monitor error logs

### Post-Deployment
- [ ] Test all features in production
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Set up error tracking

---

## 📚 Documentation Files

- `README.md` - Full project documentation
- `API_DOCUMENTATION.md` - Complete API reference
- `PAGES_DOCUMENTATION.md` - Pages and components guide
- `TESTING_GUIDE.md` - Testing procedures
- `QUICK_REFERENCE.md` - This file

---

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- Next.js Docs: https://nextjs.org/docs
- TypeScript Docs: https://www.typescriptlang.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

---

## ⚡ Performance Tips

### Frontend
- Use SWR for data fetching
- Lazy load components
- Optimize images
- Minimize bundle size

### Backend
- Use database indexes
- Optimize queries
- Implement pagination
- Cache frequently accessed data

### General
- Monitor Core Web Vitals
- Use CDN for static assets
- Implement error tracking
- Monitor API response times

---

## 🎯 Next Steps

1. **Setup**: Copy .env.local with Supabase credentials
2. **Install**: Run `pnpm install`
3. **Develop**: Run `pnpm dev`
4. **Test**: Visit http://localhost:3000
5. **Create**: Create first restaurant
6. **Build**: Add menus and items
7. **Deploy**: Push to GitHub and deploy to Vercel

---

**Last Updated:** January 2024  
**Version:** 1.0.0
