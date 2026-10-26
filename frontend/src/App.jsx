import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import MyJobs from './pages/MyJobs';
import MyApplications from './pages/MyApplications';
import Applicants from './pages/Applicants';
import Profile from './pages/Profile';
import Navbar from './Navbar';
import { useAuth } from './AuthContext';

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/post-job" element={<Guard roles={['recruiter']}><PostJob /></Guard>} />
        <Route path="/my-jobs" element={<Guard roles={['recruiter']}><MyJobs /></Guard>} />
        <Route path="/jobs/:id/edit" element={<Guard roles={['recruiter']}><PostJob edit /></Guard>} />
        <Route path="/jobs/:id/applicants" element={<Guard roles={['recruiter']}><Applicants /></Guard>} />
        <Route path="/my-applications" element={<Guard roles={['seeker']}><MyApplications /></Guard>} />
        <Route path="/profile" element={<Guard roles={['seeker', 'recruiter']}><Profile /></Guard>} />
      </Routes>
      <div className="footer">Naukri Clone (microservices + MySQL) — user :5001 • jobs :5002 • applications :5003 • gateway :5000 • UI :5173</div>
    </>
  );
}
