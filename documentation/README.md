# Restaurant Management System

A comprehensive full-stack web application for managing all aspects of a restaurant's operations including menus, orders, reservations, and inventory.

## Features

### 🍽️ Menu Management
- Create multiple menus (lunch, dinner, seasonal, etc.)
- Add menu items with descriptions and pricing
- Toggle item availability
- Edit and delete menu items
- Organize items by menu

### 📦 Order Management
- Create new orders with customer information
- Add multiple items to each order
- Track order status (pending, confirmed, preparing, ready, completed, cancelled)
- View order history with timestamps
- Display order totals and item details

### 🪑 Reservation System
- Book table reservations with customer details
- Set reservation date and time
- Specify party size
- Track reservation status
- Add special notes and requests
- Calendar view for easy scheduling

### 📊 Inventory Tracking
- Track inventory items with quantities
- Set reorder levels for automatic alerts
- Monitor stock levels
- Edit quantities as items are used
- Delete items from inventory
- Visual indicators for low-stock items

### 🔐 Authentication
- Secure OAuth with Supabase
- Protected routes requiring authentication
- Session-based access control
- User isolation of data

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **SWR** - Data fetching and caching
- **React Hook Form** - Form management
- **Lucide Icons** - Icon library

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **TypeScript** - Type safety

### Database & Auth
- **Supabase** - PostgreSQL database and authentication
- **PostgreSQL** - Relational database

### Deployment
- **Vercel** - Hosting and deployment

## Project Structure

```
.
├── app/
│   ├── api/                    # API route handlers
│   │   ├── restaurants/
│   │   ├── menus/
│   │   ├── menu-items/
│   │   ├── order-items/
│   │   ├── orders/
│   │   ├── reservations/
│   │   ├── inventory/
│   │   └── auth/callback/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main dashboard pages
│   │   ├── [id]/               # Restaurant management
│   │   │   ├── menus/
│   │   │   ├── orders/
│   │   │   ├── reservations/
│   │   │   └── inventory/
│   │   └── new-restaurant/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── page.tsx                # Landing page
├── components/                 # Reusable components
│   ├── ui/                     # shadcn/ui components
│   ├── dashboard-header.tsx    # Navigation header
│   ├── restaurant-*.tsx        # Restaurant components
│   ├── menu-*.tsx              # Menu components
│   ├── order-*.tsx             # Order components
│   ├── reservation-*.tsx       # Reservation components
│   └── inventory-*.tsx         # Inventory components
├── hooks/                      # Custom React hooks
│   ├── use-restaurants.ts
│   ├── use-menus.ts
│   ├── use-orders.ts
│   ├── use-reservations.ts
│   ├── use-inventory.ts
│   └── use-menu-items.ts
├── lib/
│   ├── supabase/              # Supabase client utilities
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts               # Utility functions
├── scripts/                    # Database setup scripts
│   └── 01-create-tables.sql   # Database schema
├── public/                     # Static assets
├── API_DOCUMENTATION.md        # API endpoint documentation
├── PAGES_DOCUMENTATION.md      # Pages and components guide
└── README.md                   # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- pnpm (recommended) or npm
- Supabase account (free tier works)

### Installation

1. **Clone the repository** (if not already cloned)
   ```bash
   git clone <repository-url>
   cd restaurant-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The database schema is automatically created when the migration is executed. The schema includes:

- **restaurants** - Restaurant information
- **menus** - Restaurant menus
- **menu_items** - Items within menus
- **orders** - Customer orders
- **order_items** - Items within orders
- **reservations** - Table reservations
- **inventory** - Stock inventory

See `scripts/01-create-tables.sql` for complete schema definition.

## API Documentation

Full API documentation is available in `API_DOCUMENTATION.md`. This includes:

- All endpoints with request/response examples
- Authentication requirements
- Query parameters and request body formats
- Error handling and status codes
- Database schema details

## Pages Documentation

Comprehensive documentation for all pages and components is available in `PAGES_DOCUMENTATION.md`. This includes:

- Page structure and routing
- Component props and features
- Data flow diagrams
- Form validation rules
- Error handling strategies

## Authentication

The application uses Supabase OAuth for authentication:

1. Users click "Get Started" or "Dashboard"
2. Redirected to Supabase OAuth provider
3. User authenticates
4. Redirected back to `/auth/callback`
5. Session established via HTTP-only cookie
6. User can now access protected routes

All API routes require a valid session.

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Code Style
The project follows TypeScript and React best practices with:
- Type-safe code throughout
- Proper error handling
- Console logging with `[System]` prefix for debugging
- Component documentation with JSDoc comments

## Key Features Implementation

### Form Validation
- React Hook Form for form state management
- Client-side validation with Zod
- Server-side validation on API routes
- User-friendly error messages

### Data Fetching
- SWR for client-side caching
- Automatic revalidation on focus
- Loading and error states
- Optimistic updates where applicable

### Error Handling
- Try-catch blocks in all async operations
- HTTP status codes for different error types
- Console logging with `[API]` and `[Hook]` prefixes
- User-friendly toast notifications

### Performance
- React Server Components where appropriate
- Lazy loading of components
- CSS-in-JS optimization with Tailwind
- Efficient database queries

## Debugging

The application includes comprehensive logging for debugging:

- **API Routes**: Log with `[API]` prefix
- **Hooks**: Log with `[Hook]` prefix
- **Components**: Log with `[ComponentName]` prefix
- **Dashboard**: Log with `[Dashboard]` prefix

Example:
```javascript
console.log('[API] GET restaurants error:', error)
console.log('[Hook] Fetching from /api/restaurants')
console.log('[RestaurantsList] Loaded 5 restaurants')
```

## Troubleshooting

### "Unauthorized" Error
- Check if Supabase session is valid
- Verify environment variables are set correctly
- Clear browser cookies and re-authenticate

### "Restaurant ID Required" Error
- Ensure you're navigating with correct restaurant UUID in URL
- Check URL parameters match database IDs

### API Returns Empty Array
- Verify user authentication status
- Check if data exists in database
- Review Supabase RLS policies

### Page Not Loading
- Check browser console for errors
- Verify all environment variables are set
- Check Supabase project status

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Production
Add the following in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

When contributing to this project:

1. Follow the existing code style
2. Add JSDoc comments for new functions
3. Include console logging for debugging
4. Update relevant documentation files
5. Test all changes before submitting

## Future Enhancements

Planned features for future releases:

- [ ] Real-time order status updates with WebSockets
- [ ] Kitchen Display System (KDS)
- [ ] Advanced analytics and reporting
- [ ] Multi-location restaurant support
- [ ] Staff management and scheduling
- [ ] Role-based access control (admin, staff, etc.)
- [ ] Image uploads for menu items
- [ ] Payment processor integration
- [ ] SMS/Email notifications
- [ ] Mobile-friendly improvements
- [ ] Dark mode support
- [ ] Internationalization (i18n)

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
1. Check the documentation files (API_DOCUMENTATION.md, PAGES_DOCUMENTATION.md)
2. Review console logs for debugging information
3. Check Supabase project status
4. Review browser console for client-side errors

## Changelog

### v1.0.0 (Initial Release)
- Core restaurant management features
- Menu and menu items management
- Order management system
- Table reservations
- Inventory tracking
- Supabase authentication
- RESTful API
- Responsive UI with Tailwind CSS

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** Production Ready
