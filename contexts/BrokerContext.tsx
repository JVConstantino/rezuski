
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Broker } from '../types';
import { BROKERS } from '../constants';

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
        setLoading(true);
        setTimeout(() => {
            setBrokers(BROKERS);
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