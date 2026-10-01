export const printPatientReport = (patient) => {
  const printWindow = window.open('', '_blank');
  
  const relativesHtml = patient.relatives && patient.relatives.length > 0
    ? patient.relatives.map(r => `
        <tr>
          <td>${r.name}</td>
          <td>${r.unique_id || '-'}</td>
          <td>${r.mobile || '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align: center; color: #64748b;">No registered relatives found sharing this phone number.</td></tr>';

  const visitsHtml = patient.visits && patient.visits.length > 0
    ? patient.visits.map(v => `
        <tr>
          <td>${new Date(v.visit_date).toLocaleDateString()}</td>
          <td>${v.doctor_name || '-'}</td>
          <td>${v.diagnosis_name || 'General Checkup'}</td>
          <td>${v.product_name || '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="text-align: center; color: #64748b;">No visits logged.</td></tr>';

  const diagnosesHtml = patient.diagnoses_history && patient.diagnoses_history.length > 0
    ? patient.diagnoses_history.map(d => `
        <tr>
          <td>${new Date(d.diagnosis_date).toLocaleDateString()}</td>
          <td>${d.diagnosis_name}</td>
          <td>${d.doctor_name || '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align: center; color: #64748b;">No diagnoses recorded.</td></tr>';

  const prescriptionsHtml = patient.prescriptions_history && patient.prescriptions_history.length > 0
    ? patient.prescriptions_history.map(p => `
        <tr>
          <td>${new Date(p.prescribed_date).toLocaleDateString()}</td>
          <td>${p.medicine_name}</td>
          <td>${p.doctor_name || '-'}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align: center; color: #64748b;">No medicines prescribed.</td></tr>';

  printWindow.document.write(`
    <html>
      <head>
        <title>Medical Report - ${patient.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            padding: 2rem;
            margin: 0;
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 1rem;
            margin-bottom: 2rem;
          }
          .hospital-name {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0f766e;
            margin: 0;
          }
          .report-title {
            font-size: 1.2rem;
            color: #475569;
            font-weight: 600;
            margin: 0.25rem 0 0;
          }
          .meta-info {
            text-align: right;
            font-size: 0.875rem;
            color: #64748b;
          }
          .section-title {
            font-size: 1.1rem;
            color: #0f766e;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.25rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 600;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .grid-item {
            font-size: 0.9rem;
          }
          .grid-item strong {
            color: #475569;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }
          .stat-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.75rem;
            background-color: #f8fafc;
          }
          .stat-val {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f766e;
          }
          .stat-lbl {
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.5rem;
            font-size: 0.85rem;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .footer {
            margin-top: 3rem;
            border-top: 1px solid #cbd5e1;
            padding-top: 1rem;
            font-size: 0.75rem;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="hospital-name">HospitalPro HMS</h1>
            <p class="report-title">Official Patient Health Record</p>
          </div>
          <div class="meta-info">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
            <div><strong>Patient ID:</strong> ${patient.unique_id || `#${patient.id}`}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-val">${patient.total_visits || 0}</div>
            <div class="stat-lbl">Total Visits</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${patient.total_prescriptions || 0}</div>
            <div class="stat-lbl">Medicines Prescribed</div>
          </div>
          <div class="stat-card">
            <div class="stat-val">${patient.total_relatives || 0}</div>
            <div class="stat-lbl">Linked Relatives</div>
          </div>
        </div>

        <div class="section-title">Patient Bio-Data</div>
        <div class="grid-container">
          <div class="grid-item"><strong>Full Name:</strong> ${patient.name}</div>
          <div class="grid-item"><strong>Age:</strong> ${patient.age || 'N/A'}</div>
          <div class="grid-item"><strong>Email:</strong> ${patient.email}</div>
          <div class="grid-item"><strong>Mobile:</strong> ${patient.mobile || 'N/A'}</div>
          <div class="grid-item"><strong>Address:</strong> ${patient.address || '-'}</div>
          <div class="grid-item"><strong>City:</strong> ${patient.city || '-'}</div>
          <div class="grid-item"><strong>Pincode:</strong> ${patient.pincode || '-'}</div>
          <div class="grid-item"><strong>Status:</strong> ${patient.status || 'Active'}</div>
        </div>

        ${patient.symptoms ? `
          <div class="section-title">Chief Symptoms / Complaint</div>
          <div style="font-size: 0.9rem; font-style: italic; color: #334155; margin-bottom: 1.5rem; background-color: #f8fafc; padding: 0.75rem; border-left: 3px solid #0f766e; border-radius: 4px;">
            "${patient.symptoms}"
          </div>
        ` : ''}

        <div class="section-title">Linked Relatives</div>
        <table>
          <thead>
            <tr>
              <th>Relative Name</th>
              <th>Patient ID</th>
              <th>Mobile</th>
            </tr>
          </thead>
          <tbody>
            ${relativesHtml}
          </tbody>
        </table>

        <div class="section-title">Complete Visit History</div>
        <table>
          <thead>
            <tr>
              <th>Visit Date</th>
              <th>Doctor</th>
              <th>Diagnosis</th>
              <th>Prescribed Medicine</th>
            </tr>
          </thead>
          <tbody>
            ${visitsHtml}
          </tbody>
        </table>

        <div class="section-title">Diagnosis History</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Diagnosis Name</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            ${diagnosesHtml}
          </tbody>
        </table>

        <div class="section-title">Prescription / Medicine History</div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Medicine Name</th>
              <th>Doctor</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>Report generated automatically by HospitalPro HMS.</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
