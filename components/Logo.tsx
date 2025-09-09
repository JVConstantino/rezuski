import React, { useState } from 'react';
import { LOGO_URL, LOGO_URL_FALLBACK, LOGO_URL_SUPABASE } from '../constants';

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
  const [currentSrc, setCurrentSrc] = useState(LOGO_URL);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    if (retryCount === 0 && currentSrc !== LOGO_URL_SUPABASE) {
      // First fallback: try Supabase URL
      setCurrentSrc(LOGO_URL_SUPABASE);
      setRetryCount(1);
    } else if (retryCount === 1 && currentSrc !== LOGO_URL_FALLBACK) {
      // Second fallback: use local fallback
      setCurrentSrc(LOGO_URL_FALLBACK);
      setRetryCount(2);
    } else {
      // Final fallback: show text logo
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-primary-blue text-white font-bold text-xl px-4 py-2 rounded ${className}`}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        REZUSKI
      </div>
    );
  }

  return (
    <img 
      src={currentSrc}
      alt={alt}
      className={`${className} ${variant === 'inverted' ? 'filter brightness-0 invert' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
};

export default Logo;