
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ImageContextType {
    galleryImages: string[];
    addImages: (newImages: string[]) => void;
    loading: boolean;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchGalleryImages = () => {
        setLoading(true);
        const mockImages = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/seed/gallery${i + 1}/400/400`);
        setGalleryImages(mockImages);
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