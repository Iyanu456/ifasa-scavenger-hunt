'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TOTAL_CODES = 6;

export default function LoggedInHome({ profile, onScan }) {
  const router = useRouter();

  function handleSignOut() {
    localStorage.removeItem('ias3_phone');
    router.refresh();
  }

  const codesFound = profile.codes_scanned_count ?? 0;
  const progressPercent = Math.round((codesFound / TOTAL_CODES) * 100);

  return (
    <div className="page-container max-w-[480px]" style={{ paddingTop: 'clamp(2rem, 8vw, 3rem)', paddingBottom: 'clamp(2rem, 8vw, 3rem)' }}>
      <div className="mb-7">
        <p className="mono-label text-fired-clay opacity-100 mb-3 block">IAS 3.0 · The Hunt</p>
        <h1 className="mb-0">{profile.name}.</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card" style={{ padding: 'clamp(0.875rem, 4vw, 1.25rem)' }}>
          <p className="mono-label mb-2">Total Points</p>
          <p className="stat-number">{profile.total_points}</p>
        </div>
        <div className="card" style={{ padding: 'clamp(0.875rem, 4vw, 1.25rem)' }}>
          <p className="mono-label mb-2">Your Rank</p>
          <p className="stat-number">#{profile.rank}</p>
        </div>
      </div>

      <div className="card mb-7">
        <div className="flex items-center justify-between mb-2">
          <p className="mono-label">Codes Found</p>
          <p className="font-mono text-[12px] text-obsidian font-medium">{codesFound} of {TOTAL_CODES}</p>
        </div>
        <div className="w-full h-2 bg-harmattan rounded-full overflow-hidden border border-tan/30">
          <div
            className="h-full bg-fired-clay rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {codesFound === TOTAL_CODES && (
          <p className="font-mono text-[11px] text-brass mt-2">You've found all the codes!</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={onScan} className="btn btn-primary w-full">Scan a Code →</button>
        <Link href="/leaderboard" className="btn btn-secondary w-full text-center">View Leaderboard →</Link>
        <button
          onClick={handleSignOut}
          className="font-mono text-[11px] uppercase tracking-widest text-iroko opacity-40 hover:opacity-70 transition-opacity text-center py-2"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
