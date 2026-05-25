'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import LeaderboardTable from '@/components/LeaderboardTable';
import { api } from '@/utils/api';

const CameraScanner = dynamic(() => import('@/components/CameraScanner'), { ssr: false });

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const wakeTimer = useRef(null);

  function fetchData() {
    wakeTimer.current = setTimeout(() => setShowWakeNotice(true), 5000);
    api.leaderboard()
      .then((d) => { clearTimeout(wakeTimer.current); setShowWakeNotice(false); setData(d); setLoading(false); })
      .catch(() => { clearTimeout(wakeTimer.current); setShowWakeNotice(false); setLoading(false); });
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => { clearInterval(interval); clearTimeout(wakeTimer.current); };
  }, []);

  return (
    <Layout>
      <div className="page-container-wide pt-10">
        <div className="mb-7 flex items-end justify-between flex-wrap gap-2">
          <h1 className="m-0">Leaderboard</h1>
          <div className="flex flex-col items-end gap-1">
            {data && <span className="mono-label opacity-85 text-[13px]">{data.total} hunter{data.total !== 1 ? 's' : ''} on the board</span>}
            <span className="font-mono text-[10px] text-iroko opacity-40">Updates every 30 seconds</span>
          </div>
        </div>
        {loading && (
          <div>
            <p className="loading-text">Loading leaderboard...</p>
            {showWakeNotice && <p className="server-wake-notice">Starting up the server — this takes a moment on first load...</p>}
          </div>
        )}
        {!loading && data && <LeaderboardTable participants={data.participants} />}
        {!loading && !data && <p className="loading-text">Could not load leaderboard.</p>}
      </div>

      <button className="fab-scan" onClick={() => setShowScanner(true)} aria-label="Scan a code">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
        </svg>
        Scan
      </button>

      {showScanner && <CameraScanner onClose={() => setShowScanner(false)} />}
    </Layout>
  );
}
