

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ImageContextType {
    galleryItems: any[];
    currentPath: string;
    setPath: (path: string) => void;
    refresh: () => void;
    loading: boolean;
    uploadFiles: (files: FileList, path: string) => Promise<void>;
    createFolder: (folderName: string) => Promise<void>;
    deleteFile: (filePath: string) => Promise<void>;
    deleteFolder: (folderPath: string) => Promise<void>;
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
    
    const refresh = () => {
        fetchItemsForPath(currentPath);
    };

    const uploadFiles = async (files: FileList, path: string) => {
        if (!files.length) return;

        setLoading(true);
        const uploadPromises = Array.from(files).map(file => {
            const filePath = `${path}/${file.name}`;
            return supabase.storage.from('property-images').upload(filePath, file);
        });

        const results = await Promise.all(uploadPromises);
        const errors = results.filter(result => result.error);

        if (errors.length > 0) {
            console.error('Errors uploading files:', errors);
            alert(`Falha ao enviar ${errors.length} de ${files.length} arquivos.`);
        }
        refresh();
    };

    const createFolder = async (folderName: string) => {
        if (!folderName.trim()) {
            alert('Nome da pasta não pode ser vazio.');
            return;
        }
        const cleanFolderName = folderName.trim().replace(/[/\\?%*:|"<>]/g, '-');
        const filePath = `${currentPath}/${cleanFolderName}/.emptyFolder`;
        
        setLoading(true);
        const { error } = await supabase.storage
            .from('property-images')
            .upload(filePath, new Blob(['']));

        if (error) {
            console.error('Error creating folder:', error);
            alert(`Erro ao criar pasta: ${error.message}`);
        }
        refresh();
    };
    
    const deleteFile = async (filePath: string) => {
        setLoading(true);
        const { error } = await supabase.storage
            .from('property-images')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting file:', error);
            alert(`Erro ao deletar arquivo: ${error.message}`);
        }
        refresh();
    };

    const listAllFiles = async (path: string): Promise<string[]> => {
        const { data, error } = await supabase.storage.from('property-images').list(path);
        if (error) {
            console.error(`Error listing files for deletion in ${path}:`, error);
            return [];
        }
    
        const filePaths: string[] = [];
        for (const file of data) {
            const fullPath = `${path}/${file.name}`;
            if (file.id === null) { // It's a folder
                const subFiles = await listAllFiles(fullPath);
                filePaths.push(...subFiles);
            } else {
                filePaths.push(fullPath);
            }
        }
        return filePaths;
    };
    
    const deleteFolder = async (folderPath: string) => {
        setLoading(true);
        const filesToDelete = await listAllFiles(folderPath);

        if (filesToDelete.length === 0) {
            filesToDelete.push(`${folderPath}/.emptyFolder`);
        }
        
        const { error } = await supabase.storage
            .from('property-images')
            .remove(filesToDelete);
        
        if (error && !(error.message.includes('Not Found') && filesToDelete.length === 1)) {
            console.error('Error deleting folder contents:', error);
            alert(`Erro ao deletar a pasta e seu conteúdo: ${error.message}`);
        }
        refresh();
    };

    useEffect(() => {
        fetchItemsForPath(currentPath);
    }, [currentPath]);

    const setPath = (newPath: string) => {
        if (newPath.startsWith('public')) {
            setCurrentPath(newPath);
        } else {
            setCurrentPath('public');
        }
    };
    
    return (
        <ImageContext.Provider value={{ galleryItems, currentPath, setPath, refresh, loading, uploadFiles, createFolder, deleteFile, deleteFolder }}>
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