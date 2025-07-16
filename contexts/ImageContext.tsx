
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ImageContextType {
    galleryImages: string[];
    addImages: (newImages: string[]) => void;
    loading: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGalleryImages = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.from('property-images').list('public', {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) {
            console.error('Error listing storage images:', error);
            setGalleryImages([]);
        } else if (data) {
            const urls = data.map(file => {
                return supabase.storage.from('property-images').getPublicUrl(`public/${file.name}`).data.publicUrl;
            });
            setGalleryImages(urls);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchGalleryImages();
    }, []);

    const addImages = (newImages: string[]) => {
        setGalleryImages(prevImages => {
            const combined = [...newImages, ...prevImages];
            const uniqueImages = [...new Set(combined)];
            return uniqueImages;
        });
    };
    
    return (
        <ImageContext.Provider value={{ galleryImages, addImages, loading }}>
            {!loading && children}
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
