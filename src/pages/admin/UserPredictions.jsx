import { useState, useEffect } from 'react';
import { getPredictionsPaginated, getMatches, getUsersByIds } from '../../services/db';

const UserPredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [matches, setMatches] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pageDocs, setPageDocs] = useState([]); 
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  const formatTime = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleString();
  };

  const fetchPage = async (direction = "initial") => {
    setLoading(true);
    try {
      let lastDoc = null;
      let firstDoc = null;
      
      if (direction === "next" && pageDocs[pageIndex]) {
        lastDoc = pageDocs[pageIndex].last;
      } else if (direction === "prev" && pageDocs[pageIndex - 1]) {
        firstDoc = pageDocs[pageIndex - 1].first;
      }

      const { predictions: predsData, firstDocSnap, lastDocSnap, isEmpty, hasMore: more } = 
        await getPredictionsPaginated(pageSize, lastDoc, direction, firstDoc);

      if (isEmpty && direction !== "initial") {
        setLoading(false);
        return;
      }

      const userIds = predsData.map(p => p.userId);
      const matchesPromise = Object.keys(matches).length === 0 ? getMatches() : Promise.resolve([]);
      
      const [matchesData, usersData] = await Promise.all([
        matchesPromise,
        getUsersByIds(userIds)
      ]);

      if (Object.keys(matches).length === 0) {
        const matchMap = {};
        matchesData.forEach(m => matchMap[m.id] = m);
        setMatches(matchMap);
      }

      setUsers(prev => {
        const userMap = { ...prev };
        usersData.forEach(u => userMap[u.userId] = u);
        return userMap;
      });

      const getTimeMs = (ts) => {
        if (!ts) return 0;
        if (ts.seconds) return ts.seconds * 1000;
        if (typeof ts === 'string') return new Date(ts).getTime();
        return ts;
      };

      predsData.sort((a, b) => getTimeMs(b.submittedAt) - getTimeMs(a.submittedAt));

      setPredictions(predsData);
      setHasMore(more);
      
      const newPageDocs = [...pageDocs];
      let newIdx = pageIndex;
      if (direction === "next") newIdx = pageIndex + 1;
      else if (direction === "prev") newIdx = pageIndex - 1;
      else newIdx = 0; // initial
      
      newPageDocs[newIdx] = { first: firstDocSnap, last: lastDocSnap };
      setPageDocs(newPageDocs);
      setPageIndex(newIdx);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-bright-red)' }}>All Predictions</h2>
      
      <div className="table-container">
        {loading && <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>Loading predictions...</div>}
        {!loading && predictions.length === 0 && <div style={{ padding: '20px', textAlign: 'center', fontWeight: 'bold' }}>No predictions found.</div>}
        
        {!loading && predictions.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
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
                    <td style={{ fontSize: '14px', color: 'var(--c-dark-gray)' }}>
                      {formatTime(p.submittedAt)}
                    </td>
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
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchPage("prev")} 
          disabled={pageIndex === 0 || loading}
        >
          Previous
        </button>
        <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>Page {pageIndex + 1}</span>
        <button 
          className="btn btn-primary" 
          onClick={() => fetchPage("next")} 
          disabled={!hasMore || loading}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserPredictions;
