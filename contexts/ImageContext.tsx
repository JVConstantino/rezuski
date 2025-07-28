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

const PLACEHOLDER_FILE = '.emptyFolder';

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
        try {
            const { data: listData, error } = await supabase.storage.from(BUCKET_NAME).list(path, {
                limit: 200,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });
    
            if (error) {
                console.error(`Error listing storage items for path "${path}":`, error);
                setGalleryItems([]);
                return; // Exit early, finally will run
            }
    
            if (!listData) {
                // This case should ideally not happen if error is null, but as a safeguard.
                setGalleryItems([]);
                return; // Exit early, finally will run
            }
    
            const itemsWithUrls = listData
                .filter(item => item && item.name !== PLACEHOLDER_FILE) // Add a check for item
                .map(item => {
                    if (item.id !== null) { // It's a file
                        const fullPath = `${path}/${item.name}`;
                        const { data: urlData } = supabase.storage
                            .from(BUCKET_NAME)
                            .getPublicUrl(fullPath);
                        
                        // The safest check for publicUrl
                        if (urlData && typeof urlData.publicUrl === 'string') {
                            return { ...item, publicUrl: urlData.publicUrl };
                        }
                        // If we can't get a URL, we can't use the image.
                        // We return null and filter it out later.
                        return null;
                    }
                    return item; // It's a folder
                });
    
            const validItems = itemsWithUrls.filter(Boolean);
    
            const sortedData = validItems.sort((a, b) => {
                if (!a || !b) return 0; // Should not happen with filter
                const aIsFolder = a.id === null;
                const bIsFolder = b.id === null;
                if (aIsFolder && !bIsFolder) return -1;
                if (!aIsFolder && bIsFolder) return 1;
                return a.name.localeCompare(b.name);
            });
            
            setGalleryItems(sortedData as any[]);
        } catch (e) {
            console.error("An exception occurred while fetching gallery items:", e);
            setGalleryItems([]);
        } finally {
            setLoading(false);
        }
    };
    
    const refresh = () => {
        fetchItemsForPath(currentPath);
    };

    const ensureFolderExists = async (folderPath: string) => {
        if (folderPath === 'public' || folderPath === '') return;

        const { data: remainingItems, error: listError } = await supabase.storage
            .from(BUCKET_NAME)
            .list(folderPath);

        if (listError) {
            console.error(`Error checking folder emptiness for ${folderPath}:`, listError);
            return;
        }

        const hasFiles = remainingItems.some(item => item.id !== null && item.name !== PLACEHOLDER_FILE);

        if (!hasFiles) {
            await supabase.storage
                .from(BUCKET_NAME)
                .upload(`${folderPath}/${PLACEHOLDER_FILE}`, new Blob(['']), { upsert: true });
        }
    };

    const removePlaceholderIfNeeded = async (folderPath: string) => {
         await supabase.storage
            .from(BUCKET_NAME)
            .remove([`${folderPath}/${PLACEHOLDER_FILE}`]);
    };

    const uploadFiles = async (files: FileList, path: string) => {
        if (!files.length) return;

        setLoading(true);
        await removePlaceholderIfNeeded(path);
        
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
        const filePath = `${currentPath}/${cleanFolderName}/${PLACEHOLDER_FILE}`;
        
        setLoading(true);
        await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, new Blob(['']));
        refresh();
    };
    
    const deleteFile = async (filePath: string) => {
        setLoading(true);
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (!error) {
            const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
            await ensureFolderExists(parentPath);
        } else {
            console.error(`Error deleting file ${filePath}:`, error);
        }
        
        refresh();
    };
    
    const deleteFolder = async (folderPath: string) => {
        setLoading(true);
        let filesToDelete = await listAllFiles(folderPath);

        if (filesToDelete.length === 0) {
            filesToDelete.push(`${folderPath}/${PLACEHOLDER_FILE}`);
        }
        
        await supabase.storage
            .from(BUCKET_NAME)
            .remove(filesToDelete);
        
        refresh();
    };

    const moveItems = async (items: ItemToMove[], destinationPath: string) => {
        setLoading(true);
    
        await removePlaceholderIfNeeded(destinationPath);

        for (const item of items) {
            const fromPath = `${currentPath}/${item.name}`;
            
            if (fromPath === destinationPath || (item.isFolder && destinationPath.startsWith(fromPath + '/'))) {
                console.warn(`Skipping move of ${item.name}: cannot move into itself.`);
                continue;
            }
    
            if (item.isFolder) {
                let filesToMove = await listAllFiles(fromPath);
                if (filesToMove.length === 0) {
                    filesToMove.push(`${fromPath}/${PLACEHOLDER_FILE}`);
                }
    
                for (const oldFilePath of filesToMove) {
                    const relativePath = oldFilePath.substring(fromPath.length);
                    const newFilePath = `${destinationPath}/${item.name}${relativePath}`;
                    await supabase.storage.from(BUCKET_NAME).move(oldFilePath, newFilePath);
                }
            } else { // It's a file
                const newFilePath = `${destinationPath}/${item.name}`;
                await supabase.storage.from(BUCKET_NAME).move(fromPath, newFilePath);
            }
        }
        
        await ensureFolderExists(currentPath);
        
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