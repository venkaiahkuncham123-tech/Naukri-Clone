import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="logo">naukri<span>clone</span></Link>
        <div className="nav">
          <NavLink to="/" end>Jobs</NavLink>
          {user?.role === 'recruiter' && <NavLink to="/post-job">Post Job</NavLink>}
          {user?.role === 'recruiter' && <NavLink to="/my-jobs">My Jobs</NavLink>}
          {user && user.role !== 'recruiter' && <NavLink to="/my-applications">My Applications</NavLink>}
          {user && <NavLink to="/profile">Profile</NavLink>}
        </div>
        <div className="authbox">
          {!user ? (
            <>
              <button className="btn" onClick={() => nav('/login')}>Login</button>
              <button className="btn primary" onClick={() => nav('/register')}>Register</button>
            </>
          ) : (
            <>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{user.name} ({user.role})</span>
              <button className="btn" onClick={() => { logout(); nav('/'); }}>Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
