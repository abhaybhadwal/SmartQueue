import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Briefcase,
  Play,
  Check,
  X,
  RefreshCw,
  ListRestart,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { socket } from '../socket';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import ThemeToggle from '../components/ThemeToggle';

interface Token {
  id: string;
  number: number;
}

interface Counter {
  id: string;
  name: string;
  service: {
    name: string;
  };
  currentToken?: Token | null;
}

interface CounterStatus {
  counter: Counter;
  currentToken: Token | null;
  nextToken: Token | null;
  stats: {
    servedToday: number;
    avgServiceTime: number;
  };
}

interface Activity {
  id: string;
  type: 'call' | 'serve' | 'no-show';
  tokenNumber: number;
  timestamp: Date;
}

interface ServiceMetric {
  id: string;
  averageServiceTime: number;
  totalTokensServed: number;
  service: {
    name: string;
  };
}

interface Analytics {
  totalTokens: number;
  servedTokens: number;
  noShowTokens: number;
  avgWaitTime: number;
  serviceMetrics: ServiceMetric[];
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<Analytics | null>(null);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [selectedCounterId, setSelectedCounterId] = useState<string>('');
  const [counterStatus, setCounterStatus] = useState<CounterStatus | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'management' | 'system'>(user?.role === 'staff' ? 'management' : 'analytics');
  const [users, setUsers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterServiceId, setNewCounterServiceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<{id: string, name: string} | null>(null);
  
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await axios.get('http://localhost:3001/api/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const fetchCounters = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/counters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounters(res.data);
    } catch (err) {
      console.error('Failed to fetch counters', err);
    }
  }, [token]);

  const fetchServices = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await axios.get('http://localhost:3001/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  }, [token, user?.role]);

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const res = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  }, [token, user?.role]);

  const fetchCounterStatus = useCallback(async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/counters/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCounterStatus(res.data);
    } catch (err) {
      console.error('Failed to fetch counter status', err);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
    fetchCounters();
    fetchServices();
    fetchUsers();
  }, [fetchAnalytics, fetchCounters, fetchServices, fetchUsers]);

  useEffect(() => {
    socket.on('queueUpdate', () => {
      fetchAnalytics();
      fetchCounters(); // Real-time grid refresh
      if (selectedCounterId) fetchCounterStatus(selectedCounterId);
    });
    return () => {
      socket.off('queueUpdate');
    };
  }, [selectedCounterId, fetchCounterStatus, fetchAnalytics, fetchCounters]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Creating service node...');
    try {
      await axios.post('http://localhost:3001/api/services', { name: newServiceName, description: newServiceDesc }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewServiceName('');
      setNewServiceDesc('');
      fetchServices();
      toast.success('Service node initialized successfully', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to initialize service node', { id: loadingToast });
    }
  };

  const handleAddCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Initializing counter...');
    try {
      await axios.post('http://localhost:3001/api/counters', { name: newCounterName, serviceId: newCounterServiceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCounterName('');
      setNewCounterServiceId('');
      fetchCounters();
      toast.success('Counter online', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to bring counter online', { id: loadingToast });
    }
  };

  const handleRemoveUserRequest = (u: any) => {
    setUserToRemove({ id: u.id, name: u.name || u.email });
    setIsConfirmOpen(true);
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    const loadingToast = toast.loading('Terminating user session...');
    try {
      await axios.delete(`http://localhost:3001/api/users/${userToRemove.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
      toast.success('User removed from system', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Access revocation failed', { id: loadingToast });
    } finally {
      setIsConfirmOpen(false);
      setUserToRemove(null);
    }
  };

  const addActivity = (type: Activity['type'], tokenNumber: number) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      tokenNumber,
      timestamp: new Date()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const callNext = async () => {
    if (!selectedCounterId || !counterStatus?.nextToken) return;
    const loadingToast = toast.loading('Relaying call signal...');
    try {
      const res = await axios.post(`http://localhost:3001/api/counters/${selectedCounterId}/call-next`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addActivity('call', res.data.number);
      fetchCounterStatus(selectedCounterId);
      toast.success(`Token #${res.data.number} called`, { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Signal relay failed', { id: loadingToast });
    }
  };

  const markServed = async () => {
    if (!counterStatus?.currentToken) return;
    const loadingToast = toast.loading('Finalizing session...');
    try {
      await axios.post('http://localhost:3001/api/tokens/' + counterStatus.currentToken.id + '/served', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addActivity('serve', counterStatus.currentToken.number);
      fetchCounterStatus(selectedCounterId);
      toast.success('Session completed', { id: loadingToast });
    } catch {
      toast.error('Finalization failed', { id: loadingToast });
    }
  };

  const markNoShow = async () => {
    if (!counterStatus?.currentToken) return;
    const loadingToast = toast.loading('Recording no-show status...');
    try {
      await axios.post('http://localhost:3001/api/tokens/' + counterStatus.currentToken.id + '/no-show', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addActivity('no-show', counterStatus.currentToken.number);
      fetchCounterStatus(selectedCounterId);
      toast.success('No-show recorded', { id: loadingToast });
    } catch {
      toast.error('Status recording failed', { id: loadingToast });
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Session terminated securely');
    navigate('/');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return `${Math.round(seconds)}s`;
    return `${mins}m ${Math.round(seconds % 60)}s`;
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
      <div className="pulse-primary" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', marginBottom: '1rem' }}></div>
      <p style={{ color: 'var(--text-muted)' }}>Loading system architecture...</p>
    </div>
  );

  return (
    <div className="stagger-1 flex-1 flex flex-col">
      <nav className="flex justify-between items-center w-full" style={{ padding: '1.5rem 0', marginBottom: '3rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: user?.role === 'admin' ? 'linear-gradient(135deg, var(--accent), #0891b2)' : 'linear-gradient(135deg, var(--warning), #d97706)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            {user?.role === 'admin' ? <ShieldCheck size={22} color="white" /> : <Briefcase size={22} color="white" />}
          </div>
          {user?.role === 'admin' ? 'Admin' : 'Staff'}<span className="gradient-text">{user?.role === 'admin' ? 'Console' : 'Portal'}</span>
        </div>
        <div className="flex items-center" style={{ gap: '1rem' }}>
           <button 
            onClick={() => navigate('/')} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
           <ThemeToggle />
           <div className="btn-glass" style={{ display: 'flex', padding: '0.25rem', borderRadius: '0.75rem', gap: '0.25rem' }}>
              <button 
                onClick={() => setActiveTab('analytics')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.6rem', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'analytics' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Analytics
              </button>
              <button 
                onClick={() => setActiveTab('management')}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.6rem', 
                  fontSize: '0.8rem', 
                  fontWeight: 700,
                  background: activeTab === 'management' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'management' ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Management
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('system')}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '0.6rem', 
                    fontSize: '0.8rem', 
                    fontWeight: 700,
                    background: activeTab === 'system' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'system' ? 'white' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  System
                </button>
              )}
           </div>
           <button 
            onClick={handleLogout} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}
          >
            <LogOut size={16} /> Secure Logout
          </button>
        </div>
      </nav>

      {activeTab === 'analytics' && (
        <div className="animate-fade-in flex flex-col">
          <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>System <span className="gradient-text">Performance</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Global infrastructure analytics & service health</p>
          </header>

          <div className="feature-grid" style={{ marginBottom: '3rem' }}>
            {!data ? (
              [1, 2, 3, 4].map(i => <div key={i} className="glass-card skeleton" style={{ height: '160px' }}></div>)
            ) : (
              <>
                <div className="glass-card stagger-1" style={{ textAlign: 'center', padding: '2rem' }}>
                  <TrendingUp size={28} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{data.totalTokens}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Total Throughput</div>
                </div>
                <div className="glass-card stagger-2" style={{ textAlign: 'center', padding: '2rem' }}>
                  <UserCheck size={28} color="var(--success)" style={{ marginBottom: '1rem' }} />
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{data.servedTokens}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Successful Sessions</div>
                </div>
                <div className="glass-card stagger-3" style={{ textAlign: 'center', padding: '2rem' }}>
                  <UserX size={28} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{data.noShowTokens}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Abandoned Tokens</div>
                </div>
                <div className="glass-card stagger-1" style={{ textAlign: 'center', padding: '2rem' }}>
                  <Clock size={28} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                  <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{formatTime(data.avgWaitTime || 0)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>Avg. Latency</div>
                </div>
              </>
            )}
          </div>

          <div className="glass-card stagger-2 flex-1" style={{ padding: '2.5rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'white', letterSpacing: '0.05em' }}>
                <BarChart3 size={20} color="var(--primary)" /> Regional Service Efficiency
              </h3>
              <button 
                className="btn-glass" 
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing}
                style={{ fontSize: '0.8rem' }}
              >
                {refreshing ? 'Syncing...' : 'Refresh Data'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                    <th style={{ paddingBottom: '1.5rem', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.1em' }}>SERVICE NODE</th>
                    <th style={{ paddingBottom: '1.5rem', fontWeight: 800, textAlign: 'right', fontSize: '0.8rem', letterSpacing: '0.1em' }}>AVG. RESPONSE</th>
                    <th style={{ paddingBottom: '1.5rem', fontWeight: 800, textAlign: 'right', fontSize: '0.8rem', letterSpacing: '0.1em' }}>CAPACITY</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.serviceMetrics.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '1.5rem 0', fontWeight: 700, color: 'white' }}>{m.service.name}</td>
                      <td style={{ color: 'var(--text-muted)', textAlign: 'right' }}>{formatTime(m.averageServiceTime)}</td>
                      <td style={{ fontWeight: 900, textAlign: 'right', fontSize: '1.25rem' }} className="gradient-text">{m.totalTokensServed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="animate-fade-in flex flex-col">
          <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Queue <span className="gradient-text">Management</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Direct counter intervention & service flow control</p>
          </header>

          <div className="admin-management-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
            <div className="flex flex-col gap-8">
              {/* Counter Grid Selection */}
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end flex-wrap gap-4">
                   <div className="flex flex-col gap-2">
                      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>Operational Stations</h3>
                      <div style={{ position: 'relative', width: '300px' }}>
                        <Briefcase size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input 
                          type="text" 
                          placeholder="Search counter or service..." 
                          className="btn-glass"
                          style={{ width: '100%', paddingLeft: '3rem', fontSize: '0.85rem', height: '2.75rem', textAlign: 'left' }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                   </div>
                   <button 
                    className="btn-glass" 
                    onClick={() => { fetchCounters(); fetchAnalytics(true); }}
                    style={{ fontSize: '0.75rem', height: 'fit-content' }}
                   >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> SYNC OPERATIONS
                   </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  {counters
                    .filter(c => 
                      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      c.service.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((c: any) => (
                    <div 
                      key={c.id} 
                      className={`glass-card stagger-1 ${selectedCounterId === c.id ? 'active-glow' : ''}`}
                      onClick={() => {
                        setSelectedCounterId(c.id);
                        fetchCounterStatus(c.id);
                      }}
                      style={{ 
                        padding: '1.5rem', 
                        cursor: 'pointer', 
                        border: selectedCounterId === c.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: selectedCounterId === c.id ? 'rgba(139, 92, 246, 0.1)' : 'var(--card-bg)'
                      }}
                    >
                      {selectedCounterId === c.id && (
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--primary)' }}>
                          <Check size={18} strokeWidth={3} />
                        </div>
                      )}
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 600 }}>{c.service.name}</div>
                      
                      <div className="flex items-center justify-between">
                         <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: c.currentToken ? 'var(--success)' : 'var(--text-muted)' }}>
                            {c.currentToken ? '● ACTIVE' : '○ IDLE'}
                         </div>
                         {c.currentToken && (
                           <div style={{ fontSize: '1rem', fontWeight: 900 }}>#{c.currentToken.number}</div>
                         )}
                      </div>
                    </div>
                  ))}
                  {counters.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No counters registered in the system
                    </div>
                  )}
                </div>
              </div>

              {counterStatus ? (
                <div className="feature-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={`glass-card stagger-2 ${counterStatus.currentToken ? 'pulse-primary' : ''}`} style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                    <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2rem', letterSpacing: '0.15em' }}>SESSION: {counterStatus.counter.name}</h3>
                    
                    {counterStatus.currentToken ? (
                      <div className="animate-fade-in flex-1 flex flex-col items-center">
                        <div style={{ fontSize: '6rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1 }}>#{counterStatus.currentToken.number}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>Token in Session</div>
                        
                        <div className="flex w-full" style={{ gap: '1.5rem', marginTop: 'auto' }}>
                          <button className="btn-modern" style={{ flex: 1.5, background: 'var(--success)', padding: '1.25rem' }} onClick={markServed}>
                            <Check size={22} /> MARK SERVED
                          </button>
                          <button className="btn-glass" style={{ flex: 1, color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={markNoShow}>
                            <X size={22} /> NO SHOW
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                        <Clock size={60} style={{ marginBottom: '1.5rem' }} />
                        <p style={{ fontStyle: 'italic' }}>Station Idle</p>
                      </div>
                    )}
                  </div>

                  <div className="glass-card stagger-3" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.15em' }}>NEXT IN QUEUE</h3>
                    </div>

                    {counterStatus.nextToken ? (
                      <div className="animate-fade-in flex flex-col justify-between" style={{ height: '100%' }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                          <div style={{ fontSize: '4rem', fontWeight: 900 }}>#{counterStatus.nextToken.number}</div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Awaiting Call</p>
                        </div>
                        <button 
                          className="btn-modern" 
                          style={{ width: '100%', padding: '1.5rem' }} 
                          onClick={callNext} 
                          disabled={!!counterStatus.currentToken}
                        >
                          <Play size={22} fill="white" /> INITIALIZE CALL
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '3rem 0', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                        Buffer Empty
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass-card text-center" style={{ padding: '4rem 2rem', opacity: 0.5 }}>
                   Select a counter from the list above to view live session control.
                </div>
              )}
            </div>

            <div className="glass-card stagger-3" style={{ height: 'fit-content', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <ListRestart size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Stream</h3>
              </div>

              <div className="flex flex-col gap-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="animate-fade-in" style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                    <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: '0.4rem',
                        background: activity.type === 'call' ? 'rgba(139, 92, 246, 0.1)' : activity.type === 'serve' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: activity.type === 'call' ? 'var(--primary)' : activity.type === 'serve' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {activity.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                        {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Token #{activity.tokenNumber} {activity.type === 'call' ? 'Called' : activity.type === 'serve' ? 'Served' : 'No Show'}
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      No session data
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="animate-fade-in flex flex-col gap-8">
          <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>System <span className="gradient-text">Configuration</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage users, services and counter infrastructure</p>
          </header>

          <div className="admin-management-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            {/* User Management */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserCheck size={20} color="var(--primary)" /> Registered Users
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <th style={{ padding: '1rem 0' }}>USER</th>
                      <th style={{ padding: '1rem 0' }}>CONTACT</th>
                      <th style={{ padding: '1rem 0' }}>ROLE</th>
                      <th style={{ padding: '1rem 0', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '1rem 0' }}>
                          <div className="flex items-center" style={{ gap: '1rem' }}>
                            <img 
                              src={u.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                              alt={u.name} 
                              style={{ width: '40px', height: '40px', borderRadius: '0.75rem', objectFit: 'cover', border: '1px solid var(--glass-border)' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700 }}>{u.name || 'Anonymous User'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {u.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 0' }}>
                          <div style={{ fontSize: '0.9rem' }}>{u.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.phoneNumber || 'No phone set'}</div>
                        </td>
                        <td style={{ padding: '1rem 0' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '0.4rem',
                            background: u.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                            color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)'
                          }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                          <button 
                            className="btn-glass" 
                            style={{ padding: '0.4rem 0.8rem', color: 'var(--danger)', fontSize: '0.75rem' }}
                            onClick={() => handleRemoveUserRequest(u)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {/* Add Service */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Briefcase size={20} color="var(--primary)" /> Add New Job/Service
                </h3>
                <form onSubmit={handleAddService} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Service Name (e.g. Loans)" 
                    className="btn-glass" 
                    style={{ width: '100%', textAlign: 'left', padding: '1rem' }}
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Description" 
                    className="btn-glass" 
                    style={{ width: '100%', textAlign: 'left', padding: '1rem' }}
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                  />
                  <button type="submit" className="btn-modern" style={{ width: '100%', padding: '1rem' }}>
                    CREATE SERVICE
                  </button>
                </form>
              </div>

              {/* Add Counter */}
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Timer size={20} color="var(--primary)" /> Add New Counter
                </h3>
                <form onSubmit={handleAddCounter} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Counter Name (e.g. Counter 5)" 
                    className="btn-glass" 
                    style={{ width: '100%', textAlign: 'left', padding: '1rem' }}
                    value={newCounterName}
                    onChange={(e) => setNewCounterName(e.target.value)}
                    required
                  />
                  <select 
                    className="btn-glass" 
                    style={{ width: '100%', textAlign: 'left', padding: '1rem', appearance: 'none' }}
                    value={newCounterServiceId}
                    onChange={(e) => setNewCounterServiceId(e.target.value)}
                    required
                  >
                    <option value="" style={{ background: '#0f172a' }}>-- Select Service --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id} style={{ background: '#0f172a' }}>{s.name}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn-modern" style={{ width: '100%', padding: '1rem' }}>
                    CREATE COUNTER
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <footer style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
        <p style={{ fontSize: '0.85rem' }}>INTERNAL SYSTEM LOGS • NODE-01-SMARTQUEUE</p>
      </footer>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        title="Revoke Access"
        message={`Are you sure you want to permanently remove ${userToRemove?.name}? this action cannot be undone.`}
        onConfirm={handleRemoveUser}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
