import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para auto-reload da aplicação
 * Monitora mudanças e força recarregamento quando necessário
 */
export const useAutoReload = (options?: {
  enabled?: boolean;
  interval?: number;
  onReload?: () => void;
}) => {
  const {
    enabled = true,
    interval = 1000,
    onReload
  } = options || {};

  const lastModifiedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Função para verificar se houve mudanças
    const checkForUpdates = async () => {
      try {
        // Verifica se o HMR está ativo (desenvolvimento)
        if (import.meta.hot) {
          // Em desenvolvimento, o Vite já cuida do hot reload
          return;
        }

        // Para produção ou casos especiais, verifica timestamp
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          cache: 'no-cache'
        });

        const lastModified = response.headers.get('last-modified');
        if (lastModified) {
          const timestamp = new Date(lastModified).getTime();
          
          if (lastModifiedRef.current === 0) {
            lastModifiedRef.current = timestamp;
          } else if (timestamp > lastModifiedRef.current) {
            console.log('🔄 Detectada atualização, recarregando página...');
            onReload?.();
            window.location.reload();
          }
        }
      } catch (error) {
        // Silenciosamente ignora erros de rede
        console.debug('Erro ao verificar atualizações:', error);
      }
    };

    // Configura verificação periódica apenas se não estiver em desenvolvimento
    if (!import.meta.hot) {
      intervalRef.current = setInterval(checkForUpdates, interval);
    }

    // Listener para mudanças de visibilidade da página
    const handleVisibilityChange = () => {
      if (!document.hidden && !import.meta.hot) {
        checkForUpdates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, interval, onReload]);

  // Função para forçar reload manual
  const forceReload = () => {
    console.log('🔄 Forçando recarregamento da página...');
    onReload?.();
    window.location.reload();
  };

  return {
    forceReload,
    isHMRActive: !!import.meta.hot
  };
};

export default useAutoReload;