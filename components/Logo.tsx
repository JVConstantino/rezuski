import React, { useState } from 'react';
import { LOGO_URL } from '../constants';

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
  // Use the Supabase logo URL
  const logoUrl = LOGO_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  console.log('Logo component rendering with URL:', logoUrl);

  const handleError = (e: any) => {
    console.error('Logo failed to load:', logoUrl, e);
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    console.log('Logo loaded successfully:', logoUrl);
    setHasError(false);
    setIsLoading(false);
  };

  // Always render the image, no fallback to text
  return (
    <img 
      src={logoUrl + '?t=' + Date.now()}
      alt={alt}
      className={`${className} ${variant === 'inverted' ? 'filter brightness-0 invert' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      crossOrigin="anonymous"
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        display: hasError ? 'none' : 'block'
      }}
    />
  );
};

export default Logo;