'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';

export function QRIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="3" height="3"/>
    </svg>
  );
}

export default function ScanPicker({ onClose }) {
  const router = useRouter();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listActiveCodes()
      .then((data) => { setCodes(data); setLoading(false); })
      .catch(() => setLoading(false));

    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function pick(slug) {
    onClose();
    router.push(`/scan/${slug}`);
  }

  return (
    <div className="bottom-sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label="Select a code to scan">
        <div className="bottom-sheet-handle" />
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-obsidian">Which code are you scanning?</h3>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[20px] text-iroko opacity-50 leading-none min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">×</button>
        </div>
        <p className="font-body text-[14px] text-iroko opacity-70 mb-5">
          Select the location where you found the QR code
        </p>
        {loading && <p className="loading-text py-4">Loading codes...</p>}
        {!loading && codes.length === 0 && (
          <p className="font-mono text-[13px] text-iroko opacity-60 text-center py-4">
            No codes are active right now. Check back soon.
          </p>
        )}
        {!loading && codes.map((code) => (
          <div key={code.slug} className="code-pick-card" onClick={() => pick(code.slug)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && pick(code.slug)}>
            <span className="font-display text-[15px] text-obsidian font-medium">{code.location}</span>
            <span className="font-mono text-[12px] text-brass font-medium">{code.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
