import { type RestaurantRole } from '@/components/users/role-definitions'

export interface RoleRoute {
  role: RestaurantRole
  destination: string
  description: string
  icon?: string
}

export const ROLE_BASED_ROUTES: RoleRoute[] = [
  // Management Roles - Full Dashboard Access
  {
    role: 'admin',
    destination: '/dashboard',
    description: 'System Administrator Dashboard',
    icon: '👑'
  },
  {
    role: 'owner',
    destination: '/dashboard',
    description: 'Restaurant Owner Dashboard',
    icon: '🏢'
  },
  {
    role: 'general_manager',
    destination: '/dashboard',
    description: 'General Manager Dashboard',
    icon: '📊'
  },
  {
    role: 'assistant_manager',
    destination: '/dashboard',
    description: 'Assistant Manager Dashboard',
    icon: '📈'
  },
  {
    role: 'manager',
    destination: '/dashboard',
    description: 'Manager Dashboard',
    icon: '📋'
  },
  {
    role: 'shift_manager',
    destination: '/dashboard',
    description: 'Shift Manager Dashboard',
    icon: '⏰'
  },

  // Kitchen Roles - Kitchen Display
  {
    role: 'chef',
    destination: '/dashboard',
    description: 'Chef Dashboard',
    icon: '👨‍🍳'
  },
  {
    role: 'head_chef',
    destination: '/kitchen',
    description: 'Head Chef Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'sous_chef',
    destination: '/kitchen',
    description: 'Sous Chef Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'line_cook',
    destination: '/kitchen',
    description: 'Line Cook Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'prep_cook',
    destination: '/kitchen',
    description: 'Prep Cook Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'grill_cook',
    destination: '/kitchen',
    description: 'Grill Cook Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'fry_cook',
    destination: '/kitchen',
    description: 'Fry Cook Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'pastry_chef',
    destination: '/kitchen',
    description: 'Pastry Chef Kitchen Display',
    icon: '👨‍🍳'
  },
  {
    role: 'dishwasher',
    destination: '/kitchen',
    description: 'Dishwasher Kitchen Display',
    icon: '🧼'
  },
  {
    role: 'kitchen_helper',
    destination: '/kitchen',
    description: 'Kitchen Helper Display',
    icon: '👨‍🍳'
  },

  // Front of House Roles - POS System
  {
    role: 'server',
    destination: '/pos',
    description: 'Server POS System',
    icon: '🍽'
  },
  {
    role: 'waiter',
    destination: '/pos',
    description: 'Waiter POS System',
    icon: '🍽'
  },
  {
    role: 'waitress',
    destination: '/pos',
    description: 'Waitress POS System',
    icon: '🍽'
  },
  {
    role: 'host',
    destination: '/pos',
    description: 'Host POS System',
    icon: '👋'
  },
  {
    role: 'bartender',
    destination: '/pos',
    description: 'Bartender POS System',
    icon: '🍸'
  },
  {
    role: 'barista',
    destination: '/pos',
    description: 'Barista POS System',
    icon: '☕'
  },
  {
    role: 'sommelier',
    destination: '/pos',
    description: 'Sommelier POS System',
    icon: '🍷'
  },
  {
    role: 'busser',
    destination: '/pos',
    description: 'Busser POS System',
    icon: '🍽'
  },
  {
    role: 'runner',
    destination: '/pos',
    description: 'Runner POS System',
    icon: '🏃'
  },

  // Support Staff - POS System
  {
    role: 'cashier',
    destination: '/pos',
    description: 'Cashier POS System',
    icon: '💰'
  },
  {
    role: 'delivery_driver',
    destination: '/pos',
    description: 'Delivery Driver POS System',
    icon: '🚚'
  },
  {
    role: 'cleaner',
    destination: '/pos',
    description: 'Cleaner POS System',
    icon: '🧹'
  },
  {
    role: 'security',
    destination: '/pos',
    description: 'Security POS System',
    icon: '🔒'
  }
]

export const getRouteForRole = (role: RestaurantRole): RoleRoute | undefined => {
  return ROLE_BASED_ROUTES.find(route => route.role === role)
}

export const getDestinationForRole = (role: RestaurantRole): string => {
  const route = getRouteForRole(role)
  return route?.destination || '/pos'
}

export const getRoleDescription = (role: RestaurantRole): string => {
  const route = getRouteForRole(role)
  return route?.description || 'POS System'
}
