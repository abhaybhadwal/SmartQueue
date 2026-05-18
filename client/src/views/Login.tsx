import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Briefcase, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../config';

interface LoginProps {
  role: 'user' | 'admin' | 'staff';
}

const Login: React.FC<LoginProps> = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const handleGoogleCallback = async (response: any) => {
    const loadingToast = toast.loading('Authenticating via Google...');
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        idToken: response.credential,
        role: role === 'admin' ? 'admin' : role
      });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name || 'Member'}!`, { id: loadingToast });
      navigate(role === 'user' ? '/dashboard' : '/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Google authentication failed', { id: loadingToast });
    }
  };

  useEffect(() => {
    const google = (window as any).google;
    if (google && GOOGLE_CLIENT_ID) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback
      });
      google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: "100%", text: "continue_with" }
      );
    }
  }, [GOOGLE_CLIENT_ID]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

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
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
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

            <button type="submit" className="btn-modern" style={{ marginTop: '1rem', height: '3.5rem', background: currentRole.gradient }} disabled={loading}>
              <LogIn size={20} /> {loading ? 'Authorizing...' : 'Authorize Session'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)', opacity: 0.5 }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)', opacity: 0.5 }}></div>
          </div>

          {/* Google Sign-in Button */}
          {GOOGLE_CLIENT_ID ? (
            <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          ) : (
            <button 
              type="button" 
              className="btn-glass flex items-center justify-center" 
              style={{ width: '100%', height: '3.5rem', gap: '0.75rem', fontWeight: 700 }}
              onClick={() => toast.error('Google Sign-In is ready! Please add VITE_GOOGLE_CLIENT_ID to your .env file to activate.', { duration: 5000 })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

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
      </div>
    </div>
  );
};

export default Login;
