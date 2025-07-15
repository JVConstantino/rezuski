
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { ResourceDocument } from '../types';
import { supabase } from '../lib/supabaseClient';

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
        const fetchResources = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('resources')
                    .select('*')
                    .order('title');

                if (error) {
                    console.error('Error fetching resources:', error);
                    setResources([]);
                } else {
                    setResources(data || []);
                }
            } catch (error) {
                console.error('Error fetching resources:', error);
                setResources([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const addResource = async (resource: Omit<ResourceDocument, 'id'>) => {
        try {
            const { data, error } = await supabase
                .from('resources')
                .insert([resource])
                .select()
                .single();

            if (error) {
                console.error('Error adding resource:', error);
                throw error;
            }

            setResources(prev => [...prev, data]);
        } catch (error) {
            console.error('Error adding resource:', error);
            throw error;
        }
    };

    const updateResource = async (updatedResource: ResourceDocument) => {
        try {
            const { error } = await supabase
                .from('resources')
                .update(updatedResource)
                .eq('id', updatedResource.id);

            if (error) {
                console.error('Error updating resource:', error);
                throw error;
            }

            setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
        } catch (error) {
            console.error('Error updating resource:', error);
            throw error;
        }
    };

    const deleteResource = async (resourceId: string) => {
        try {
            const { error } = await supabase
                .from('resources')
                .delete()
                .eq('id', resourceId);

            if (error) {
                console.error('Error deleting resource:', error);
                throw error;
            }

            setResources(prev => prev.filter(r => r.id !== resourceId));
        } catch (error) {
            console.error('Error deleting resource:', error);
            throw error;
        }
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