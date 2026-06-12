import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserStats } from '../../services/db';
import { Trophy, Target, Hash } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getUserStats(user.mobile);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) return <div className="text-center mt-4">Loading...</div>;
  if (!stats) return <div className="text-center mt-4">Failed to load stats.</div>;

  return (
    <div>
      <h2 className="mb-4">Welcome back,<br/><span style={{ color: 'var(--c-bright-red)' }}>{user.name}</span></h2>
      
      <div className="grid-12">
        {/* Total Points Card */}
        <div className="card col-span-12 md:col-span-4" style={{ 
          background: 'var(--c-electric-purple)', 
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Trophy size={48} opacity={0.8} />
            <div style={{ 
              width: '120px', height: '120px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%', 
              position: 'absolute', 
              top: '-20px', right: '-20px' 
            }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '64px', margin: 0, lineHeight: 1 }}>{stats.points}</h3>
            <p style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.9 }}>Total Points</p>
          </div>
        </div>

        {/* Predictions Made Card */}
        <div className="card col-span-12 md:col-span-4" style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '16px', background: 'rgba(43, 62, 255, 0.1)', borderRadius: '24px', color: 'var(--c-royal-blue)' }}>
              <Target size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', margin: 0, lineHeight: 1, color: 'var(--c-royal-blue)' }}>{stats.predictionsCount}</h3>
            <p style={{ textTransform: 'uppercase', fontWeight: 700, color: 'var(--c-dark-gray)' }}>Predictions Made</p>
          </div>
        </div>

        {/* Perfect Matches Card */}
        <div className="card col-span-12 md:col-span-4" style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '200px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ padding: '16px', background: 'rgba(0, 230, 77, 0.1)', borderRadius: '24px', color: 'var(--c-neon-green)' }}>
              <Hash size={32} />
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', margin: 0, lineHeight: 1, color: 'var(--c-dark-teal)' }}>{stats.correctPredictions}</h3>
            <p style={{ textTransform: 'uppercase', fontWeight: 700, color: 'var(--c-dark-gray)' }}>Perfect Matches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
