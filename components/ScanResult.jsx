'use client';
import Link from 'next/link';

export default function ScanResult({ pointsEarned, totalPoints, rank }) {
  return (
    <div className="card text-center">
      <div className="flex flex-col items-center gap-1 pt-4 pb-2">
        <span className="font-display text-[clamp(3rem,12vw,4.5rem)] font-bold text-brass leading-none">
          +{pointsEarned}
        </span>
        <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-iroko opacity-65">
          points earned
        </span>
      </div>
      <hr className="divider" />
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-2xl font-bold text-obsidian">{totalPoints} pts</span>
          <span className="mono-label">total points</span>
        </div>
        <div className="w-px h-10 bg-[rgba(209,180,155,0.5)]" />
        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-2xl font-bold text-obsidian">#{rank}</span>
          <span className="mono-label">on the board</span>
        </div>
      </div>
      <Link href="/leaderboard" className="btn btn-primary w-full flex">
        See the leaderboard →
      </Link>
    </div>
  );
}
