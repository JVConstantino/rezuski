
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

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

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile && profile.role === UserRole.ADMIN) {
                    setUser({
                        id: profile.id,
                        email: profile.email,
                        role: profile.role,
                        name: profile.name,
                        avatarUrl: profile.avatarUrl
                    });
                }
            }
        };
        
        checkSession();
    }, []);

    const login = async (email: string, password?: string) => {
        if (!password) {
            alert('A senha é obrigatória para o login.');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // Fetch user profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                if (profile && profile.role === UserRole.ADMIN) {
                    setUser({
                        id: profile.id,
                        email: profile.email,
                        role: profile.role,
                        name: profile.name,
                        avatarUrl: profile.avatarUrl
                    });
                    closeLoginModal();
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    throw new Error('Usuário não é um administrador.');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Erro no login. Verifique suas credenciais.');
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            setUser(null);
            navigate('/');
        }
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