
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        // Redireciona para a página inicial se não estiver autenticado
        return <ReactRouterDOM.Navigate to="/" replace />;
    }

    return <ReactRouterDOM.Outlet />;
};

export default ProtectedRoute;