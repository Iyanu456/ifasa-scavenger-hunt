'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ConfirmDialog from '@/components/ConfirmDialog';
import { api } from '@/utils/api';
import { formatTime } from '@/utils/time';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    api.admin.participants().then((d) => { setParticipants(d); setLoading(false); });
  }, []);

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.phone.includes(q);
  });

  function openDialog(type, participant) { setDialog({ type, participant }); }
  function closeDialog() { setDialog(null); }

  async function handleConfirm() {
    if (!dialog) return;
    const { type, participant } = dialog;
    try {
      if (type === 'delete') {
        await api.admin.deleteParticipant(participant.phone);
        setParticipants((prev) => prev.filter((p) => p.phone !== participant.phone));
      } else if (type === 'disqualify') {
        await api.admin.setDisqualified(participant.phone, true);
        setParticipants((prev) =>
          prev.map((p) => p.phone === participant.phone ? { ...p, disqualified: true } : p)
        );
      } else if (type === 'reinstate') {
        await api.admin.setDisqualified(participant.phone, false);
        setParticipants((prev) =>
          prev.map((p) => p.phone === participant.phone ? { ...p, disqualified: false } : p)
        );
      }
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      closeDialog();
    }
  }

  const dialogMessage = !dialog ? '' :
    dialog.type === 'delete'
      ? `Permanently delete ${dialog.participant.name}? This cannot be undone. Their scan history will also be removed.`
      : dialog.type === 'disqualify'
      ? `Disqualify ${dialog.participant.name}? They will be hidden from the public leaderboard. Their points are preserved and they can be reinstated at any time.`
      : `Reinstate ${dialog.participant.name}? They will reappear on the public leaderboard with their existing points intact.`;

  const dialogLabel = !dialog ? '' :
    dialog.type === 'delete' ? 'Delete' :
    dialog.type === 'disqualify' ? 'Disqualify' : 'Reinstate';

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-obsidian text-[28px]">Participants</h1>
          {!loading && (
            <span className="font-mono text-[11px] uppercase tracking-widest text-iroko/50">
              {participants.length} Participants
            </span>
          )}
        </div>

        <input
          type="text"
          placeholder="Search by name or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs mb-5 px-4 py-2.5 rounded border border-tan font-body text-[14px] text-obsidian bg-white placeholder:text-tan/80 focus:outline-none focus:border-fired-clay"
        />

        {loading ? <p className="loading-text">Loading participants...</p> : (
          <div className="bg-white rounded-lg border border-tan/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-tan/40">
                    {['Name', 'Phone', 'Dept', 'Level', 'Points', 'Codes', 'Registered', 'Actions'].map((h) => (
                      <th key={h} className="font-mono text-[10px] uppercase tracking-[0.1em] text-iroko/55 px-4 py-3 text-left whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.phone}
                      className={[
                        'border-b border-tan/20 last:border-0',
                        p.disqualified ? 'opacity-50 bg-rust/5' : 'hover:bg-harmattan/60',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3 font-body text-[13px] text-obsidian font-medium whitespace-nowrap">
                        <span>{p.name}</span>
                        {p.disqualified && (
                          <span className="ml-2 font-mono text-[9px] uppercase tracking-wider bg-rust/10 text-rust px-1.5 py-0.5 rounded">
                            DQ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-iroko whitespace-nowrap">{p.phone}</td>
                      <td className="px-4 py-3 font-body text-[13px] text-iroko">{p.department}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-iroko">{p.level}</td>
                      <td className="px-4 py-3 font-display font-semibold text-[14px] text-obsidian">{p.total_points}</td>
                      <td className="px-4 py-3 font-mono text-[12px] text-iroko">{p.codes_scanned?.length ?? 0}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-iroko/60 whitespace-nowrap">{formatTime(p.registered_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.disqualified ? (
                            <button
                              onClick={() => openDialog('reinstate', p)}
                              className="font-mono text-[11px] px-2.5 py-1 rounded border border-olive/40 text-olive hover:bg-olive/10 transition-colors whitespace-nowrap"
                            >
                              Reinstate
                            </button>
                          ) : (
                            <button
                              onClick={() => openDialog('disqualify', p)}
                              className="font-mono text-[11px] px-2.5 py-1 rounded border border-rust/40 text-rust hover:bg-rust/10 transition-colors whitespace-nowrap"
                            >
                              Disqualify
                            </button>
                          )}
                          <button
                            onClick={() => openDialog('delete', p)}
                            className="font-mono text-[11px] px-2.5 py-1 rounded border border-rust/40 text-rust hover:bg-rust hover:text-white transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center font-mono text-[12px] text-iroko/40">
                        No participants found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {dialog && (
        <ConfirmDialog
          message={dialogMessage}
          confirmLabel={dialogLabel}
          cancelLabel="Cancel"
          confirmDestructive={dialog.type !== 'reinstate'}
          onConfirm={handleConfirm}
          onCancel={closeDialog}
        />
      )}
    </AdminLayout>
  );
}
