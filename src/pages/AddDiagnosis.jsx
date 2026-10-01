import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, X, Activity } from 'lucide-react';

const AddDiagnosis = () => {
  const [patients, setPatients] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    product_id: '',
    diagnosis_date: new Date().toISOString().split('T')[0],
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [patientsRes, productsRes] = await Promise.all([
          api.get('/patients?all=true&per_page=1000'),
          api.get('/products/list')
        ]);

        if (patientsRes.data.status) {
          setPatients(patientsRes.data.data.patients || []);
        }
        if (productsRes.data.status) {
          setProducts(productsRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching form options:", err);
        setError("Failed to load options. Please refresh the page.");
      } finally {
        setFetching(false);
      }
    };
    loadDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
      setError("Please select a patient.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/diagnoses', formData);
      if (response.data.status) {
        navigate('/diagnoses');
      } else {
        setError(response.data.message || 'Failed to add diagnosis');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while adding the diagnosis');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading form options...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Add New Diagnosis</h1>
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <Activity size={24} color="var(--primary-color)" />
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Diagnosis Details</h2>
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
              <label className="form-label" htmlFor="patient_id">Select Patient</label>
              <select
                id="patient_id"
                name="patient_id"
                className="form-input"
                value={formData.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.unique_id || `#${p.id}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="product_id">Select Product/Treatment</label>
              <select
                id="product_id"
                name="product_id"
                className="form-input"
                value={formData.product_id}
                onChange={handleChange}
              >
                <option value="">-- Choose Product/Treatment (Optional) --</option>
                {products.map(pr => (
                  <option key={pr.id} value={pr.id}>
                    {pr.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="diagnosis_date">Diagnosis Date</label>
              <input
                id="diagnosis_date"
                name="diagnosis_date"
                type="date"
                className="form-input"
                value={formData.diagnosis_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="comment">Diagnosis / Treatment Notes</label>
              <textarea
                id="comment"
                name="comment"
                className="form-input"
                rows={4}
                value={formData.comment}
                onChange={handleChange}
                placeholder="Enter doctor's comments, diagnosis details, or treatment instructions"
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/diagnoses')}
            >
              <X size={18} /> Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              <Save size={18} /> {loading ? 'Saving...' : 'Save Diagnosis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDiagnosis;
