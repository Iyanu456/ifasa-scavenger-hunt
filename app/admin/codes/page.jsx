'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';
import AdminLayout from '@/components/AdminLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
import QRModal from '@/components/QRModal';
import { api } from '@/utils/api';

const LocationPicker = dynamic(
  () => import('@/components/LocationPicker'),
  { ssr: false }
);

export default function Codes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(null);
  const [selectedQR, setSelectedQR] = useState(null);
  const [locationPickerCode, setLocationPickerCode] = useState(null);

  useEffect(() => { loadCodes(); }, []);

  function loadCodes() { api.admin.codes().then((d) => { setCodes(d); setLoading(false); }); }

  function handleToggle(code) {
    if (code.slug === 'code-06' && !code.active) { setPending(code); return; }
    toggle(code);
  }

  async function toggle(code) { await api.admin.toggleCode(code.slug, !code.active); loadCodes(); }
  async function confirmToggle() { await toggle(pending); setPending(null); }

  async function handleDownloadQR(code) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${code.slug}`;
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, url, { width: 400, margin: 2, color: { dark: '#1A1A1A', light: '#F2EDE4' } });
    const link = document.createElement('a');
    link.download = `IAS3-Hunt-${code.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="font-display font-bold text-obsidian text-[28px] mb-5">Codes</h1>

        <div
          className="rounded-md border border-brass/50 p-4 mb-6"
          style={{ backgroundColor: 'rgba(201,168,76,0.1)' }}
        >
          <p className="font-mono text-[11px] text-iroko leading-relaxed">
            Verify the coordinates for each code before the event. GPS verification
            will not work without accurate coordinates. Use the map picker to set
            each QR code location.
          </p>
        </div>

        {loading ? <p className="loading-text">Loading codes...</p> : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {codes.map((code) => (
              <div
                key={code.slug}
                className={[
                  'bg-white rounded-lg border border-tan/40 p-5 flex flex-col gap-4',
                  code.slug === 'code-06' ? 'border-l-[3px] border-l-brass' : '',
                ].join(' ')}
              >
                {code.slug === 'code-06' && (
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-brass">
                    Summit Day Code
                  </p>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-semibold text-obsidian text-[17px] leading-tight">
                      {code.location}
                    </h3>
                    <p className="font-mono text-[11px] text-iroko/55 mt-1">
                      {code.slug} · {code.points} pts · {code.scan_count ?? 0} scans
                    </p>
                  </div>
                  <span className={[
                    'font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded flex-shrink-0',
                    code.active ? 'bg-olive/10 text-olive' : 'bg-rust/10 text-rust',
                  ].join(' ')}>
                    {code.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLocationPickerCode(code)}
                    className="px-3 py-1.5 rounded border border-tan text-[12px] font-body text-iroko hover:border-fired-clay hover:text-fired-clay transition-colors flex-shrink-0"
                  >
                    {code.lat && code.lng ? 'Edit Location' : '⚠ Set Location'}
                  </button>
                  {code.lat && code.lng ? (
                    <span className="font-mono text-[11px] text-iroko/50">
                      {Number(code.lat).toFixed(4)}, {Number(code.lng).toFixed(4)}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-rust">No coordinates set</span>
                  )}
                </div>

                <div className="border-t border-tan/30" />

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedQR(code)}
                    className="px-4 py-2 rounded border border-fired-clay text-fired-clay text-[13px] font-body hover:bg-fired-clay/5 transition-colors"
                  >
                    View QR
                  </button>
                  <button
                    onClick={() => handleDownloadQR(code)}
                    className="px-4 py-2 rounded border border-tan text-iroko text-[13px] font-body hover:bg-iroko/5 transition-colors"
                  >
                    Download QR
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleToggle(code)}
                    className={[
                      'px-4 py-2 rounded text-[13px] font-body font-medium transition-colors border',
                      code.active
                        ? 'border-tan text-iroko hover:bg-iroko/5'
                        : 'bg-fired-clay text-white hover:bg-rust border-transparent',
                    ].join(' ')}
                  >
                    {code.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pending && (
          <ConfirmDialog
            message="You are about to make the Summit Venue code live. Anyone who scans it will earn 100 points. This cannot be easily undone."
            confirmLabel="Yes, go live"
            cancelLabel="Not yet"
            onConfirm={confirmToggle}
            onCancel={() => setPending(null)}
          />
        )}
        {selectedQR && <QRModal code={selectedQR} onClose={() => setSelectedQR(null)} />}
        {locationPickerCode && (
          <LocationPicker
            code={locationPickerCode}
            onSave={(coords) => {
              setCodes((prev) =>
                prev.map((c) =>
                  c.slug === locationPickerCode.slug ? { ...c, ...coords } : c
                )
              );
            }}
            onClose={() => setLocationPickerCode(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
