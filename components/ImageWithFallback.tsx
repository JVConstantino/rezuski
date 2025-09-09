import React, { useState } from 'react';
import { BuildingIcon } from './Icons';
import { getCategoryIcon } from '../utils/categoryIconMapping';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
  categoryName?: string; // Nome da categoria para mapeamento automático
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon,
  onError,
  categoryName
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Determina o ícone de fallback
  const getFallbackIcon = () => {
    if (fallbackIcon) {
      return fallbackIcon;
    }
    
    if (categoryName) {
      const IconComponent = getCategoryIcon(categoryName);
      return <IconComponent className="w-8 h-8" />;
    }
    
    return <BuildingIcon className="w-8 h-8" />;
  };

  if (hasError || !src) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        {getFallbackIcon()}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`flex items-center justify-center bg-slate-100 ${className}`}>
          <div className="animate-pulse bg-slate-200 w-full h-full rounded"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </>
  );
};

export default ImageWithFallback;