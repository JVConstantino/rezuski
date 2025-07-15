import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        // Redireciona para a página inicial se não estiver autenticado
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;