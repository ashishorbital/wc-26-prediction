import { useState, useEffect } from 'react';
import { getMatches, setMatchResult, updateMatch, getPredictionsByMatch, getUsersByIds } from '../../services/db';
import { format, parseISO, isBefore } from 'date-fns';

const ManageMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data.reverse());
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

  const handleEditMatch = async (match) => {
    const newTeamA = prompt("Edit Team A:", match.teamA);
    if (newTeamA === null) return;
    const newTeamB = prompt("Edit Team B:", match.teamB);
    if (newTeamB === null) return;
    
    const currentDate = parseISO(match.matchDateTime);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const timeStr = format(currentDate, 'HH:mm');

    const newDate = prompt("Edit Date (YYYY-MM-DD):", dateStr);
    if (newDate === null) return;
    const newTime = prompt("Edit Time (HH:MM):", timeStr);
    if (newTime === null) return;

    try {
      const dateTimeStr = `${newDate}T${newTime}:00`;
      await updateMatch(match.id, {
        teamA: newTeamA,
        teamB: newTeamB,
        matchDateTime: new Date(dateTimeStr).toISOString(),
      });
      fetchMatches();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportPredictions = async (match, onlyWinners = false) => {
    try {
      const preds = await getPredictionsByMatch(match.id);
      
      let filteredPreds = preds;
      if (onlyWinners) {
        if (match.status !== 'completed') {
          alert("Cannot export winners for an incomplete match.");
          return;
        }
        filteredPreds = preds.filter(p => p.points > 0);
      }

      if (filteredPreds.length === 0) {
        alert(onlyWinners ? "No winners for this match." : "No predictions for this match yet.");
        return;
      }
      
      const userIds = filteredPreds.map(p => p.userId);
      const users = await getUsersByIds(userIds);
      
      const userMap = {};
      users.forEach(u => {
        userMap[u.userId] = u;
      });

      let csv = "Name,Mobile,Predicted Team A,Predicted Team B,Points\n";
      filteredPreds.forEach(p => {
        const u = userMap[p.userId] || { name: "Unknown", mobile: p.userId };
        csv += `"${u.name}","${u.mobile}",${p.predictedA},${p.predictedB},${p.points || 0}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const fileNamePrefix = onlyWinners ? "Winners" : "Predictions";
      link.setAttribute('download', `${fileNamePrefix}_${match.teamA}_vs_${match.teamB}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch(err) {
      alert("Failed to export: " + err.message);
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
                  {m.status === 'completed' && (
                    <button onClick={() => handleExportPredictions(m, true)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px', color: 'var(--c-royal-blue)', borderColor: 'var(--c-royal-blue)' }}>
                      Winners
                    </button>
                  )}
                  <button onClick={() => handleExportPredictions(m)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px', color: 'var(--c-dark-gray)', borderColor: 'var(--c-dark-gray)' }}>
                    Export
                  </button>
                  <button onClick={() => handleSetResult(m.id)} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px', background: 'var(--c-neon-green)', color: 'var(--c-dark-teal)' }}>
                    Set Result
                  </button>
                  {isBefore(new Date(), parseISO(m.matchDateTime)) && (
                    <button onClick={() => handleEditMatch(m)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '14px', color: 'var(--c-royal-blue)', borderColor: 'var(--c-royal-blue)' }}>
                      Edit
                    </button>
                  )}
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
