import React, { useState, useEffect } from 'react';
import { useAutoReload } from '../hooks/useAutoReload';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

interface HotReloadIndicatorProps {
  className?: string;
}

const HotReloadIndicator: React.FC<HotReloadIndicatorProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastReload, setLastReload] = useState<Date | null>(null);
  const { user } = useAuth();
  const { forceReload, isHMRActive } = useAutoReload({
    enabled: true,
    onReload: () => {
      setLastReload(new Date());
    }
  });
  const { t } = useLanguage();

  // Mostra o indicador apenas em desenvolvimento e para o usuário específico
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development' || isHMRActive;
    const isAuthorizedUser = user?.email === 'joaovictor.priv@gmail.com';
    setIsVisible(isDevelopment && isAuthorizedUser);
  }, [isHMRActive, user]);

  const handleManualReload = () => {
    setLastReload(new Date());
    forceReload();
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-20 right-4 z-40 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 sm:p-3 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              isHMRActive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}></div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-700">
              {isHMRActive ? 'Hot Reload Ativo' : 'Auto Reload'}
            </span>
          </div>
        </div>
        
        {lastReload && (
          <div className="text-[10px] sm:text-xs text-gray-500 mb-2">
            Último reload: {lastReload.toLocaleTimeString()}
          </div>
        )}
        
        <button
          onClick={handleManualReload}
          className="w-full px-2 py-1 text-[10px] sm:text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors duration-200 flex items-center justify-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Recarregar Agora
        </button>
        
        <div className="mt-2 text-[10px] sm:text-xs text-gray-400 text-center">
          {isHMRActive ? 'Vite HMR' : 'Manual Check'}
        </div>
      </div>
    </div>
  );
};

export default HotReloadIndicator;