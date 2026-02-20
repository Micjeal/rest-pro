// Comprehensive role definitions for the restaurant system
export type RestaurantRole = 
  // Management Roles
  | 'admin' 
  | 'owner' 
  | 'general_manager' 
  | 'assistant_manager' 
  | 'manager' 
  | 'shift_manager'
  
  // Kitchen Staff  
  | 'chef'
  | 'head_chef' 
  | 'sous_chef' 
  | 'line_cook' 
  | 'prep_cook' 
  | 'grill_cook' 
  | 'fry_cook' 
  | 'pastry_chef' 
  | 'dishwasher' 
  | 'kitchen_helper'
  
  // Front of House Staff
  | 'server' 
  | 'waiter' 
  | 'waitress' 
  | 'host' 
  | 'bartender' 
  | 'barista' 
  | 'sommelier' 
  | 'busser' 
  | 'runner'
  
  // Support Staff
  | 'cashier' 
  | 'delivery_driver' 
  | 'cleaner' 
  | 'security'

export interface RoleDefinition {
  value: RestaurantRole
  label: string
  description: string
  category: 'Management' | 'Kitchen' | 'Front of House' | 'Support'
  permissions: string[]
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  // Management Roles
  {
    value: 'admin',
    label: 'System Administrator',
    description: 'Full system access including user management and all operations',
    category: 'Management',
    permissions: ['All permissions']
  },
  {
    value: 'owner',
    label: 'Restaurant Owner',
    description: 'Complete restaurant management except user management',
    category: 'Management',
    permissions: ['Restaurant operations, financial reports, staff management']
  },
  {
    value: 'general_manager',
    label: 'General Manager',
    description: 'Oversee all restaurant operations and staff',
    category: 'Management',
    permissions: ['Full restaurant management, staff coordination']
  },
  {
    value: 'assistant_manager',
    label: 'Assistant Manager',
    description: 'Assist with daily operations and staff supervision',
    category: 'Management',
    permissions: ['Operations, inventory, menus, basic reports']
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Manage daily operations and inventory',
    category: 'Management',
    permissions: ['Operations, inventory, menus, reports']
  },
  {
    value: 'shift_manager',
    label: 'Shift Manager',
    description: 'Supervise specific shifts and staff',
    category: 'Management',
    permissions: ['Shift supervision, order management']
  },

  // Kitchen Staff
  {
    value: 'chef',
    label: 'Chef',
    description: 'Kitchen staff with dashboard access',
    category: 'Kitchen',
    permissions: ['Kitchen operations, dashboard access']
  },
  {
    value: 'head_chef',
    label: 'Head Chef',
    description: 'Lead kitchen operations and menu development',
    category: 'Kitchen',
    permissions: ['Kitchen management, menu creation, inventory control']
  },
  {
    value: 'sous_chef',
    label: 'Sous Chef',
    description: 'Assist head chef and supervise kitchen staff',
    category: 'Kitchen',
    permissions: ['Kitchen supervision, food preparation']
  },
  {
    value: 'line_cook',
    label: 'Line Cook',
    description: 'Prepare specific menu items',
    category: 'Kitchen',
    permissions: ['Food preparation, station management']
  },
  {
    value: 'prep_cook',
    label: 'Prep Cook',
    description: 'Prepare ingredients and assist line cooks',
    category: 'Kitchen',
    permissions: ['Food preparation, ingredient prep']
  },
  {
    value: 'grill_cook',
    label: 'Grill Cook',
    description: 'Manage grill station and grilled items',
    category: 'Kitchen',
    permissions: ['Grill operations, food preparation']
  },
  {
    value: 'fry_cook',
    label: 'Fry Cook',
    description: 'Manage fry station and fried items',
    category: 'Kitchen',
    permissions: ['Fry station operations, food preparation']
  },
  {
    value: 'pastry_chef',
    label: 'Pastry Chef',
    description: 'Prepare desserts and baked goods',
    category: 'Kitchen',
    permissions: ['Dessert preparation, baking']
  },
  {
    value: 'dishwasher',
    label: 'Dishwasher',
    description: 'Maintain kitchen cleanliness and dishwashing',
    category: 'Kitchen',
    permissions: ['Kitchen maintenance, dishwashing']
  },
  {
    value: 'kitchen_helper',
    label: 'Kitchen Helper',
    description: 'Assist with various kitchen tasks',
    category: 'Kitchen',
    permissions: ['Basic kitchen assistance']
  },

  // Front of House Staff
  {
    value: 'server',
    label: 'Server',
    description: 'Take orders and serve customers',
    category: 'Front of House',
    permissions: ['Order taking, customer service, payments']
  },
  {
    value: 'waiter',
    label: 'Waiter',
    description: 'Serve food and drinks to customers',
    category: 'Front of House',
    permissions: ['Customer service, order delivery']
  },
  {
    value: 'waitress',
    label: 'Waitress',
    description: 'Serve food and drinks to customers',
    category: 'Front of House',
    permissions: ['Customer service, order delivery']
  },
  {
    value: 'host',
    label: 'Host',
    description: 'Greet guests and manage seating',
    category: 'Front of House',
    permissions: ['Guest greeting, table management']
  },
  {
    value: 'bartender',
    label: 'Bartender',
    description: 'Prepare and serve alcoholic beverages',
    category: 'Front of House',
    permissions: ['Bar operations, drink preparation']
  },
  {
    value: 'barista',
    label: 'Barista',
    description: 'Prepare coffee and espresso drinks',
    category: 'Front of House',
    permissions: ['Coffee preparation, barista station']
  },
  {
    value: 'sommelier',
    label: 'Sommelier',
    description: 'Manage wine selection and service',
    category: 'Front of House',
    permissions: ['Wine service, wine list management']
  },
  {
    value: 'busser',
    label: 'Busser',
    description: 'Clear tables and assist servers',
    category: 'Front of House',
    permissions: ['Table clearing, server assistance']
  },
  {
    value: 'runner',
    label: 'Runner',
    description: 'Deliver food from kitchen to tables',
    category: 'Front of House',
    permissions: ['Food delivery, kitchen coordination']
  },

  // Support Staff
  {
    value: 'cashier',
    label: 'Cashier',
    description: 'Process payments and handle cash transactions',
    category: 'Support',
    permissions: ['Payment processing, cash handling']
  },
  {
    value: 'delivery_driver',
    label: 'Delivery Driver',
    description: 'Deliver orders to customers',
    category: 'Support',
    permissions: ['Order delivery, customer interaction']
  },
  {
    value: 'cleaner',
    label: 'Cleaner',
    description: 'Maintain restaurant cleanliness',
    category: 'Support',
    permissions: ['Cleaning, maintenance']
  },
  {
    value: 'security',
    label: 'Security',
    description: 'Ensure restaurant safety and security',
    category: 'Support',
    permissions: ['Safety, security monitoring']
  }
]

export const getRoleLabel = (role: RestaurantRole): string => {
  const roleDef = ROLE_DEFINITIONS.find(r => r.value === role)
  return roleDef?.label || role
}

export const getRoleDescription = (role: RestaurantRole): string => {
  const roleDef = ROLE_DEFINITIONS.find(r => r.value === role)
  return roleDef?.description || ''
}

export const getRoleCategory = (role: RestaurantRole): string => {
  const roleDef = ROLE_DEFINITIONS.find(r => r.value === role)
  return roleDef?.category || ''
}

export const getRolesByCategory = (category: string): RoleDefinition[] => {
  return ROLE_DEFINITIONS.filter(r => r.category === category)
}

export const getRoleBadgeColor = (role: RestaurantRole): string => {
  const category = getRoleCategory(role)
  switch (category) {
    case 'Management':
      return 'bg-red-500'
    case 'Kitchen':
      return 'bg-orange-500'
    case 'Front of House':
      return 'bg-blue-500'
    case 'Support':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

export const getRoleBadgeVariant = (role: RestaurantRole): string => {
  const category = getRoleCategory(role)
  switch (category) {
    case 'Management':
      return 'destructive'
    case 'Kitchen':
      return 'default'
    case 'Front of House':
      return 'secondary'
    case 'Support':
      return 'outline'
    default:
      return 'outline'
  }
}
