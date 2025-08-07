import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabaseClient';

interface UserContextType {
    users: User[];
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email, avatarUrl, role');

            if (error) {
                console.error('Error fetching users:', error);
                setUsers([]);
            } else {
                const fetchedUsers: User[] = data.map(profile => ({
                    id: profile.id,
                    email: profile.email,
                    name: profile.name || profile.email,
                    avatarUrl: profile.avatarUrl || `https://avatar.vercel.sh/${profile.email}.svg`,
                    role: profile.role,
                }));
                setUsers(fetchedUsers);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider value={{ users, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUsers must be used within a UserProvider');
    }
    return context;
};
