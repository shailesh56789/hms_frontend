import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Shield, Plus, Trash2, Eye, Edit, Save, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'staff',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (query = '') => {
    try {
      const response = await api.get(`/users?search=${encodeURIComponent(query)}&per_page=100`);
      if (response.data.status) {
        setUsers(response.data.data.users || response.data.data.staff || response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchUsers(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchUsers('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await api.delete(`/users/${id}`);
        if (response.data.status) {
          fetchUsers();
        } else {
          alert(response.data.message || 'Failed to delete user');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleOpenView = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'staff',
      description: user.description || ''
    });
    setError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await api.put(`/users/${selectedUser.id}`, formData);
      if (response.data.status) {
        setShowEditModal(false);
        fetchUsers();
      } else {
        setError(response.data.message || 'Failed to update staff member');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating staff member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Staff</h1>
        {currentUser?.role === 'doctor' && (
          <Link to="/users/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <Plus size={18} /> Add Staff
          </Link>
        )}
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ maxWidth: '320px', margin: 0 }}
          />
          {searchQuery && (
            <button 
              className="btn btn-outline" 
              onClick={handleClear} 
              style={{ padding: '0.6rem 1.2rem', borderColor: '#cbd5e1', color: '#64748b' }}
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff members...</div>
        ) : users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '1rem' }}>Staff ID</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>{user.id}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{user.name}</td>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                      {user.role === 'admin' ? 'Admin (Doctor)' : user.role === 'staff' ? 'Staff (Child)' : user.role === 'doctor' ? 'Doctor' : user.role}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.description}>
                      {user.description || '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem', border: 'none', color: '#0284c7' }}
                          title="View"
                          onClick={() => handleOpenView(user)}
                        >
                          <Eye size={18} />
                        </button>
                        {currentUser?.role === 'doctor' && (
                          <>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.4rem', border: 'none', color: '#d97706' }}
                              title="Edit"
                              onClick={() => handleOpenEdit(user)}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              className="btn btn-outline"
                              style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }}
                              title="Delete"
                              onClick={() => handleDelete(user.id)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Shield size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No staff found.</p>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--primary-color)" /> Staff Details
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>STAFF ID</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedUser.id}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>FULL NAME</strong>
                <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>{selectedUser.name}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>EMAIL ADDRESS</strong>
                <span style={{ fontSize: '1.05rem' }}>{selectedUser.email}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>MOBILE NUMBER</strong>
                <span style={{ fontSize: '1.05rem' }}>{selectedUser.mobile || '-'}</span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>ROLE</strong>
                <span style={{ fontSize: '1.05rem', textTransform: 'capitalize' }}>
                  {selectedUser.role === 'admin' ? 'Admin (Doctor)' : selectedUser.role === 'staff' ? 'Staff (Child)' : selectedUser.role === 'doctor' ? 'Doctor' : selectedUser.role}
                </span>
              </div>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>DESCRIPTION</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {selectedUser.description || 'No description provided.'}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 2rem' }} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Staff Details</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role *</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="staff">Staff (Child)</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter bio or description"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
