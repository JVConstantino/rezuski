
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ImageContextType {
    galleryItems: any[];
    currentPath: string;
    setPath: (path: string) => void;
    refresh: () => void;
    loading: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [currentPath, setCurrentPath] = useState('public');
    const [loading, setLoading] = useState(true);

    const fetchItemsForPath = async (path: string) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('property-images').list(path, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            console.error(`Error listing storage items for path "${path}":`, error);
            setGalleryItems([]);
        } else if (data) {
            const itemsWithUrls = data.map(item => {
                // if id is null, it's a folder
                if (item.id !== null) {
                    const fullPath = `${path}/${item.name}`;
                    const { data: { publicUrl } } = supabase.storage
                        .from('property-images')
                        .getPublicUrl(fullPath);
                    return { ...item, publicUrl };
                }
                return item;
            });

            // Sort folders first, then by name
            const sortedData = itemsWithUrls.sort((a, b) => {
                const aIsFolder = a.id === null;
                const bIsFolder = b.id === null;
                if (aIsFolder && !bIsFolder) return -1;
                if (!aIsFolder && bIsFolder) return 1;
                return a.name.localeCompare(b.name);
            });
            
            setGalleryItems(sortedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItemsForPath(currentPath);
    }, [currentPath]);

    const setPath = (newPath: string) => {
        setCurrentPath(newPath);
    };

    const refresh = () => {
        fetchItemsForPath(currentPath);
    };
    
    return (
        <ImageContext.Provider value={{ galleryItems, currentPath, setPath, refresh, loading }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if (context === undefined) {
        throw new Error('useImages must be used within an ImageProvider');
    }
    return context;
};
