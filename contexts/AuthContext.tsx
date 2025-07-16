

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = ReactRouterDOM.useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await updateUserState(session);
            setLoading(false);
        };
        
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, session: Session | null) => {
                await updateUserState(session);
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
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            // Handle case where profile doesn't exist (e.g., new user)
            // PGRST116 error code from PostgREST means no rows were found
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error.message);
                setUser(null);
                return;
            }

            if (profile) {
                // If profile exists, map it to our app's User type
                const appUser: User = {
                    id: profile.id,
                    email: session.user.email!,
                    name: profile.name || session.user.email!,
                    avatarUrl: profile.avatarUrl || `https://avatar.vercel.sh/${session.user.email!}.svg`,
                    role: profile.role as UserRole,
                };
                setUser(appUser);
            } else {
                // If no profile exists, the user is authenticated with Supabase but not a valid user in our app's public.profiles table.
                // For an admin panel, this is an invalid state. We log a warning and treat them as not logged in.
                console.warn(`Authentication successful, but no profile found for user ID: ${session.user.id}. Please ensure a profile exists in the 'profiles' table.`);
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }

    const login = async (email: string, password?: string) => {
        if (!password) {
            alert('Password is required for login.');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            // Successful Supabase login will trigger onAuthStateChange,
            // which handles fetching the profile and setting the user state.
            closeLoginModal();
            navigate('/admin/dashboard', { replace: true });
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            alert(error.message);
        }
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