
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
        const { id, ...updateData } = updatedBroker;
        const { error } = await supabase
            .from('brokers')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Error updating broker:', error);
        } else {
            setBrokers(prev => prev.map(b => b.id === updatedBroker.id ? updatedBroker : b));
        }
    };

    const deleteBroker = async (brokerId: string) => {
        const brokerToDelete = brokers.find(b => b.id === brokerId);
        if (!brokerToDelete) return;

        // 1. Delete avatar from storage
        if (brokerToDelete.avatarUrl) {
            const bucketName = 'property-images'; // As per BrokerForm logic
            try {
                const url = new URL(brokerToDelete.avatarUrl);
                const filePath = url.pathname.split(`/${bucketName}/`)[1];
                if (filePath) {
                    const { error: storageError } = await supabase.storage
                        .from(bucketName)
                        .remove([filePath]);
                    if (storageError) {
                        console.error('Error deleting broker avatar:', storageError.message);
                        // We log and proceed, not blocking the DB deletion.
                    }
                }
            } catch (e) {
                console.warn('Could not parse avatar URL to delete from storage:', brokerToDelete.avatarUrl);
            }
        }

        // 2. Delete the broker record from the database
        const { error: dbError } = await supabase
            .from('brokers')
            .delete()
            .eq('id', brokerId);
        
        if (dbError) {
            console.error('Error deleting broker:', dbError);
            alert(`Erro ao remover corretor: ${dbError.message}`);
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
