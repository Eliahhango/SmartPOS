'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Tags, Truck, Users,
  ClipboardList, DollarSign, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Store, Receipt, Shield, X, History
} from 'lucide-react';
import { useCallback } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier', 'stock_officer', 'accountant'] },
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { href: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager', 'stock_officer', 'store_keeper', 'accountant'] },
  { href: '/categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager', 'accountant'] },
  { href: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'accountant'] },
  { href: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'cashier', 'accountant'] },
  { href: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['admin', 'manager', 'stock_officer', 'store_keeper', 'accountant'] },
  { href: '/purchases', label: 'Purchases', icon: Receipt, roles: ['admin', 'manager', 'stock_officer', 'store_keeper', 'accountant'] },
  { href: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['admin', 'manager', 'accountant'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager', 'accountant'] },
  { href: '/users', label: 'Users', icon: Shield, roles: ['admin'] },
  { href: '/taxes', label: 'Tax Rates', icon: Settings, roles: ['admin', 'accountant'] },
  { href: '/branches', label: 'Branches', icon: Store, roles: ['admin', 'accountant'] },
  { href: '/audit-log', label: 'Audit Log', icon: History, roles: ['admin', 'accountant'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Called when a nav link is clicked — used by mobile drawer to auto-close */
  onNavClick?: () => void;
  /** When true, renders the close (X) button in the header instead of the collapse chevron */
  isMobileDrawer?: boolean;
}

export default function Sidebar({ collapsed = false, onToggleCollapse, onNavClick, isMobileDrawer = false }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  const handleNavClick = useCallback(() => {
    if (onNavClick) onNavClick();
  }, [onNavClick]);

  return (
    <div className="flex flex-col h-full">
      {/* Header — brand + collapse/close button */}
      <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
        {!collapsed && (
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className="text-xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent"
          >
            SmartPOS
          </Link>
        )}
        {isMobileDrawer ? (
          <button
            onClick={onNavClick}
            className="p-2.5 hover:bg-white/10 rounded"
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-white/10 rounded"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25 [&_svg]:text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10 shrink-0">
        {!collapsed && user && (
          <div className="mb-3 text-sm">
            <p className="text-white/90 font-medium truncate">{user.name}</p>
            <p className="text-white/50 text-xs capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-white/60 hover:text-red-400 text-sm transition-colors w-full"
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}
