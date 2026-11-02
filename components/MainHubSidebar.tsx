'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  Warehouse,
  Building2,
  HelpCircle,
  ChevronRight,
  LogOut,
  User,
  ShoppingCart,
  Package,
  Store,
  CreditCard,
  Scale,
  CalendarDays,
  Receipt,
  UsersRound,
  Factory,
  ArrowLeftRight,
  Ship,
  Send,
} from 'lucide-react';
import { usePermissions } from '../lib/usePermissions';
import { BrandHeader } from './BrandHeader';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { performLogout } from '../lib/auth-logout';
import {
  fetchSubscriptionCapacity,
  isPosOnlyTier,
  readCachedProductTier,
  readCachedSubscription,
} from '../lib/subscription-service';
import { SUBSCRIPTION_PURCHASE_UI_ENABLED } from '../lib/subscription-ui';
import { useSidebarCollapsed } from '../lib/sidebar-collapse';

export function MainHubSidebar({ activePath = '/dashboard' }: { activePath?: string }) {
  const { hasModuleAccess, isAdmin, canViewRegisteredUsers } = usePermissions();
  const { collapsed } = useSidebarCollapsed();
  const cached = readCachedSubscription();
  const [posOnly, setPosOnly] = useState(() =>
    isPosOnlyTier(
      readCachedProductTier() || cached.productTier,
      cached.subscription.plan,
      cached.hasAccess
    )
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromCache = isPosOnlyTier(
        readCachedProductTier() || cached.productTier,
        cached.subscription.plan,
        cached.hasAccess
      );
      if (!cancelled) setPosOnly(fromCache);

      try {
        const cap = await fetchSubscriptionCapacity();
        if (cancelled || !cap.success || !cap.data) return;
        setPosOnly(
          isPosOnlyTier(cap.data.productTier, cap.data.subscriptionPlan, true)
        );
      } catch {
        /* keep cached */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems = posOnly
    ? [
        {
          icon: <Store className="w-5 h-5" />,
          label: 'Point of Sale',
          path: '/pos',
          show: true,
        },
        {
          icon: <CreditCard className="w-5 h-5" />,
          label: 'Subscription Plans',
          path: '/plans',
          show: isAdmin && SUBSCRIPTION_PURCHASE_UI_ENABLED,
        },
        {
          icon: <Receipt className="w-5 h-5" />,
          label: 'Billing',
          path: '/billing',
          show: isAdmin && SUBSCRIPTION_PURCHASE_UI_ENABLED,
        },
      ]
    : [
        { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/dashboard', show: true },
        {
          icon: <Building2 className="w-5 h-5" />,
          label: 'Accounting',
          path: '/accounting/dashboard',
          show: isAdmin || hasModuleAccess('accounting'),
        },
        {
          icon: <Warehouse className="w-5 h-5" />,
          label: 'Inventory',
          path: '/warehouse/dashboard',
          show: isAdmin || hasModuleAccess('warehouse'),
        },
        {
          icon: <ShoppingCart className="w-5 h-5" />,
          label: 'Sales',
          path: '/sales/dashboard',
          show: isAdmin || hasModuleAccess('sales'),
        },
        {
          icon: <Package className="w-5 h-5" />,
          label: 'Purchases',
          path: '/purchases',
          show: isAdmin || hasModuleAccess('purchases'),
        },
        {
          icon: <Factory className="w-5 h-5" />,
          label: 'Manufacturing',
          path: '/manufacturing/dashboard',
          show: isAdmin || hasModuleAccess('manufacturing'),
        },
        {
          icon: <UsersRound className="w-5 h-5" />,
          label: 'HR Management',
          path: '/hr/dashboard',
          show: isAdmin || hasModuleAccess('hr'),
        },
        {
          icon: <ArrowLeftRight className="w-5 h-5" />,
          label: 'Trading',
          path: '/trading/dashboard',
          show: isAdmin || hasModuleAccess('trading'),
        },
        {
          icon: <Ship className="w-5 h-5" />,
          label: 'Import',
          path: '/import/dashboard',
          show: isAdmin || hasModuleAccess('import'),
        },
        {
          icon: <Send className="w-5 h-5" />,
          label: 'Export',
          path: '/export/dashboard',
          show: isAdmin || hasModuleAccess('export'),
        },
        {
          icon: <Store className="w-5 h-5" />,
          label: 'Point of Sale',
          path: '/pos',
          show: isAdmin || hasModuleAccess('pos'),
        },
        {
          icon: <Scale className="w-5 h-5" />,
          label: 'Tax Compliance',
          path: '/tax',
          show:
            isAdmin ||
            hasModuleAccess('accounting') ||
            hasModuleAccess('sales') ||
            hasModuleAccess('purchases') ||
            hasModuleAccess('pos'),
        },
        { icon: <User className="w-5 h-5" />, label: 'Users', path: '/users', show: isAdmin },
        {
          icon: <CalendarDays className="w-5 h-5" />,
          label: 'Registered Users',
          path: '/registered-users',
          show: canViewRegisteredUsers,
        },
        {
          icon: <CreditCard className="w-5 h-5" />,
          label: 'Subscription Plans',
          path: '/plans',
          show: isAdmin && SUBSCRIPTION_PURCHASE_UI_ENABLED,
        },
        {
          icon: <Receipt className="w-5 h-5" />,
          label: 'Billing',
          path: '/billing',
          show: isAdmin && SUBSCRIPTION_PURCHASE_UI_ENABLED,
        },
      ];

  const filteredMenuItems = menuItems.filter((item) => item.show);

  return (
    <CollapsibleSidebar
      expandedClassName="w-56"
      expandedWidth={224}
      fixed={false}
      fullHeight={false}
    >
      <BrandHeader subtitle={posOnly ? 'POS' : 'Main Dashboard'} compact />

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 text-[11px] font-bold text-slate-500 tracking-wider mb-3 sidebar-expanded-only uppercase">
            Main Menu
          </p>
        )}

        {filteredMenuItems.map((item) => {
          const isActive =
            item.path === '/hr/dashboard'
              ? activePath === '/hr' || activePath.startsWith('/hr/')
              : activePath === item.path || activePath.startsWith(`${item.path}/`);
          return (
            <button
              key={item.path}
              type="button"
              title={item.label}
              onClick={() => {
                window.location.href = item.path;
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#131b22] text-white shadow-sm font-semibold rounded-2xl'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#dbe8e3] rounded-xl font-medium'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                <span className="text-sm sidebar-expanded-only">{item.label}</span>
              </div>
              {isActive && !collapsed && (
                <ChevronRight className="w-4 h-4 text-white/80 sidebar-expanded-only" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-4">
        {!collapsed && (
          <div className="p-3.5 bg-white/90 rounded-2xl border border-[#d8e5e0] shadow-sm sidebar-help sidebar-expanded-only space-y-3">
            {/* Circular utility dock icons like the reference image */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                title="Support"
                onClick={() => { window.location.href = '/support'; }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#dcf89d] text-slate-600 hover:text-[#1e3a1f] flex items-center justify-center transition-colors shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#9ee6e6] text-slate-600 hover:text-[#134e4a] flex items-center justify-center transition-colors shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-1 right-1" />
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <button
                type="button"
                title="Account Settings"
                onClick={() => { window.location.href = '/accounting/settings'; }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#fba4a4] text-slate-600 hover:text-[#881337] flex items-center justify-center transition-colors shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                title="Logout"
                onClick={() => performLogout()}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Profile snippet like bottom of reference image */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#131b22] text-white text-xs font-bold flex items-center justify-center shrink-0">
                FN
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">FastNxt Admin</p>
                <p className="text-[10px] text-slate-400 truncate">business@fastnxt.com</p>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            title="Logout"
            onClick={() => performLogout()}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </CollapsibleSidebar>
  );
}
