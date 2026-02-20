# Restaurant Management System - Pages Documentation

## Overview
This document provides a comprehensive guide to all pages and components in the Restaurant Management System.

---

## Page Structure

### Root Pages

#### `/` - Landing Page
**File:** `app/page.tsx`  
**Type:** Public (no authentication required)  
**Description:** Welcome page introducing the restaurant management system with features overview and CTA buttons.

**Features:**
- Hero section with main call-to-action
- Feature cards highlighting key capabilities
- Navigation to dashboard
- Responsive design for all devices

---

#### `/auth/auth-code-error` - Authentication Error Page
**File:** `app/auth/auth-code-error/page.tsx`  
**Type:** Public  
**Description:** Error page shown when authentication fails or code is invalid.

**Scenarios:**
- Invalid OAuth code
- Expired authentication session
- User cancels OAuth flow

---

### Dashboard Pages

#### `/dashboard` - Main Dashboard
**File:** `app/dashboard/page.tsx`  
**Type:** Protected (requires authentication)  
**Description:** Main dashboard showing list of all restaurants owned by the user.

**Components Used:**
- `DashboardHeader` - Navigation and user info
- `RestaurantsList` - Grid/list of restaurants
- `RestaurantCard` - Individual restaurant entry with actions

**Features:**
- View all restaurants
- Create new restaurant button
- Restaurant quick stats
- Edit/delete restaurant options

---

#### `/dashboard/new-restaurant` - Create Restaurant
**File:** `app/dashboard/new-restaurant/page.tsx`  
**Type:** Protected  
**Description:** Form page to create a new restaurant.

**Components Used:**
- `DashboardHeader` - Navigation
- `RestaurantForm` - Restaurant creation form

**Form Fields:**
- Restaurant Name (required)
- Address (optional)
- Phone Number (optional)
- Email Address (optional)

**API Calls:**
- POST `/api/restaurants` - Create new restaurant

---

#### `/dashboard/[id]` - Restaurant Dashboard (Overview)
**File:** `app/dashboard/[id]/page.tsx`  
**Type:** Protected  
**Description:** Main restaurant management dashboard with tabbed navigation to all features.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Tabs Available:**
1. **Overview** - Quick stats and action links
2. **Menus** - Menu management
3. **Orders** - Order management
4. **Reservations** - Table reservations
5. **Inventory** - Stock management

**Components Used:**
- `MenuList` - Menu display
- `OrdersList` - Orders table
- `ReservationsList` - Reservations table
- `InventoryList` - Inventory items

---

### Menu Management Pages

#### `/dashboard/[id]/menus/new` - Create Menu
**File:** `app/dashboard/[id]/menus/new/page.tsx`  
**Type:** Protected  
**Description:** Form to create a new menu for a restaurant.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `MenuForm` - Menu creation form

**Form Fields:**
- Menu Name (required)
- Menu Description (optional)

**API Calls:**
- POST `/api/menus` - Create menu

---

#### `/dashboard/[id]/menus/[menuId]` - Menu Detail & Items
**File:** `app/dashboard/[id]/menus/[menuId]/page.tsx`  
**Type:** Protected  
**Description:** View and manage items in a specific menu.

**URL Parameters:**
- `[id]` - Restaurant UUID
- `[menuId]` - Menu UUID

**Components Used:**
- `MenuItemsList` - List of menu items
- Add item button

**Features:**
- View all items in menu
- Edit/delete menu items
- Add new items to menu
- Availability toggle

---

#### `/dashboard/[id]/menus/[menuId]/items/new` - Add Menu Item
**File:** `app/dashboard/[id]/menus/[menuId]/items/new/page.tsx`  
**Type:** Protected  
**Description:** Form to add a new item to a menu.

**URL Parameters:**
- `[id]` - Restaurant UUID
- `[menuId]` - Menu UUID

**Components Used:**
- `MenuItemForm` - Item creation form

**Form Fields:**
- Item Name (required)
- Description (optional)
- Price (required)
- Availability (toggle)

**API Calls:**
- POST `/api/menu-items` - Create menu item

---

### Order Management Pages

#### `/dashboard/[id]/orders` - Orders Overview
**File:** `app/dashboard/[id]/orders/page.tsx`  
**Type:** Protected  
**Description:** View all orders for a restaurant with status tracking.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `OrdersList` - Orders table with filters

**Features:**
- Order list with customer info
- Status badges (pending, confirmed, ready, etc.)
- Total amount display
- Order timestamp
- Filter by status

---

#### `/dashboard/[id]/orders/new` - Create Order
**File:** `app/dashboard/[id]/orders/new/page.tsx`  
**Type:** Protected  
**Description:** Form to create a new order.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `OrderForm` - Order creation with item selection

**Form Fields:**
- Customer Name (required)
- Customer Phone (optional)
- Customer Email (optional)
- Order Items (required, with quantity)
- Special Notes (optional)

**API Calls:**
- POST `/api/orders` - Create order
- POST `/api/order-items` - Add items to order
- GET `/api/menus` - Get menus for selection
- GET `/api/menu-items` - Get items for selection

---

### Reservation Pages

#### `/dashboard/[id]/reservations` - Reservations List
**File:** `app/dashboard/[id]/reservations/page.tsx`  
**Type:** Protected  
**Description:** View and manage all table reservations.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `ReservationsList` - Reservations table with calendar view

**Features:**
- Reservation list
- Customer info display
- Party size
- Reservation time
- Status tracking (confirmed, cancelled, completed)

---

#### `/dashboard/[id]/reservations/new` - Create Reservation
**File:** `app/dashboard/[id]/reservations/new/page.tsx`  
**Type:** Protected  
**Description:** Form to create a new table reservation.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `ReservationForm` - Reservation creation form

**Form Fields:**
- Customer Name (required)
- Customer Phone (required)
- Customer Email (optional)
- Party Size (required)
- Reservation Date & Time (required)
- Special Notes (optional)

**API Calls:**
- POST `/api/reservations` - Create reservation
- GET `/api/reservations` - Check availability

---

### Inventory Management Pages

#### `/dashboard/[id]/inventory` - Inventory List
**File:** `app/dashboard/[id]/inventory/page.tsx`  
**Type:** Protected  
**Description:** View and manage restaurant inventory with low-stock alerts.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `InventoryList` - Inventory table with alerts

**Features:**
- Item list with quantities
- Reorder levels
- Low-stock indicators
- Last updated timestamps
- Edit/delete functionality

---

#### `/dashboard/[id]/inventory/new` - Add Inventory Item
**File:** `app/dashboard/[id]/inventory/new/page.tsx`  
**Type:** Protected  
**Description:** Form to add a new inventory item.

**URL Parameters:**
- `[id]` - Restaurant UUID

**Components Used:**
- `InventoryForm` - Item creation form

**Form Fields:**
- Item Name (required)
- Quantity (required)
- Unit (e.g., lbs, oz, count) (optional)
- Reorder Level (optional, default: 10)

**API Calls:**
- POST `/api/inventory` - Create inventory item

---

## Component Documentation

### Layout Components

#### DashboardHeader
**File:** `components/dashboard-header.tsx`  
**Description:** Navigation header for authenticated pages showing user menu and quick actions.

**Props:**
- None (uses hooks for auth state)

**Features:**
- User authentication info
- Logout button
- Navigation links
- Logo/branding

---

### Restaurant Components

#### RestaurantsList
**File:** `components/restaurants-list.tsx`  
**Description:** Displays grid of restaurants with management options.

**Props:**
- `restaurants` (Restaurant[]) - Array of restaurant objects
- `isLoading` (boolean) - Loading state
- `error` (string | null) - Error message if any

**Features:**
- Grid/list view toggle
- Create new restaurant button
- Restaurant cards with actions
- Loading skeleton
- Error display

---

#### RestaurantCard
**File:** `components/restaurant-card.tsx`  
**Description:** Individual restaurant card in grid view.

**Props:**
- `restaurant` (Restaurant) - Restaurant object
- `onEdit` (callback) - Edit action handler
- `onDelete` (callback) - Delete action handler

**Features:**
- Restaurant info display
- Action buttons
- Status indicators
- Quick stats

---

#### RestaurantForm
**File:** `components/restaurant-form.tsx`  
**Description:** Form for creating/editing restaurants.

**Props:**
- `initialData` (Restaurant | null) - Initial form data for editing
- `isLoading` (boolean) - Loading state during submission
- `onSubmit` (callback) - Form submission handler

**Validation:**
- Restaurant name is required
- Email must be valid format (if provided)
- Phone number format validation (if provided)

---

### Menu Components

#### MenuList
**File:** `components/menu-list.tsx`  
**Description:** Displays all menus for a restaurant.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `onSelect` (callback) - Menu selection handler
- `isLoading` (boolean) - Loading state

**Features:**
- Menu list with descriptions
- Create new menu button
- Edit/delete menu options
- Item count display

---

#### MenuForm
**File:** `components/menu-form.tsx`  
**Description:** Form for creating/editing menus.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `initialData` (Menu | null) - Initial data for editing
- `isLoading` (boolean) - Loading state
- `onSubmit` (callback) - Submit handler

**Validation:**
- Menu name is required
- Minimum 2 characters for name

---

#### MenuItemsList
**File:** `components/menu-items-list.tsx`  
**Description:** Table of items in a menu.

**Props:**
- `menuId` (string) - UUID of menu
- `restaurantId` (string) - UUID of restaurant
- `items` (MenuItem[]) - Array of menu items
- `isLoading` (boolean) - Loading state

**Features:**
- Item table with price and availability
- Edit/delete buttons
- Add new item button
- Availability toggle

---

#### MenuItemForm
**File:** `components/menu-item-form.tsx`  
**Description:** Form for creating/editing menu items.

**Props:**
- `menuId` (string) - UUID of menu
- `initialData` (MenuItem | null) - Initial data
- `isLoading` (boolean) - Loading state
- `onSubmit` (callback) - Submit handler

**Validation:**
- Name and price are required
- Price must be positive number
- Name minimum 2 characters

---

### Order Components

#### OrdersList
**File:** `components/orders-list.tsx`  
**Description:** Table of restaurant orders with filtering.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `orders` (Order[]) - Array of orders
- `isLoading` (boolean) - Loading state

**Features:**
- Orders table
- Status filtering
- Customer info display
- Total amount
- Timeline/history

---

#### OrderForm
**File:** `components/order-form.tsx`  
**Description:** Form for creating orders with menu selection.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `isLoading` (boolean) - Loading state
- `onSubmit` (callback) - Submit handler

**Features:**
- Customer information form
- Menu selection dropdown
- Item quantity input
- Multiple items in one order
- Special notes textarea

**Validation:**
- Customer name required
- At least one item required
- Quantities must be positive

---

### Reservation Components

#### ReservationsList
**File:** `components/reservations-list.tsx`  
**Description:** Calendar and list view of reservations.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `reservations` (Reservation[]) - Array of reservations
- `isLoading` (boolean) - Loading state

**Features:**
- Calendar view
- List view
- Status badges
- Time display
- Party size info

---

#### ReservationForm
**File:** `components/reservation-form.tsx`  
**Description:** Form for creating/editing reservations.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `initialData` (Reservation | null) - Initial data
- `isLoading` (boolean) - Loading state
- `onSubmit` (callback) - Submit handler

**Features:**
- Date/time picker
- Customer information
- Party size selector
- Special requests textarea
- Availability checker

**Validation:**
- All required fields
- Future date only
- Phone number format
- Party size 1-20

---

### Inventory Components

#### InventoryList
**File:** `components/inventory-list.tsx`  
**Description:** Table of inventory items with low-stock alerts.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `items` (InventoryItem[]) - Array of inventory items
- `isLoading` (boolean) - Loading state

**Features:**
- Item list with quantities
- Low-stock visual indicators (red)
- Reorder level display
- Last updated timestamps
- Edit/delete buttons

---

#### InventoryForm
**File:** `components/inventory-form.tsx`  
**Description:** Form for creating/editing inventory items.

**Props:**
- `restaurantId` (string) - UUID of restaurant
- `initialData` (InventoryItem | null) - Initial data
- `isLoading` (boolean) - Loading state
- `onSubmit` (callback) - Submit handler

**Features:**
- Item name input
- Quantity number input
- Unit selection (lbs, oz, count, etc.)
- Reorder level setting
- Quantity update on existing items

**Validation:**
- Item name required
- Quantity must be non-negative
- Reorder level must be less than max quantity

---

## Data Flow

### Authentication Flow
1. User lands on `/` (public)
2. Clicks "Get Started" or "Dashboard"
3. Redirected to Supabase Auth
4. After OAuth, redirected to `/auth/callback`
5. Session established via HTTP-only cookie
6. User redirected to `/dashboard`

### Restaurant Management Flow
1. User views all restaurants at `/dashboard`
2. Clicks restaurant to enter `/dashboard/[id]`
3. Uses tabs to manage menus, orders, reservations, inventory
4. Each section has dedicated create/edit pages
5. API calls handle all data operations

### Order Creation Flow
1. User navigates to `/dashboard/[id]/orders/new`
2. Enters customer information
3. Selects menu and items with quantities
4. Submits form
5. Creates order via POST `/api/orders`
6. Creates order items via POST `/api/order-items`
7. Redirected back to orders list

---

## Error Handling

### Page-Level Error Handling
- Try-catch blocks in form submissions
- Toast notifications for user feedback
- Error state display in components
- Loading states during async operations

### API Error Handling
- All API routes include error logging
- Console error logs with `[API]` prefix
- HTTP status codes for different error types
- Meaningful error messages returned to client

---

## Performance Optimizations

### Data Fetching
- SWR hooks for client-side caching
- Automatic revalidation on focus
- Reduced unnecessary API calls
- Optimistic updates where applicable

### Component Optimization
- React.memo for expensive renders
- Lazy loading of components
- Dynamic imports for large forms
- Pagination recommendations (not yet implemented)

---

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Future Enhancements

### Planned Features
- [ ] Real-time order status updates (WebSocket)
- [ ] Kitchen display system (KDS)
- [ ] Advanced analytics and reporting
- [ ] Multi-location support
- [ ] Staff management
- [ ] Role-based access control (RBAC)
- [ ] Image uploads for menu items
- [ ] Integration with payment processors
- [ ] SMS/email notifications for reservations
- [ ] Mobile app
