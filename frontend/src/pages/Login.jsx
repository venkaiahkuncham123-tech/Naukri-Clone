import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();
  const { save } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const r = await api.post('/api/auth/login', { email, password });
      save(r.data.user, r.data.token);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="form">
      <h2>Login to Naukri Clone</h2>
      {err && <div className="alert err">{err}</div>}
      <form onSubmit={submit}>
        <div className="field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" /></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></div>
        <button className="btn dark" style={{ width: '100%' }} type="submit">Login</button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>No account? <Link to="/register" style={{ color: '#275df1', fontWeight: 700 }}>Register</Link></p>
    </div>
  );
}
