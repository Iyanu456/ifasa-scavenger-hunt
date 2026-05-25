'use client';
import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/Layout';
import LeaderboardTable from '@/components/LeaderboardTable';
import ScanPicker, { QRIcon } from '@/components/ScanPicker';
import { api } from '@/utils/api';

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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

      <button className="fab-scan" onClick={() => setPickerOpen(true)} aria-label="Scan a code">
        <QRIcon />Scan
      </button>

      {pickerOpen && <ScanPicker onClose={() => setPickerOpen(false)} />}
    </Layout>
  );
}
