import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Briefcase, User as UserIcon, Zap, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';

interface LoginProps {
  role: 'user' | 'admin' | 'staff';
}

const Login: React.FC<LoginProps> = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const roleConfig = {
    user: {
      title: 'Member Login',
      subtitle: 'Manage your personal queue tokens',
      icon: <UserIcon size={24} color="var(--primary)" />,
      redirect: '/dashboard',
      gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
    },
    admin: {
      title: 'Admin Console',
      subtitle: 'System architecture & analytics',
      icon: <ShieldCheck size={24} color="var(--accent)" />,
      redirect: '/admin',
      gradient: 'linear-gradient(135deg, var(--accent) 0%, #0891b2 100%)'
    },
    staff: {
      title: 'Staff Portal',
      subtitle: 'Queue management & service control',
      icon: <Briefcase size={24} color="var(--warning)" />,
      redirect: '/admin',
      gradient: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)'
    }
  };

  const currentRole = roleConfig[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== role) {
        toast.error(`Access denied. You do not have ${role} privileges.`);
        setLoading(false);
        return;
      }

      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(currentRole.redirect);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-pager stagger-1">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <button 
          onClick={() => navigate('/')} 
          className="btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', width: 'auto' }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="glass-card" style={{ padding: '3rem 2rem' }}>
          <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '1.25rem', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '1px solid var(--glass-border)'
            }}>
              {currentRole.icon}
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{currentRole.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentRole.subtitle}</p>
          </header>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input 
                type="email" 
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="btn-glass"
                style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left', height: '3.5rem' }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="btn-glass"
                style={{ width: '100%', paddingLeft: '3.5rem', paddingRight: '3.5rem', textAlign: 'left', height: '3.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '1.25rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-muted)',
                  opacity: 0.6
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="btn-modern" style={{ marginTop: '1rem', height: '3.5rem', background: currentRole.gradient }}>
              <LogIn size={20} /> Authorize Session
            </button>
          </form>

          {(role === 'user' || role === 'staff') && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                {role === 'user' ? "New to the platform?" : "New operator?"} <Link to={role === 'user' ? "/signup" : "/staff/signup"} style={{ color: role === 'user' ? 'var(--primary)' : 'var(--warning)', fontWeight: 700, textDecoration: 'none' }}>{role === 'user' ? "Initialize Account" : "Request Access"}</Link>
              </p>
            </div>
          )}

          {/* Role Switcher - Designer UX Touch */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
             {role !== 'user' && <Link to="/login" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}>USER LOGIN</Link>}
             {role !== 'staff' && <Link to="/staff/login" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}>STAFF PORTAL</Link>}
             {role !== 'admin' && <Link to="/admin/login" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}>ADMIN ACCESS</Link>}
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Zap size={14} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em' }}>SECURED BY SMARTQUEUE CORE</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
