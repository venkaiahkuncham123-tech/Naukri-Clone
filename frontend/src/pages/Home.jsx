import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const load = async (over = {}) => {
    const params = { q: over.q ?? q, location: over.location ?? location, job_type: over.jobType ?? jobType, limit: 24 };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    const r = await api.get('/api/jobs', { params });
    setJobs(r.data.jobs || []);
    setTotal(r.data.total || 0);
  };

  useEffect(() => { load({}); /* eslint-disable-next-line */ }, []);

  return (
    <>
      <div className="hero">
        <h1>Find your dream job now</h1>
        <p>{total}+ live jobs from top companies — search, apply, track</p>
        <form className="hero-form" onSubmit={(e) => { e.preventDefault(); load(); }}>
          <input placeholder="Skills, title, company…" value={q} onChange={(e) => setQ(e.target.value)} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
            <option value="">All types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Remote</option>
          </select>
          <button type="submit">Search</button>
        </form>
        <div className="chips">
          {['React', 'Node.js', 'DevOps', 'Remote', 'SQL'].map((s) => (
            <span key={s} style={{ cursor: 'pointer' }} onClick={() => { setQ(s); load({ q: s }); }}>{s}</span>
          ))}
        </div>
      </div>
      <div className="container">
        <h2 className="section-title">Recommended jobs ({total})</h2>
        <div className="grid">
          {jobs.map((j) => (
            <div className="card" key={j.id}>
              <h3><Link to={`/jobs/${j.id}`}>{j.title}</Link></h3>
              <div className="company">{j.company}</div>
              <div className="meta">
                <span>📍 {j.location}</span>
                <span>💼 {j.experience_min}-{j.experience_max} yrs</span>
                {j.salary_min && <span>💰 {j.salary_min}-{j.salary_max} LPA</span>}
              </div>
              <div className="meta">
                <span className="tag">{j.job_type}</span>
                {(j.skills || '').split(',').slice(0, 3).map((s) => <span className="tag" key={s.trim()}>{s.trim()}</span>)}
              </div>
              <p className="desc">{(j.description || '').slice(0, 120)}…</p>
              <div className="card-foot">
                <small style={{ color: '#889' }}>{new Date(j.created_at).toLocaleDateString()}</small>
                <Link className="btn dark" to={`/jobs/${j.id}`}>View & Apply</Link>
              </div>
            </div>
          ))}
        </div>
        {!jobs.length && <p style={{ marginTop: 20 }}>No jobs found. Try another search — or seed the DB.</p>}
      </div>
    </>
  );
}
