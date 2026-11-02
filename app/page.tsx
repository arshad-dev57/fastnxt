export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

/** If not logged in, redirect to login page instead of marketing site */
export default function Home() {
  redirect('/login');
}
