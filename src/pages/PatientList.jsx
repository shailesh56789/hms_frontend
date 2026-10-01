import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { UserPlus, Eye, Edit, Trash2, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { printPatientReport } from '../utils/printHelper';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingId, setPrintingId] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async (query = '') => {
    try {
      const response = await api.get(`/patients?search=${encodeURIComponent(query)}&per_page=100`);
      if (response.data.status) {
        setPatients(response.data.data.patients || []);
      }
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchPatients(val);
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchPatients('');
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete patient ${name}?`)) {
      try {
        const response = await api.delete(`/patients/${id}`);
        if (response.data.status) {
          setPatients(patients.filter(p => p.id !== id));
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete patient');
      }
    }
  };

  const handlePrintReport = async (id) => {
    setPrintingId(id);
    try {
      const response = await api.get(`/patients/${id}`);
      if (response.data.status) {
        printPatientReport(response.data.data);
      } else {
        alert("Failed to fetch complete patient record for report generation.");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      alert("An error occurred while generating the report.");
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patient Management</h1>
        <Link to="/patients/new" className="btn btn-primary">
          <UserPlus size={18} /> Add Patient
        </Link>
      </div>

      <div className="card">
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or mobile..."
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
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading patients...</div>
        ) : patients.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '1rem' }}>Patient ID</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email & Mobile</th>
                  <th style={{ padding: '1rem' }}>Address</th>
                  <th style={{ padding: '1rem' }}>Symptoms</th>
                  <th style={{ padding: '1rem' }}>Diagnosis</th>
                  <th style={{ padding: '1rem' }}>Relatives</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Report</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(patient => (
                  <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                      {patient.unique_id || `#${patient.id}`}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      {patient.name}
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'normal' }}>Age: {patient.age || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{patient.email}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{patient.mobile}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      <div>{patient.address || '-'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {patient.city ? `${patient.city}, ` : ''}{patient.state ? `${patient.state} ` : ''}{patient.pincode || ''}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dark)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={patient.symptoms || ''}>
                      {patient.symptoms || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                      {patient.diagnosis_name || '-'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                      {patient.relatives && patient.relatives.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {patient.relatives.map((rel, idx) => (
                            <span key={idx} style={{ background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', width: 'max-content' }}>
                              {rel}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <Link to={`/patients/${patient.id}`} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#0284c7' }} title="View">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/patients/${patient.id}/edit`} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: '#d97706' }} title="Edit">
                          <Edit size={18} />
                        </Link>
                        {(currentUser?.role === 'doctor' || currentUser?.role === 'staff') && (
                          <button onClick={() => handleDelete(patient.id, patient.name)} className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }} title="Delete">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handlePrintReport(patient.id)} 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem', border: 'none', color: '#0f766e', cursor: 'pointer' }} 
                        title="Print Report"
                        disabled={printingId === patient.id}
                      >
                        <Printer size={18} style={{ opacity: printingId === patient.id ? 0.5 : 1 }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <UserPlus size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No patients found in the system.</p>
            <Link to="/patients/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add First Patient</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
