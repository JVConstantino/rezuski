import React from 'react';

interface PreloaderProps {
  isLoading: boolean;
  message?: string;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading, message = 'Carregando...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        
        {/* Mensagem de carregamento */}
        <p className="text-gray-600 text-lg font-medium">{message}</p>
        
        {/* Barra de progresso animada */}
        <div className="mt-4 w-64 bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;