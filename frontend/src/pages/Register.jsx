import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'seeker', phone: '', headline: '', skills: '', experience_years: 0, location: '', company_name: '' });
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { save } = useAuth();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const r = await api.post('/api/auth/register', form);
      save(r.data.user, r.data.token);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="form">
      <h2>Create your profile</h2>
      {err && <div className="alert err">{err}</div>}
      <form onSubmit={submit}>
        <div className="row2">
          <div className="field"><label>Full name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="field"><label>Role</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)}>
              <option value="seeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
        </div>
        <div className="row2">
          <div className="field"><label>Email</label><input value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div className="field"><label>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Bengaluru" /></div>
        </div>
        <div className="field"><label>{form.role === 'recruiter' ? 'Company' : 'Headline'}</label>
          {form.role === 'recruiter'
            ? <input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} placeholder="Company name" />
            : <input value={form.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Full Stack Developer" />}
        </div>
        <div className="row2">
          <div className="field"><label>Skills (comma separated)</label><input value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Node, MySQL" /></div>
          <div className="field"><label>Experience (yrs)</label><input type="number" value={form.experience_years} onChange={(e) => set('experience_years', Number(e.target.value))} /></div>
        </div>
        <button className="btn primary" style={{ width: '100%' }} type="submit">Register</button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>Have an account? <Link to="/login" style={{ color: '#275df1', fontWeight: 700 }}>Login</Link></p>
    </div>
  );
}
