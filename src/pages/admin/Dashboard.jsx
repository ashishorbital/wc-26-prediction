import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers } from '../../services/db';

const AdminDashboard = () => {
  const { admin } = useAuth();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

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

      <div className="card mt-4" style={{ borderTop: '8px solid #0dcaf0', marginBottom: '40px' }}>
        <h3 style={{ color: 'var(--c-electric-purple)' }}>Registered Users</h3>
        {loadingUsers ? (
          <p className="mt-3" style={{ color: 'var(--c-dark-gray)' }}>Loading users...</p>
        ) : (
          <div className="table-responsive mt-3" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table table-striped table-hover w-100" style={{ minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '12px 8px' }}>Name</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '12px 8px' }}>Mobile Number</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '12px 8px' }}>PIN</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '12px 8px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.mobile || idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ fontWeight: '500', padding: '12px 8px' }}>{user.name}</td>
                    <td style={{ padding: '12px 8px' }}>{user.mobile}</td>
                    <td style={{ padding: '12px 8px' }}>{user.pin}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{user.points || 0}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">No registered users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
