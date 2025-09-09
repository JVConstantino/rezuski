import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminProtectedRouteProps {
    allowedEmails?: string[];
    children?: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
    allowedEmails = ['joaovictor.priv@gmail.com'],
    children 
}) => {
    const { isAuthenticated, user } = useAuth();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
        // Redirect to home page if not authenticated
        return <Navigate to="/" replace />;
    }
    
    // Check if user's email is in the allowed list
    if (user && !allowedEmails.includes(user.email)) {
        // Redirect to admin dashboard if user is not authorized
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default AdminProtectedRoute;