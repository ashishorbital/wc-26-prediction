import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Home, LogOut, X } from 'lucide-react';

const UserLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Show ad only once per session
    const hasSeenAd = sessionStorage.getItem('hasSeenAd');
    if (!hasSeenAd) {
      setShowAd(true);
      sessionStorage.setItem('hasSeenAd', 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={24} /> },
    { path: '/matches', label: 'Matches', icon: <Calendar size={24} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={24} /> },
  ];

  return (
    <div style={{ paddingBottom: '140px', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header - Vibrant Hero style */}
      <header style={{ 
        background: 'var(--bg-hero)',
        padding: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 8px 16px rgba(106, 0, 255, 0.2)',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: 'var(--c-white)' }}>WC 2026</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' }}>
            {user?.name}
          </span>
          <button onClick={handleLogout} className="btn" style={{ 
            padding: '8px 16px', 
            background: 'rgba(255,255,255,0.2)', 
            color: 'white',
            borderRadius: '24px' 
          }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container animate-slide-up">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'space-around', padding: '12px 0 24px',
        background: 'var(--c-white)',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.06)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        zIndex: 100
      }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                color: isActive ? 'var(--c-royal-blue)' : 'var(--c-dark-gray)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                padding: '8px 24px',
                borderRadius: '20px',
                background: isActive ? 'rgba(43, 62, 255, 0.1)' : 'transparent',
                marginBottom: '4px'
              }}>
                {item.icon}
              </div>
              <span style={{ 
                fontSize: '12px', 
                fontFamily: 'var(--font-display)',
                fontWeight: isActive ? '800' : '700',
                textTransform: 'uppercase'
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Advertisement Modal */}
      {showAd && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px'
        }}>
          <div className="animate-slide-up" style={{
            position: 'relative',
            maxWidth: '400px',
            width: '100%',
            background: 'var(--c-white)',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setShowAd(false)}
              style={{
                position: 'absolute',
                top: '12px', right: '12px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                color: 'var(--c-black)'
              }}
            >
              <X size={20} />
            </button>
            <img 
              src="/poster.jpg" 
              alt="Advertisement" 
              style={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/400x600?text=Please+add+poster.jpg+to+public+folder";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
