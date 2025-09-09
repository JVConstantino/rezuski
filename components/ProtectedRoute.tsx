import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    
    if (!isAuthenticated) {
        // Redirect to home page if not authenticated
        return <Navigate to="/" replace />;
    }
    
    // Additional check for admin role
    if (user && user.role !== 'ADMIN') {
        // Redirect to home page if not admin
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;