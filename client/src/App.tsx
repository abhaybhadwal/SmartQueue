import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './views/Landing';
import Home from './views/Home';
import Login from './views/Login';
import Signup from './views/Signup';
import UserDashboard from './views/UserDashboard';
import AccountSettings from './views/AccountSettings';
import TokenTracker from './views/TokenTracker';
import AdminDashboard from './views/AdminDashboard';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/services" element={<Home />} />
          
          {/* User Auth */}
          <Route path="/login" element={<Login role="user" />} />
          <Route path="/signup" element={<Signup role="user" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['user', 'admin']}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute roles={['user', 'admin']}>
              <AccountSettings />
            </ProtectedRoute>
          } />
          
          {/* Admin/Staff Auth & Dash */}
          <Route path="/admin/login" element={<Login role="admin" />} />
          <Route path="/staff/login" element={<Login role="staff" />} />
          <Route path="/staff/signup" element={<Signup role="staff" />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Token Tracking */}
          <Route path="/token/:id" element={<TokenTracker />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
