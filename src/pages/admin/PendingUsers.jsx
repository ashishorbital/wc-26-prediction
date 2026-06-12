import { useState, useEffect } from 'react';
import { getPendingUsers, approveUser, rejectUser } from '../../services/db';
import { format } from 'date-fns';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getPendingUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (mobile) => {
    try {
      await approveUser(mobile);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (mobile) => {
    if (confirm("Are you sure you want to reject this user?")) {
      try {
        await rejectUser(mobile);
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) return <div>Loading pending users...</div>;

  return (
    <div>
      <h2 className="mb-4" style={{ color: 'var(--c-electric-purple)' }}>Pending Approvals</h2>
      
      {users.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <h3 style={{ color: 'var(--c-dark-gray)' }}>No pending approvals</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Registered At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                let dateStr = '-';
                if (u.createdAt) {
                  // Handle firestore timestamp vs string
                  const d = u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(u.createdAt);
                  dateStr = format(d, 'MMM dd, HH:mm');
                }
                return (
                  <tr key={u.userId} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td style={{ fontWeight: '700', fontSize: '18px' }}>{u.name}</td>
                    <td style={{ color: 'var(--c-dark-gray)', fontWeight: '700' }}>{u.mobile}</td>
                    <td style={{ color: 'var(--c-dark-gray)' }}>{dateStr}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleApprove(u.userId)} 
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px', background: 'var(--c-neon-green)', color: 'var(--c-dark-teal)' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(u.userId)} 
                        className="btn btn-outline" 
                        style={{ padding: '8px 16px', fontSize: '14px', color: 'var(--c-bright-red)', borderColor: 'var(--c-bright-red)' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
