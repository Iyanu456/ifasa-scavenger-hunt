'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/utils/auth';

const NAV_LINKS = [
  { label: 'Overview',     href: '/admin' },
  { label: 'Codes',        href: '/admin/codes' },
  { label: 'Participants', href: '/admin/participants' },
  { label: 'Scan Log',     href: '/admin/scans' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    auth.clear();
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen bg-harmattan">

      {/* Sidebar */}
      <aside
        style={{ width: '224px' }}
        className="fixed top-0 left-0 h-screen bg-chocolate flex flex-col z-50 overflow-y-auto"
      >
        <div className="px-6 pt-7 pb-5 border-b border-white/10 flex-shrink-0">
          <p className="font-display font-bold text-white text-[17px] leading-tight">IAS 3.0</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-fired-clay mt-1">Admin</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-5 flex-1">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center rounded-md text-[13px] transition-colors duration-150 py-2.5',
                  isActive
                    ? 'bg-white/10 text-white font-medium pl-[9px] border-l-[3px] border-fired-clay'
                    : 'text-white/55 hover:text-white/90 hover:bg-white/5 px-3',
                ].join(' ')}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-5 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-fired-clay hover:text-white transition-colors duration-150 bg-transparent border-none cursor-pointer p-0"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: '224px' }} className="min-h-screen">
        <main className="px-8 py-8 max-w-5xl">
          {children}
        </main>
      </div>

    </div>
  );
}
