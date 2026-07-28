import { useState, useCallback } from 'react';
import { DatabaseMigration, migrationUtils } from '../lib/databaseMigration';

interface MigrationConfig {
  sourceUrl: string;
  sourceKey: string;
  sourceServiceKey?: string;
  targetUrl: string;
  targetKey: string;
  targetServiceKey?: string;
  includeStorage?: boolean;
}

interface MigrationStatus {
  isRunning: boolean;
  currentStep: string | null;
  progress: number;
  error: string | null;
  logs: string[];
}

export const useDatabaseMigration = () => {
  const [status, setStatus] = useState<MigrationStatus>({
    isRunning: false,
    currentStep: null,
    progress: 0,
    error: null,
    logs: []
  });

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setStatus(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`]
    }));
  }, []);

  const updateProgress = useCallback((step: string, progress: number) => {
    setStatus(prev => ({
      ...prev,
      currentStep: step,
      progress
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setStatus(prev => ({
      ...prev,
      error,
      isRunning: false
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      logs: [],
      error: null
    }));
  }, []);

  const runMigration = useCallback(async (config: MigrationConfig) => {
    setStatus({
      isRunning: true,
      currentStep: 'Iniciando migração',
      progress: 0,
      error: null,
      logs: []
    });

    try {
      addLog('🚀 Iniciando migração de banco de dados...');

      // Validate configuration
      const validationErrors = migrationUtils.validateConfig(config);
      if (validationErrors.length > 0) {
        throw new Error(`Erro de configuração: ${validationErrors.join(', ')}`);
      }

      const migration = new DatabaseMigration(config);

      // Step 1: Test connections (20% progress)
      updateProgress('Testando conexões', 20);
      addLog('🔧 Testando conexões...');
      
      const connectionResults = await migration.testConnections();
      if (!connectionResults.source || !connectionResults.target) {
        let errorDetails = [];
        if (!connectionResults.source) {
          errorDetails.push(`Origem: FALHA${connectionResults.sourceError ? ` (${connectionResults.sourceError})` : ''}`);
        } else {
          errorDetails.push('Origem: OK');
        }
        if (!connectionResults.target) {
          errorDetails.push(`Destino: FALHA${connectionResults.targetError ? ` (${connectionResults.targetError})` : ''}`);
        } else {
          errorDetails.push('Destino: OK');
        }
        
        throw new Error(`Falha na conexão - ${errorDetails.join(', ')}`);
      }
      
      addLog('✅ Conexões testadas com sucesso');

      // Step 2: Export schema (40% progress)
      updateProgress('Exportando schema', 40);
      addLog('📄 Exportando schema...');
      
      const schema = await migration.exportSchema();
      addLog('✅ Schema exportado - IMPORTANTE: Execute o SQL manualmente no banco de destino');

      // Step 3: Export data (60% progress)
      updateProgress('Exportando dados', 60);
      addLog('📋 Exportando dados...');
      
      const exportedData = await migration.exportData({
        batchSize: 1000
      });
      
      const totalRecords = Object.values(exportedData).reduce((sum, records) => sum + records.length, 0);
      addLog(`✅ Dados exportados: ${totalRecords} registros`);

      // Step 4: Import data (80% progress)
      updateProgress('Importando dados', 80);
      addLog('📥 Importando dados...');
      
      await migration.importData(exportedData, {
        batchSize: 100
      });
      
      addLog('✅ Dados importados com sucesso');

      // Step 5: Migrate storage (100% progress)
      if (config.includeStorage && config.sourceServiceKey && config.targetServiceKey) {
        updateProgress('Migrando storage', 90);
        addLog('🪣 Migrando storage...');
        
        await migration.migrateStorage();
        
        addLog('✅ Storage migrado com sucesso');
      } else {
        addLog('⏭️ Migração de storage pulada (não configurada)');
      }

      updateProgress('Concluído', 100);
      addLog('🎉 Migração concluída com sucesso!');

      setStatus(prev => ({
        ...prev,
        isRunning: false,
        currentStep: 'Concluído'
      }));

      return { success: true, schema };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro durante a migração: ${errorMessage}`);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [addLog, updateProgress, setError]);

  const testConnections = useCallback(async (config: MigrationConfig) => {
    try {
      addLog('🔧 Testando conexões...');
      
      const migration = new DatabaseMigration(config);
      const results = await migration.testConnections();
      
      if (results.source && results.target) {
        addLog('✅ Ambas as conexões testadas com sucesso');
        return { success: true, results };
      } else {
        let errorDetails = [];
        if (!results.source) {
          errorDetails.push(`Origem: FALHA${results.sourceError ? ` (${results.sourceError})` : ''}`);
        } else {
          errorDetails.push('Origem: OK');
        }
        if (!results.target) {
          errorDetails.push(`Destino: FALHA${results.targetError ? ` (${results.targetError})` : ''}`);
        } else {
          errorDetails.push('Destino: OK');
        }
        
        const error = `Falha na conexão - ${errorDetails.join(', ')}`;
        addLog(`❌ ${error}`);
        
        // Add specific guidance based on the error
        if (results.targetError) {
          addLog(`💡 Detalhes do erro no destino: ${results.targetError}`);
          
          if (results.targetError.includes('relation') && results.targetError.includes('does not exist')) {
            addLog('🛠️ O banco de destino não tem as tabelas necessárias.');
            addLog('📝 Execute primeiro o SQL do schema exportado no banco de destino.');
          } else if (results.targetError.includes('authentication') || results.targetError.includes('JWT')) {
            addLog('🔑 Problema de autenticação: Verifique se a chave anônima está correta.');
          } else if (results.targetError.includes('network') || results.targetError.includes('fetch')) {
            addLog('🌐 Problema de rede: Verifique se a URL do Supabase está correta e acessível.');
          }
        }
        
        return { success: false, error, results };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao testar conexões: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [addLog]);

  const exportSchemaOnly = useCallback(async (config: MigrationConfig) => {
    try {
      addLog('📄 Exportando schema...');
      
      const migration = new DatabaseMigration(config);
      const schema = await migration.exportSchema();
      
      addLog('✅ Schema exportado com sucesso');
      return { success: true, schema };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro ao exportar schema: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }, [addLog]);

  return {
    status,
    runMigration,
    testConnections,
    exportSchemaOnly,
    clearLogs,
    addLog
  };
};