import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recalculateAllUsersPoints } from '../../services/db';

const AdminDashboard = () => {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    if (confirm("Are you sure you want to recalculate points for all users? This might take a few seconds.")) {
      setLoading(true);
      try {
        await recalculateAllUsersPoints();
        alert("Successfully recalculated points for all users!");
      } catch (err) {
        alert("Error recalculating points: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-electric-purple)' }}>Admin Dashboard</h2>
      <p style={{ fontSize: '18px', fontWeight: '500', color: 'var(--c-dark-gray)' }}>Welcome, {admin.username}. Use the sidebar to manage the tournament.</p>
      
      <div className="card mt-4" style={{ borderTop: '8px solid var(--c-electric-purple)' }}>
        <h3 style={{ color: 'var(--c-electric-purple)' }}>Quick Links</h3>
        <ul style={{ marginTop: '16px', lineHeight: '2.5', listStyleType: 'none' }}>
          <li><strong style={{ color: 'var(--c-black)' }}>Matches:</strong> Create, edit, and set results for matches.</li>
          <li><strong style={{ color: 'var(--c-black)' }}>Predictions:</strong> View all user predictions.</li>
          <li><strong style={{ color: 'var(--c-black)' }}>Leaderboard:</strong> View the current standings.</li>
        </ul>
      </div>

      <div className="card mt-4" style={{ borderTop: '8px solid var(--c-neon-green)' }}>
        <h3 style={{ color: 'var(--c-electric-purple)' }}>Admin Utilities</h3>
        <p style={{ marginTop: '16px', color: 'var(--c-dark-gray)' }}>
          If you manually delete predictions from the database, you need to recalculate the user points to fix the leaderboard.
        </p>
        <button 
          onClick={handleRecalculate} 
          disabled={loading}
          className="btn btn-primary mt-3"
          style={{ background: 'var(--c-electric-purple)' }}
        >
          {loading ? 'Recalculating...' : 'Recalculate All User Points'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
