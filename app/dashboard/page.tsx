'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState, useMemo, type ComponentType } from 'react';
import Image from 'next/image';
import {
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Users as UsersIcon,
} from 'lucide-react';
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
} from '../../components/dashboard/ModuleAppIcons';

const banners = [
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
    title: 'Search',
    action: 'search',
    Icon: SearchAppIcon,
    detail: 'Quickly find any page or feature across your entire business suite.',
  },
  {
    title: 'Support',
    href: '/support',
    Icon: SupportAppIcon,
    detail: 'Raise support tickets and get help whenever you need assistance.',
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

const TILE_OFFSETS_KEY = 'dashboard-tile-offsets-v1';

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

export default function DashboardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [summaryFilter, setSummaryFilter] = useState('This Month');
  const { canAccessDashboardModule, isAdmin, ready: permsReady } = usePermissions();
  const { organizationName } = useCompanyBranding();

  /* ── Draggable tiles: offset (x, y) ── */
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingTitle, setDraggingTitle] = useState<string | null>(null);
  const offsetsLoaded = useRef(false);
  const dragRef = useRef<{
    title: string;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);
  const justDragged = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TILE_OFFSETS_KEY);
      if (raw) setOffsets(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    offsetsLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!offsetsLoaded.current || draggingTitle) return;
    try {
      localStorage.setItem(TILE_OFFSETS_KEY, JSON.stringify(offsets));
    } catch {
      /* ignore */
    }
  }, [offsets, draggingTitle]);

  const handleTilePointerDown = (e: React.PointerEvent<HTMLButtonElement>, title: string) => {
    if (e.button !== 0) return;
    const base = offsets[title] ?? { x: 0, y: 0 };
    dragRef.current = {
      title,
      startX: e.clientX,
      startY: e.clientY,
      baseX: base.x,
      baseY: base.y,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleTilePointerMove = (e: React.PointerEvent<HTMLButtonElement>, title: string) => {
    const d = dragRef.current;
    if (!d || d.title !== title) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      setDraggingTitle(title);
    }
    setOffsets((prev) => ({ ...prev, [title]: { x: d.baseX + dx, y: d.baseY + dy } }));
  };

  const endTileDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (d?.moved) {
      justDragged.current = true;
      window.setTimeout(() => {
        justDragged.current = false;
      }, 0);
    }
    dragRef.current = null;
    setDraggingTitle(null);
  };

  const resetTileLayout = () => {
    setOffsets({});
    try {
      localStorage.removeItem(TILE_OFFSETS_KEY);
    } catch {
      /* ignore */
    }
  };

  const visibleModules = useMemo(() => {
    if (isAdmin) return modules;
    if (!permsReady) return [];

    return modules.filter((m) => {
      if (m.adminOnly) return false;
      if (!m.permModule) return true;
      return canAccessDashboardModule(m.permModule);
    });
  }, [isAdmin, permsReady, canAccessDashboardModule]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const banner = banners[currentIndex];

  return (
    <div className="flex min-h-screen bg-[#edf4f1]">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Clean, Light Top Header matching Reference Image */}
        <header className="dash-header bg-[#edf4f1]/90 backdrop-blur-md border-b border-[#d8e5e0] px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3 flex-shrink-0 sticky top-0 z-30">
          <div className="min-w-0 shrink">
            <TopBarBrand title="Dashboard" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 shrink-0">
            {/* Pill Search */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>

            {/* Integration shortcuts like in image */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>FastNxt Cloud</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
            </div>

            {/* Now Online avatar pill like in image */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-700">Online</span>
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#dcf89d] text-[#1e3a1f] text-[9px] font-bold text-center leading-5">
                  FJ
                </div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#9ee6e6] text-[#134e4a] text-[9px] font-bold text-center leading-5">
                  LD
                </div>
                <div className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-[#fba4a4] text-[#881337] text-[9px] font-bold text-center leading-5">
                  MP
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500">(3)</span>
            </div>

            <div className="w-px h-5 bg-slate-300/80 hidden sm:block" />

            <NotificationDropdown />

            <div className="w-px h-5 bg-slate-300/80" />

            <ProfileDropdown accentClassName="bg-[#131b22]" />
          </div>
        </header>

        <AppBreadcrumbs />

        <SubscriptionStatusBanner />

        {/* Scrollable Dashboard Body */}
        <div
          data-dashboard-scroll
          className="app-square-grid flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 overflow-auto"
        >
          <div className="w-full max-w-7xl mx-auto space-y-8">

            {/* Layout Grid: Main Section + Right 'Live Feed' (Matching Screenshot) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

              {/* Left Main Column */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-6 sm:space-y-8">

                {/* Section Title */}
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    My Activity
                  </h1>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-slate-600 shadow-2xs">
                    Workspace Overview
                  </span>
                </div>

                {/* ── Top Profile / Overview Card (Exact match of image top card) ── */}
                <div className="rounded-3xl bg-white p-6 sm:p-7 border border-[#dce7e3] shadow-sm relative overflow-hidden transition-all">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-md">
                          FJ
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                      </div>

                      {/* Name & Title */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                            Fred Jhonson
                          </h2>
                          <span className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">
                          Agent <span className="text-slate-400 font-normal">286 days on the platform</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => openHeaderAction('profile')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Profile Details"
                      >
                        <Building className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openHeaderAction('search')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Search Workspace"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Badges Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">+1-202-555-0167</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">jhonsonfred@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Los Angeles</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{organizationName || 'Horizon Realty Group'}</span>
                    </div>
                  </div>

                  {/* 3 Metric Stats Row with Color Underlines (from image) */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4">
                    {/* Stat 1 - Coral Underline */}
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Listings</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">1203</p>
                      <div className="h-1 w-full bg-[#fba4a4] rounded-full mt-2" />
                    </div>

                    {/* Stat 2 - Aqua Underline */}
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Properties sold</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">912</p>
                      <div className="h-1 w-full bg-[#9ee6e6] rounded-full mt-2" />
                    </div>

                    {/* Stat 3 - Lime Underline */}
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400">Properties rent</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">320</p>
                      <div className="h-1 w-full bg-[#dcf89d] rounded-full mt-2" />
                    </div>
                  </div>
                </div>

                {/* ── 'My Summary' - The 3 Iconic Pastel Cards (Exact replica of image) ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      My Summary
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <select
                          aria-label="Summary time filter"
                          value={summaryFilter}
                          onChange={(e) => setSummaryFilter(e.target.value)}
                          className="appearance-none bg-white border border-[#dce7e3] text-xs font-semibold text-slate-700 rounded-full pl-3 pr-7 py-1.5 shadow-2xs outline-none cursor-pointer"
                        >
                          <option>This Month</option>
                          <option>Last Month</option>
                          <option>This Quarter</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <button
                        type="button"
                        aria-label="Refresh summary data"
                        className="p-1.5 rounded-full bg-white border border-[#dce7e3] text-slate-500 hover:text-slate-900 shadow-2xs transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 3 Pastel Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* 1. Lime Green Card */}
                    <div className="rounded-3xl bg-[#dcf89d] p-5 sm:p-6 border border-[#cbe98c] shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-[#1e3a1f] leading-snug">
                          Unassigned<br />Leads
                        </h4>
                        <span className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#1e3a1f] cursor-pointer transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-8 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-[#1e3a1f]/70 font-semibold">Update:</p>
                          <p className="text-[11px] text-[#1e3a1f]/90 font-bold">16 mar, 01:34 pm</p>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-xs text-[#1e3a1f] font-extrabold text-sm flex items-center justify-center shadow-2xs">
                          23
                        </span>
                      </div>
                    </div>

                    {/* 2. Aqua / Mint Card */}
                    <div className="rounded-3xl bg-[#9ee6e6] p-5 sm:p-6 border border-[#89dcdc] shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-[#134e4a] leading-snug">
                          Valuation<br />Seller Leads
                        </h4>
                        <span className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#134e4a] cursor-pointer transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-8 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-[#134e4a]/70 font-semibold">Update:</p>
                          <p className="text-[11px] text-[#134e4a]/90 font-bold">16 mar, 01:34 pm</p>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-xs text-[#134e4a] font-extrabold text-sm flex items-center justify-center shadow-2xs">
                          98
                        </span>
                      </div>
                    </div>

                    {/* 3. Coral / Pink Card */}
                    <div className="rounded-3xl bg-[#fba4a4] p-5 sm:p-6 border border-[#f59191] shadow-sm flex flex-col justify-between transition-transform hover:-translate-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-[#881337] leading-snug">
                          Potential Seller<br />Leads
                        </h4>
                        <span className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[#881337] cursor-pointer transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="mt-8 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-[#881337]/70 font-semibold">Update:</p>
                          <p className="text-[11px] text-[#881337]/90 font-bold">16 mar, 01:34 pm</p>
                        </div>
                        <span className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-xs text-[#881337] font-extrabold text-sm flex items-center justify-center shadow-2xs">
                          231
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* ── Feature Banner ── */}
                <div className="relative w-full h-[200px] sm:h-[260px] md:h-[300px] rounded-3xl overflow-hidden shadow-sm border border-[#dce7e3]">
                  <Image
                    src={banner.image}
                    alt={banner.badge}
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, 900px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#131b22]/95 via-[#131b22]/75 to-transparent" />

                  <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
                    <span className="inline-block px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider rounded-full border border-white/20 bg-white/10 text-white/90 w-fit mb-2 sm:mb-3 backdrop-blur-xs">
                      {banner.badge}
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2 whitespace-pre-line">
                      {banner.title}
                    </h2>
                    <p className="text-white/70 text-xs sm:text-sm max-w-md mb-4 line-clamp-2">
                      {banner.subtitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => { window.location.href = banner.href; }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 w-fit text-[#131b22] shadow-sm"
                      style={{ backgroundColor: banner.accentColor }}
                    >
                      {banner.btnText}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentIndex
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Business Modules (Interactive & Draggable) ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Workspace Modules
                      </h3>
                      <p className="text-xs text-slate-500">
                        Access operations, accounting, inventory, and management apps
                      </p>
                    </div>

                    {Object.keys(offsets).length > 0 && (
                      <button
                        type="button"
                        onClick={resetTileLayout}
                        className="px-3 py-1.5 rounded-full bg-white border border-[#dce7e3] text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                      >
                        Reset layout
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                    {!isAdmin && !permsReady
                      ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={`skel-${i}`}
                            className="flex flex-col items-center justify-center gap-4 py-8 px-4 rounded-3xl bg-white border border-[#dce7e3] animate-pulse"
                          >
                            <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                            <div className="h-3 w-20 rounded bg-slate-100" />
                          </div>
                        ))
                      : visibleModules.map((mod) => {
                          const Icon = mod.Icon;
                          const off = offsets[mod.title];
                          const isDragging = draggingTitle === mod.title;
                          return (
                            <button
                              key={mod.title}
                              type="button"
                              onPointerDown={(e) => handleTilePointerDown(e, mod.title)}
                              onPointerMove={(e) => handleTilePointerMove(e, mod.title)}
                              onPointerUp={endTileDrag}
                              onPointerCancel={endTileDrag}
                              style={{
                                transform: off || isDragging
                                  ? `translate(${off?.x ?? 0}px, ${off?.y ?? 0}px)${isDragging ? ' scale(1.04)' : ''}`
                                  : undefined,
                                zIndex: isDragging ? 50 : undefined,
                              }}
                              onClick={() => {
                                if (justDragged.current) return;
                                if (mod.action) {
                                  openHeaderAction(mod.action);
                                  return;
                                }
                                if (mod.href) window.location.href = mod.href;
                              }}
                              className={`select-none md:touch-none ${isDragging ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'} group relative z-0 hover:z-40 focus-within:z-40 flex flex-col items-center justify-center gap-3 sm:gap-4 py-7 sm:py-9 px-3 rounded-3xl bg-white hover:bg-slate-50/80 transition-all duration-200 shadow-sm border border-[#dce7e3] hover:border-[#9ee6e6]`}
                            >
                              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-[#edf4f1] border border-[#d8e5e0] flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-300">
                                <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-slate-800 text-center leading-snug px-1">
                                {mod.title}
                              </span>

                              {!isDragging && (
                                <div
                                  className="pointer-events-none absolute left-1/2 top-[calc(100%-0.35rem)] w-[min(380px,calc(100vw-1.5rem))] max-w-[380px] -translate-x-1/2 opacity-0 translate-y-1 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-200 ease-out z-50"
                                  role="tooltip"
                                >
                                  <div className="mx-auto h-0 w-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#131b22]" />
                                  <div className="rounded-2xl bg-[#131b22] px-5 py-4 text-left shadow-2xl">
                                    <p className="text-xs sm:text-sm leading-relaxed text-white/90">
                                      {mod.detail}
                                    </p>
                                    <p className="mt-3 text-right text-xs font-bold text-[#9ee6e6]">
                                      Open Module →
                                    </p>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                  </div>
                </div>

              </div>

              {/* ── Right Column: 'Live Feed' (Matching Screenshot) ── */}
              <div className="lg:col-span-4 xl:col-span-4 space-y-6">

                <div className="rounded-3xl bg-white p-5 sm:p-6 border border-[#dce7e3] shadow-sm space-y-6">
                  {/* Live Feed Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">Live Feed</h3>
                    </div>
                    <button
                      type="button"
                      aria-label="Refresh live feed"
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Feed Item 1: Property / Listing Card */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Tu. 25.03</span>
                      <span>1:23 pm</span>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                      <div className="relative h-28 bg-slate-100">
                        <Image
                          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80"
                          alt="Single Family Residential"
                          fill
                          className="object-cover"
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#fba4a4] text-[#881337] text-[10px] font-extrabold shadow-2xs">
                          Sale
                        </span>
                      </div>
                      <div className="p-3 bg-white space-y-2">
                        <p className="text-xs font-bold text-slate-900">Single Family Residential</p>
                        <p className="text-[10px] text-slate-400">305 Pomona Ave, Coronado, CA 92118</p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            Property Viewed
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#dcf89d] text-[#1e3a1f] text-[10px] font-bold">
                            +8 views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feed Item 2: Logan Davidson */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Tu. 25.03</span>
                      <span>1:23 pm</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#9ee6e6] text-[#134e4a] text-xs font-extrabold flex items-center justify-center shrink-0">
                          LD
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Logan Davidson</p>
                          <p className="text-[10px] text-slate-400 truncate">Follow up mail</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label="Send message"
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Call"
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Agent</span>
                      <span className="text-slate-400">Created</span>
                    </div>
                  </div>

                  {/* Feed Item 3: Megan Pearce */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Tu. 25.03</span>
                      <span>1:23 pm</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#fba4a4] text-[#881337] text-xs font-extrabold flex items-center justify-center shrink-0">
                          MP
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Megan Pearce</p>
                          <p className="text-[10px] text-slate-400 truncate">First customer call</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label="Call"
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#dcf89d] text-[#1e3a1f]">Lead · 11:09 am</span>
                      <span className="text-slate-400">Was Assigned</span>
                    </div>
                  </div>

                  {/* Feed Item 4: Mason Reynolds */}
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Tu. 25.03</span>
                      <span>1:23 pm</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center justify-center shrink-0">
                          MR
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Mason Reynolds</p>
                          <p className="text-[10px] text-slate-400 truncate">First customer call</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          aria-label="Send message"
                          className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold pt-1">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Lead · 8:56 am</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer">
                        Add Search
                      </span>
                    </div>
                  </div>

                </div>

                {/* Quick Status Pill Dock */}
                <div className="rounded-3xl bg-white p-4 border border-[#dce7e3] shadow-sm flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>All services operational</span>
                  </div>
                  <span className="text-[11px] text-slate-400">v2.4.0</span>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
