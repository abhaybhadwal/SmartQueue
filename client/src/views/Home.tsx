import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, QrCode, ArrowLeft, Zap, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { API_BASE_URL } from '../config';
import { socket } from '../socket';

interface Service {
  id: string;
  name: string;
  description: string;
  predictedWaitTime: number;
  _count: {
    tokens: number;
  };
}

const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/services`);
        if (isMounted) setServices(res.data);
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const loadServices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services`);
      setServices(res.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    socket.on('queueUpdate', () => {
      loadServices();
    });
    socket.on('tokenCalled', () => {
      loadServices();
    });
    socket.on('tokenServed', () => {
      loadServices();
    });
    return () => {
      socket.off('queueUpdate');
      socket.off('tokenCalled');
      socket.off('tokenServed');
    };
  }, [loadServices]);

  const generateToken = async (serviceId: string) => {
    const phoneNumber = phoneNumbers[serviceId];
    const loadingToast = toast.loading('Synchronizing with queue system...');
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post(`${API_BASE_URL}/api/tokens`, { 
        serviceId, 
        phoneNumber 
      }, config);
      toast.success('Token generated successfully!', { id: loadingToast });
      navigate(`/token/${res.data.id}`);
    } catch {
      toast.error('Failed to generate token. Please try again.', { id: loadingToast });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return 'Less than a minute';
    return `${mins} min${mins > 1 ? 's' : ''}`;
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
      <div className="pulse-primary" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', marginBottom: '1.5rem' }}></div>
      <p style={{ color: 'var(--text-muted)' }}>Loading services...</p>
    </div>
  );

  return (
    <div className="stagger-1 flex-1 flex flex-col">
      {/* Header for Services */}
      <nav className="flex justify-between items-center w-full" style={{ padding: '1.5rem 0', marginBottom: '3rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={22} color="white" fill="white" />
          </div>
          Smart<span className="gradient-text">Queue</span>
        </div>
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7, fontSize: '0.85rem' }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
          <ThemeToggle />
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <History size={16} /> My Dashboard
          </button>
        </div>
      </nav>

      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Available <span className="gradient-text">Services</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a service to initialize your digital token</p>
      </header>

      <div className="feature-grid">
        {services.length > 0 ? (
          services.map((service, index) => (
            <div key={service.id} className={`glass-card stagger-${(index % 3) + 1}`} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{service.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{service.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  <Users size={18} color="var(--primary)" />
                  <span>{service._count.tokens} in line</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 700 }}>
                  <Clock size={18} color="var(--secondary)" />
                  <span>~{formatTime(service.predictedWaitTime)}</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <input 
                  type="tel" 
                  placeholder="Phone for SMS updates (Optional)"
                  className="btn-glass"
                  style={{ width: '100%', textAlign: 'left', padding: '1rem', fontSize: '0.9rem' }}
                  value={phoneNumbers[service.id] || ''}
                  onChange={(e) => setPhoneNumbers(prev => ({ ...prev, [service.id]: e.target.value }))}
                />
              </div>

              <button className="btn-modern" onClick={() => generateToken(service.id)} style={{ width: '100%', padding: '1.25rem' }}>
                <QrCode size={20} /> Generate Token
              </button>
            </div>
          ))
        ) : (
          <div className="glass-card text-center" style={{ gridColumn: '1 / -1', padding: '5rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>No services are currently active in your area.</p>
          </div>
        )}
      </div>

      <div className="mt-auto" style={{ textAlign: 'center', padding: '4rem 0', opacity: 0.5 }}>
        <button 
          className="btn-glass" 
          onClick={() => loadServices(true)} 
          disabled={refreshing}
          style={{ width: 'auto', margin: '0 auto', fontSize: '0.85rem' }}
        >
          {refreshing ? 'Syncing...' : 'Refresh Status'}
        </button>
      </div>
    </div>
  );
};

export default Home;
