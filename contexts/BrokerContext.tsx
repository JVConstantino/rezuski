
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Broker } from '../types';
import { supabase } from '../lib/supabaseClient';

interface BrokerContextType {
    brokers: Broker[];
    addBroker: (broker: Omit<Broker, 'id'>) => Promise<Broker | null>;
    updateBroker: (updatedBroker: Broker) => Promise<void>;
    deleteBroker: (brokerId: string) => Promise<void>;
    loading: boolean;
}

const BrokerContext = createContext<BrokerContextType | undefined>(undefined);

export const BrokerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [brokers, setBrokers] = useState<Broker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrokers = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('brokers').select('*');
            if (error) {
                console.error('Error fetching brokers:', error);
                setBrokers([]);
            } else {
                setBrokers(data as Broker[]);
            }
            setLoading(false);
        };
        fetchBrokers();
    }, []);

    const addBroker = async (broker: Omit<Broker, 'id'>) => {
        const { data, error } = await supabase
            .from('brokers')
            .insert([broker])
            .select()
            .single();
        
        if (error) {
            console.error('Error adding broker:', error);
            return null;
        }
        if (data) {
            setBrokers(prev => [...prev, data as Broker]);
            return data as Broker;
        }
        return null;
    };

    const updateBroker = async (updatedBroker: Broker) => {
        const { error } = await supabase
            .from('brokers')
            .update(updatedBroker)
            .eq('id', updatedBroker.id);

        if (error) {
            console.error('Error updating broker:', error);
        } else {
            setBrokers(prev => prev.map(b => b.id === updatedBroker.id ? updatedBroker : b));
        }
    };

    const deleteBroker = async (brokerId: string) => {
        const { error } = await supabase
            .from('brokers')
            .delete()
            .eq('id', brokerId);
        
        if (error) {
            console.error('Error deleting broker:', error);
        } else {
            setBrokers(prev => prev.filter(b => b.id !== brokerId));
        }
    };

    return (
        <BrokerContext.Provider value={{ brokers, addBroker, updateBroker, deleteBroker, loading }}>
            {!loading && children}
        </BrokerContext.Provider>
    );
};

export const useBrokers = () => {
    const context = useContext(BrokerContext);
    if (context === undefined) {
        throw new Error('useBrokers must be used within a BrokerProvider');
    }
    return context;
};
