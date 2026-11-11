'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  Users,
  FileHeart,
  Sparkles,
  Activity,
  ClipboardList,
  Pill,
  PhoneCall,
  UserRound,
  CalendarClock,
  DoorOpen,
  UserCog,
  Package,
  Receipt,
  Wallet,
  Boxes,
  CircleDollarSign,
  BarChart3,
  Bell,
  Globe,
  Settings,
  Shield,
  ScrollText,
  Home,
  LogOut,
} from 'lucide-react';
import { BrandHeader } from '../../components/BrandHeader';
import { CollapsibleSidebar } from '../../components/CollapsibleSidebar';
import { useSidebarCollapsed } from '../../lib/sidebar-collapse';
import { performLogout } from '../../lib/auth-logout';

type ClinicNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const CLINIC_SECTIONS: Array<{ label: string; items: ClinicNavItem[] }> = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/clinic/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/clinic/calendar', label: 'Calendar & Appointments', icon: CalendarDays },
      { href: '/clinic/waiting-list', label: 'Waiting List', icon: ListOrdered },
    ],
  },
  {
    label: 'PATIENT CARE',
    items: [
      { href: '/clinic/patients', label: 'Patients', icon: Users },
      { href: '/clinic/medical-records', label: 'Medical Records', icon: FileHeart },
      { href: '/clinic/therapies', label: 'Therapies & Services', icon: Sparkles },
      { href: '/clinic/sessions', label: 'Therapy Sessions', icon: Activity },
      { href: '/clinic/treatment-plans', label: 'Treatment Plans', icon: ClipboardList },
      { href: '/clinic/prescriptions', label: 'Prescriptions', icon: Pill },
      { href: '/clinic/follow-ups', label: 'Follow-ups', icon: PhoneCall },
    ],
  },
  {
    label: 'CLINIC OPERATIONS',
    items: [
      { href: '/clinic/therapists', label: 'Therapists', icon: UserRound },
      { href: '/clinic/therapist-schedules', label: 'Therapist Schedules', icon: CalendarClock },
      { href: '/clinic/rooms', label: 'Rooms & Facilities', icon: DoorOpen },
      { href: '/clinic/staff', label: 'Staff Management', icon: UserCog },
      { href: '/clinic/inventory', label: 'Inventory & Equipment', icon: Package },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { href: '/clinic/invoices', label: 'Invoices & Billing', icon: Receipt },
      { href: '/clinic/payments', label: 'Payments & Receipts', icon: Wallet },
      { href: '/clinic/packages', label: 'Therapy Packages', icon: Boxes },
      { href: '/clinic/expenses', label: 'Expenses', icon: CircleDollarSign },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [{ href: '/clinic/reports', label: 'Reports & Analytics', icon: BarChart3 }],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { href: '/clinic/notifications', label: 'Notifications', icon: Bell },
      { href: '/clinic/patient-portal', label: 'Patient Portal', icon: Globe },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { href: '/clinic/settings', label: 'Clinic Settings', icon: Settings },
      { href: '/clinic/roles', label: 'Roles & Permissions', icon: Shield },
      { href: '/clinic/audit-logs', label: 'Audit Logs', icon: ScrollText },
    ],
  },
];

export function ClinicSidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebarCollapsed();
  const isActive = (path: string): boolean =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <CollapsibleSidebar expandedClassName="w-64" expandedWidth={256}>
      <BrandHeader subtitle="Clinic Management" />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
        {CLINIC_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2 text-[10px] font-semibold text-white/30 tracking-wider mb-1.5 sidebar-expanded-only">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-[#014582] text-white shadow-md shadow-[#014582]/30 font-semibold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[13px] font-medium sidebar-expanded-only leading-snug">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="my-2 border-t border-white/10" />
        <div>
          {!collapsed && (
            <p className="px-2 text-[10px] font-semibold text-white/30 tracking-wider mb-1.5 sidebar-expanded-only">
              CONNECTED MODULES
            </p>
          )}
          <Link
            href="/dashboard"
            title="Main Dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="sidebar-expanded-only">Main Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="px-3 pb-3 flex-shrink-0 border-t border-white/10 pt-2">
        <button
          type="button"
          title="Logout"
          onClick={() => void performLogout()}
          className="w-full flex items-center gap-3 px-3 py-2 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium sidebar-expanded-only">Logout</span>
        </button>
      </div>
    </CollapsibleSidebar>
  );
}
