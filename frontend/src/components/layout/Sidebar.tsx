'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Tags, Truck, Users,
  ClipboardList, DollarSign, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Store, Receipt, Shield
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'cashier', 'stock_officer'] },
  { href: '/pos', label: 'Point of Sale', icon: ShoppingCart, roles: ['admin', 'manager', 'cashier'] },
  { href: '/products', label: 'Products', icon: Package, roles: ['admin', 'manager', 'stock_officer'] },
  { href: '/categories', label: 'Categories', icon: Tags, roles: ['admin', 'manager'] },
  { href: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager'] },
  { href: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'cashier'] },
  { href: '/inventory', label: 'Inventory', icon: ClipboardList, roles: ['admin', 'manager', 'stock_officer'] },
  { href: '/purchases', label: 'Purchases', icon: Receipt, roles: ['admin', 'manager', 'stock_officer'] },
  { href: '/expenses', label: 'Expenses', icon: DollarSign, roles: ['admin', 'manager'] },
  { href: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
  { href: '/users', label: 'Users', icon: Shield, roles: ['admin'] },
  { href: '/taxes', label: 'Tax Rates', icon: Settings, roles: ['admin'] },
  { href: '/branches', label: 'Branches', icon: Store, roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[#090727] text-white flex flex-col transition-all duration-300 h-full`}>
      <div className="p-4 flex items-center justify-between border-b border-white/10">
        {!collapsed && (
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SmartPOS
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
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
    </aside>
  );
}
