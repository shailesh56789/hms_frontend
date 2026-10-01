import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const EditPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    age: '',
    address: '',
    city: '',
    pincode: '',
    symptoms: '',
    relative_id: '',
    diagnosis_id: '',
    product_id: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [relatives, setRelatives] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [products, setProducts] = useState([]);

  const isDoctor = user?.role === 'doctor';

  // Fetch existing patient data and master dropdowns
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientRes = await api.get(`/patients/${id}`);
        if (patientRes.data.status) {
          const p = patientRes.data.data;
          setFormData({
            name: p.name || '',
            email: p.email || '',
            mobile: p.mobile || '',
            age: p.age || '',
            address: p.address || '',
            city: p.city || '',
            pincode: p.pincode || '',
            symptoms: p.symptoms || '',
            relative_id: p.relative_id || '',
            diagnosis_id: p.diagnosis_id || '',
            product_id: p.product_id || ''
          });
        }

        if (isDoctor) {
          const [diagRes, prodRes] = await Promise.all([
            api.get('/diagnoses'),
            api.get('/products/list')
          ]);
          if (diagRes.data.status) {
            setDiagnoses(diagRes.data.data.diagnoses || diagRes.data.data || []);
          }
          if (prodRes.data.status) {
            setProducts(prodRes.data.data || []);
          }
        }
      } catch (err) {
        setError("Failed to load patient details. " + (err.response?.data?.message || ''));
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id, isDoctor]);

  useEffect(() => {
    const checkMobileRelatives = async () => {
      const trimmedMobile = formData.mobile.trim();
      if (trimmedMobile.length >= 5) {
        try {
          const response = await api.get(`/patients/by-mobile?mobile=${encodeURIComponent(trimmedMobile)}`);
          if (response.data.status) {
            setRelatives(response.data.data || []);
          }
        } catch (err) {
          console.error("Error checking relatives by mobile", err);
        }
      } else {
        setRelatives([]);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      checkMobileRelatives();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.mobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        age: formData.age,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        symptoms: formData.symptoms,
        relative_id: formData.relative_id || null
      };

      if (isDoctor) {
        payload.diagnosis_id = formData.diagnosis_id || null;
        payload.product_id = formData.product_id || null;
      }

      const response = await api.put(`/patients/${id}`, payload);
      
      if (response.data.status) {
        setSuccess('Patient successfully updated!');
        setTimeout(() => {
          navigate('/patients');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading patient details...</div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/patients" className="btn btn-outline" style={{ padding: '0.4rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Edit Patient</h1>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: 'var(--danger-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mobile Number *</label>
              <input type="text" className="form-input" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age *</label>
              <input type="number" className="form-input" name="age" value={formData.age} onChange={handleChange} required min="0" max="120" />
            </div>

            {isDoctor && (
              <>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Diagnosis</label>
                  <select className="form-input" name="diagnosis_id" value={formData.diagnosis_id} onChange={handleChange}>
                    <option value="">-- Choose Diagnosis --</option>
                    {diagnoses.map(diag => (
                      <option key={diag.diagnosis_id} value={diag.diagnosis_id}>{diag.diagnosis_name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Prescribed Medicine/Product</label>
                  <select className="form-input" name="product_id" value={formData.product_id} onChange={handleChange}>
                    <option value="">-- Choose Medicine/Product --</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>{prod.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {relatives.length > 0 && (
              <div className="form-group" style={{ gridColumn: 'span 2', animation: 'modalSlideUp 0.2s ease-out' }}>
                <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  Relative Patient Found (Linked by Mobile)
                </label>
                <select
                  className="form-input"
                  name="relative_id"
                  value={formData.relative_id || ''}
                  onChange={handleChange}
                  style={{ borderColor: 'var(--primary-color)' }}
                >
                  <option value="">-- No link (Not a relative) --</option>
                  {relatives.map(rel => (
                    <option key={rel.id} value={rel.id}>
                      {rel.name} (Patient ID: {rel.unique_id || `#${rel.id}`})
                    </option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Select a family member/relative if this patient is related to them.
                </small>
              </div>
            )}
          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Address Details</h3>
          
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input type="text" className="form-input" name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pincode</label>
              <input type="text" className="form-input" name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Symptoms & Complaints</h3>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Symptoms / Reason for Visit</label>
            <textarea 
              className="form-input" 
              name="symptoms" 
              value={formData.symptoms} 
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Patient reports persistent headache, mild fever, and nausea since yesterday."
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            <small style={{ color: 'var(--text-muted)' }}>Describe what symptoms the patient is experiencing as reported by them.</small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link to="/patients" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Update Patient'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditPatient;
