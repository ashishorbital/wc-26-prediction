import { useState } from 'react';
import { createMatch } from '../../services/db';

const AddMatch = () => {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      const dateTimeStr = `${matchDate}T${matchTime}:00`;
      await createMatch({
        teamA, teamB,
        matchDateTime: new Date(dateTimeStr).toISOString(),
      });
      setTeamA(''); setTeamB(''); setMatchDate(''); setMatchTime('');
      alert("Match added successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-royal-blue)' }}>Add New Match</h2>
      <div className="card animate-slide-up" style={{ borderTop: '8px solid var(--c-royal-blue)' }}>
        <form onSubmit={handleCreateMatch}>
          <div className="form-group mb-4">
            <label className="form-label">Team A</label>
            <input type="text" className="form-control" value={teamA} onChange={e => setTeamA(e.target.value)} required />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Team B</label>
            <input type="text" className="form-control" value={teamB} onChange={e => setTeamB(e.target.value)} required />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={matchDate} onChange={e => setMatchDate(e.target.value)} required />
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Time</label>
            <input type="time" className="form-control" value={matchTime} onChange={e => setMatchTime(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary mt-2" style={{ width: '100%', background: 'var(--c-royal-blue)' }}>
            Add Match
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMatch;
