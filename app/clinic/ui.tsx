'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { initials } from './_lib/format';

export const CLINIC_COLORS = {
  primary: '#0f766e',
  primaryHover: '#0d9488',
  primaryDark: '#115e59',
  accent: '#14b8a6',
  soft: '#ecfdf5',
  softBorder: '#a7f3d0',
  canvas: '#f3faf7',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#0284c7',
  slate: '#64748b',
  text: '#0f172a',
  muted: '#64748b',
  border: '#d1e7df',
  card: '#ffffff',
};

export function ClinicPage({
  children,
  className = '',
  fullWidth = false,
}: {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={`w-full space-y-6 pb-12 ${fullWidth ? '' : 'max-w-7xl mx-auto'} ${className}`}>
      {children}
    </div>
  );
}

export function ClinicMockBanner() {
  return (
    <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-950">
      <p className="font-semibold">Clinic Management is a frontend demo module (local mock data).</p>
      <p className="text-[11px] text-teal-800/90 mt-1 leading-relaxed">
        Changes are saved in browser localStorage only and are not connected to ERP Accounting, Inventory, or HR backends.
      </p>
    </div>
  );
}

export function ClinicPageHeader({
  title,
  subtitle,
  badge = 'Clinic Management',
  backHref,
  actions,
  icon,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  backHref?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-[#14b8a6] border border-teal-700/20 rounded-2xl px-5 sm:px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 shadow-lg text-white">
      <div className="absolute -right-10 -top-14 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute right-20 bottom-0 w-28 h-28 rounded-full bg-emerald-300/10 pointer-events-none" />
      <div className="flex items-center gap-3 relative min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-all flex-shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
        )}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 shadow-inner">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
              {badge}
            </span>
            <span className="text-xs text-white/70">Bisonstechs Care</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-white/80 font-medium mt-0.5 line-clamp-2">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="relative flex items-center flex-wrap gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

export function ClinicStatCard({
  label,
  value,
  icon: Icon,
  color = CLINIC_COLORS.primary,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  hint?: string;
  href?: string;
}) {
  const content = (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border border-[#d1e7df] transition-all duration-200 ${
        href ? 'hover:border-teal-400 hover:shadow-md cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[#64748b] leading-tight line-clamp-1">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}1A` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-extrabold text-[#0f172a] tracking-tight">{value}</p>
      {hint && (
        <p className="text-[11px] font-medium mt-1 truncate" style={{ color }}>
          {hint}
        </p>
      )}
    </div>
  );
  if (href) return <Link href={href} className="block">{content}</Link>;
  return content;
}

export function ClinicCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#d1e7df] overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 py-4 border-b border-[#d1e7df]">
          <div>
            {title && <h2 className="text-sm font-bold text-[#0f172a]">{title}</h2>}
            {subtitle && <p className="text-xs text-[#64748b] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

export function ClinicStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  if (
    ['active', 'completed', 'paid', 'confirmed', 'available', 'approved', 'booked'].some((k) =>
      s.includes(k)
    )
  ) {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (
    ['in progress', 'checked in', 'contacted', 'partially', 'scheduled', 'upcoming'].some((k) =>
      s.includes(k)
    )
  ) {
    bg = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (
    ['pending', 'waiting', 'draft', 'paused', 'on hold', 'low stock', 'on leave'].some((k) =>
      s.includes(k)
    )
  ) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (
    ['cancel', 'overdue', 'no show', 'missed', 'expired', 'out of stock', 'rejected', 'failed', 'inactive', 'discharged'].some(
      (k) => s.includes(k)
    )
  ) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['urgent', 'high'].some((k) => s.includes(k))) {
    bg = 'bg-orange-50 text-orange-700 border-orange-200';
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} whitespace-nowrap`}>
      {status}
    </span>
  );
}

export function ClinicAvatar({
  name,
  color = CLINIC_COLORS.primary,
  size = 'md',
}: {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeCls = size === 'sm' ? 'w-8 h-8 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-base' : 'w-10 h-10 text-xs';
  return (
    <div
      className={`${sizeCls} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initials(name)}
    </div>
  );
}

export function ClinicTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#d1e7df]">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">{children}</table>
    </div>
  );
}

export function ClinicTableHeader({ columns }: { columns: string[] }) {
  return (
    <thead className="bg-[#f0fdf9] border-b border-[#d1e7df] text-teal-900/70 uppercase text-[11px] font-bold tracking-wider">
      <tr>
        {columns.map((col, idx) => (
          <th key={idx} className="px-4 py-3 whitespace-nowrap">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function ClinicTableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-[#d1e7df] bg-white">{children}</tbody>;
}

export function ClinicTableRow({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-teal-50/40 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

export function ClinicTableCell({
  children,
  className = '',
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 text-slate-700 align-middle ${className}`}>
      {children}
    </td>
  );
}

export function ClinicSearchInput({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full sm:w-72 pl-9 pr-3 py-2 rounded-xl border border-[#d1e7df] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
      />
    </div>
  );
}

export function ClinicSelect({
  value,
  onChange,
  options,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 rounded-xl border border-[#d1e7df] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${className}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ClinicButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[#0f766e] text-white hover:bg-[#0d9488] shadow-sm'
      : variant === 'secondary'
      ? 'bg-white text-teal-800 border border-[#d1e7df] hover:bg-teal-50'
      : variant === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-700'
      : 'bg-transparent text-slate-600 hover:bg-slate-100';
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function ClinicModal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'max-w-2xl',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl border border-[#d1e7df] overflow-hidden`}>
        <div className="px-6 py-4 border-b border-[#d1e7df] flex items-center justify-between bg-[#f0fdf9]">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 custom-scrollbar">{children}</div>
        {actions && (
          <div className="px-6 py-4 border-t border-[#d1e7df] bg-[#f0fdf9] flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function ClinicDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  actions,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-[#d1e7df] flex items-center justify-between bg-[#f0fdf9]">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {tabs && tabs.length > 0 && (
          <div className="px-6 border-b border-[#d1e7df] flex gap-4 bg-white overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange?.(tab)}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">{children}</div>
        {actions && (
          <div className="px-6 py-4 border-t border-[#d1e7df] bg-[#f0fdf9] flex items-center justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function ClinicPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-3 px-2 text-xs text-slate-600">
      <span>
        Showing <strong className="text-slate-900">{start}</strong> to{' '}
        <strong className="text-slate-900">{end}</strong> of{' '}
        <strong className="text-slate-900">{totalItems}</strong> entries
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-semibold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ClinicEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-teal-600" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ClinicField({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function clinicInputClass() {
  return 'w-full px-3 py-2 rounded-xl border border-[#d1e7df] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';
}

export function ClinicTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[#d1e7df] pb-px">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
            active === tab
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function ClinicProgress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
        <span>Progress</span>
        <span className="font-semibold text-teal-700">{v}%</span>
      </div>
      <div className="h-2 rounded-full bg-teal-50 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
