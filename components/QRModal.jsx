'use client';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRModal({ code, onClose }) {
  const canvasRef = useRef(null);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${code.slug}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: { dark: '#1A1A1A', light: '#F2EDE4' },
      });
    }
  }, [url]);

  function handleDownload() {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `IAS3-Hunt-${code.slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="fixed inset-0 bg-[rgba(26,26,26,0.55)] flex items-center justify-center z-[1000] p-4" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="card max-w-[360px] w-full text-center flex flex-col items-center gap-3">
        <h3 className="text-[1.1rem] text-obsidian">{code.location}</h3>
        <p className="font-mono text-[11px] text-iroko opacity-50 break-all m-0">
          {url.replace(/^https?:\/\//, '')}
        </p>
        <div className="rounded-sm overflow-hidden leading-none">
          <canvas ref={canvasRef} />
        </div>
        <p className="text-brass font-mono text-[13px] m-0">{code.points} pts</p>
        <div className="flex gap-3 w-full mt-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>Close</button>
          <button className="btn btn-primary flex-1" onClick={handleDownload}>Download PNG</button>
        </div>
      </div>
    </div>
  );
}
