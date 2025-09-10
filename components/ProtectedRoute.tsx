import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    
    // Show loading while authentication is being determined
    if (user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permissões...</p>
                </div>
            </div>
        );
    }
    
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