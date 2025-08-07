import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Application } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ApplicationContextType {
    applications: Application[];
    loading: boolean;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('applications').select('*').order('applicationDate', { ascending: false });
            if (error) {
                console.error('Error fetching applications:', error);
                setApplications([]);
            } else {
                setApplications(data as any[] as Application[]);
            }
            setLoading(false);
        };
        fetchApplications();
    }, []);

    return (
        <ApplicationContext.Provider value={{ applications, loading }}>
            {!loading && children}
        </ApplicationContext.Provider>
    );
};

export const useApplications = () => {
    const context = useContext(ApplicationContext);
    if (context === undefined) {
        throw new Error('useApplications must be used within an ApplicationProvider');
    }
    return context;
};
