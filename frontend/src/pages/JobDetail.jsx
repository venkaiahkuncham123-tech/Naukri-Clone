import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [cover, setCover] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/api/jobs/${id}`).then((r) => setJob(r.data.job)).catch(() => setErr('Job not found'));
  }, [id]);

  const apply = async () => {
    setErr(''); setMsg('');
    if (!user) return nav('/login');
    try {
      await api.post('/api/applications', { job_id: Number(id), cover_letter: cover });
      setMsg('Applied successfully! Track it under My Applications.');
    } catch (e) {
      setErr(e.response?.data?.message || 'Apply failed');
    }
  };

  if (!job) return <div className="container">{err || 'Loading…'}</div>;

  return (
    <div className="container">
      <div className="detail">
        <h2>{job.title}</h2>
        <div className="company">{job.company} • {job.location} • {job.job_type}</div>
        <div className="meta" style={{ marginTop: 10 }}>
          <span>💼 {job.experience_min}-{job.experience_max} yrs</span>
          {job.salary_min && <span>💰 {job.salary_min}-{job.salary_max} LPA</span>}
          <span>👥 {job.vacancies} openings</span>
          <span className="tag">{job.status}</span>
        </div>
        <div className="meta"><b>Skills:</b> {(job.skills || '').split(',').map((s) => <span className="tag" key={s.trim()}>{s.trim()}</span>)}</div>
        <h3 style={{ marginTop: 16 }}>Job description</h3>
        <p className="desc">{job.description}</p>

        {(!user || user.role !== 'recruiter') && job.status === 'active' && (
          <div style={{ marginTop: 18 }}>
            <h3>Apply for this job</h3>
            {msg && <div className="alert ok">{msg}</div>}
            {err && <div className="alert err">{err}</div>}
            <div className="field"><label>Cover letter (optional)</label><textarea value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why are you a good fit?" /></div>
            <button className="btn primary" onClick={apply}>Apply Now</button>
            {msg && <Link to="/my-applications" style={{ marginLeft: 12, color: '#275df1', fontWeight: 700 }}>Go to My Applications →</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
