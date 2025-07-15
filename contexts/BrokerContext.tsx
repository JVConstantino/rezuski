
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
            try {
                const { data, error } = await supabase
                    .from('brokers')
                    .select('*')
                    .order('name');

                if (error) {
                    console.error('Error fetching brokers:', error);
                    setBrokers([]);
                } else {
                    setBrokers(data || []);
                }
            } catch (error) {
                console.error('Error fetching brokers:', error);
                setBrokers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrokers();
    }, []);

    const addBroker = async (broker: Omit<Broker, 'id'>): Promise<Broker | null> => {
        try {
            const { data, error } = await supabase
                .from('brokers')
                .insert([broker])
                .select()
                .single();

            if (error) {
                console.error('Error adding broker:', error);
                throw error;
            }

            setBrokers(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error adding broker:', error);
            throw error;
        }
    };

    const updateBroker = async (updatedBroker: Broker) => {
        try {
            const { error } = await supabase
                .from('brokers')
                .update(updatedBroker)
                .eq('id', updatedBroker.id);

            if (error) {
                console.error('Error updating broker:', error);
                throw error;
            }

            setBrokers(prev => prev.map(b => b.id === updatedBroker.id ? updatedBroker : b));
        } catch (error) {
            console.error('Error updating broker:', error);
            throw error;
        }
    };

    const deleteBroker = async (brokerId: string) => {
        try {
            const { error } = await supabase
                .from('brokers')
                .delete()
                .eq('id', brokerId);

            if (error) {
                console.error('Error deleting broker:', error);
                throw error;
            }

            setBrokers(prev => prev.filter(b => b.id !== brokerId));
        } catch (error) {
            console.error('Error deleting broker:', error);
            throw error;
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
            setLoading(false);
        }, 100);
    }, []);

    const addBroker = async (broker: Omit<Broker, 'id'>): Promise<Broker | null> => {
        const newBroker = { ...broker, id: `broker-${Date.now()}` };
        setBrokers(prev => [...prev, newBroker]);
        return newBroker;
    };

    const updateBroker = async (updatedBroker: Broker) => {
        setBrokers(prev => prev.map(b => b.id === updatedBroker.id ? updatedBroker : b));
    };

    const deleteBroker = async (brokerId: string) => {
        setBrokers(prev => prev.filter(b => b.id !== brokerId));
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