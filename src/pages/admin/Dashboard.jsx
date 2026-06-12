import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { admin } = useAuth();

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
    </div>
  );
};

export default AdminDashboard;
