import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, X, User } from 'lucide-react';

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'staff', // Default role
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/users', formData);
      if (response.data.status) {
        navigate('/users');
      } else {
        setError(response.data.message || 'Failed to add user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Staff</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <User size={24} color="var(--primary-color)" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Staff Details</h2>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: 'var(--danger-color)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="mobile">Mobile Number</label>
              <input
                id="mobile"
                name="mobile"
                type="text"
                className="form-input"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (Optional)</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank for default password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-input"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter bio or description about staff"
              />
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
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                Admin users have full access. Staff  have access but cannot delete data.
              </small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/users')}
            >
              <X size={18} /> Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
