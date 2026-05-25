'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/utils/auth';
import { api } from '@/utils/api';

const NAV_LINKS = [
  { label: 'Overview',     href: '/admin' },
  { label: 'Codes',        href: '/admin/codes' },
  { label: 'Participants', href: '/admin/participants' },
  { label: 'Scan Log',     href: '/admin/scans' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (!auth.isLoggedIn()) { router.replace('/admin/login'); return; }
      try {
        await api.admin.me();
        setVerified(true);
      } catch {
        auth.clear();
        router.replace('/admin/login');
      }
    }
    checkAuth();
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  if (!verified) {
    return (
      <div className="min-h-screen bg-harmattan flex items-center justify-center">
        <p className="mono-label">Checking access...</p>
      </div>
    );
  }

  function handleSignOut() {
    auth.clear();
    router.push('/admin/login');
  }

  const NavLinks = () => (
    <>
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
    </>
  );

  return (
    <div className="min-h-screen bg-harmattan">

      {/* ── DESKTOP SIDEBAR — hidden below lg ── */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 h-screen flex-col z-50 overflow-y-auto"
        style={{ width: '224px', backgroundColor: '#583624' }}
      >
        <div className="px-6 pt-7 pb-5 border-b border-white/10 flex-shrink-0">
          <p className="font-display font-bold text-white text-[17px] leading-tight">IAS 3.0</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-fired-clay mt-1">Admin</p>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-5 flex-1">
          <NavLinks />
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

      {/* ── MOBILE TOP BAR — hidden on lg+ ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14"
        style={{ backgroundColor: '#583624' }}
      >
        <div>
          <span className="font-display font-bold text-white text-[15px]">IAS 3.0</span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-fired-clay ml-2">Admin</span>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-md hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <span className="w-5 h-[2px] bg-white rounded-full" />
          <span className="w-5 h-[2px] bg-white rounded-full" />
          <span className="w-5 h-[2px] bg-white rounded-full" />
        </button>
      </header>

      {/* ── MOBILE DRAWER BACKDROP ── */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-obsidian/60"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER PANEL ── */}
      <div
        className={[
          'lg:hidden fixed top-0 left-0 h-screen z-[70] flex flex-col overflow-y-auto',
          'transition-transform duration-300 ease-in-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ width: '260px', backgroundColor: '#583624' }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="font-display font-bold text-white text-[17px] leading-tight">IAS 3.0</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-fired-clay mt-0.5">Admin</p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors text-lg leading-none"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-5 flex-1">
          <NavLinks />
        </nav>

        <div className="px-6 py-5 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-fired-clay hover:text-white transition-colors duration-150 bg-transparent border-none cursor-pointer p-0"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      {/* Desktop: sidebar offset. Mobile: top bar offset. */}
      <div className="hidden lg:block" style={{ marginLeft: '224px' }}>
        <main className="px-8 py-8 max-w-5xl">
          {children}
        </main>
      </div>

      <div className="lg:hidden pt-14">
        <main className="px-4 py-6">
          {children}
        </main>
      </div>

    </div>
  );
}
