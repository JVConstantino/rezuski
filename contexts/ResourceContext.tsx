
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
            const { data, error } = await supabase.from('resources').select('*');
            if (error) {
                console.error('Error fetching resources:', error);
                setResources([]);
            } else {
                setResources(data as ResourceDocument[]);
            }
            setLoading(false);
        };
        fetchResources();
    }, []);


    const addResource = async (resource: Omit<ResourceDocument, 'id'>) => {
        const { data, error } = await supabase
            .from('resources')
            .insert([resource])
            .select()
            .single();

        if (error) {
            console.error('Error adding resource:', error);
        } else if (data) {
            setResources(prev => [...prev, data as ResourceDocument]);
        }
    };

    const updateResource = async (updatedResource: ResourceDocument) => {
        const { error } = await supabase
            .from('resources')
            .update(updatedResource)
            .eq('id', updatedResource.id);
        
        if (error) {
            console.error('Error updating resource:', error);
        } else {
            setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
        }
    };

    const deleteResource = async (resourceId: string) => {
        const resourceToDelete = resources.find(r => r.id === resourceId);
        if (resourceToDelete) {
            const filePath = resourceToDelete.fileUrl.substring(resourceToDelete.fileUrl.lastIndexOf('public/') + 7);
            if(filePath) {
                await supabase.storage.from('resource-documents').remove([`public/${filePath}`]);
            }
        }

        const { error } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId);
        
        if (error) {
            console.error('Error deleting resource:', error);
        } else {
            setResources(prev => prev.filter(r => r.id !== resourceId));
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
