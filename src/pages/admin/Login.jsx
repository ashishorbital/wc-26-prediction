import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    try {
      const admin = await loginAdmin(username, password);
      adminLogin(admin);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="hero-section" style={{ paddingBottom: '120px', borderRadius: '0 0 48px 48px', background: 'var(--c-dark-gray)' }}>
        <h1 className="text-center" style={{ color: 'var(--c-electric-purple)' }}>ADMIN<br/>PORTAL</h1>
      </div>
      
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px', borderTop: '8px solid var(--c-electric-purple)' }}>
          <h3 className="text-center mb-4" style={{ color: 'var(--c-black)' }}>Login</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            {error && <p className="error-text mb-3 text-center">{error}</p>}

            <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
