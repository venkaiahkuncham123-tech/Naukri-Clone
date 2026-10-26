import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { user, save, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', headline: user?.headline || '',
    skills: user?.skills || '', experience_years: user?.experience_years || 0,
    location: user?.location || '', company_name: user?.company_name || '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (!user) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const r = await api.put(`/api/users/${user.id}`, form);
      save(r.data.user, localStorage.getItem('naukri_token'));
      setMsg('Profile updated!');
    } catch (e) {
      setErr(e.response?.data?.message || 'Update failed');
    }
  };

  const remove = async () => {
    if (!confirm('Delete your account permanently?')) return;
    await api.delete(`/api/users/${user.id}`);
    logout();
    nav('/');
  };

  return (
    <div className="form" style={{ maxWidth: 700 }}>
      <h2>My profile ({user.role})</h2>
      <p style={{ fontSize: 13, color: '#667', marginBottom: 12 }}>{user.email}</p>
      {err && <div className="alert err">{err}</div>}
      {msg && <div className="alert ok">{msg}</div>}
      <form onSubmit={submit}>
        <div className="row2">
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>{user.role === 'recruiter' ? 'Company' : 'Headline'}</label>
            {user.role === 'recruiter'
              ? <input value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
              : <input value={form.headline} onChange={(e) => set('headline', e.target.value)} />}
          </div>
          <div className="field"><label>Location</label><input value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Skills</label><input value={form.skills} onChange={(e) => set('skills', e.target.value)} /></div>
          <div className="field"><label>Experience (yrs)</label><input type="number" value={form.experience_years} onChange={(e) => set('experience_years', Number(e.target.value))} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn dark" type="submit" style={{ flex: 1 }}>Save changes</button>
          <button className="btn" type="button" onClick={remove}>Delete account</button>
        </div>
      </form>
    </div>
  );
}
