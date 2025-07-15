
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ResourceDocument } from '../types';
import { getInitialResources } from '../constants';

interface ResourceContextType {
    resources: ResourceDocument[];
    addResource: (resource: Omit<ResourceDocument, 'id'>) => Promise<void>;
    updateResource: (updatedResource: ResourceDocument) => Promise<void>;
    deleteResource: (resourceId: string) => Promise<void>;
    loading: boolean;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [resources, setResources] = useState<ResourceDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setResources(getInitialResources());
            setLoading(false);
        }, 100);
    }, []);


    const addResource = async (resource: Omit<ResourceDocument, 'id'>) => {
        const newResource = { ...resource, id: `res-${Date.now()}` };
        setResources(prev => [...prev, newResource]);
    };

    const updateResource = async (updatedResource: ResourceDocument) => {
        setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
    };

    const deleteResource = async (resourceId: string) => {
        setResources(prev => prev.filter(r => r.id !== resourceId));
    };

    return (
        <ResourceContext.Provider value={{ resources, addResource, updateResource, deleteResource, loading }}>
            {!loading && children}
        </ResourceContext.Provider>
    );
};

export const useResources = () => {
    const context = useContext(ResourceContext);
    if (context === undefined) {
        throw new Error('useResources must be used within a ResourceProvider');
    }
    return context;
};