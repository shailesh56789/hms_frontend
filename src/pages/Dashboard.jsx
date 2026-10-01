import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Activity, UserPlus, Shield, Calendar, Filter, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell,
  PieChart, Pie
} from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2023'); // Default selected year
  
  // New Dropdown Filter State
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('All Diagnoses');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const roleEndpoint = (user?.role === 'doctor' || user?.role === 'staff') ? '/dashboard/admin' : '/dashboard/patient';
        
        const response = await api.get(roleEndpoint);
        if (response.data.status) {
          setData(response.data.data);
          
          // Set initial selected year
          const visits = response.data.data.yearly_visits || [];
          if (visits.length > 0) {
            setSelectedYear(String(visits[visits.length - 1].year));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard data...</div>;

  // Monthly Diagnosis Trends Chart setup
  const MONTHS_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Raw data from DB
  const dbTrends = data?.monthly_diagnosis_trends || [];

  // Mock data for current year diagnosis trends if DB is empty
  const mockTrends = [
    { month: 1, diagnosis_name: 'Viral Fever', total: 12 },
    { month: 1, diagnosis_name: 'COVID-19', total: 8 },
    { month: 2, diagnosis_name: 'Viral Fever', total: 15 },
    { month: 2, diagnosis_name: 'Malaria', total: 5 }, // maps to Others
    { month: 3, diagnosis_name: 'Typhoid', total: 10 },
    { month: 3, diagnosis_name: 'Hypertension', total: 8 },
    { month: 4, diagnosis_name: 'Dengue', total: 14 },
    { month: 4, diagnosis_name: 'COVID-19', total: 9 },
    { month: 5, diagnosis_name: 'Malaria', total: 20 }, // maps to Others
    { month: 5, diagnosis_name: 'Typhoid', total: 7 },
    { month: 6, diagnosis_name: 'Viral Fever', total: 18 },
    { month: 6, diagnosis_name: 'Dengue', total: 10 },
    { month: 7, diagnosis_name: 'COVID-19', total: 22 },
    { month: 7, diagnosis_name: 'Diabetes', total: 5 },
    { month: 8, diagnosis_name: 'Malaria', total: 15 }, // maps to Others
    { month: 8, diagnosis_name: 'Dengue', total: 12 },
    { month: 9, diagnosis_name: 'Typhoid', total: 18 },
    { month: 9, diagnosis_name: 'COVID-19', total: 11 },
    { month: 10, diagnosis_name: 'Viral Fever', total: 25 },
    { month: 10, diagnosis_name: 'Diabetes', total: 9 },
    { month: 11, diagnosis_name: 'Dengue', total: 20 },
    { month: 11, diagnosis_name: 'Viral Fever', total: 14 },
    { month: 12, diagnosis_name: 'COVID-19', total: 30 },
    { month: 12, diagnosis_name: 'Typhoid', total: 15 }
  ];

  const activeTrends = dbTrends;

  // Normalize diagnosis names into required categories
  const normalizeDiagnosisName = (name) => {
    if (!name) return 'Others';
    const lower = name.toLowerCase().trim();
    if (lower.includes('viral') || lower.includes('fever')) return 'Viral Fever';
    if (lower.includes('diabetes') || lower.includes('sugar')) return 'Diabetes';
    if (lower.includes('hypertension') || lower.includes('pressure') || lower.includes('bp')) return 'Hypertension';
    if (lower.includes('covid') || lower.includes('corona')) return 'COVID-19';
    if (lower.includes('dengue')) return 'Dengue';
    if (lower.includes('typhoid')) return 'Typhoid';
    return 'Others';
  };

  const DIAGNOSIS_CATEGORIES = [
    'Viral Fever',
    'Diabetes',
    'Hypertension',
    'COVID-19',
    'Dengue',
    'Typhoid',
    'Others'
  ];

  // Process data for Recharts
  const formattedDiagnosisChartData = MONTHS_NAMES.map((monthName, index) => {
    const monthNum = index + 1;
    const monthEntries = activeTrends.filter(item => parseInt(item.month) === monthNum);

    const row = { name: monthName };
    
    // Initialize all categories with 0 for this month
    DIAGNOSIS_CATEGORIES.forEach(cat => {
      row[cat] = 0;
    });

    let monthlyTotalVisits = 0;
    let highestVal = -1;
    let highestCat = 'Others';

    monthEntries.forEach(entry => {
      const cat = normalizeDiagnosisName(entry.diagnosis_name || entry.comment);
      const count = parseInt(entry.total) || 0;
      row[cat] += count;
      monthlyTotalVisits += count;
    });

    DIAGNOSIS_CATEGORIES.forEach(cat => {
      if (row[cat] > highestVal && row[cat] > 0) {
        highestVal = row[cat];
        highestCat = cat;
      }
    });

    row.highestDiag = highestCat;
    row.highestVal = highestVal;
    row.monthlyTotal = monthlyTotalVisits;

    return row;
  });

  // Category colors mapping (curated modern palette)
  const DIAGNOSIS_COLORS = {
    'Viral Fever': '#3b82f6',   // Blue
    'Diabetes': '#ec4899',      // Pink
    'Hypertension': '#10b981',  // Green
    'COVID-19': '#ef4444',      // Red
    'Dengue': '#8b5cf6',        // Purple
    'Typhoid': '#f59e0b',       // Amber
    'Others': '#6b7280'         // Gray
  };

  // Determine active categories to display on the chart
  const visibleCategories = selectedDiagnosis === 'All Diagnoses' 
    ? DIAGNOSIS_CATEGORIES 
    : [selectedDiagnosis];

  // Performance KPI Circles (dynamically updates based on selectedYear)
  const dbDiagnosisBreakdown = data?.diagnosis_breakdown || [];
  const filteredDiagnosis = dbDiagnosisBreakdown.filter(item => String(item.year) === selectedYear);
  const totalFilteredCount = filteredDiagnosis.reduce((acc, curr) => acc + parseInt(curr.total), 0) || 1;

  const dbKPIs = filteredDiagnosis.map(item => {
    const percentage = Math.round((parseInt(item.total) / totalFilteredCount) * 100);
    return {
      status: item.status,
      percentage: percentage,
      total: item.total,
      pieData: [
        { name: 'completed', value: percentage },
        { name: 'remaining', value: 100 - percentage }
      ]
    };
  });

  const mockYearlyKPIs = {
    '2020': [
      { status: 'Active', percentage: 70, total: 10, pieData: [{ value: 70 }, { value: 30 }] },
      { status: 'Resolved', percentage: 80, total: 12, pieData: [{ value: 80 }, { value: 20 }] },
      { status: 'Pending', percentage: 50, total: 5, pieData: [{ value: 50 }, { value: 50 }] }
    ],
    '2021': [
      { status: 'Active', percentage: 85, total: 14, pieData: [{ value: 85 }, { value: 15 }] },
      { status: 'Resolved', percentage: 75, total: 16, pieData: [{ value: 75 }, { value: 25 }] },
      { status: 'Pending', percentage: 40, total: 8, pieData: [{ value: 40 }, { value: 60 }] }
    ],
    '2022': [
      { status: 'Active', percentage: 80, total: 20, pieData: [{ value: 80 }, { value: 20 }] },
      { status: 'Resolved', percentage: 88, total: 22, pieData: [{ value: 88 }, { value: 12 }] },
      { status: 'Pending', percentage: 65, total: 12, pieData: [{ value: 65 }, { value: 35 }] }
    ],
    '2023': [
      { status: 'Active', percentage: 92, total: 25, pieData: [{ value: 92 }, { value: 8 }] },
      { status: 'Resolved', percentage: 78, total: 30, pieData: [{ value: 78 }, { value: 22 }] },
      { status: 'Pending', percentage: 88, total: 15, pieData: [{ value: 88 }, { value: 12 }] }
    ],
    '2024': [
      { status: 'Active', percentage: 95, total: 35, pieData: [{ value: 95 }, { value: 5 }] },
      { status: 'Resolved', percentage: 85, total: 40, pieData: [{ value: 85 }, { value: 15 }] },
      { status: 'Pending', percentage: 90, total: 20, pieData: [{ value: 90 }, { value: 10 }] }
    ]
  };

  const displayKPIs = dbKPIs;

  const visiblePatients = showAllPatients 
    ? (data?.latest_patients || []) 
    : (data?.latest_patients || []).slice(0, 3);

  const KPI_COLORS = ['#2563eb', '#f97316', '#22c55e', '#ef4444', '#a855f7', '#78350f'];

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthData = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '1rem', border: '1px solid #cbd5e1', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem' }}>{label} ({new Date().getFullYear()})</p>
          {payload.map((pld) => {
            const count = pld.value || 0;
            // Calculate percentage based on all visible parameters
            const percentage = monthData.monthlyTotal > 0 ? Math.round((count / monthData.monthlyTotal) * 100) : 0;
            return (
              <p key={pld.name} style={{ margin: '0.2rem 0', color: pld.color, display: 'flex', justifyContent: 'space-between', gap: '1.5rem', fontSize: '0.9rem' }}>
                <span>{pld.name}: <strong>{count}</strong></span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({percentage}%)</span>
              </p>
            );
          })}
          {selectedDiagnosis === 'All Diagnoses' && monthData.monthlyTotal > 0 && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#1e293b' }}>
              <span>Peak: <strong>{monthData.highestDiag}</strong> ({monthData.highestVal} patients)</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name}</h1>
      </div>

      {/* Quick Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0284c7' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total Patients</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.total_patients ?? 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '12px', color: '#059669' }}>
            <Shield size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total Doctors</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.total_doctors ?? 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#f3e8ff', borderRadius: '12px', color: '#7c3aed' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total Staff</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.total_staff ?? 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '12px', color: '#dc2626' }}>
            <Activity size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Total Diagnoses</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.total_diagnoses ?? 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#ffedd5', borderRadius: '12px', color: '#ea580c' }}>
            <Calendar size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Today's Visits</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.today_visits ?? 0}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
            <Package size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Products</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{data?.counts?.total_products ?? 0}</h3>
          </div>
        </div>
      </div>

      {/* Dashboard Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', width: '100%' }}>
        
        {/* Monthly Diagnosis-wise Patient Visit Analysis (Current Year) */}
        <div className="card" style={{ minHeight: '440px', display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0, fontWeight: '700', color: '#1e293b' }}>
                Monthly Diagnosis-wise Patient Visit Analysis
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0', lineHeight: '1.4' }}>
                Analyze diagnosis trends to identify the most common diseases and support hospital planning.
              </p>
            </div>
            
            {/* Diagnosis Dropdown Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <Filter size={18} style={{ color: '#64748b' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Diagnosis:</span>
              <select
                value={selectedDiagnosis}
                onChange={(e) => setSelectedDiagnosis(e.target.value)}
                style={{
                  padding: '0.4rem 1.5rem 0.4rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  color: '#1e293b',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <option value="All Diagnoses">All Diagnoses</option>
                {DIAGNOSIS_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <div style={{ minWidth: '600px', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedDiagnosisChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} label={{ value: 'Number of Patients', angle: -90, position: 'insideLeft', offset: 0, style: { textAnchor: 'middle', fill: '#475569', fontSize: 12, fontWeight: '500' } }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ fontWeight: '500', color: '#475569', fontSize: '0.85rem' }}>{value}</span>} />
                  {visibleCategories.map((cat, index) => (
                    <Bar 
                      key={cat} 
                      dataKey={cat} 
                      stackId="a" 
                      fill={DIAGNOSIS_COLORS[cat]} 
                      radius={selectedDiagnosis !== 'All Diagnoses' ? [4, 4, 0, 0] : (index === visibleCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0])}
                      maxBarSize={50}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Dynamic side panels grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', width: '100%' }}>
          


          {/* Latest Patients List */}
          <div className="card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 'bold', color: '#1e293b' }}>Latest Patients</h3>
              <Link to="/patients/new" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                <UserPlus size={16} /> Add Patient
              </Link>
            </div>
            
            {visiblePatients.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem' }}>Patient ID</th>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email & Mobile</th>
                        <th style={{ padding: '0.75rem' }}>Address</th>
                        <th style={{ padding: '0.75rem' }}>Symptoms</th>
                        <th style={{ padding: '0.75rem' }}>Diagnosis</th>
                        <th style={{ padding: '0.75rem' }}>Relatives</th>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePatients.map(patient => (
                        <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem 0.75rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                            {patient.unique_id || `#${patient.id}`}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontWeight: '500' }}>
                            {patient.name}
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'normal' }}>Age: {patient.age || 'N/A'}</div>
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <div>{patient.email}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{patient.mobile}</div>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem' }}>
                            <div>{patient.address || '-'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              {patient.city ? `${patient.city}, ` : ''}{patient.state ? `${patient.state} ` : ''}{patient.pincode || ''}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', color: 'var(--text-dark)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={patient.symptoms || ''}>
                            {patient.symptoms || '-'}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                            {patient.diagnosis_name || '-'}
                          </td>
                          <td style={{ padding: '1rem 0.75rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
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
                          <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(patient.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Show More Dropdown/Toggle */}
                {(data?.latest_patients?.length > 3) && (
                  <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button 
                      onClick={() => setShowAllPatients(!showAllPatients)}
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}
                    >
                      {showAllPatients ? 'Show Less' : `Show More (${data.latest_patients.length - 3} remaining)`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No patients recently added.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
