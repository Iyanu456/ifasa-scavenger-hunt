'use client';

export default function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg border border-tan/40 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-iroko/60 mb-3">
        {label}
      </p>
      <p className="font-display font-bold text-obsidian leading-none" style={{ fontSize: '30px' }}>
        {value ?? '—'}
      </p>
      {sub && (
        <p className="font-mono text-[11px] text-iroko/50 mt-1.5">{sub}</p>
      )}
    </div>
  );
}
