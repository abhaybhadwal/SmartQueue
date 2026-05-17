import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, ArrowLeft, Zap, CheckCircle2, ShieldCheck, Key, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';

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
  const { login } = useAuth();

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
