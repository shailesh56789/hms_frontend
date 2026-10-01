import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, User, Phone, MapPin, Activity, Calendar, Award, Users, Printer } from 'lucide-react';
import { printPatientReport } from '../utils/printHelper';

const ViewPatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await api.get(`/patients/${id}`);
        if (response.data.status) {
          setPatient(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load patient data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading patient details...</div>;
  if (!patient) return <div style={{ padding: '2rem' }}>Patient not found.</div>;

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header with Print Action */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/patients" className="btn btn-outline" style={{ padding: '0.4rem' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 className="page-title" style={{ margin: 0 }}>Patient Profile</h1>
        </div>
        <button 
          onClick={() => printPatientReport(patient)} 
          className="btn btn-primary" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Printer size={18} /> Print Record / PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{patient.total_visits || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Visits</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#e2fbf0', color: '#0d9488', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{patient.total_prescriptions || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medicines Prescribed</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#faf5ff', color: '#7e22ce', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-dark)' }}>{patient.total_relatives || 0}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Linked Relatives</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Bio & Relatives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Bio Data Card */}
          <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                {patient.name.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-dark)' }}>{patient.name}</h2>
              <div style={{ color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: '600', marginTop: '0.25rem' }}>
                ID: {patient.unique_id || `#${patient.id}`}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dark)' }}>
                <User size={18} style={{ color: 'var(--primary-color)' }} />
                <span>Age: {patient.age || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dark)' }}>
                <Phone size={18} style={{ color: 'var(--primary-color)' }} />
                <span>{patient.mobile || 'No mobile provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-dark)' }}>
                <MapPin size={18} style={{ color: 'var(--primary-color)' }} />
                <span>
                  {patient.address ? `${patient.address}, ` : ''}
                  {patient.city ? `${patient.city}, ` : ''}
                  {patient.state ? `${patient.state}, ` : ''}
                  {patient.pincode || ''}
                  {(!patient.address && !patient.city) && 'No address details'}
                </span>
              </div>
            </div>

            {patient.symptoms && (
              <>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--primary-color)', marginBottom: '0.25rem' }}>Chief Complaint:</strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>"{patient.symptoms}"</p>
                </div>
              </>
            )}
          </div>

          {/* Relatives Card */}
          <div className="card">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
              <Users size={18} color="var(--primary-color)" />
              Relatives ({patient.total_relatives || 0})
            </h3>
            {patient.relatives && patient.relatives.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {patient.relatives.map((rel) => (
                  <div key={rel.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{rel.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {rel.unique_id || '#'+rel.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone: {rel.mobile}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                No relatives registered with this phone number.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Lifetime History Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Treatment / Visit History */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
              <Calendar size={20} color="var(--primary-color)" />
              Complete Treatment & Visit History
            </h3>
            
            {patient.visits && patient.visits.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Visit Date</th>
                      <th style={{ padding: '0.75rem' }}>Doctor</th>
                      <th style={{ padding: '0.75rem' }}>Diagnosis</th>
                      <th style={{ padding: '0.75rem' }}>Prescribed Medicine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.visits.map((v) => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(v.visit_date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '500' }}>{v.doctor_name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                            {v.diagnosis_name || 'General Checkup'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: 'var(--primary-color)', fontWeight: '500' }}>{v.product_name || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No visits logged for this patient yet.
              </div>
            )}
          </div>

          {/* Diagnoses History */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
              <Activity size={20} color="var(--primary-color)" />
              Diagnosis History
            </h3>
            {patient.diagnoses_history && patient.diagnoses_history.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Diagnosis Name</th>
                      <th style={{ padding: '0.75rem' }}>Assigned By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.diagnoses_history.map((d, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(d.diagnosis_date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '600' }}>{d.diagnosis_name}</td>
                        <td style={{ padding: '0.75rem' }}>{d.doctor_name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No diagnosis history.
              </div>
            )}
          </div>

          {/* Prescriptions History */}
          <div className="card">
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)' }}>
              <Award size={20} color="var(--primary-color)" />
              Prescription & Medicine History
            </h3>
            {patient.prescriptions_history && patient.prescriptions_history.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-dark)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Prescribed Date</th>
                      <th style={{ padding: '0.75rem' }}>Medicine Name</th>
                      <th style={{ padding: '0.75rem' }}>Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.prescriptions_history.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(p.prescribed_date).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', fontWeight: '600', color: 'var(--primary-color)' }}>{p.medicine_name}</td>
                        <td style={{ padding: '0.75rem' }}>{p.doctor_name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                No prescription history.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewPatient;
