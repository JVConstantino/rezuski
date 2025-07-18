
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
        const { id, ...updateData } = updatedResource;
        const { error } = await supabase
            .from('resources')
            .update(updateData)
            .eq('id', id);
        
        if (error) {
            console.error('Error updating resource:', error);
        } else {
            setResources(prev => prev.map(r => r.id === updatedResource.id ? updatedResource : r));
        }
    };

    const deleteResource = async (resourceId: string) => {
        const resourceToDelete = resources.find(r => r.id === resourceId);
        if (!resourceToDelete) return;

        // 1. Delete file from storage
        if (resourceToDelete.fileUrl) {
            const bucketName = 'resource-documents';
            try {
                const url = new URL(resourceToDelete.fileUrl);
                const filePath = url.pathname.split(`/${bucketName}/`)[1];
                if (filePath) {
                    const { error: storageError } = await supabase.storage
                        .from(bucketName)
                        .remove([filePath]);

                    if (storageError) {
                        console.error('Error deleting resource document:', storageError);
                        alert(`Não foi possível remover o documento do armazenamento. Erro: ${storageError.message}. O recurso ainda será excluído.`);
                    }
                }
            } catch (e) {
                console.warn('Could not parse resource URL to delete from storage:', resourceToDelete.fileUrl);
            }
        }
        
        // 2. Delete the resource record from database
        const { error: dbError } = await supabase
            .from('resources')
            .delete()
            .eq('id', resourceId);
        
        if (dbError) {
            console.error('Error deleting resource:', dbError.message);
            alert(`Erro ao excluir recurso: ${dbError.message}`);
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
