

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ItemToMove {
    name: string;
    isFolder: boolean;
}
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
    moveItems: (items: ItemToMove[], destinationPath: string) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const BUCKET_NAME = 'property-images';
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [currentPath, setCurrentPath] = useState('public');
    const [loading, setLoading] = useState(true);

    const listAllFiles = async (path: string): Promise<string[]> => {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path);
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

    const fetchItemsForPath = async (path: string) => {
        setLoading(true);
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
            limit: 200,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        });

        if (error) {
            console.error(`Error listing storage items for path "${path}":`, error);
            setGalleryItems([]);
        } else if (data) {
            const itemsWithUrls = data.map(item => {
                if (item.id !== null) {
                    const fullPath = `${path}/${item.name}`;
                    const { data: { publicUrl } } = supabase.storage
                        .from(BUCKET_NAME)
                        .getPublicUrl(fullPath);
                    return { ...item, publicUrl };
                }
                return item;
            });

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
            return supabase.storage.from(BUCKET_NAME).upload(filePath, file);
        });

        await Promise.all(uploadPromises);
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
        await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, new Blob(['']));
        refresh();
    };
    
    const deleteFile = async (filePath: string) => {
        setLoading(true);
        await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);
        refresh();
    };
    
    const deleteFolder = async (folderPath: string) => {
        setLoading(true);
        const filesToDelete = await listAllFiles(folderPath);

        if (filesToDelete.length === 0) {
            filesToDelete.push(`${folderPath}/.emptyFolder`);
        }
        
        await supabase.storage
            .from(BUCKET_NAME)
            .remove(filesToDelete);
        
        refresh();
    };

    const moveItems = async (items: ItemToMove[], destinationPath: string) => {
        setLoading(true);
    
        for (const item of items) {
            const fromPath = `${currentPath}/${item.name}`;
            
            // Skip if trying to move into itself or the same directory
            if (fromPath === destinationPath || destinationPath.startsWith(fromPath + '/')) {
                console.warn(`Skipping move of ${item.name}: cannot move into itself.`);
                continue;
            }
    
            if (item.isFolder) {
                const filesToMove = await listAllFiles(fromPath);
                if (filesToMove.length === 0) {
                    filesToMove.push(`${fromPath}/.emptyFolder`);
                }
    
                for (const oldFilePath of filesToMove) {
                    const relativePath = oldFilePath.substring(fromPath.length);
                    const newFilePath = `${destinationPath}/${item.name}${relativePath}`;
                    const { error } = await supabase.storage.from(BUCKET_NAME).move(oldFilePath, newFilePath);
                    if (error) {
                        console.error(`Error moving file ${oldFilePath} to ${newFilePath}:`, error);
                    }
                }
            } else { // It's a file
                const newFilePath = `${destinationPath}/${item.name}`;
                const { error } = await supabase.storage.from(BUCKET_NAME).move(fromPath, newFilePath);
                if (error) {
                    console.error(`Error moving file ${fromPath} to ${newFilePath}:`, error);
                }
            }
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
        <ImageContext.Provider value={{ galleryItems, currentPath, setPath, refresh, loading, uploadFiles, createFolder, deleteFile, deleteFolder, moveItems }}>
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
