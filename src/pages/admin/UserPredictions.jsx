import { useState, useEffect } from 'react';
import { getAllPredictions, getMatches, getAllUsers } from '../../services/db';

const UserPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [matches, setMatches] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predsData, matchesData, usersData] = await Promise.all([
          getAllPredictions(),
          getMatches(),
          getAllUsers()
        ]);
        
        const matchMap = {};
        matchesData.forEach(m => matchMap[m.id] = m);
        
        const userMap = {};
        usersData.forEach(u => userMap[u.userId] = u);
        
        const getTimeMs = (ts) => {
          if (!ts) return 0;
          if (ts.seconds) return ts.seconds * 1000;
          if (typeof ts === 'string') return new Date(ts).getTime();
          return 0;
        };

        predsData.sort((a, b) => {
          return getTimeMs(b.submittedAt) - getTimeMs(a.submittedAt);
        });
        
        setMatches(matchMap);
        setUsers(userMap);
        setPredictions(predsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading predictions...</div>;

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-bright-red)' }}>All Predictions</h2>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Match</th>
              <th>Prediction</th>
              <th>Points Awarded</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, i) => {
              const match = matches[p.matchId];
              const user = users[p.userId];
              return (
                <tr key={p.predictionId} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td style={{ fontWeight: '700', color: 'var(--c-dark-gray)' }}>
                    {user ? `${user.name} (${p.userId})` : p.userId}
                  </td>
                  <td style={{ fontWeight: '700', fontSize: '18px' }}>
                    {match ? `${match.teamA} vs ${match.teamB}` : 'Unknown Match'}
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', color: 'var(--c-royal-blue)' }}>
                    {p.predictedA} - {p.predictedB}
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '900', color: p.points > 0 ? 'var(--c-neon-green)' : 'var(--c-black)' }}>
                    {p.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPredictions;
