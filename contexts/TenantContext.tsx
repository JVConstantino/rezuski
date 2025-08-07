import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Tenant } from '../types';
import { supabase } from '../lib/supabaseClient';

interface TenantContextType {
    tenants: Tenant[];
    loading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenants = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('tenants').select('*').order('leaseEndDate', { ascending: true });
            if (error) {
                console.error('Error fetching tenants:', error);
                setTenants([]);
            } else {
                setTenants(data as Tenant[]);
            }
            setLoading(false);
        };
        fetchTenants();
    }, []);

    return (
        <TenantContext.Provider value={{ tenants, loading }}>
            {!loading && children}
        </TenantContext.Provider>
    );
};

export const useTenants = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenants must be used within a TenantProvider');
    }
    return context;
};
