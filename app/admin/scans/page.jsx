'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { api } from '@/utils/api';
import { formatTime } from '@/utils/time';

export default function Scans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.admin.scans().then((d) => { setScans(d); setLoading(false); }); }, []);

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-obsidian text-[28px]">Scan Log</h1>
          {!loading && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-iroko/50">
              {scans.length} Scans
            </span>
          )}
        </div>

        {loading ? <p className="loading-text">Loading scans...</p> : (
          <div className="bg-white rounded-lg border border-tan/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-tan/40">
                    {['#', 'Phone', 'Code', 'Points', 'Time'].map((h) => (
                      <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-iroko/55 px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scans.map((scan, i) => (
                    <tr key={scan._id ?? i} className="border-b border-tan/20 last:border-0 hover:bg-harmattan/60">
                      <td className="px-4 py-3 font-mono text-[12px] text-iroko/40">{i + 1}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-iroko whitespace-nowrap">{scan.phone}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-fired-clay">{scan.code_slug}</td>
                      <td className="px-4 py-3 font-display font-semibold text-[14px] text-obsidian">{scan.points_awarded}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-iroko/60 whitespace-nowrap">{formatTime(scan.scanned_at)}</td>
                    </tr>
                  ))}
                  {scans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center font-mono text-[12px] text-iroko/40">
                        No scans yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
