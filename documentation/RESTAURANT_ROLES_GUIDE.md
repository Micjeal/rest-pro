# Restaurant Staff Roles Guide

This guide provides comprehensive information about all restaurant staff roles available in the system and how to manage them.

## Overview

The restaurant management system now supports **25 different staff roles** across 4 main categories:
- Management Roles (6)
- Kitchen Staff (9) 
- Front of House Staff (9)
- Support & Other Staff (3)

## Role Categories

### 🏢 Management Roles
| Role | Display Name | Key Permissions | Hourly Rate (Sample) |
|------|--------------|------------------|----------------------|
| `admin` | System Administrator | Full system access, user management | - |
| `owner` | Restaurant Owner | Restaurant control, staff management, financials | - |
| `general_manager` | General Manager | All operations oversight | $25-35 |
| `assistant_manager` | Assistant Manager | Daily operations support | $20-28 |
| `manager` | Manager | Specific area management | $18-25 |
| `shift_manager` | Shift Manager | Shift-specific operations | $15-22 |

### 👨‍🍳 Kitchen Staff
| Role | Display Name | Key Responsibilities | Hourly Rate (Sample) |
|------|--------------|---------------------|----------------------|
| `head_chef` | Head Chef | Kitchen leadership, menu development | $28-40 |
| `sous_chef` | Sous Chef | Second in command, kitchen coordination | $22-32 |
| `line_cook` | Line Cook | Station-specific food preparation | $16-24 |
| `prep_cook` | Prep Cook | Ingredient preparation, station setup | $14-18 |
| `grill_cook` | Grill Cook | Grilled items preparation | $16-22 |
| `fry_cook` | Fry Cook | Fried items preparation | $15-20 |
| `pastry_chef` | Pastry Chef | Desserts and baked goods | $20-30 |
| `dishwasher` | Dishwasher | Kitchen cleanliness, dish washing | $12-15 |
| `kitchen_helper` | Kitchen Helper | Basic kitchen tasks assistance | $11-14 |

### 🍽️ Front of House Staff
| Role | Display Name | Key Responsibilities | Hourly Rate (Sample) |
|------|--------------|---------------------|----------------------|
| `server` | Server | Take orders, serve customers, payments | $12-20 (+ tips) |
| `waiter` | Waiter | Male serving staff | $12-20 (+ tips) |
| `waitress` | Waitress | Female serving staff | $12-20 (+ tips) |
| `host` | Host | Guest greeting, seating management | $11-16 |
| `bartender` | Bartender | Drink preparation, bar management | $15-25 (+ tips) |
| `barista` | Barista | Coffee and beverage preparation | $12-18 |
| `sommelier` | Sommelier | Wine service, wine list management | $20-35 |
| `busser` | Busser | Table clearing, server assistance | $10-14 |
| `runner` | Runner | Food delivery from kitchen to tables | $11-15 |

### 🔧 Support & Other Staff
| Role | Display Name | Key Responsibilities | Hourly Rate (Sample) |
|------|--------------|---------------------|----------------------|
| `cashier` | Cashier | Payment processing, checkout | $12-16 |
| `delivery_driver` | Delivery Driver | Order delivery to customers | $14-20 (+ mileage) |
| `cleaner` | Cleaner | Restaurant maintenance | $12-16 |
| `security` | Security | Safety and security | $15-25 |

## Database Schema

### New Tables Created

#### `roles` Table
Stores role definitions with permissions and metadata:
- `name`: Internal role identifier
- `display_name`: Human-readable role name
- `description`: Role description
- `category`: Management, Kitchen, Front of House, Other
- `permissions`: JSON object with role permissions
- `is_management_role`: Boolean flag for management roles
- `is_kitchen_role`: Boolean flag for kitchen roles
- `is_front_of_house`: Boolean flag for front of house roles

#### `staff_assignments` Table
Links users to restaurants with specific roles:
- `user_id`: Reference to users table
- `restaurant_id`: Reference to restaurants table
- `role`: Role name
- `hire_date`: When staff was hired
- `termination_date`: When staff employment ended
- `is_active`: Current employment status
- `hourly_rate`: Hourly wage
- `salary`: Annual salary (if applicable)
- `schedule`: JSON object for schedule information

#### `shifts` Table
Manages staff scheduling:
- `restaurant_id`: Reference to restaurants table
- `staff_assignment_id`: Reference to staff_assignments table
- `shift_date`: Date of the shift
- `start_time` / `end_time`: Shift timing
- `position`: Working position during shift
- `is_approved`: Shift approval status

### Views and Functions

#### `staff_directory` View
Provides a comprehensive view of all active staff with their roles and assignments.

#### `get_restaurant_staff()` Function
Retrieves staff for a specific restaurant, optionally filtered by role:
```sql
SELECT * FROM get_restaurant_staff(restaurant_uuid, 'server');
```

## How to Use

### 1. Adding New Staff Members

```sql
-- Insert a new user
INSERT INTO users (email, password_hash, name, role) 
VALUES ('newserver@restaurant.com', '$2b$10$...', 'John Doe', 'server');

-- Assign to restaurant
INSERT INTO staff_assignments (user_id, restaurant_id, role, hourly_rate)
VALUES (
  (SELECT id FROM users WHERE email = 'newserver@restaurant.com'),
  (SELECT id FROM restaurants WHERE name = 'Your Restaurant'),
  'server',
  15.00
);
```

### 2. Updating Staff Roles

```sql
-- Update user role
UPDATE users SET role = 'shift_manager' WHERE email = 'user@restaurant.com';

-- Update assignment
UPDATE staff_assignments 
SET role = 'shift_manager', hourly_rate = 20.00
WHERE user_id = (SELECT id FROM users WHERE email = 'user@restaurant.com');
```

### 3. Managing Staff Schedules

```sql
-- Add a shift
INSERT INTO shifts (restaurant_id, staff_assignment_id, shift_date, start_time, end_time, position)
VALUES (
  restaurant_uuid,
  assignment_uuid,
  '2026-02-21',
  '09:00:00',
  '17:00:00',
  'server'
);
```

### 4. Viewing Staff by Department

```sql
-- Get all kitchen staff
SELECT * FROM staff_directory 
WHERE role_category = 'Kitchen' AND restaurant_name = 'Your Restaurant';

-- Get all management staff
SELECT * FROM staff_directory 
WHERE role_category = 'Management' AND restaurant_name = 'Your Restaurant';
```

## Sample Login Credentials

The system includes sample staff accounts for testing (password: `password123`):

### Management
- **admin@restaurant.com** - System Administrator
- **manager@restaurant.com** - General Manager

### Kitchen Staff
- **chef@gardenbistro.com** - Head Chef
- **souschef@gardenbistro.com** - Sous Chef
- **linecook1@gardenbistro.com** - Line Cook

### Front of House
- **server1@gardenbistro.com** - Server
- **host1@gardenbistro.com** - Host
- **bartender1@gardenbistro.com** - Bartender

### Support Staff
- **cashier@restaurant.com** - Cashier
- **delivery1@pizzapalace.com** - Delivery Driver

## Role-Based Access Control

Each role has specific permissions defined in the `permissions` JSON field:

### Management Permissions
- `can_manage_users`: Add/edit/remove users
- `can_manage_restaurants`: Restaurant settings
- `can_view_financials`: Access financial reports
- `can_manage_staff`: Staff management
- `can_manage_inventory`: Inventory control
- `can_manage_orders`: Order management

### Kitchen Permissions
- `can_manage_menu`: Menu item management
- `can_manage_kitchen_staff`: Kitchen staff supervision
- `can_view_orders`: View incoming orders
- `can_update_order_status`: Change order status

### Front of House Permissions
- `can_take_orders`: Create new orders
- `can_manage_tables`: Table management
- `can_process_payments`: Handle payments
- `can_manage_reservations`: Reservation management
- `can_manage_bar`: Bar inventory and operations

## Implementation Notes

1. **Security**: All tables have Row Level Security (RLS) enabled
2. **Audit Trail**: Created/updated timestamps track changes
3. **Flexibility**: JSON fields allow for custom permissions and schedules
4. **Scalability**: Designed to handle multiple restaurants and large staff counts
5. **Integration**: Works with existing user authentication and restaurant management

## Next Steps

1. Run the SQL script to update your database
2. Test the new roles with sample accounts
3. Update your UI to display role-specific features
4. Implement role-based access control in your frontend
5. Add staff management interfaces for administrators

This comprehensive role system provides the foundation for a complete restaurant workforce management solution.
