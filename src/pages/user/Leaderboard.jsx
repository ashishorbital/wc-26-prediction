import { useState, useEffect } from 'react';
import { getLeaderboard } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        
        let currentRank = 1;
        let prevPoints = -1;
        
        const rankedData = data.map((u, index) => {
          if (u.points !== prevPoints && prevPoints !== -1) {
            currentRank = index + 1;
          }
          prevPoints = u.points;
          return { ...u, rank: currentRank };
        });

        setUsers(rankedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center mt-4">Loading leaderboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Global<br/><span style={{ color: 'var(--c-electric-purple)' }}>Rankings</span></h2>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Rank</th>
              <th>Player</th>
              <th style={{ textAlign: 'right' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const isCurrentUser = currentUser?.mobile === u.userId;
              const isTop3 = u.rank <= 3;
              
              let rankColor = 'var(--c-dark-gray)';
              if (u.rank === 1) rankColor = 'var(--c-bright-red)';
              else if (u.rank === 2) rankColor = 'var(--c-royal-blue)';
              else if (u.rank === 3) rankColor = 'var(--c-electric-purple)';

              return (
                <tr 
                  key={u.userId} 
                  style={{ 
                    animationDelay: `${i * 0.05}s`,
                    outline: isCurrentUser ? '2px solid var(--c-royal-blue)' : 'none'
                  }}
                  className="animate-slide-up"
                >
                  <td style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontSize: '24px', 
                    fontWeight: '900', 
                    color: rankColor
                  }}>
                    #{u.rank}
                  </td>
                  <td style={{ 
                    fontWeight: isCurrentUser ? '700' : '500',
                    color: isCurrentUser ? 'var(--c-royal-blue)' : 'var(--c-black)',
                    fontSize: '18px'
                  }}>
                    {u.name} {isCurrentUser && <span style={{ fontSize: '14px', color: 'var(--c-dark-gray)', marginLeft: '8px' }}>(You)</span>}
                  </td>
                  <td style={{ 
                    textAlign: 'right', 
                    fontFamily: 'var(--font-display)', 
                    fontSize: '32px', 
                    fontWeight: '900', 
                    color: isTop3 ? 'var(--c-black)' : 'var(--c-dark-gray)' 
                  }}>
                    {u.points}
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

export default Leaderboard;
