import React from 'react';
import { useStorageConfig } from '../contexts/StorageConfigContext';
import { getImageUrl } from '../lib/storageClient';

interface StorageImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
}

const StorageImage: React.FC<StorageImageProps> = ({ src, alt, ...props }) => {
    const { activeConfig } = useStorageConfig();
    
    // Convert relative path to full URL using active storage configuration
    const imageUrl = React.useMemo(() => {
        if (!src) return '';
        
        return getImageUrl(
            src, 
            activeConfig?.storage_url, 
            activeConfig?.bucket_name
        );
    }, [src, activeConfig]);
    
    return <img src={imageUrl} alt={alt} {...props} />;
};

export default StorageImage;