'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import StatCard from '@/components/StatCard';
import LeaderboardTable from '@/components/LeaderboardTable';
import { api } from '@/utils/api';
import { formatTime } from '@/utils/time';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.admin.stats().then(setStats).catch(console.error); }, []);

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display font-bold text-obsidian text-[28px] mb-7">Overview</h1>

        {!stats ? <p className="loading-text">Loading stats...</p> : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard label="Total Participants" value={stats.totalParticipants ?? '—'} />
              <StatCard label="Total Scans" value={stats.totalScans ?? '—'} />
              <StatCard
                label="Most Scanned Code"
                value={stats.scansPerCode?.[0]?.slug ?? '—'}
                sub={stats.scansPerCode?.[0] ? `${stats.scansPerCode[0].count} scans` : undefined}
              />
              <StatCard
                label="Last Scan"
                value={stats.lastScan ? formatTime(stats.lastScan.scanned_at) : 'No scans yet'}
              />
            </div>

            <h2 className="font-display font-semibold text-obsidian text-[18px] mb-4">Top 10</h2>
            <div className="bg-white rounded-lg border border-tan/40 overflow-hidden">
              <LeaderboardTable participants={stats.topParticipants ?? []} />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
