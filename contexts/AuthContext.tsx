
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { USERS } from '../constants'; // Use mock data

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoginModalOpen: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const login = async (email: string, password?: string) => {
        if (!password) {
            alert('A senha é obrigatória para o login.');
            return;
        }

        const foundUser = USERS.find(u => u.email === email && u.role === UserRole.ADMIN);
        
        // Simple password check for mock environment
        if (foundUser && password === 'admin') {
            setUser(foundUser);
            closeLoginModal();
            navigate('/admin/dashboard', { replace: true });
        } else {
            alert('Credenciais inválidas ou o usuário não é um administrador.');
        }
    };

    const logout = async () => {
        setUser(null);
        navigate('/');
    };

    const openLoginModal = () => setLoginModalOpen(true);
    const closeLoginModal = () => setLoginModalOpen(false);
    
    // An user is only authenticated in the app if they have a user object AND their role is ADMIN.
    const isAuthenticated = !!user && user.role === UserRole.ADMIN;

    const value = { isAuthenticated, user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};