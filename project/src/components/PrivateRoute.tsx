import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseContext } from '../context/SupabaseProvider';

interface PrivateRouteProps {
  requiredRole?: 'admin' | 'clinic';
}

export default function PrivateRoute({ requiredRole }: PrivateRouteProps) {
  const { user, loading } = useSupabaseContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}