# Restaurant Management System - API Documentation

## Overview
This document provides comprehensive documentation for all REST API endpoints in the Restaurant Management System.

**Base URL:** `/api`  
**Authentication:** All endpoints require valid Supabase session cookies  
**Content-Type:** `application/json`

---

## Authentication

All API endpoints require a valid Supabase session. The session is managed via HTTP-only cookies set during the OAuth callback.

### Authentication Flow
1. User is redirected to Supabase Auth
2. After successful authentication, Supabase redirects to `/auth/callback`
3. Session is established via HTTP-only cookie
4. User can now access authenticated endpoints

---

## Endpoints

### Restaurants

#### GET /api/restaurants
Retrieves all restaurants owned by the authenticated user.

**Parameters:** None

**Response (200 - Success):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Main Street Café",
    "address": "123 Main St, City, State 12345",
    "phone": "555-0123",
    "email": "contact@mainstreetcafe.com",
    "owner_id": "user-uuid",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

**Error Responses:**
- 401 - Unauthorized (no valid session)
- 400 - Database error

---

#### POST /api/restaurants
Creates a new restaurant for the authenticated user.

**Request Body:**
```json
{
  "name": "New Restaurant",
  "address": "456 Oak Ave, City, State 67890",
  "phone": "555-9876",
  "email": "info@newrestaurant.com"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "name": "New Restaurant",
  "address": "456 Oak Ave, City, State 67890",
  "phone": "555-9876",
  "email": "info@newrestaurant.com",
  "owner_id": "user-uuid",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 401 - Unauthorized
- 400 - Invalid request body or database error

---

### Menus

#### GET /api/menus
Retrieves all menus for a specific restaurant.

**Query Parameters:**
- `restaurantId` (required) - UUID of the restaurant

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "restaurant_id": "uuid",
    "name": "Lunch Menu",
    "description": "Available 11:00 AM - 2:00 PM",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

**Error Responses:**
- 400 - Missing restaurantId or database error

---

#### POST /api/menus
Creates a new menu for a restaurant.

**Request Body:**
```json
{
  "restaurant_id": "uuid",
  "name": "Dinner Menu",
  "description": "Available 5:00 PM - 10:00 PM"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "name": "Dinner Menu",
  "description": "Available 5:00 PM - 10:00 PM",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

### Menu Items

#### GET /api/menu-items
Retrieves all items in a specific menu.

**Query Parameters:**
- `menuId` (required) - UUID of the menu

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "menu_id": "uuid",
    "name": "Caesar Salad",
    "description": "Fresh romaine with parmesan and croutons",
    "price": "12.99",
    "availability": true,
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

**Error Responses:**
- 400 - Missing menuId or database error

---

#### POST /api/menu-items
Adds an item to a menu.

**Request Body:**
```json
{
  "menu_id": "uuid",
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon with lemon butter sauce",
  "price": 24.99,
  "availability": true
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "menu_id": "uuid",
  "name": "Grilled Salmon",
  "description": "Fresh Atlantic salmon with lemon butter sauce",
  "price": "24.99",
  "availability": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

#### PUT /api/menu-items
Updates an existing menu item.

**Request Body:**
```json
{
  "id": "uuid",
  "name": "Grilled Salmon",
  "description": "Updated description",
  "price": 26.99,
  "availability": true
}
```

**Response (200 - Success):**
```json
{
  "id": "uuid",
  "menu_id": "uuid",
  "name": "Grilled Salmon",
  "description": "Updated description",
  "price": "26.99",
  "availability": true,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

#### DELETE /api/menu-items
Deletes a menu item.

**Query Parameters:**
- `id` (required) - UUID of the menu item

**Response (200 - Success):**
```json
{
  "success": true
}
```

**Error Responses:**
- 400 - Missing id or database error

---

### Orders

#### GET /api/orders
Retrieves all orders for a restaurant (with nested order items).

**Query Parameters:**
- `restaurantId` (required) - UUID of the restaurant

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "restaurant_id": "uuid",
    "customer_name": "John Doe",
    "customer_phone": "555-1234",
    "customer_email": "john@example.com",
    "status": "pending",
    "total_amount": "45.99",
    "notes": "Extra sauce on the side",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z",
    "order_items": [
      {
        "id": "uuid",
        "order_id": "uuid",
        "menu_item_id": "uuid",
        "quantity": 2,
        "unit_price": "12.99",
        "subtotal": "25.98"
      }
    ]
  }
]
```

**Status Values:** `pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`

**Error Responses:**
- 400 - Missing restaurantId or database error

---

#### POST /api/orders
Creates a new order.

**Request Body:**
```json
{
  "restaurant_id": "uuid",
  "customer_name": "Jane Smith",
  "customer_phone": "555-5678",
  "customer_email": "jane@example.com",
  "status": "pending",
  "notes": "Special dietary requirements noted"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "customer_name": "Jane Smith",
  "customer_phone": "555-5678",
  "customer_email": "jane@example.com",
  "status": "pending",
  "total_amount": "0.00",
  "notes": "Special dietary requirements noted",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

### Order Items

#### GET /api/order-items
Retrieves all items in a specific order.

**Query Parameters:**
- `orderId` (required) - UUID of the order

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "order_id": "uuid",
    "menu_item_id": "uuid",
    "quantity": 2,
    "unit_price": "12.99",
    "subtotal": "25.98",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

**Error Responses:**
- 400 - Missing orderId or database error

---

#### POST /api/order-items
Adds an item to an order.

**Request Body:**
```json
{
  "order_id": "uuid",
  "menu_item_id": "uuid",
  "quantity": 2,
  "unit_price": 12.99,
  "subtotal": 25.98
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "menu_item_id": "uuid",
  "quantity": 2,
  "unit_price": "12.99",
  "subtotal": "25.98",
  "created_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

#### DELETE /api/order-items
Removes an item from an order.

**Query Parameters:**
- `id` (required) - UUID of the order item

**Response (200 - Success):**
```json
{
  "success": true
}
```

**Error Responses:**
- 400 - Missing id or database error

---

### Reservations

#### GET /api/reservations
Retrieves all reservations for a restaurant.

**Query Parameters:**
- `restaurantId` (required) - UUID of the restaurant

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "restaurant_id": "uuid",
    "customer_name": "Jane Smith",
    "customer_phone": "555-5678",
    "customer_email": "jane@example.com",
    "party_size": 4,
    "reservation_date": "2024-01-15T19:00:00Z",
    "status": "confirmed",
    "notes": "Window seat preferred",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

**Status Values:** `confirmed`, `cancelled`, `completed`, `no-show`

**Error Responses:**
- 400 - Missing restaurantId or database error

---

#### POST /api/reservations
Creates a new reservation.

**Request Body:**
```json
{
  "restaurant_id": "uuid",
  "customer_name": "John Doe",
  "customer_phone": "555-1234",
  "customer_email": "john@example.com",
  "party_size": 6,
  "reservation_date": "2024-01-20T19:30:00Z",
  "notes": "Birthday celebration"
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "customer_name": "John Doe",
  "customer_phone": "555-1234",
  "customer_email": "john@example.com",
  "party_size": 6,
  "reservation_date": "2024-01-20T19:30:00Z",
  "status": "confirmed",
  "notes": "Birthday celebration",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

### Inventory

#### GET /api/inventory
Retrieves all inventory items for a restaurant.

**Query Parameters:**
- `restaurantId` (required) - UUID of the restaurant

**Response (200 - Success):**
```json
[
  {
    "id": "uuid",
    "restaurant_id": "uuid",
    "item_name": "Tomatoes",
    "quantity": 45,
    "unit": "lbs",
    "reorder_level": 20,
    "last_updated": "2024-01-01T12:00:00Z"
  }
]
```

**Error Responses:**
- 400 - Missing restaurantId or database error

---

#### POST /api/inventory
Creates a new inventory item.

**Request Body:**
```json
{
  "restaurant_id": "uuid",
  "item_name": "Chicken Breast",
  "quantity": 100,
  "unit": "lbs",
  "reorder_level": 30
}
```

**Response (201 - Created):**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "item_name": "Chicken Breast",
  "quantity": 100,
  "unit": "lbs",
  "reorder_level": 30,
  "last_updated": "2024-01-01T12:00:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

#### PUT /api/inventory
Updates an inventory item.

**Request Body:**
```json
{
  "id": "uuid",
  "quantity": 75,
  "reorder_level": 35
}
```

**Response (200 - Success):**
```json
{
  "id": "uuid",
  "restaurant_id": "uuid",
  "item_name": "Chicken Breast",
  "quantity": 75,
  "unit": "lbs",
  "reorder_level": 35,
  "last_updated": "2024-01-01T15:30:00Z"
}
```

**Error Responses:**
- 400 - Invalid request body or database error

---

#### DELETE /api/inventory
Deletes an inventory item.

**Query Parameters:**
- `id` (required) - UUID of the inventory item

**Response (200 - Success):**
```json
{
  "success": true
}
```

**Error Responses:**
- 400 - Missing id or database error

---

## Error Handling

All API endpoints return standardized error responses:

**Error Response Format (400/401):**
```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- 200 - Success (GET, PUT)
- 201 - Created (POST)
- 400 - Bad Request (invalid data, missing parameters, database errors)
- 401 - Unauthorized (no valid session)

---

## Rate Limiting

Currently, there is no rate limiting implemented. Production deployments should consider adding rate limiting to prevent abuse.

---

## Pagination

Currently, pagination is not implemented. All results are returned in full. For large datasets, consider implementing offset/limit pagination.

---

## Authentication Examples

### Using JavaScript/Fetch

```javascript
// GET request
const response = await fetch('/api/restaurants', {
  method: 'GET',
  credentials: 'include', // Important: include cookies
})
const restaurants = await response.json()

// POST request
const newRestaurant = await fetch('/api/restaurants', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'New Restaurant',
    address: '123 Main St',
    phone: '555-1234',
    email: 'contact@restaurant.com'
  })
})
const created = await newRestaurant.json()
```

---

## Database Schema

### restaurants
- id (UUID, primary key)
- name (TEXT, required)
- address (TEXT)
- phone (TEXT)
- email (TEXT)
- owner_id (UUID, foreign key to auth.users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### menus
- id (UUID, primary key)
- restaurant_id (UUID, foreign key)
- name (TEXT, required)
- description (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### menu_items
- id (UUID, primary key)
- menu_id (UUID, foreign key)
- name (TEXT, required)
- description (TEXT)
- price (NUMERIC)
- availability (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### orders
- id (UUID, primary key)
- restaurant_id (UUID, foreign key)
- customer_name (TEXT, required)
- customer_phone (TEXT)
- customer_email (TEXT)
- status (TEXT, default: 'pending')
- total_amount (NUMERIC)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### order_items
- id (UUID, primary key)
- order_id (UUID, foreign key)
- menu_item_id (UUID, foreign key)
- quantity (INTEGER)
- unit_price (NUMERIC)
- subtotal (NUMERIC)
- created_at (TIMESTAMP)

### reservations
- id (UUID, primary key)
- restaurant_id (UUID, foreign key)
- customer_name (TEXT, required)
- customer_phone (TEXT, required)
- customer_email (TEXT)
- party_size (INTEGER, required)
- reservation_date (TIMESTAMP, required)
- status (TEXT, default: 'confirmed')
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### inventory
- id (UUID, primary key)
- restaurant_id (UUID, foreign key)
- item_name (TEXT, required)
- quantity (INTEGER)
- unit (TEXT)
- reorder_level (INTEGER)
- last_updated (TIMESTAMP)

---

## Version Information

- API Version: 1.0
- Last Updated: January 2024
- Authentication: Supabase Session Cookies
- Database: PostgreSQL (Supabase)
