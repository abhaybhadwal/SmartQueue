import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { socket } from '../socket';
import { Clock, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface Token {
  id: string;
  number: number;
  status: string;
  peopleAhead: number;
  predictedWaitTime: number;
  service: {
    name: string;
  };
  counter?: {
    name: string;
  };
}

const TokenTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchToken = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/tokens/${id}`);
      setToken(res.data);
    } catch (err) {
      console.error('Failed to fetch token', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/tokens/${id}`);
        if (isMounted) setToken(res.data);
      } catch (err) {
        console.error('Failed to fetch token', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();

    socket.on('queueUpdate', () => {
      fetchToken();
    });

    socket.on('tokenCalled', (calledToken) => {
      if (calledToken.id === id) {
        fetchToken();
        // Browser notification or alert
        if (Notification.permission === 'granted') {
          new Notification('Your turn!', { body: `Please proceed to ${calledToken.counterName}` });
        } else {
          alert(`Your turn! Please proceed to ${calledToken.counterName}`);
        }
      }
    });

    socket.on('tokenServed', (servedToken) => {
      if (servedToken.id === id) fetchToken();
    });

    return () => {
      isMounted = false;
      socket.off('queueUpdate');
      socket.off('tokenCalled');
      socket.off('tokenServed');
    };
  }, [id, fetchToken]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return 'Less than a minute';
    return `${mins} min${mins > 1 ? 's' : ''}`;
  };

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 animate-fade-in">
      <div className="pulse-primary" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', marginBottom: '1.5rem' }}></div>
      <p style={{ color: 'var(--text-muted)' }}>Fetching token details...</p>
    </div>
  );

  if (!token) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
      <h2 style={{ marginBottom: '1rem' }}>Token Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The token you're looking for doesn't exist or has expired.</p>
      <button onClick={() => navigate('/services')} className="btn-modern">Back to Services</button>
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

      <header style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {token.service.name}
        </p>
        <h1 style={{ fontSize: '4.5rem', margin: '0', lineHeight: 1 }}>#{token.number}</h1>
        <div style={{ marginTop: '1.25rem' }}>
          <span className={`badge badge-${token.status}`}>
            {token.status.replace('-', ' ')}
          </span>
        </div>
      </header>

      <div className={`glass-card ${token.status === 'serving' ? 'pulse-primary' : ''}`} style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        {token.status === 'waiting' && (
          <div className="animate-fade-in">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>ESTIMATED WAIT</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }} className="gradient-text">
              {formatTime(token.predictedWaitTime)}
            </div>
            
            <div className="progress-container" style={{ height: '10px' }}>
              <div 
                className="progress-bar" 
                style={{ width: `${Math.min(100, Math.max(5, 100 - (token.peopleAhead * 20)))}%` }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>{token.peopleAhead}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>People Ahead</div>
              </div>
            </div>
          </div>
        )}

        {token.status === 'serving' && (
          <div className="animate-fade-in">
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={80} color="var(--success)" />
              <div className="pulse-primary" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', zIndex: -1 }}></div>
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.75rem' }}>It's Your Turn!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              Please proceed to <span className="gradient-text" style={{ fontWeight: 800 }}>{token.counter?.name || 'the counter'}</span>
            </p>
          </div>
        )}

        {token.status === 'served' && (
          <div className="animate-fade-in">
            <CheckCircle2 size={64} color="var(--primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Thank You!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your request has been processed.</p>
            <button onClick={() => navigate('/services')} className="btn-modern" style={{ margin: '0 auto' }}>Get Another Token</button>
          </div>
        )}

        {token.status === 'no-show' && (
          <div className="animate-fade-in">
            <X size={64} color="var(--danger)" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Missed Call</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You weren't available when your number was called.</p>
            <button onClick={() => navigate('/services')} className="btn-modern" style={{ margin: '0 auto' }}>Try Again</button>
          </div>
        )}
      </div>

      <div className="glass-card stagger-2" style={{ marginTop: 'auto' }}>
        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
          <Clock size={18} color="var(--primary)" /> Live Updates
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>
          Real-time notifications are active. Keep this page open; we'll alert you the moment your number is called.
        </p>
      </div>
    </div>
  );
};

export default TokenTracker;
