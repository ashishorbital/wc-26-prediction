import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/db';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required');
    if (!/^\d{10}$/.test(mobile)) return setError('Mobile number must be exactly 10 digits');
    if (!/^\d{4}$/.test(pin)) return setError('PIN must be exactly 4 digits');

    setLoading(true);
    try {
      const user = await registerUser(name.trim(), mobile, pin);
      login(user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="hero-section" style={{ paddingBottom: '120px', borderRadius: '0 0 48px 48px' }}>
        <h1 className="text-center">WC<br/>2026</h1>
      </div>
      
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: '-80px', position: 'relative', zIndex: 10 }}>
        <div className="card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <h3 className="text-center mb-4" style={{ color: 'var(--c-electric-purple)' }}>Join The Game</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input 
                type="tel" 
                className="form-control" 
                value={mobile} 
                onChange={(e) => setMobile(e.target.value)} 
                placeholder="10 digit number"
                maxLength={10}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Create 4-Digit PIN</label>
              <input 
                type="password" 
                className="form-control" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                placeholder="0000"
                maxLength={4}
              />
            </div>

            {error && <p className="error-text mb-3 text-center">{error}</p>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Registering...' : 'Start Playing'}
            </button>
          </form>

          <p className="text-center mt-4" style={{ fontWeight: 700, color: 'var(--c-dark-gray)' }}>
            Already registered? <Link to="/login" style={{ color: 'var(--c-royal-blue)' }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
