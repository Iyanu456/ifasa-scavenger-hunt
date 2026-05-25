'use client';

function rankRowClass(rank) {
  if (rank === 1) return 'bg-[rgba(201,168,76,0.12)]';
  if (rank === 2) return 'bg-[rgba(168,169,173,0.1)]';
  if (rank === 3) return 'bg-[rgba(196,98,45,0.1)]';
  return '';
}

function rankCellClass(rank) {
  if (rank === 1) return 'text-brass font-display font-bold';
  if (rank === 2) return 'text-silver font-display font-bold';
  if (rank === 3) return 'text-fired-clay font-display font-bold';
  return 'font-mono opacity-60';
}

export default function LeaderboardTable({ participants }) {
  if (!participants || participants.length === 0) {
    return <p className="loading-text">No participants yet.</p>;
  }

  return (
    <>
      <style>{`@media (max-width: 600px) { .col-dept { display: none; } }`}</style>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th className="col-dept">Department</th>
              <th>Points</th>
              <th>Codes Found</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.rank} className={rankRowClass(p.rank)}>
                <td className={rankCellClass(p.rank)}>#{p.rank}</td>
                <td>{p.name}</td>
                <td className="col-dept">{p.department}</td>
                <td className="font-mono font-medium">{p.total_points}</td>
                <td className="font-mono">{p.codes_scanned_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
