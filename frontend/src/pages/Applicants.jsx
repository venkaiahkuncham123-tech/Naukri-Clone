import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

export default function Applicants() {
  const { id } = useParams();
  const [apps, setApps] = useState([]);
  const [job, setJob] = useState(null);

  const load = async () => {
    const [a, j] = await Promise.all([
      api.get('/api/applications', { params: { job_id: id } }),
      api.get(`/api/jobs/${id}`),
    ]);
    setApps(a.data.applications || []);
    setJob(j.data.job);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const setStatus = async (appId, status) => {
    await api.put(`/api/applications/${appId}`, { status });
    load();
  };

  return (
    <div className="container">
      <h2 className="section-title">Applicants for: {job?.title} ({apps.length})</h2>
      <table className="table">
        <thead><tr><th>Candidate</th><th>Email</th><th>Cover letter</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id}>
              <td><b>{a.seeker_name}</b></td>
              <td>{a.seeker_email}</td>
              <td style={{ maxWidth: 280 }}>{a.cover_letter || '—'}</td>
              <td><span className={`badge ${a.status}`}>{a.status}</span></td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn" onClick={() => setStatus(a.id, 'shortlisted')}>Shortlist</button>
                <button className="btn" onClick={() => setStatus(a.id, 'hired')}>Hire</button>
                <button className="btn" onClick={() => setStatus(a.id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!apps.length && <p>No applicants yet.</p>}
      <p style={{ marginTop: 12 }}><Link to="/my-jobs" style={{ color: '#275df1', fontWeight: 700 }}>← Back to My Jobs</Link></p>
    </div>
  );
}
