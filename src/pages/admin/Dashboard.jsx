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
        const sortedData = data.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setUsers(sortedData);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--c-electric-purple)', margin: 0 }}>Registered Users ({users.length})</h2>
        <p style={{ margin: 0, fontWeight: '500', color: 'var(--c-dark-gray)' }}>
          Welcome, {admin.username}
        </p>
      </div>

      <div className="card" style={{ borderTop: '8px solid #0dcaf0', marginBottom: '40px' }}>
        {loadingUsers ? (
          <p className="mt-3" style={{ color: 'var(--c-dark-gray)' }}>Loading users...</p>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
            <table className="table table-striped table-hover w-100" style={{ minWidth: '600px', margin: 0 }}>
              <thead>
                <tr>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '16px 12px' }}>Name</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '16px 12px' }}>Mobile Number</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '16px 12px' }}>PIN</th>
                  <th style={{ color: 'var(--c-electric-purple)', textAlign: 'left', padding: '16px 12px' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.mobile || idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ fontWeight: '500', padding: '12px' }}>{user.name}</td>
                    <td style={{ padding: '12px' }}>{user.mobile}</td>
                    <td style={{ padding: '12px' }}>{user.pin}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{user.points || 0}</td>
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
