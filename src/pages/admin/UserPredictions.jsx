import { useState, useEffect } from 'react';
import { getAllPredictions, getMatches } from '../../services/db';

const UserPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predsData, matchesData] = await Promise.all([
          getAllPredictions(),
          getMatches()
        ]);
        
        const matchMap = {};
        matchesData.forEach(m => matchMap[m.id] = m);
        setMatches(matchMap);
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
              <th>User Mobile</th>
              <th>Match</th>
              <th>Prediction</th>
              <th>Points Awarded</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((p, i) => {
              const match = matches[p.matchId];
              return (
                <tr key={p.predictionId} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td style={{ fontWeight: '700', color: 'var(--c-dark-gray)' }}>{p.userId}</td>
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
