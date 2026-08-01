import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PageLayout } from './components/layout/PageLayout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import DoctorPageWrapper from './pages/DoctorPageWrapper';

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role === 'doctor') return <Navigate to="/doctor" />;
  return children;
};

const DoctorRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" />;
  if (currentUser.role !== 'doctor') return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (currentUser?.role === 'doctor') return <Navigate to="/doctor" />;
  return currentUser ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div
          className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/hero-body.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
          aria-hidden="true"
        />
        <Router>
          <PageLayout>
            <Routes>
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><AuthPage isLogin={true} /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><AuthPage isLogin={false} /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/doctor" element={<DoctorRoute><DoctorPageWrapper /></DoctorRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </PageLayout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
