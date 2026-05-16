import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Tag,
  Truck,
  Puzzle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  tag?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { label: 'Customers', icon: Users, href: '/customers' },
  { label: 'Products', icon: Package, href: '/products' },
  { label: 'Pricing', icon: Tag, href: '/pricing' },
  { label: 'Freight', icon: Truck, href: '/freight', tag: 'NEW' },
  { label: 'Integrations', icon: Puzzle, href: '/integrations' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-white border-r border-surface-border z-40 flex flex-col">
      {/* Top spacer to align with topbar */}
      <div className="h-20 shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 mt-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-ink-900' : 'text-ink-500')} />
              <span>{item.label}</span>

              {item.tag && (
                <span className="ml-auto text-[10px] font-bold text-status-new">{item.tag}</span>
              )}

              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-full bg-teal" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom wordmark */}
      <div className="px-6 pb-6">
        <span className="text-2xl font-black tracking-tight text-ink-900">FOBOH</span>
      </div>
    </aside>
  );
}
