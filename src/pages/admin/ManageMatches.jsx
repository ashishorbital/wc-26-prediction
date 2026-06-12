import { useState, useEffect } from 'react';
import { getMatches, setMatchResult, deleteMatch } from '../../services/db';
import { format, parseISO } from 'date-fns';

const ManageMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetResult = async (matchId) => {
    const scoreA = prompt("Enter Team A final score:");
    if (scoreA === null) return;
    const scoreB = prompt("Enter Team B final score:");
    if (scoreB === null) return;

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      alert("Invalid score.");
      return;
    }

    try {
      await setMatchResult(matchId, scoreA, scoreB);
      fetchMatches();
      alert("Result saved and points updated!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteMatch = async (matchId) => {
    if (confirm("Are you sure you want to delete this match?")) {
      try {
        await deleteMatch(matchId);
        fetchMatches();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div>Loading matches...</div>;

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-royal-blue)' }}>Set Results</h2>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Score</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={m.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <td style={{ fontWeight: '700', fontSize: '18px' }}>{m.teamA} vs {m.teamB}</td>
                <td style={{ color: 'var(--c-dark-gray)', fontWeight: '700' }}>{format(parseISO(m.matchDateTime), 'MMM dd, HH:mm')}</td>
                <td>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '800',
                    background: m.status === 'completed' ? 'rgba(0, 230, 77, 0.1)' : 'rgba(43, 62, 255, 0.1)',
                    color: m.status === 'completed' ? 'var(--c-dark-teal)' : 'var(--c-royal-blue)',
                    textTransform: 'uppercase'
                  }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900' }}>
                  {m.status === 'completed' ? `${m.scoreA} - ${m.scoreB}` : '-'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => handleSetResult(m.id)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px', background: 'var(--c-neon-green)', color: 'var(--c-dark-teal)' }}>
                    Set Result
                  </button>
                  <button onClick={() => handleDeleteMatch(m.id)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px', color: 'var(--c-bright-red)', borderColor: 'var(--c-bright-red)' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageMatches;
