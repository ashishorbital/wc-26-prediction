import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAd, setShowAd] = useState(true); // Always show on mount
  const [audioPlayed, setAudioPlayed] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (showAd && !audioPlayed) {
      const playAudio = () => {
        const audio = document.getElementById('ad-audio');
        if (audio) {
          audio.play()
            .then(() => setAudioPlayed(true))
            .catch(e => {
              // Autoplay was blocked, will try again on next click
              console.log('Autoplay blocked, waiting for user interaction');
            });
        }
      };
      
      // Try to play immediately (works if user navigated here, e.g. from logout)
      playAudio();
      
      // Add a listener to play on the first click (works if they refreshed the page)
      document.addEventListener('click', playAudio);
      return () => document.removeEventListener('click', playAudio);
    }
  }, [showAd, audioPlayed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(mobile)) {
      return setError('Mobile number must be exactly 10 digits');
    }
    if (!/^\d{4}$/.test(pin)) {
      return setError('PIN must be exactly 4 digits');
    }

    setLoading(true);
    try {
      const user = await loginUser(mobile, pin);
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
          <h3 className="text-center mb-4" style={{ color: 'var(--c-royal-blue)' }}>Welcome Back</h3>
          
          <form onSubmit={handleSubmit}>
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
              <label className="form-label">4-Digit PIN</label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'var(--c-royal-blue)' }} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center mt-4" style={{ fontWeight: 700, color: 'var(--c-dark-gray)' }}>
            New user? <Link to="/register" style={{ color: 'var(--c-electric-purple)' }}>Register</Link>
          </p>
        </div>
      </div>

      {/* Advertisement Modal */}
      {showAd && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div className="animate-slide-up" style={{
            position: 'relative',
            maxWidth: '500px',
            width: '100%',
            background: 'var(--c-white)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
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
              src="/poster.jpeg" 
              alt="Advertisement" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '80vh', 
                objectFit: 'contain', 
                display: 'block',
                margin: '0 auto'
              }}
            />
            {/* Play audio automatically when the ad is shown */}
            <audio id="ad-audio" src="/audio.mpeg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
