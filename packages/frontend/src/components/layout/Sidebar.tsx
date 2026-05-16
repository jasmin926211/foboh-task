import { useLocation, Link } from 'react-router-dom';
import {
  Users,
  UsersRound,
  Package,
  Tag,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Customers', icon: Users, href: ROUTES.CUSTOMERS },
  { label: 'Customer Groups', icon: UsersRound, href: ROUTES.CUSTOMER_GROUPS },
  { label: 'Products', icon: Package, href: ROUTES.PRODUCTS },
  { label: 'Pricing', icon: Tag, href: ROUTES.PRICING },
  { label: 'Resolved Prices', icon: DollarSign, href: ROUTES.RESOLVED_PRICES },
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
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

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
