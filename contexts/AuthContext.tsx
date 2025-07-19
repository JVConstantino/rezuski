
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';

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

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
        
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
    
    const isAuthenticated = !!user && user.role === UserRole.ADMIN;

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