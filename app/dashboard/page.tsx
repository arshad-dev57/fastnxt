'use client';

export const dynamic = 'force-dynamic';

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from 'react';
import Image from 'next/image';
import { ChevronRight, Sparkles, ArrowUpRight } from 'lucide-react';
import { usePermissions } from '../../lib/usePermissions';
import { TopBarBrand, useCompanyBranding } from '../../components/BrandHeader';
import ProfileDropdown from '../../components/ProfileDropdown';
import NotificationDropdown from '../../components/NotificationDropdown';
import SubscriptionStatusBanner from '../../components/SubscriptionStatusBanner';
import AppBreadcrumbs from '../../components/AppBreadcrumbs';
import GlobalSearch from '../../components/GlobalSearch';
import {
  SalesAppIcon,
  PurchasesAppIcon,
  InventoryAppIcon,
  AccountingAppIcon,
  PosAppIcon,
  HrAppIcon,
  TaxAppIcon,
  ManufacturingAppIcon,
  SearchAppIcon,
  SupportAppIcon,
  ProfileAppIcon,
  CompanyAppIcon,
  UsersAppIcon,
  ImportAppIcon,
  ExportAppIcon,
  TradingAppIcon,
  ClinicAppIcon,
} from '../../components/dashboard/ModuleAppIcons';

const highlights = [
  {
    title: 'Advanced Financial\nReports',
    subtitle: 'Cash flow, balance sheet & aged receivables at your fingertips',
    badge: 'NEW FEATURE',
    btnText: 'Explore Reports',
    href: '/accounting/reports',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
    accentColor: '#9ee6e6',
  },
  {
    title: 'Inventory\nModule Live',
    subtitle: 'Manage inventory, orders & stock all in one place',
    badge: 'NOW LIVE',
    btnText: 'Open Inventory',
    href: '/warehouse/dashboard',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80',
    accentColor: '#dcf89d',
  },
  {
    title: 'Bank-Grade\nSecurity',
    subtitle: 'Your financial data is encrypted and always protected',
    badge: 'ALWAYS ON',
    btnText: 'Learn More',
    href: '/accounting/dashboard',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80',
    accentColor: '#fba4a4',
  },
];

type ModuleItem = {
  title: string;
  detail: string;
  Icon: ComponentType<{ className?: string }>;
  href?: string;
  action?: 'search' | 'profile';
  /** Key used with canAccessDashboardModule / dashboard.module_<key>.view */
  permModule?: string;
  /** Hide from non-admin users entirely */
  adminOnly?: boolean;
};

const modules: ModuleItem[] = [
  {
    title: 'Accounting',
    href: '/accounting/dashboard',
    Icon: AccountingAppIcon,
    detail: 'Let\'s automate your bills, bank transactions and accounting processes.',
    permModule: 'accounting',
  },
  {
    title: 'Sales',
    href: '/sales/dashboard',
    Icon: SalesAppIcon,
    detail: 'Create quotations, manage orders, and track customer invoices in one place.',
    permModule: 'sales',
  },
  {
    title: 'Purchases',
    href: '/purchases',
    Icon: PurchasesAppIcon,
    detail: 'Raise purchase orders, receive goods, and control vendor bills smoothly.',
    permModule: 'purchases',
  },
  {
    title: 'Inventory',
    href: '/warehouse/dashboard',
    Icon: InventoryAppIcon,
    detail: 'Real-time stock valuation, transfers, warehouse movements and tracking.',
    permModule: 'inventory',
  },
  {
    title: 'HR & Payroll',
    href: '/hr/dashboard',
    Icon: HrAppIcon,
    detail: 'Manage employee shifts, attendance records, leaves, loans, and payroll runs.',
    permModule: 'hr',
  },
  {
    title: 'Manufacturing',
    href: '/manufacturing/dashboard',
    Icon: ManufacturingAppIcon,
    detail: 'Bills of materials, work orders, costing analysis, and production schedules.',
    permModule: 'manufacturing',
  },
  {
    title: 'Trading Hub',
    href: '/trading/dashboard',
    Icon: TradingAppIcon,
    detail: 'Track margins, customer price lists, supplier quotes, and high-volume deals.',
    permModule: 'trading',
  },
  {
    title: 'Import Operations',
    href: '/import/dashboard',
    Icon: ImportAppIcon,
    detail: 'Customs clearance, landed cost calculations, carriers, and RFQs.',
    permModule: 'import',
  },
  {
    title: 'Export Operations',
    href: '/export/dashboard',
    Icon: ExportAppIcon,
    detail: 'Overseas shipments, customs documents, packing lists, and proforma bills.',
    permModule: 'export',
  },
  {
    title: 'Clinic Management',
    href: '/clinic/dashboard',
    Icon: ClinicAppIcon,
    detail: 'Patients, appointments, therapy sessions, billing, and clinic operations.',
    permModule: 'clinic',
  },
  {
    title: 'Tax Compliance',
    href: '/tax',
    Icon: TaxAppIcon,
    detail: 'Tax rates, exemption certificates, and automated audit-ready tax reports.',
    permModule: 'tax',
  },
  {
    title: 'Users & Roles',
    href: '/users/roles',
    Icon: UsersAppIcon,
    detail: 'Invite team members, manage roles, and control access across your company.',
    permModule: 'users',
  },
  {
    title: 'Point of Sale',
    href: '/pos',
    Icon: PosAppIcon,
    detail: 'Run fast checkout counters with receipts, payments, and live sales updates.',
    permModule: 'pos',
  },
  {
    title: 'Support',
    href: '/support',
    Icon: SupportAppIcon,
    detail: 'Raise support tickets and get help whenever you need assistance.',
  },
  {
    title: 'Search',
    action: 'search',
    Icon: SearchAppIcon,
    detail: 'Quickly find any page or feature across your entire business suite.',
  },
  {
    title: 'Profile',
    action: 'profile',
    Icon: ProfileAppIcon,
    detail: 'Update your company profile, contact details, logo, and signature.',
  },
  {
    title: 'Company',
    href: '/companies',
    Icon: CompanyAppIcon,
    detail: 'Create a new company or manage your workspace companies from one place.',
    adminOnly: true,
  },
];

/** Per-module accent used for icon chips, active indicator and stage wash */
const ACCENT_MAP: Record<string, string> = {
  Accounting: '#14b8a6',
  Sales: '#f43f5e',
  Purchases: '#f59e0b',
  Inventory: '#8b5cf6',
  'HR & Payroll': '#0ea5e9',
  Manufacturing: '#f97316',
  'Trading Hub': '#10b981',
  'Import Operations': '#06b6d4',
  'Export Operations': '#6366f1',
  'Tax Compliance': '#84cc16',
  'Users & Roles': '#ec4899',
  'Point of Sale': '#d946ef',
  Support: '#64748b',
  Search: '#64748b',
  Profile: '#64748b',
  Company: '#64748b',
};

function openHeaderAction(action: ModuleItem['action']) {
  if (!action || typeof window === 'undefined') return;

  if (action === 'search') {
    const scrollRoot = document.querySelector<HTMLElement>('[data-dashboard-scroll]');
    if (scrollRoot) {
      scrollRoot.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.setTimeout(() => {
      window.dispatchEvent(new Event('open-global-search'));
    }, 220);
    return;
  }

  window.dispatchEvent(new Event('open-profile-dropdown'));
}

function openModule(mod: ModuleItem) {
  if (mod.action) {
    openHeaderAction(mod.action);
    return;
  }
  if (mod.href) window.location.href = mod.href;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
        {children}
      </h2>
      <div className="h-px w-14 bg-gradient-to-r from-slate-300 to-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  const { canAccessDashboardModule, isAdmin, ready: permsReady } = usePermissions();
  const { organizationName } = useCompanyBranding();

  const visibleModules = useMemo(() => {
    if (isAdmin) return modules;
    if (!permsReady) return [];

    return modules.filter((m) => {
      if (m.adminOnly) return false;
      if (!m.permModule) return true;
      return canAccessDashboardModule(m.permModule);
    });
  }, [isAdmin, permsReady, canAccessDashboardModule]);

  const railModules = useMemo(
    () => visibleModules.filter((m) => !m.action && m.title !== 'Company'),
    [visibleModules],
  );
  const quickActions = useMemo(
    () => visibleModules.filter((m) => m.action || m.title === 'Company'),
    [visibleModules],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(railModules.length - 1, 0));
  const activeModule = railModules[safeIndex] ?? null;
  const activeAccent = activeModule
    ? ACCENT_MAP[activeModule.title] ?? '#64748b'
    : '#64748b';

  /* Keyboard navigation: ↑ ↓ to move, Enter to open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, railModules.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && railModules[safeIndex]) {
        e.preventDefault();
        openModule(railModules[safeIndex]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [railModules, safeIndex]);

  /* Keep the active row visible inside the scrolling rail */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.querySelector<HTMLElement>(
      `[data-module-index="${safeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [safeIndex]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-slate-900">
      {/* Soft ambient color washes */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[440px] w-[440px] rounded-full bg-teal-200/25 blur-[130px]" />
        <div className="absolute right-[-8%] top-1/3 h-[400px] w-[400px] rounded-full bg-violet-200/25 blur-[130px]" />
        <div className="absolute bottom-[-8%] left-[-5%] h-[360px] w-[360px] rounded-full bg-amber-200/25 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex flex-shrink-0 items-center justify-between gap-3 border-b border-black/5 bg-[#faf9f6]/85 px-4 py-3 backdrop-blur-md sm:px-6 md:px-8">
          <div className="min-w-0 shrink">
            <TopBarBrand title="Dashboard" />
          </div>

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <GlobalSearch />
            <NotificationDropdown />

            <div className="h-5 w-px bg-black/10" />

            <ProfileDropdown accentClassName="bg-[#131b22]" />
          </div>
        </header>

        <AppBreadcrumbs />

        <SubscriptionStatusBanner />

        {/* Scrollable body */}
        <div
          data-dashboard-scroll
          className="flex-1 overflow-auto px-4 py-8 sm:px-6 sm:py-10 md:px-8"
        >
          <div className="mx-auto w-full max-w-7xl space-y-10 pb-20">

            {/* Greeting row */}
            <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-teal-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Workspace
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  {greeting}
                  {organizationName ? `, ${organizationName}` : ' back'}
                </h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">
                  {dateLabel} — pick a module from the left to get started.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  All systems operational
                </span>
                {permsReady && !isAdmin ? (
                  <span className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    {railModules.length} modules
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => openHeaderAction('search')}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-slate-300 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-500 hover:text-slate-900"
                >
                  <span className="rounded border border-slate-200 bg-slate-50 px-1 text-[10px] font-bold text-slate-500">
                    ⌘K
                  </span>
                  Quick search
                </button>
              </div>
            </section>

            {/* Two-pane workspace */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
              {/* ── Left rail: modules + quick actions ── */}
              <div className="rounded-3xl border border-black/5 bg-white/70 p-3 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100vh-130px)] lg:overflow-auto">
                <div className="px-3 pb-2 pt-2">
                  <SectionLabel>Modules</SectionLabel>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                  {!isAdmin && !permsReady
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`rail-skel-${i}`}
                          className="flex shrink-0 animate-pulse items-center gap-3 rounded-2xl px-3 py-3 lg:shrink"
                        >
                          <div className="h-10 w-10 rounded-xl bg-slate-100" />
                          <div className="h-3 w-20 rounded bg-slate-100" />
                        </div>
                      ))
                    : railModules.map((mod, index) => {
                        const Icon = mod.Icon;
                        const accent = ACCENT_MAP[mod.title] ?? '#64748b';
                        const active = index === safeIndex;
                        return (
                          <button
                            key={mod.title}
                            type="button"
                            data-module-index={index}
                            onClick={() => openModule(mod)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onFocus={() => setActiveIndex(index)}
                            className={`group relative flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all duration-200 lg:shrink ${
                              active
                                ? 'bg-white shadow-md ring-1 ring-black/5'
                                : 'hover:bg-white/80'
                            }`}
                          >
                            {active && (
                              <span
                                className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full"
                                style={{ backgroundColor: accent }}
                              />
                            )}
                            <span
                              className={`hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 lg:flex ${
                                active ? 'scale-105' : ''
                              }`}
                              style={{
                                backgroundColor: `${accent}14`,
                                borderColor: `${accent}30`,
                              }}
                            >
                              <Icon className="h-6 w-6" />
                            </span>
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border lg:hidden"
                              style={{
                                backgroundColor: `${accent}14`,
                                borderColor: `${accent}30`,
                              }}
                            >
                              <Icon className="h-5.5 w-5.5" />
                            </span>
                            <span className="flex min-w-0 flex-1 items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  active ? 'text-slate-900' : 'text-slate-600'
                                }`}
                              >
                                {mod.title}
                              </span>
                            </span>
                            <ChevronRight
                              className={`hidden h-4 w-4 flex-shrink-0 text-slate-400 transition-all lg:block ${
                                active
                                  ? 'translate-x-0 opacity-100'
                                  : '-translate-x-1 opacity-0 group-hover:opacity-100'
                              }`}
                              style={active ? { color: accent } : undefined}
                            />
                          </button>
                        );
                      })}
                </div>

                {quickActions.length > 0 && (
                  <div className="mt-2 border-t border-black/5 pt-2">
                    <div className="px-3 pb-2 pt-2">
                      <SectionLabel>Quick actions</SectionLabel>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
                      {quickActions.map((mod) => {
                        const Icon = mod.Icon;
                        const accent = ACCENT_MAP[mod.title] ?? '#64748b';
                        return (
                          <button
                            key={mod.title}
                            type="button"
                            onClick={() => openModule(mod)}
                            className="flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/80 lg:shrink"
                          >
                            <span
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border"
                              style={{
                                backgroundColor: `${accent}10`,
                                borderColor: `${accent}26`,
                              }}
                            >
                              <Icon className="h-5.5 w-5.5" />
                            </span>
                            <span className="text-sm font-semibold text-slate-600">
                              {mod.title}
                            </span>
                            <ChevronRight className="ml-auto hidden h-4 w-4 text-slate-300 lg:block" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right stage: selected module preview ── */}
              <div className="flex flex-col gap-6">
                {!isAdmin && !permsReady || !activeModule ? (
                  <div className="min-h-[400px] animate-pulse rounded-[2rem] border border-black/5 bg-white shadow-sm">
                    <div className="space-y-5 p-8 sm:p-12">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100" />
                      <div className="h-10 w-56 rounded bg-slate-100" />
                      <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
                      <div className="h-4 w-2/3 rounded bg-slate-100" />
                    </div>
                  </div>
                ) : (
                  (() => {
                    const StageIcon = activeModule.Icon;
                    return (
                      <div className="relative min-h-[400px] overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm transition-all duration-500">
                        {/* Accent wash + watermark number */}
                        <div
                          aria-hidden
                          className="absolute inset-0 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(900px 500px at 15% 0%, ${activeAccent}24, transparent 65%)`,
                          }}
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute bottom-0 right-4 select-none text-[170px] font-black leading-none text-black/[0.035] transition-colors duration-500 sm:text-[200px]"
                        >
                          {String(safeIndex + 1).padStart(2, '0')}
                        </span>

                        <div className="relative z-10 flex h-full min-h-[400px] flex-col justify-center p-8 sm:p-12">
                          <div className="flex items-start justify-between gap-6">
                            <div>
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 backdrop-blur">
                                Selected module
                              </span>
                              <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                {activeModule.title}
                              </h2>
                              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                {activeModule.detail}
                              </p>
                            </div>

                            <span
                              className="hidden h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border bg-white shadow-md transition-transform duration-300 sm:flex"
                              style={{
                                borderColor: `${activeAccent}40`,
                                boxShadow: `0 12px 40px -12px ${activeAccent}66`,
                              }}
                            >
                              <StageIcon className="h-12 w-12" />
                            </span>
                          </div>

                          <div className="mt-10 flex flex-wrap items-center gap-5">
                            <button
                              type="button"
                              onClick={() => openModule(activeModule)}
                              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-slate-900 shadow-md transition-transform duration-200 hover:scale-[1.03] sm:text-base"
                              style={{ backgroundColor: activeAccent }}
                            >
                              Open {activeModule.title}
                              <ArrowUpRight className="h-4 w-4" />
                            </button>

                            <div className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
                              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-500">
                                ↑
                              </kbd>
                              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-500">
                                ↓
                              </kbd>
                              <span className="ml-1">navigate</span>
                              <kbd className="ml-2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-500">
                                ↵
                              </kbd>
                              <span>open</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}

                {/* Highlights — static cards */}
                <section className="space-y-4">
                  <SectionLabel>Highlights</SectionLabel>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {highlights.map((h) => (
                      <button
                        key={h.title}
                        type="button"
                        onClick={() => {
                          window.location.href = h.href;
                        }}
                        className="group overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="relative h-28">
                          <Image
                            src={h.image}
                            alt={h.badge}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, 400px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                          <span
                            className="absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-800"
                            style={{ backgroundColor: h.accentColor }}
                          >
                            {h.badge}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="whitespace-pre-line text-base font-bold leading-snug text-slate-900">
                            {h.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {h.subtitle}
                          </p>
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-slate-700 transition-colors group-hover:text-teal-700">
                            {h.btnText}
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
