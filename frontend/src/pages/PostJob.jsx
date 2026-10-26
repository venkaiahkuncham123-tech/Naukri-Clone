import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

const empty = { title: '', company: '', description: '', skills: '', location: 'Bengaluru', job_type: 'Full-time', experience_min: 0, experience_max: 3, salary_min: '', salary_max: '', vacancies: 1, status: 'active' };

export default function PostJob({ edit }) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const id = edit ? params.id : null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (id) api.get(`/api/jobs/${id}`).then((r) => setForm({ ...empty, ...r.data.job }));
  }, [id]);

  useEffect(() => {
    if (!edit && user?.company_name && !form.company) set('company', user.company_name);
    // eslint-disable-next-line
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    const payload = { ...form, salary_min: form.salary_min === '' ? null : Number(form.salary_min), salary_max: form.salary_max === '' ? null : Number(form.salary_max), experience_min: Number(form.experience_min), experience_max: Number(form.experience_max), vacancies: Number(form.vacancies) };
    try {
      if (id) { await api.put(`/api/jobs/${id}`, payload); setMsg('Job updated!'); }
      else { const r = await api.post('/api/jobs', payload); setMsg('Job posted!'); nav(`/jobs/${r.data.job.id}`); }
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="form" style={{ maxWidth: 760 }}>
      <h2>{id ? 'Edit job' : 'Post a new job'}</h2>
      {err && <div className="alert err">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <form onSubmit={submit}>
        <div className="field"><label>Job title</label><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Full Stack Developer" /></div>
        <div className="row2">
          <div className="field"><label>Company</label><input value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
          <div className="field"><label>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
        </div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
        <div className="field"><label>Skills (comma separated)</label><input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Node.js, MySQL" /></div>
        <div className="row2">
          <div className="field"><label>Job type</label>
            <select value={form.job_type} onChange={(e) => set('job_type', e.target.value)}>
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Remote</option>
            </select>
          </div>
          <div className="field"><label>Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="active">active</option><option value="closed">closed</option>
            </select>
          </div>
        </div>
        <div className="row2">
          <div className="field"><label>Exp min</label><input type="number" value={form.experience_min} onChange={(e) => set('experience_min', e.target.value)} /></div>
          <div className="field"><label>Exp max</label><input type="number" value={form.experience_max} onChange={(e) => set('experience_max', e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Salary min (LPA)</label><input type="number" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} /></div>
          <div className="field"><label>Salary max (LPA)</label><input type="number" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} /></div>
        </div>
        <div className="field"><label>Vacancies</label><input type="number" value={form.vacancies} onChange={(e) => set('vacancies', e.target.value)} /></div>
        <button className="btn dark" style={{ width: '100%' }} type="submit">{id ? 'Update job' : 'Post job'}</button>
      </form>
    </div>
  );
}
