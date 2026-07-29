import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Application } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ApplicationContextType {
    applications: Application[];
    loading: boolean;
    addApplication: (application: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => Promise<Application>;
    updateApplication: (id: string, updates: Partial<Application>) => Promise<Application>;
    deleteApplication: (id: string) => Promise<void>;
    refreshApplications: () => Promise<void>;
}

interface CacheData {
    data: Application[];
    timestamp: number;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export const ApplicationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [cache, setCache] = useState<CacheData | null>(null);

    const isCacheValid = (cacheData: CacheData): boolean => {
        return Date.now() - cacheData.timestamp < CACHE_TTL;
    };

    const clearCache = () => {
        setCache(null);
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);

            // Check if we have valid cached data
            if (cache && isCacheValid(cache)) {
                setApplications(cache.data);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.from('applications').select('*').order('applicationDate', { ascending: false });
            if (error) {
                console.error('Error fetching applications:', error);
                setApplications([]);
            } else {
                const applicationsData = data as any[] as Application[];
                setApplications(applicationsData);
                
                // Cache the data
                setCache({
                    data: applicationsData,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error in fetchApplications:', error);
        } finally {
            setLoading(false);
        }
    };

    const addApplication = async (applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at'>) => {
        const { data, error } = await supabase
            .from('applications')
            .insert([applicationData])
            .select()
            .single();

        if (error) {
            console.error('Error adding application:', error);
            throw error;
        }

        clearCache(); // Clear cache when data changes
        await fetchApplications();
        return data;
    };

    const updateApplication = async (id: string, updates: Partial<Application>) => {
        const { data, error } = await supabase
            .from('applications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating application:', error);
            throw error;
        }

        clearCache(); // Clear cache when data changes
        await fetchApplications();
        return data;
    };

    const deleteApplication = async (id: string) => {
        const { error } = await supabase
            .from('applications')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting application:', error);
            throw error;
        }

        clearCache(); // Clear cache when data changes
        await fetchApplications();
    };

    const refreshApplications = async () => {
        clearCache(); // Clear cache to force fresh data
        await fetchApplications();
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <ApplicationContext.Provider value={{ 
            applications, 
            loading, 
            addApplication, 
            updateApplication, 
            deleteApplication, 
            refreshApplications 
        }}>
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
