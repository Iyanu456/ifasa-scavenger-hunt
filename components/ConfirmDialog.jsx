'use client';
import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ message, confirmLabel, cancelLabel, confirmDestructive, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function trap(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
      if (e.key === 'Escape') onCancel();
    }
    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-[rgba(26,26,26,0.55)] flex items-center justify-center z-[1000] p-4" role="dialog" aria-modal="true">
      <div className="card max-w-[400px] w-full" ref={dialogRef}>
        <p className="mb-6 text-iroko leading-[1.65]">{message}</p>
        <div className="flex gap-3 justify-end flex-wrap">
          <button className="btn btn-ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={[
              'flex-1 px-4 py-2.5 rounded font-body font-medium text-[14px] transition-colors text-white border-none cursor-pointer',
              confirmDestructive ? 'bg-rust hover:bg-rust/80' : 'bg-fired-clay hover:bg-rust',
            ].join(' ')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
