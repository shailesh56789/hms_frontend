import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Activity, Eye, Edit, Trash2, Plus, X, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const DiagnosesList = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    diagnosis_name: '',
    description: '',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const fetchDiagnoses = async (query = '') => {
    try {
      const response = await api.get(`/diagnoses?search=${encodeURIComponent(query)}&per_page=100`);
      if (response.data.status) {
        setDiagnoses(response.data.data.diagnoses || response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load diagnoses", err);
      setError("Failed to load diagnoses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchDiagnoses(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchDiagnoses('');
  };

  const handleOpenAdd = () => {
    setFormData({ diagnosis_name: '', description: '', status: 'active' });
    setError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (diag) => {
    setCurrentDiagnosis(diag);
    setFormData({
      diagnosis_name: diag.diagnosis_name,
      description: diag.description || '',
      status: diag.status || 'active'
    });
    setError('');
    setShowEditModal(true);
  };

  const handleOpenView = (diag) => {
    setCurrentDiagnosis(diag);
    setShowViewModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis_name.trim()) {
      setError("Diagnosis Name is required.");
      return;
    }
    setSaving(true);
    try {
      const response = await api.post('/diagnoses', formData);
      if (response.data.status) {
        setShowAddModal(false);
        fetchDiagnoses();
      } else {
        setError(response.data.message || 'Failed to add diagnosis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving diagnosis');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis_name.trim()) {
      setError("Diagnosis Name is required.");
      return;
    }
    setSaving(true);
    try {
      const response = await api.put(`/diagnoses/${currentDiagnosis.diagnosis_id}`, formData);
      if (response.data.status) {
        setShowEditModal(false);
        fetchDiagnoses();
      } else {
        setError(response.data.message || 'Failed to update diagnosis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating diagnosis');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this diagnosis?")) {
      try {
        const response = await api.delete(`/diagnoses/${id}`);
        if (response.data.status) {
          fetchDiagnoses();
        } else {
          alert(response.data.message || 'Failed to delete diagnosis');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting diagnosis');
      }
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Diagnoses Management</h1>
        {currentUser?.role === 'doctor' && (
          <button className="btn btn-primary" onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Diagnosis
          </button>
        )}
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or description..."
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
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading diagnoses...</div>
        ) : diagnoses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '1rem' }}>Diagnosis ID</th>
                  <th style={{ padding: '1rem' }}>Diagnosis Name</th>
                  <th style={{ padding: '1rem' }}>Description</th>
                  <th style={{ padding: '1rem' }}>Created Date</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.map(diag => (
                  <tr key={diag.diagnosis_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                      {diag.diagnosis_id}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{diag.diagnosis_name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {diag.description || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(diag.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#0284c7' }} title="View" onClick={() => handleOpenView(diag)}>
                        <Eye size={18} />
                      </button>
                      {currentUser?.role === 'doctor' && (
                        <>
                          <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#d97706' }} title="Edit" onClick={() => handleOpenEdit(diag)}>
                            <Edit size={18} />
                          </button>
                          <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }} title="Delete" onClick={() => handleDelete(diag.diagnosis_id)}>
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Activity size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No diagnoses found.</p>
          </div>
        )}
      </div>

      {/* ADD DIAGNOSIS MODAL */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Add Diagnosis</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleAddSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Diagnosis Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.diagnosis_name}
                    onChange={(e) => setFormData({ ...formData, diagnosis_name: e.target.value })}
                    required
                    placeholder="e.g. Viral Fever"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter details or comments about this diagnosis"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DIAGNOSIS MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Edit Diagnosis</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            {error && <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>{error}</div>}

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Diagnosis Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.diagnosis_name}
                    onChange={(e) => setFormData({ ...formData, diagnosis_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {/* VIEW DIAGNOSIS DETAIL MODAL */}
      {showViewModal && currentDiagnosis && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'modalSlideUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary-color)" /> Diagnosis Details
              </h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowViewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>DIAGNOSIS ID</strong>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{currentDiagnosis.diagnosis_id}</span>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>DIAGNOSIS NAME</strong>
                <span style={{ fontSize: '1.05rem', fontWeight: '500' }}>{currentDiagnosis.diagnosis_name}</span>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>DESCRIPTION</strong>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-dark)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {currentDiagnosis.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>CREATED DATE</strong>
                <span style={{ fontSize: '0.95rem' }}>{new Date(currentDiagnosis.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 2rem' }} onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosesList;
