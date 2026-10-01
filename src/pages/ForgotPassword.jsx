import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Mail } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data && response.data.status) {
        setMessage(response.data.message || 'Reset link sent successfully!');
      } else {
        setError(response.data.message || 'Failed to send reset link');
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
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset link</p>
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
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginBottom: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
