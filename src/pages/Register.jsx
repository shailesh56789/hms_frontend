import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Lock, HeartPulse } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' // Default
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.data.status) {
        setMessage('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register for your Hospital Management System</p>
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
            backgroundColor: '#dcfce7', 
            color: '#166534', 
            padding: '0.8rem', 
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            border: '1px solid #bbf7d0'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="name"
                name="name"
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                id="email"
                name="email"
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Choose a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select 
              id="role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Sign in</Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
