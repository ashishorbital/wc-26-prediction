import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMatches, submitPrediction, getUserPredictions } from '../../services/db';
import { format, isBefore, parseISO } from 'date-fns';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [matchesData, userPreds] = await Promise.all([
        getMatches(),
        getUserPredictions(user.mobile)
      ]);
      const sortedMatches = [...matchesData].sort((a, b) => {
        const timeA = parseISO(a.matchDateTime).getTime();
        const timeB = parseISO(b.matchDateTime).getTime();
        const now = Date.now();
        const startedA = now >= timeA;
        const startedB = now >= timeB;
        
        if (startedA && !startedB) return 1;
        if (!startedA && startedB) return -1;
        
        if (!startedA && !startedB) {
          return timeA - timeB; // ascending (closest upcoming first)
        }
        
        // both started
        return timeB - timeA; // descending (most recently started first)
      });
      setMatches(sortedMatches);
      
      const predMap = {};
      userPreds.forEach(p => {
        predMap[p.matchId] = { predictedA: p.predictedA, predictedB: p.predictedB };
      });
      setPredictions(predMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (matchId, teamA, teamB, dt) => {
    setSubmitting(true);
    try {
      const response = await fetch('http://worldtimeapi.org/api/timezone/Etc/UTC');
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      
      if (!isBefore(serverTime, parseISO(dt))) {
        alert("Match has already started! (Verified via Network Time)");
        setSubmitting(false);
        return;
      }
    } catch (err) {
      // Fallback to local time if API fails
      if (!isBefore(new Date(), parseISO(dt))) {
        alert("Match has already started!");
        setSubmitting(false);
        return;
      }
    }
    setSubmitting(false);

    const scoreA = prompt(`Predict score for ${teamA}:`, predictions[matchId]?.predictedA || 0);
    if (scoreA === null) return;
    const scoreB = prompt(`Predict score for ${teamB}:`, predictions[matchId]?.predictedB || 0);
    if (scoreB === null) return;

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      alert("Please enter valid positive numbers.");
      return;
    }

    setSubmitting(true);
    try {
      await submitPrediction(user.mobile, matchId, scoreA, scoreB);
      setPredictions(prev => ({
        ...prev,
        [matchId]: { predictedA: parseInt(scoreA), predictedB: parseInt(scoreB) }
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center mt-4">Loading matches...</div>;

  const toPredictMatches = matches.filter(m => !predictions[m.id]);
  const predictedMatches = matches.filter(m => predictions[m.id]);

  const visiblePredicted = predictedMatches.slice(0, visibleCount);
  const hasMorePredicted = visibleCount < predictedMatches.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const renderMatchCard = (match, idx) => {
    const isStarted = !isBefore(new Date(), parseISO(match.matchDateTime));
    const pred = predictions[match.id];
    const isCompleted = match.status === 'completed';

    return (
      <div key={match.id} className="card col-span-12 md:col-span-6" style={{ 
        textAlign: 'center', 
        borderTop: `8px solid ${idx % 2 === 0 ? 'var(--c-bright-red)' : 'var(--c-royal-blue)'}` 
      }}>
        <div style={{ fontWeight: '700', color: 'var(--c-dark-gray)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {format(parseISO(match.matchDateTime), 'MMM dd, yyyy - HH:mm')}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{match.teamA}</div>
          <div style={{ 
            padding: '8px 16px', 
            background: 'var(--c-light-gray)', 
            borderRadius: '16px',
            color: 'var(--c-black)', 
            fontFamily: 'var(--font-display)',
            fontWeight: '900',
            margin: '0 16px'
          }}>VS</div>
          <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '900', lineHeight: 1 }}>{match.teamB}</div>
        </div>

        {isCompleted ? (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--c-light-gray)', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', color: 'var(--c-dark-teal)' }}>Final Score</p>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '48px', color: 'var(--c-black)', lineHeight: 1 }}>{match.scoreA} - {match.scoreB}</p>
          </div>
        ) : null}

        {!isStarted && !isCompleted && (
          <button 
            className={`btn ${pred ? 'btn-outline' : 'btn-primary'} mb-4`}
            style={{ width: '100%' }}
            onClick={() => handlePredict(match.id, match.teamA, match.teamB, match.matchDateTime)}
            disabled={submitting}
          >
            {pred ? 'Update Prediction' : 'Predict Now'}
          </button>
        )}
        {isStarted && !isCompleted && (
          <div style={{ padding: '12px', background: 'var(--c-light-gray)', borderRadius: '16px', color: 'var(--c-bright-red)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '24px' }}>
            Match Locked
          </div>
        )}

        {pred ? (
          <div>
            <p style={{ margin: '0 0 8px 0', fontWeight: '700', textTransform: 'uppercase', fontSize: '14px', color: 'var(--c-royal-blue)' }}>Your Prediction</p>
            <div style={{ display: 'inline-block', padding: '12px 32px', border: '2px solid var(--c-royal-blue)', borderRadius: '24px' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '32px', color: 'var(--c-royal-blue)', lineHeight: 1 }}>{pred.predictedA} - {pred.predictedB}</p>
            </div>
          </div>
        ) : (
          <p style={{ fontWeight: '700', color: 'var(--c-dark-gray)' }}>No prediction submitted</p>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-4">To <span style={{ color: 'var(--c-royal-blue)' }}>Predict</span></h2>
      <div className="grid-12">
        {toPredictMatches.length === 0 ? (
          <div className="col-span-12" style={{ padding: '24px', textAlign: 'center', color: 'var(--c-dark-gray)', background: 'var(--c-light-gray)', borderRadius: '16px' }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎉</span>
            You have predicted all upcoming matches!
          </div>
        ) : (
          toPredictMatches.map(renderMatchCard)
        )}
      </div>

      <h2 className="mb-4" style={{ marginTop: '48px' }}>Already <span style={{ color: 'var(--c-royal-blue)' }}>Predicted</span></h2>
      <div className="grid-12">
        {visiblePredicted.length === 0 ? (
          <div className="col-span-12" style={{ padding: '24px', textAlign: 'center', color: 'var(--c-dark-gray)', background: 'var(--c-light-gray)', borderRadius: '16px' }}>
            You haven't made any predictions yet.
          </div>
        ) : (
          visiblePredicted.map(renderMatchCard)
        )}
      </div>
      
      {hasMorePredicted && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleLoadMore}
            style={{ padding: '12px 32px' }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Matches;

