import React, { useState } from 'react';
import { LOGO_URL, LOGO_URL_FALLBACK } from '../constants';

interface LogoProps {
  className?: string;
  alt?: string;
  onClick?: () => void;
  variant?: 'default' | 'inverted';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-16 object-contain", 
  alt = "Rezuski Imóveis Logo",
  onClick,
  variant = 'default'
}) => {
  const [currentUrl, setCurrentUrl] = useState(LOGO_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  console.log('Logo component rendering with URL:', currentUrl);

  const handleError = (e: any) => {
    console.error('Logo failed to load:', currentUrl, e);
    
    // Skip URLs that contain base64 data as they cause 414 errors
    if (currentUrl.includes('data:image') || currentUrl.includes('base64')) {
      console.log('Skipping base64 URL, trying fallback:', LOGO_URL_FALLBACK);
      setCurrentUrl(LOGO_URL_FALLBACK);
      setUsedFallback(true);
      return;
    }
    
    // Try fallback if not already used
    if (!usedFallback && currentUrl !== LOGO_URL_FALLBACK) {
      console.log('Trying fallback logo:', LOGO_URL_FALLBACK);
      setCurrentUrl(LOGO_URL_FALLBACK);
      setUsedFallback(true);
      return;
    }
    
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('Logo loaded successfully:', currentUrl);
    setHasError(false);
    setIsLoading(false);
  };

  // Show fallback text if both images fail
  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-blue-600 text-white font-bold text-lg rounded`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        Rezuski
      </div>
    );
  }

  return (
    <img 
      src={currentUrl + (currentUrl === LOGO_URL ? '?t=' + Date.now() : '')}
      alt={alt}
      className={`${className} ${variant === 'inverted' ? 'filter brightness-0 invert' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default'
      }}
    />
  );
};

export default Logo;