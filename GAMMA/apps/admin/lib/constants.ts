export interface NavItem {
  label: string;
  href: string;
  iconName: 'LayoutDashboard' | 'UtensilsCrossed' | 'Grid' | 'Boxes' | 'Users' | 'TrendingUp' | 'Sparkles' | 'LogOut';
  badge?: string;
  isLogout?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    label: 'Orders',
    href: '/orders',
    iconName: 'UtensilsCrossed',
    badge: '12 Live',
  },
  {
    label: 'Tables',
    href: '/tables',
    iconName: 'Grid',
  },
  {
    label: 'Inventory',
    href: '/inventory',
    iconName: 'Boxes',
    badge: '3 Low',
  },
  {
    label: 'Staff',
    href: '/staff',
    iconName: 'Users',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    iconName: 'TrendingUp',
  },
  {
    label: 'Insights',
    href: '/insights',
    iconName: 'Sparkles',
    badge: 'AI',
  },
];

export const LOGOUT_NAV_ITEM: NavItem = {
  label: 'Logout',
  href: '/login',
  iconName: 'LogOut',
  isLogout: true,
};

export const APP_CONFIG = {
  name: 'SmartDine Admin',
  subtext: 'Staff & Operations Dashboard',
  version: '1.0.0',
};
