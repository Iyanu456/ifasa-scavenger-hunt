'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';

export default function CameraScanner({ onClose }) {
  const router = useRouter();
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let scanner;

    async function startScanner() {
      try {
        scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText) => { handleScan(decodedText); },
          () => {}
        );

        setStarting(false);
      } catch (err) {
        const msg = err?.toString() ?? '';
        if (err?.name === 'NotAllowedError' || msg.includes('NotAllowedError')) {
          setError('permission_denied');
        } else if (err?.name === 'NotFoundError' || msg.includes('NotFoundError')) {
          setError('no_camera');
        } else {
          setError('unavailable');
        }
        setStarting(false);
      }
    }

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  function handleScan(decodedText) {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }

    try {
      const url = new URL(decodedText);
      const path = url.pathname;
      if (path.startsWith('/scan/')) {
        onClose();
        router.push(path);
      } else {
        setError('invalid_code');
      }
    } catch {
      setError('invalid_code');
    }
  }

  function handleRetry() {
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] bg-obsidian flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div>
          <p className="font-display font-bold text-white text-[17px]">Scan a Code</p>
          <p className="font-mono text-[11px] text-white/50 mt-0.5">
            Point your camera at a QR code
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {error ? (
          <div className="text-center max-w-xs">
            {error === 'permission_denied' && (
              <>
                <p className="font-display font-semibold text-white text-lg mb-2">Camera access denied</p>
                <p className="font-body text-white/60 text-[14px] mb-6">
                  Allow camera access in your browser settings and try again.
                </p>
              </>
            )}
            {error === 'no_camera' && (
              <>
                <p className="font-display font-semibold text-white text-lg mb-2">No camera found</p>
                <p className="font-body text-white/60 text-[14px] mb-6">
                  This device doesn't have a camera. Use a phone to scan QR codes.
                </p>
              </>
            )}
            {error === 'invalid_code' && (
              <>
                <p className="font-display font-semibold text-white text-lg mb-2">Not a Hunt code</p>
                <p className="font-body text-white/60 text-[14px] mb-6">
                  That QR code isn't part of The Hunt. Find one of the hidden codes on campus.
                </p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2.5 rounded bg-fired-clay text-white font-body font-medium text-[14px] hover:bg-rust transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
            {error === 'unavailable' && (
              <>
                <p className="font-display font-semibold text-white text-lg mb-2">Camera unavailable</p>
                <p className="font-body text-white/60 text-[14px] mb-6">
                  Couldn't access your camera. Try refreshing or use a different browser.
                </p>
                <button
                  onClick={handleRetry}
                  className="px-6 py-2.5 rounded bg-fired-clay text-white font-body font-medium text-[14px] hover:bg-rust transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {starting && (
              <p className="font-mono text-[12px] text-white/50 text-center mb-4">
                Starting camera...
              </p>
            )}
            <div
              id="qr-reader"
              className="w-full rounded-lg overflow-hidden"
              style={{ minHeight: '300px' }}
            />
            {!starting && (
              <p className="font-mono text-[11px] text-white/40 text-center mt-4">
                Hold steady — scanning automatically
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
