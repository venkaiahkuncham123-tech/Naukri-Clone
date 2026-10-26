import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const { user } = useAuth();
  const load = async () => {
    const r = await api.get('/api/jobs', { params: { recruiter_id: user.id, status: 'all', limit: 100 } });
    setJobs(r.data.jobs || []);
  };
  useEffect(() => { if (user) load(); /* eslint-disable-next-line */ }, [user]);

  const remove = async (id) => {
    if (!confirm('Delete this job?')) return;
    await api.delete(`/api/jobs/${id}`);
    load();
  };

  return (
    <div className="container">
      <h2 className="section-title">My posted jobs ({jobs.length})</h2>
      <div className="grid">
        {jobs.map((j) => (
          <div className="card" key={j.id}>
            <h3><Link to={`/jobs/${j.id}`}>{j.title}</Link></h3>
            <div className="company">{j.company} • {j.location}</div>
            <div className="meta"><span className="tag">{j.status}</span><span className="tag">{j.job_type}</span></div>
            <div className="card-foot">
              <Link to={`/jobs/${j.id}/applicants`} style={{ color: '#275df1', fontWeight: 700 }}>Applicants</Link>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link className="btn" to={`/jobs/${j.id}/edit`}>Edit</Link>
                <button className="btn" onClick={() => remove(j.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!jobs.length && <p>No jobs yet. <Link to="/post-job" style={{ color: '#275df1', fontWeight: 700 }}>Post one →</Link></p>}
    </div>
  );
}
