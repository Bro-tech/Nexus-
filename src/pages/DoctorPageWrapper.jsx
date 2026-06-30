import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DoctorPage from './DoctorPage';

export default function DoctorPageWrapper() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return <DoctorPage currentUser={currentUser} onLogout={handleLogout} />;
}
