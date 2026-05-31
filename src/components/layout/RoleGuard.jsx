import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RoleGuard({ allowedRoles }) {
  const { user, token, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cc-offwhite">
        <Loader2 className="animate-spin text-cc-maroon w-12 h-12" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = user?.role || 'student';

  if (user && allowedRoles && !allowedRoles.includes(currentRole)) {
    // If they have the wrong role, redirect to their actual dashboard
    if (currentRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (currentRole === 'clubLeader' || currentRole === 'leader') return <Navigate to="/leader/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
