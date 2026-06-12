import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, Users, Calendar, Trophy, LogOut, UserCheck, PlusCircle } from 'lucide-react';

const AdminLayout = () => {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Overview', icon: <Settings size={20} /> },
    { path: '/admin/add-match', label: 'Add Match', icon: <PlusCircle size={20} /> },
    { path: '/admin/matches', label: 'Set Results', icon: <Calendar size={20} /> },
    { path: '/admin/predictions', label: 'Predictions', icon: <Users size={20} /> },
    { path: '/admin/pending', label: 'Pending Users', icon: <UserCheck size={20} /> },
    { path: '/admin/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar for Admin */}
      <aside className="card admin-sidebar">
        <h2 className="text-center mb-4" style={{ color: 'var(--c-electric-purple)' }}>Admin Portal</h2>
        
        <nav className="admin-nav" style={{ flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px', borderRadius: '16px',
                  background: isActive ? 'var(--c-electric-purple)' : 'transparent',
                  color: isActive ? 'var(--c-white)' : 'var(--c-dark-gray)',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  justifyContent: 'center'
                }}
              >
                {item.icon}
                <span className="hide-on-mobile">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button onClick={handleLogout} className="btn btn-outline mt-4" style={{ width: '100%' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main animate-slide-up">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
