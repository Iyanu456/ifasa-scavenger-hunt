'use client';
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-[rgba(209,180,155,0.4)] sticky top-0 z-10">
        <div className="pattern-strip" />
        <div className="max-w-[1100px] mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link href="/" className="flex flex-col gap-[1px] no-underline">
            <span className="font-display font-bold text-[18px] text-obsidian leading-none">IAS 3.0</span>
            <span className="font-mono text-[10px] text-fired-clay uppercase tracking-[0.1em] leading-none">The Hunt</span>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/register" className="font-body text-iroko text-[15px]">Register</Link>
            <Link href="/leaderboard" className="font-body text-iroko text-[15px]">Leaderboard</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-obsidian">
        <div className="pattern-strip" />
        <p className="font-mono text-[11px] text-[rgba(242,237,228,0.5)] text-center px-5 py-4 m-0">
          © IFASA 2026 · Ife Architecture Summit 3.0 · Obafemi Awolowo University
        </p>
      </footer>
    </div>
  );
}
