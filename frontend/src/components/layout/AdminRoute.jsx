import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from './DashboardLayout';

const AdminRoute = () => {
  const { token, user } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default AdminRoute;
