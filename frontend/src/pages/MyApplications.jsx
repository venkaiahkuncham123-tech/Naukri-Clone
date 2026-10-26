import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const load = async () => {
    const r = await api.get('/api/applications');
    setApps(r.data.applications || []);
  };
  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    await api.put(`/api/applications/${id}`, { status: 'withdrawn' });
    load();
  };

  return (
    <div className="container">
      <h2 className="section-title">My applications ({apps.length})</h2>
      <table className="table">
        <thead><tr><th>Job</th><th>Company</th><th>Status</th><th>Applied</th><th></th></tr></thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id}>
              <td><Link to={`/jobs/${a.job_id}`} style={{ fontWeight: 700, color: '#275df1' }}>{a.job_title || `Job #${a.job_id}`}</Link></td>
              <td>{a.job_company}</td>
              <td><span className={`badge ${a.status}`}>{a.status}</span></td>
              <td>{new Date(a.applied_at).toLocaleString()}</td>
              <td>{a.status === 'applied' && <button className="btn" onClick={() => withdraw(a.id)}>Withdraw</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!apps.length && <p style={{ marginTop: 14 }}>No applications yet. <Link to="/" style={{ color: '#275df1', fontWeight: 700 }}>Browse jobs →</Link></p>}
    </div>
  );
}
