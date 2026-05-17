import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  User, 
  Phone, 
  Mail,
  ShieldCheck,
  Zap,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../AuthContext';
import { API_BASE_URL } from '../config';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user?.name || '');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState((user as any)?.phoneNumber?.slice(-10) || '');
  const [profileImage, setProfileImage] = useState((user as any)?.profileImage || '');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Synchronizing profile data...');

    try {
      const fullPhone = `${countryCode} ${phoneNumber}`;
      const res = await axios.put(`${API_BASE_URL}/api/users/profile`, 
        { name, phoneNumber: fullPhone, profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      login(token!, res.data);
      toast.success('Profile updated securely', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to sync profile changes', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+61', name: 'Australia' },
    { code: '+971', name: 'UAE' },
  ];

  return (
    <div className="stagger-1 flex-1 flex flex-col">
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
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-glass"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
        </div>
      </nav>

      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Account <span className="gradient-text">Settings</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Personalize your profile for better identification</p>
      </header>

      <div className="flex justify-center">
        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2.5rem' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center gap-6">
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                  alt="Profile" 
                  style={{ width: '120px', height: '120px', borderRadius: '2rem', objectFit: 'cover', border: '4px solid var(--primary)', boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
                />
                <div style={{ 
                  position: 'absolute', 
                  bottom: '-10px', 
                  right: '-10px', 
                  width: '40px', 
                  height: '40px', 
                  background: 'var(--primary)', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                  <Camera size={20} color="white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                 <p style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Profile Photo</p>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Click the photo to upload directly</p>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '1rem 0' }} />

            {/* Details Section */}
            <div className="flex flex-col gap-6">
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="btn-glass" 
                    style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Phone Number</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ position: 'relative', width: '120px' }}>
                    <Globe size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <select 
                      className="btn-glass" 
                      style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left', appearance: 'none' }}
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      {countries.map(c => (
                        <option key={c.code} value={c.code} style={{ background: '#0f172a' }}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Phone size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                      type="tel" 
                      placeholder="10 digit number" 
                      className="btn-glass" 
                      style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left' }}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      required
                    />
                  </div>
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter exactly 10 digits without spaces or special characters.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>Email Address (Non-editable)</label>
                <div style={{ position: 'relative', opacity: 0.5 }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    className="btn-glass" 
                    style={{ width: '100%', paddingLeft: '3.5rem', textAlign: 'left' }}
                    disabled
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-modern" style={{ width: '100%', padding: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }} disabled={loading}>
              <Save size={20} /> {loading ? 'Saving Changes...' : 'Update Account'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', padding: '4rem 0', opacity: 0.3 }}>
        <div className="flex items-center justify-center" style={{ gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
          <ShieldCheck size={16} />
          SECURE PROFILE MANAGEMENT
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
