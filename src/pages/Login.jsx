import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, HeartPulse } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('staff');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password, accountType);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            <HeartPulse size={48} strokeWidth={1.5} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to your Hospital Management System</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee2e2', 
            color: 'var(--danger-color)', 
            padding: '0.8rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>


          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="email"
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="password"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
