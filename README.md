# Restaurant Management System MVP

A comprehensive restaurant management system built with Next.js 16, TypeScript, and Supabase. This system provides complete functionality for managing menus, orders, inventory, staff, and kitchen operations in a modern, responsive web application.

## 🚀 Features

### Core Management
- **Point of Sale (POS)** - Complete order management with payment processing
- **Inventory Management** - Real-time stock tracking with low-stock alerts
- **User Management** - Role-based access control (Admin, Manager, Cashier, Chef)
- **Kitchen Display** - Real-time order status with text-to-speech announcements
- **Staff Assignment** - Server assignment and order distribution
- **Reservations** - Table booking and customer management
- **Analytics & Reports** - Sales analytics, order trends, and performance metrics

### Technical Features
- **Multi-Restaurant Support** - Manage multiple restaurant locations
- **Real-time Updates** - Live data synchronization across all devices
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Themes** - Multiple theme options including kitchen-optimized modes
- **Role-based Access** - Secure permissions based on staff roles
- **Receipt Generation** - Digital receipts with PDF download capability

## 🏗️ System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                │
├─────────────────────────────────────────────────────────────┤
│  Pages & Routes                                      │
│  ├── / (auth)/login - Authentication               │
│  ├── / (dashboard)/                                │
│  │   ├── /pos - Point of Sale                    │
│  │   ├── /inventory - Stock Management              │
│  │   ├── /users - Staff Management                │
│  │   ├── /kitchen - Order Display                │
│  │   ├── /reports - Analytics                    │
│  │   ├── /receipts - Order History               │
│  │   └── /settings - Configuration              │
│  └── /dashboard/[id]/ - Restaurant-specific        │
│      ├── /orders - Order Management              │
│      ├── /reservations - Booking System          │
│      └── /staff-assignment - Server Management    │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Component Layers                     │
├─────────────────────────────────────────────────────────────┤
│  UI Components (shadcn/ui)                        │
│  ├── Forms, Buttons, Cards, Tables, etc.           │
│  │                                                   │
│  Business Components                                   │
│  ├── POS Components - Order forms, payment modals     │
│  ├── Kitchen Components - Order cards, status displays  │
│  ├── Inventory Components - Stock tracking, alerts      │
│  └── User Components - Role management, permissions  │
│                                                         │
│  Data Hooks (SWR)                                      │
│  ├── useOrders, useInventory, useUsers, etc.          │
│  └── Real-time data fetching with optimistic updates      │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Database Architecture

### Database Schema
```sql
┌─────────────────────────────────────────────────────────────┐
│                    Supabase PostgreSQL              │
├─────────────────────────────────────────────────────────────┤
│  Core Tables                                         │
│  ├── restaurants - Restaurant locations & settings        │
│  ├── users - Staff accounts & roles                   │
│  ├── menus - Restaurant menu categories                │
│  ├── menu_items - Food & beverage items               │
│  ├── orders - Customer orders & payments              │
│  ├── order_items - Ordered items & quantities          │
│  ├── inventory - Stock levels & tracking              │
│  └── reservations - Table bookings & customer data   │
│                                                         │
│  Relationships & Constraints                            │
│  ├── Foreign keys for data integrity                  │
│  ├── Cascade deletes for consistency                  │
│  └── Role-based access control                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                    Data Flow Architecture              │
├─────────────────────────────────────────────────────────────┤
│  Client (Browser)                                    │
│  ├── React Components with SWR hooks                  │
│  ├── Real-time updates via WebSocket/Supabase          │
│  └── Optimistic UI updates                          │
│                                                         │
│  API Layer (/app/api/*)                              │
│  ├── Next.js API Routes (server-side)                │
│  ├── Authentication & authorization                    │
│  ├── Data validation & sanitization                   │
│  └── Error handling & logging                      │
│                                                         │
│  Database (Supabase)                                 │
│  ├── PostgreSQL for persistent storage                  │
│  ├── Row Level Security (RLS) for access control   │
│  └── Real-time subscriptions                      │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Hooks + SWR for data fetching
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **PDF Generation**: jsPDF + html2canvas

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT tokens
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage for receipts/images

### Development Tools
- **Package Manager**: pnpm
- **Code Quality**: TypeScript with strict mode
- **Build Tool**: Next.js with Turbopack
- **Deployment**: Vercel/Netlify/Railway ready

## 🚀 Deployment

### Supported Platforms
1. **Vercel** (Recommended for Next.js)
   - Automatic SSR optimization
   - Built-in CI/CD
   - Global CDN
   - Environment variable management

2. **Netlify** (Alternative)
   - GitHub integration
   - Form handling
   - Split testing
   - Edge functions

3. **Railway** (Full-stack)
   - Database included
   - Docker support
   - Simple deployment

4. **Render** (Developer-friendly)
   - Free tier available
   - Auto-deploy from Git
   - SSL certificates

### Deployment Steps

#### Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy project
vercel --prod

# 4. Add environment variables in Vercel dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

#### Netlify Deployment
```bash
# 1. Build project
npm run build

# 2. Deploy to Netlify
# - Connect GitHub repository
# - Set build command: npm run build
# - Set publish directory: .next
# - Add environment variables
```

### Environment Variables
```bash
# Required for all deployments
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔄 Data Flow & Business Logic

### Order Processing Flow
```
┌─────────────────────────────────────────────────────────────┐
│                Order Lifecycle                      │
├─────────────────────────────────────────────────────────────┤
│  1. Customer Order (POS)                            │
│     ├── Menu item selection                           │
│     ├── Quantity & customization                       │
│     └── Customer information                         │
│                                                         │
│  2. Order Processing                                 │
│     ├── Payment processing                            │
│     ├── Order confirmation                           │
│     └── Kitchen notification                        │
│                                                         │
│  3. Kitchen Operations                               │
│     ├── Real-time order display                      │
│     ├── Status updates (pending → preparing → ready)  │
│     └── Text-to-speech announcements                │
│                                                         │
│  4. Order Completion                                 │
│     ├── Server assignment                           │
│     ├── Order fulfillment                          │
│     └── Receipt generation                        │
└─────────────────────────────────────────────────────────────┘
```

### Inventory Management Flow
```
┌─────────────────────────────────────────────────────────────┐
│              Inventory Management System              │
├─────────────────────────────────────────────────────────────┤
│  1. Stock Monitoring                                   │
│     ├── Real-time quantity tracking                   │
│     ├── Low stock alerts                          │
│     └── Automatic reorder level calculations         │
│                                                         │
│  2. Stock Updates                                      │
│     ├── Manual stock adjustments                   │
│     ├── Automatic deduction from orders             │
│     └── Supplier restocking                      │
│                                                         │
│  3. Reporting & Analytics                              │
│     ├── Usage trends                              │
│     ├── Waste tracking                            │
│     └── Cost analysis                           │
└─────────────────────────────────────────────────────────────┘
```

### User Management Flow
```
┌─────────────────────────────────────────────────────────────┐
│               Role-Based Access Control               │
├─────────────────────────────────────────────────────────────┤
│  Roles & Permissions                                   │
│  ├── Admin: Full system access                     │
│  ├── Manager: Inventory + reports + staff management   │
│  ├── Cashier: POS + order management               │
│  └── Chef: Kitchen display + order status updates    │
│                                                         │
│  Authentication Flow                                   │
│  ├── Secure login with JWT tokens                  │
│  ├── Role-based route protection                 │
│  └── Session management                         │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Key Features Deep Dive

### Point of Sale (POS)
- **Menu Management**: Dynamic menu loading with categories
- **Order Management**: Add, modify, remove items
- **Payment Processing**: Multiple payment methods
- **Receipt Generation**: Digital and printable receipts
- **Restaurant Selection**: Multi-location support

### Kitchen Display System
- **Real-time Updates**: Live order status
- **Text-to-Speech**: Audio announcements for ready orders
- **Visual Indicators**: Color-coded status badges
- **Staff Assignment**: Server assignment interface
- **Kitchen Themes**: Optimized for kitchen environments

### Inventory Management
- **Real-time Tracking**: Live stock levels
- **Low Stock Alerts**: Automatic notifications
- **Batch Operations**: Bulk updates and restocking
- **Usage Analytics**: Consumption tracking
- **Supplier Management**: Vendor information

### User Management
- **Role-Based Access**: Secure permission system
- **Staff Profiles**: Complete user information
- **Password Management**: Secure authentication
- **Activity Logging**: User action tracking
- **Bulk Operations**: Import/export capabilities

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Granular permissions
- **API Security**: Request validation and sanitization
- **Row Level Security**: Database-level access control
- **Secure Headers**: CORS and security headers

### Data Protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token-based requests
- **Environment Security**: Secure variable handling

## 📱 Responsive Design

### Mobile Optimization
- **Touch-Friendly**: Large tap targets
- **Swipe Gestures**: Natural mobile interactions
- **Offline Support**: Service worker capabilities
- **Progressive Web App**: Installable on mobile devices
- **Adaptive Layout**: Screen-size optimization

### Cross-Platform Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Devices**: iOS Safari, Chrome Mobile
- **Tablet Support**: iPad, Android tablets
- **Desktop Optimization**: Full keyboard/mouse support

## 🧪 Testing & Quality

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Unit Tests**: Component testing (planned)
- **Integration Tests**: API testing (planned)
- **E2E Tests**: Full user flows (planned)

### Performance Optimization
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Size optimization
- **Caching Strategy**: SWR + browser caching
- **Core Web Vitals**: Performance monitoring

## 🔧 Development Setup

### Local Development
```bash
# Clone repository
git clone https://github.com/Micjeal/rest-pro.git
cd rest-pro

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev
```

### Project Structure
```
restaurant-mvp-system/
├── app/                    # Next.js App Router pages
├── components/              # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── kitchen/           # Kitchen display components
│   ├── pos/               # Point of sale components
│   └── users/             # User management components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── types/                  # TypeScript type definitions
├── styles/                 # Global CSS files
├── documentation/           # Project documentation
├── database-plans/         # Database schemas
└── scripts/               # Build and utility scripts
```

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript** strict mode
2. **Use Tailwind CSS** for styling
3. **Write component tests** for new features
4. **Update documentation** for API changes
5. **Follow Git flow** for contributions

### Code Standards
- **Component Structure**: Functional components with hooks
- **Error Handling**: Proper error boundaries
- **Loading States**: Skeleton components and spinners
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized re-renders and memoization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation**: `/documentation/API_DOCUMENTATION.md`
- **Setup Guide**: `/documentation/README.md`
- **Troubleshooting**: `/documentation/TESTING_GUIDE.md`

### Contact
- **Issues**: Report bugs via GitHub Issues
- **Features**: Request features via GitHub Discussions
- **Support**: Email support for enterprise deployments

---

## 🎯 Quick Start

1. **Clone & Install**: `git clone && pnpm install`
2. **Configure**: Set up Supabase project and environment variables
3. **Deploy**: Push to Vercel/Netlify with environment variables
4. **Use**: Login with admin credentials and start managing!

**Built with ❤️ for restaurant owners and managers worldwide.**
