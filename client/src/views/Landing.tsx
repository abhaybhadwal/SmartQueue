import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Heart, Clock, Users, Globe, Smartphone, BarChart, Mail, Phone } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col" id="top">
      {/* --- HEADER --- */}
      <nav className="flex justify-between items-center w-full" style={{ padding: '1.5rem 0', zIndex: 10 }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => scrollToSection('top')}>
          <div className="animate-float" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.4)' }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <span style={{ letterSpacing: '-0.03em' }}>Smart<span className="gradient-text">Queue</span></span>
        </div>
        <div className="flex items-center" style={{ gap: '2rem' }}>
          <div className="flex" style={{ gap: '1.5rem', fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>
            <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('features')}>Features</span>
            <span style={{ cursor: 'pointer' }} onClick={() => scrollToSection('features')}>Solution</span>
          </div>
          <div className="flex items-center" style={{ gap: '1rem' }}>
            <ThemeToggle />
            <button className="btn-glass" onClick={() => navigate('/login')}>Sign In</button>
            <button className="btn-modern" onClick={() => navigate('/signup')} style={{ padding: '0.75rem 1.5rem' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* --- CENTER FULL PAGER (Hero/Messaging) --- */}
      <main className="full-pager stagger-1">
        <div style={{ maxWidth: '800px', textAlign: 'center', position: 'relative' }}>
          <div className="animate-float" style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', opacity: 0.1, zIndex: -1 }}>
            <Globe size={400} color="var(--primary)" />
          </div>
          
          <span className="badge badge-waiting" style={{ marginBottom: '2rem', padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
            🚀 ELIMINATING WAIT TIMES GLOBALLY
          </span>
          
          <h1 style={{ fontSize: '4.5rem', marginBottom: '2rem', lineHeight: 1 }}>
            We're solving the <br />
            <span className="gradient-text">Queueing Crisis.</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3.5rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 3.5rem' }}>
            Traditional lines waste human potential and cause unnecessary stress. We've built a digital infrastructure that turns physical waiting into free time.
          </p>

          <div className="flex justify-center" style={{ gap: '1.5rem' }}>
            <button className="btn-modern" onClick={() => navigate('/signup')} style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
              Claim Your Spot <ArrowRight size={20} />
            </button>
            <button className="btn-glass" onClick={() => navigate('/services')} style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem' }}>
              How it Works
            </button>
          </div>
        </div>

        {/* Hero Visual Element */}
        <div className="glass-card" style={{ marginTop: '5rem', width: '100%', maxWidth: '1000px', height: '400px', padding: 0, border: 'none', borderRadius: '2.5rem', position: 'relative' }}>
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=2000" 
            alt="Team working on smart solutions" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2.5rem' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 0%, transparent 50%)', borderRadius: '2.5rem' }}></div>
          <div style={{ position: 'absolute', bottom: '2rem', left: '3rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>1M+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Hours Saved</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900 }}>500+</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Partner Venues</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FEATURE SECTION --- */}
      <section id="features" className="section-padding">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Engineered for <span className="gradient-text">Efficiency</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>A complete ecosystem to manage, track, and optimize flow.</p>
        </div>

        <div className="feature-grid">
          <div className="glass-card stagger-1">
            <div style={{ width: '60px', height: '60px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Smartphone size={30} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Mobile First</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              No hardware needed. Customers scan a QR code and receive their digital token instantly on their device.
            </p>
          </div>

          <div className="glass-card stagger-2">
            <div style={{ width: '60px', height: '60px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={30} color="var(--secondary)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Real-time Logic</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Advanced predictive algorithms calculate wait times based on live server performance and historical data.
            </p>
          </div>

          <div className="glass-card stagger-3">
            <div style={{ width: '60px', height: '60px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <BarChart size={30} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Admin Insights</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Powerful analytics dashboard for managers to identify bottlenecks and optimize resource allocation in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="section-padding" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '3rem', margin: '4rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Get in <span className="gradient-text">Touch</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Have questions? Our support team is here to help.</p>
        </div>

        <div className="flex justify-center" style={{ gap: '2rem', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Mail size={30} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Email Us</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Direct your inquiries to our team</p>
            <a href="mailto:prince54918@gmail.com" style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none' }}>prince54918@gmail.com</a>
          </div>

          <div className="glass-card" style={{ flex: '1', minWidth: '300px', maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Phone size={30} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Call Us</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Available for immediate assistance</p>
            <a href="tel:+919816708876" style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', textDecoration: 'none' }}>+91 98167-08876</a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', padding: '4rem 0' }}>
        <div className="feature-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '4rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => scrollToSection('top')}>Smart<span className="gradient-text">Queue</span></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '300px' }}>
              Revolutionizing venue management and customer experience through digital innovation.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>PRODUCT</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('features')}>Features</li>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('features')}>Integrations</li>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('features')}>Solutions</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>COMPANY</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('top')}>About Us</li>
              <li style={{ cursor: 'pointer' }} onClick={() => navigate('/staff/login')} style={{ color: 'var(--warning)', fontWeight: 700 }}>Staff Portal</li>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('top')}>Careers</li>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('top')}>Newsroom</li>
              <li style={{ cursor: 'pointer' }} onClick={() => scrollToSection('contact')}>Contact</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '0.9rem', color: 'white' }}>LEGAL</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('Privacy Policy coming soon in the full version.')}>Privacy Policy</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('Terms of Service coming soon in the full version.')}>Terms of Service</li>
              <li style={{ cursor: 'pointer' }} onClick={() => alert('Cookie Policy coming soon in the full version.')}>Cookie Policy</li>
            </ul>
          </div>
        </div>
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © 2026 SmartQueue Digital Systems Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
