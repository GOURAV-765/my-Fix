import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

interface RoleRouteProps {
 permission: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ permission }) => {
 const { hasPermission, isLoading } = useAuth();

 if (isLoading) {
 return (
 <div className="flex h-screen items-center justify-center bg-cardBg text-textPrimary">
 <div className="flex flex-col items-center gap-4">
 <div className="h-12 w-12 animate-spin rounded-full border-4 border-ieeeBlue border-t-transparent"></div>
 <p className="text-sm font-medium text-textMuted">Verifying permissions...</p>
 </div>
 </div>
 );
 }

 return hasPermission(permission) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default RoleRoute;
