
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Property, PropertyStatus } from '../types';
import { PROPERTIES } from '../constants';

interface PropertyContextType {
    properties: Property[];
    addProperty: (property: Property) => Promise<void>;
    updateProperty: (updatedProperty: Property) => Promise<void>;
    toggleArchiveProperty: (propertyId: string) => Promise<void>;
    loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Simulate async fetch with a small delay
        setTimeout(() => {
            setProperties(PROPERTIES as Property[]);
            setLoading(false);
        }, 200);
    }, []);

    const addProperty = async (property: Property) => {
        const newProperty = { ...property, id: `prop-${Date.now()}` };
        setProperties(prev => [newProperty, ...prev]);
    };

    const updateProperty = async (updatedProperty: Property) => {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
    };
    
    const toggleArchiveProperty = async (propertyId: string) => {
        const propertyToToggle = properties.find(p => p.id === propertyId);
        if (!propertyToToggle) return;

        const newStatus = propertyToToggle.status === PropertyStatus.ARCHIVED ? PropertyStatus.AVAILABLE : PropertyStatus.ARCHIVED;
        
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status: newStatus } : p));
    }

    return (
        <PropertyContext.Provider value={{ properties, addProperty, updateProperty, toggleArchiveProperty, loading }}>
            {!loading && children}
        </PropertyContext.Provider>
    );
};

export const useProperties = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error('useProperties must be used within a PropertyProvider');
    }
    return context;
};