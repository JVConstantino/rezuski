
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoginModalOpen: boolean;
    login: (email: string, password?: string) => Promise<void>;
    logout: () => void;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await updateUserState(session);
            setLoading(false);
        };
        
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                updateUserState(session);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const updateUserState = async (session: Session | null) => {
        if (session?.user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('id, name, email, avatarUrl, role')
                .eq('id', session.user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error.message);
                setUser(null);
                return;
            }

            if (profile) {
                const appUser: User = {
                    id: profile.id,
                    email: session.user.email!,
                    name: profile.name || session.user.email!,
                    avatarUrl: profile.avatarUrl || `https://avatar.vercel.sh/${session.user.email!}.svg`,
                    role: profile.role as UserRole,
                };
                setUser(appUser);
            } else {
                console.warn(`Authentication successful, but no profile found for user ID: ${session.user.id}. Please ensure a profile exists in the 'profiles' table.`);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }

    const login = async (email: string, password?: string) => {
        if (!password) {
            throw new Error('A senha é obrigatória.');
        }

        // 1. Sign in to get the session
        const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            throw signInError;
        }

        if (!sessionData.session?.user) {
            throw new Error('Login falhou, sessão não encontrada.');
        }

        // 2. Fetch the user's profile to verify role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, name, email, avatarUrl, role')
            .eq('id', sessionData.session.user.id)
            .single();

        if (profileError) {
            await supabase.auth.signOut(); // Log out if profile is missing
            console.error('Error fetching profile after login:', profileError.message);
            throw new Error('Falha ao carregar os dados do perfil.');
        }

        // 3. Check if user is an admin
        if (profile.role !== 'ADMIN') {
            await supabase.auth.signOut(); // Log out non-admin users
            throw new Error('Acesso negado. Apenas administradores podem entrar.');
        }

        // 4. Construct and set the user object in state
        const appUser: User = {
            id: profile.id,
            email: sessionData.session.user.email!,
            name: profile.name || sessionData.session.user.email!,
            avatarUrl: profile.avatarUrl || `https://avatar.vercel.sh/${sessionData.session.user.email!}.svg`,
            role: profile.role as UserRole,
        };
        setUser(appUser);

        // 5. Close modal and navigate to the dashboard
        closeLoginModal();
        navigate('/admin/dashboard', { replace: true });
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert(error.message);
        }
        setUser(null);
        navigate('/');
    };
    
    const sendPasswordResetEmail = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Or a specific password reset page
        });

        if (error) {
            // Don't expose specific Supabase errors to the user for security
            console.error('Password reset error:', error);
            throw new Error('Não foi possível enviar o email de recuperação.');
        }
    };

    const openLoginModal = () => setLoginModalOpen(true);
    const closeLoginModal = () => setLoginModalOpen(false);
    
    const isAuthenticated = !!user && user.role === 'ADMIN';

    const value = { isAuthenticated, user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal, sendPasswordResetEmail };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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