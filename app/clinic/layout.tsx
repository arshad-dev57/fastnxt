'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { Stethoscope } from 'lucide-react';
import { TopBarBrand } from '../../components/BrandHeader';
import { SidebarMain } from '../../components/CollapsibleSidebar';
import ProfileDropdown from '../../components/ProfileDropdown';
import AppBreadcrumbs from '../../components/AppBreadcrumbs';
import GlobalSearch from '../../components/GlobalSearch';
import NotificationDropdown from '../../components/NotificationDropdown';
import LocationSelect from '../../components/LocationSelect';
import { LocationProvider } from '../../lib/location-context';
import { FiscalYearProvider } from '../../lib/fiscal-year-context';
import { CurrencyProvider } from '../../lib/currency-context';
import { ClinicSidebar } from './nav';

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <FiscalYearProvider>
      <LocationProvider allowAll allowAllUsers>
        <CurrencyProvider>
          <ClinicSidebar />
          <SidebarMain className="bg-[#f3faf7]">
            <header className="bg-white border-b border-[#d1e7df] px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-20 shadow-xs">
              <TopBarBrand
                title="Clinic Management"
                icon={<Stethoscope className="w-5 h-5 text-[#0f766e]" />}
                href="/dashboard"
              />
              <div className="flex items-center gap-2 sm:gap-4">
                <LocationSelect entityLabel="Location" />
                <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                <GlobalSearch />
                <NotificationDropdown />
                <div className="w-px h-6 bg-gray-200" />
                <ProfileDropdown accentClassName="bg-[#0f766e]" />
              </div>
            </header>
            <AppBreadcrumbs />
            <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
          </SidebarMain>
        </CurrencyProvider>
      </LocationProvider>
    </FiscalYearProvider>
  );
}
