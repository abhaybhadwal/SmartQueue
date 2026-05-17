import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Ticket, 
  Clock, 
  History, 
  Settings, 
  LogOut, 
  Star,
  PlusCircle,
  Bell,
  TrendingUp,
  User,
  ArrowUpRight,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE_URL } from '../config';

interface ActiveToken {
  id: string;
  number: number;
  service: {
    name: string;
  };
  status: 'waiting' | 'serving';
  predictedWaitTime: number;
}

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [activeTokens, setActiveTokens] = useState<ActiveToken[]>([]);
  const [loading, setLoading] = useState(true);
  const userName = user?.name?.split(' ')[0] || 'Member'; 
  const profileImage = (user as any)?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
  
  const fetchMyTokens = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tokens/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveTokens(res.data);
    } catch (err) {
      console.error('Failed to fetch tokens', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyTokens();
  }, [fetchMyTokens]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUnimplemented = (feature: string) => {
    alert(`${feature} is coming soon in the full version!`);
  };

  const stats = [
    { label: 'Saved', value: '14h', icon: <Clock size={18} color="var(--primary)" /> },
    { label: 'Used', value: '28', icon: <Ticket size={18} color="var(--secondary)" /> },
    { label: 'Rating', value: '4.9', icon: <Star size={18} color="var(--warning)" /> }
  ];

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
      <div className="pulse-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', marginBottom: '1rem' }}></div>
      <p style={{ color: 'var(--text-muted)' }}>Synchronizing dashboard...</p>
    </div>
  );

  return (
    <div className="stagger-1 flex-1 flex flex-col">
      <nav className="flex justify-between items-center w-full" style={{ padding: '1.5rem 0', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          Smart<span className="gradient-text">Queue</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="btn-glass"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </nav>

      {/* Dynamic Profile Header */}
      <header className="flex justify-between items-center" style={{ marginBottom: '3.5rem', padding: '1rem 0', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div className="flex items-center" style={{ gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={profileImage} 
              alt="Profile" 
              style={{ width: '72px', height: '72px', borderRadius: '1.5rem', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
            />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '22px', height: '22px', background: 'var(--success)', borderRadius: '50%', border: '4px solid var(--bg)' }}></div>
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>Hi, {userName} <span className="animate-float" style={{ display: 'inline-block' }}>👋</span></h1>
            <div className="flex items-center" style={{ gap: '0.5rem' }}>
              <span className="badge badge-serving" style={{ fontSize: '0.6rem', padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>PREMIUM MEMBER</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>ID: SQ-{user?.id?.substring(0, 4).toUpperCase()}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <ThemeToggle />
          <button className="btn-glass" style={{ padding: '1rem', borderRadius: '1.25rem' }} onClick={() => handleUnimplemented('Notifications')}>
            <Bell size={24} />
          </button>
          <button className="btn-modern" onClick={() => navigate('/services')} style={{ padding: '0.8rem 1.5rem', borderRadius: '1.25rem' }}>
            <PlusCircle size={20} /> New Ticket
          </button>
        </div>
      </header>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', flex: 1 }}>
        {/* Responsive CSS handled via style tags for simplicity in this prototype */}
        <style>{`
          .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 350px;
          }
          @media (max-width: 1024px) {
            .dashboard-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        {/* Left Column: Activity & History */}
        <div className="flex flex-col" style={{ gap: '2.5rem' }}>
          {/* Visual Analytics Cards */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
            {stats.map((stat, i) => (
              <div key={i} className="glass-card stagger-1" style={{ padding: '1.75rem', marginBottom: 0, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{stat.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main Focus: Live Queue with Images */}
          <section>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Live <span className="gradient-text">Engagement</span></h2>
              <div className="flex items-center" style={{ gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => handleUnimplemented('History')}>
                View All History <ArrowUpRight size={18} />
              </div>
            </div>
            
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {activeTokens.length > 0 ? (
                activeTokens.map((token, i) => (
                  <div 
                    key={token.id} 
                    className={`glass-card stagger-${(i % 3) + 1} ${token.status === 'serving' ? 'pulse-primary' : ''}`}
                    style={{ marginBottom: 0, padding: '1.5rem', cursor: 'pointer' }}
                    onClick={() => navigate(`/token/${token.id}`)}
                  >
                    <div className="flex flex-col" style={{ gap: '1.5rem' }}>
                      <div className="flex items-center" style={{ gap: '1.25rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                           #{token.number}
                        </div>
                        <div className="flex-1">
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{token.service.name}</h3>
                          <div className="flex items-center" style={{ gap: '0.75rem' }}>
                            <span className={`badge badge-${token.status}`} style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem' }}>
                              {token.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {token.status === 'waiting' ? (
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <Clock size={16} /> Est. Wait
                          </div>
                          <span style={{ fontSize: '1rem', fontWeight: 900 }} className="gradient-text">~{token.predictedWaitTime} mins</span>
                        </div>
                      ) : (
                        <button className="btn-modern" style={{ width: '100%', padding: '1rem', background: 'var(--success)' }} onClick={(e) => { e.stopPropagation(); navigate(`/token/${token.id}`); }}>
                          PROCEED TO COUNTER
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card stagger-1" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>
                   <p>You don't have any active tokens. Start by creating a new ticket!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Quick Actions & System Health */}
        <div className="flex flex-col" style={{ gap: '2rem' }}>
           <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 800 }}>Quick Actions</h3>
              <div className="flex flex-col" style={{ gap: '1rem' }}>
                 <button className="btn-glass flex items-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem', padding: '1.25rem' }} onClick={() => window.open('mailto:prince54918@gmail.com', '_blank')}>
                    <Bell size={20} color="var(--primary)" />
                    <span>Help & Support</span>
                 </button>
                 <button className="btn-glass flex items-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem', padding: '1.25rem' }} onClick={() => handleUnimplemented('Transaction History')}>
                    <History size={20} color="var(--secondary)" />
                    <span>Transaction History</span>
                 </button>
                 <button className="btn-glass flex items-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem', padding: '1.25rem' }} onClick={() => navigate('/settings')}>
                    <Settings size={20} color="var(--accent)" />
                    <span>Account Settings</span>
                 </button>
                 <button className="btn-glass flex items-center" style={{ width: '100%', justifyContent: 'flex-start', gap: '1rem', padding: '1.25rem' }} onClick={handleLogout}>
                    <LogOut size={20} color="var(--danger)" />
                    <span>Logout Session</span>
                 </button>
              </div>
           </div>

           <div className="glass-card" style={{ padding: '2rem' }}>
              <div className="flex items-center" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                 <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                 All regional nodes are operational. High demand detected in "General Consultation".
              </p>
           </div>
        </div>
      </div>

      {/* Global Tab Bar removed for full-screen web experience, using sidebar/header instead */}
      <footer style={{ marginTop: '5rem', padding: '2rem 0', opacity: 0.3, textAlign: 'center', borderTop: '1px solid var(--glass-border)' }}>
         <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>SMARTQUEUE DASHBOARD v4.2.0 • ENCRYPTED SESSION</p>
      </footer>
    </div>
  );
};

export default UserDashboard;
