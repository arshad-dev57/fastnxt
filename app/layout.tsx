import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SubscriptionGuard from '../components/SubscriptionGuard';
import AppToaster from '../components/AppToaster';
import HostingerNavFix from '../components/HostingerNavFix';
import LogoutHistoryGuard from '../components/LogoutHistoryGuard';
import AppProviders from '../components/AppProviders';
import { CurrencyProvider } from '../lib/currency-context';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FastNxt - COMPLETE BUSINESS MANAGEMENT APP',
  description: 'FastNxt warehouse, sales, purchases, POS and accounting management',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1369779382804350"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <HostingerNavFix />
        <LogoutHistoryGuard />
        <CurrencyProvider>
          <AppProviders>
            <SubscriptionGuard>{children}</SubscriptionGuard>
          </AppProviders>
        </CurrencyProvider>
        <AppToaster />
      </body>
    </html>
  );
}
