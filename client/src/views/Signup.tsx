import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, Zap, CheckCircle2, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../config';

interface SignupProps {
  role: 'user' | 'staff';
}

const Signup: React.FC<SignupProps> = ({ role }) => {
  const [name, setName] = useState('');
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
        role: role
      });
      login(res.data.token, res.data.user);
      toast.success(`Welcome to SmartQueue, ${res.data.user.name || 'Member'}!`, { id: loadingToast });
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
        document.getElementById("google-signup-btn"),
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
      title: 'Member Signup',
      subtitle: 'Join our community and start queueing smarter',
      gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      redirect: '/dashboard',
      emailPlaceholder: 'Personal Email'
    },
    staff: {
      title: 'Staff Registration',
      subtitle: 'Onboard as a service operator',
      gradient: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)',
      redirect: '/admin',
      emailPlaceholder: 'Work Email'
    }
  };

  const currentConfig = roleConfig[role];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, { 
        name, 
        email, 
        password,
        role: role
      });
      const { token, user } = res.data;
      login(token, user);
      toast.success(`Welcome aboard, ${user.name}!`);
      navigate(currentConfig.redirect);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-pager stagger-1">
      <div className="signup-grid" style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        
        {/* Left Side: Branding/Messaging */}
        <div className="glass-card signup-left-panel" style={{ background: currentConfig.gradient, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', border: 'none' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={24} color={role === 'user' ? 'var(--primary)' : 'var(--warning)'} fill={role === 'user' ? 'var(--primary)' : 'var(--warning)'} />
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>Instant <br />Access.</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.6 }}>{currentConfig.subtitle}</p>
          </div>
          
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'white', padding: 0 }}>
            <li className="flex items-center" style={{ gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Secure Authentication
            </li>
            <li className="flex items-center" style={{ gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <CheckCircle2 size={18} /> Real-time Updates
            </li>
            <li className="flex items-center" style={{ gap: '0.75rem', fontSize: '0.9rem', fontWeight: 600 }}>
              <Key size={18} /> Data Privacy
            </li>
          </ul>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col">
          <button 
            onClick={() => navigate('/')} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', width: 'auto', alignSelf: 'flex-start' }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="glass-card" style={{ padding: '3rem 2rem', flex: 1 }}>
            <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                {currentConfig.title}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Enter your details to get started
              </p>
            </header>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="btn-glass"
                  style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left', height: '3.5rem' }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="email" 
                  placeholder={currentConfig.emailPlaceholder}
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
                  placeholder="Create Password"
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

              <button type="submit" className="btn-modern" style={{ marginTop: '1rem', height: '3.5rem', background: role === 'staff' ? currentConfig.gradient : undefined }} disabled={loading}>
                <UserPlus size={20} /> {loading ? 'Creating Account...' : 'Complete Registration'}
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
              <div id="google-signup-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
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

            <div style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.9rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                Already have an account? <Link to={role === 'user' ? "/login" : "/staff/login"} style={{ color: role === 'user' ? 'var(--primary)' : 'var(--warning)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
