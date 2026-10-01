import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { HeartPulse, Lock } from 'lucide-react';
import api from '../services/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', { reset_token: token, new_password: password });
      if (response.data && response.data.status) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your new password below</p>
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

        {message && (
          <div style={{ 
            backgroundColor: '#d1fae5', 
            color: '#047857', 
            padding: '0.8rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            border: '1px solid #a7f3d0'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="password"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="confirmPassword"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}
            disabled={isLoading || !token}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
