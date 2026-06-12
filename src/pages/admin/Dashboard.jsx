import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsersPaginated, getTotalUsersCount } from '../../services/db';

const AdminDashboard = () => {
  const { admin } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Pagination state
  const [pageDocs, setPageDocs] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const count = await getTotalUsersCount();
        setTotalUsers(count);
      } catch (err) {
        console.error("Error fetching total users:", err);
      }
    };
    fetchTotal();
  }, []);

  const fetchPage = async (direction = "initial") => {
    setLoadingUsers(true);
    try {
      let lastDoc = null;
      let firstDoc = null;

      if (direction === "next" && pageDocs[pageIndex]) {
        lastDoc = pageDocs[pageIndex].last;
      } else if (direction === "prev" && pageDocs[pageIndex]) {
        firstDoc = pageDocs[pageIndex].first;
      }

      const { users: fetchedUsers, firstDocSnap, lastDocSnap, isEmpty, hasMore: more } = 
        await getUsersPaginated(pageSize, lastDoc, direction, firstDoc);

      if (isEmpty && direction !== "initial") {
        setLoadingUsers(false);
        return;
      }

      setUsers(fetchedUsers);
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
      console.error("Error fetching users page:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPage("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--c-electric-purple)', margin: 0 }}>Registered Users ({totalUsers})</h2>
        <p style={{ margin: 0, fontWeight: '500', color: 'var(--c-dark-gray)' }}>
          Welcome, {admin.username}
        </p>
      </div>

      <div className="card" style={{ borderTop: '8px solid #0dcaf0', marginBottom: '40px' }}>
        {loadingUsers ? (
          <p className="mt-3 text-center" style={{ color: 'var(--c-dark-gray)' }}>Loading users...</p>
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
      
      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => fetchPage("prev")} 
          disabled={pageIndex === 0 || loadingUsers}
        >
          Previous
        </button>
        <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>Page {pageIndex + 1}</span>
        <button 
          className="btn btn-primary" 
          onClick={() => fetchPage("next")} 
          disabled={!hasMore || loadingUsers}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
