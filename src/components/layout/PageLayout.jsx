import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const PageLayout = ({ children }) => {
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Auth pages: bare wrapper
  if (isAuthRoute) {
    return <div className="min-h-screen bg-transparent transition-colors duration-300">{children}</div>;
  }

  // Dashboard: no Navbar/Footer — DashboardPage handles its own Sidebar
  if (isDashboard) {
    return <>{children}</>;
  }

  // Landing and other public pages
  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export { PageLayout };
