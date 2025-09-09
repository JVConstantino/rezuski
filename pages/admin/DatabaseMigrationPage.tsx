import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseMigration, migrationUtils } from '../../lib/databaseMigration';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { CheckCircleIcon, XIcon, ExclamationTriangleIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, EyeIcon } from '../../components/Icons';
import { useUserPermissions } from '../../hooks/useUserPermissions';

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
}

const DatabaseMigrationPage: React.FC = () => {
  const { configs } = useStorageConfig();
  const { user, canAccessAdvancedTools } = useUserPermissions();
  const navigate = useNavigate();
  const [sourceConfigId, setSourceConfigId] = useState<string>('');
  const [targetConfigId, setTargetConfigId] = useState<string>('');
  const [sourceServiceKey, setSourceServiceKey] = useState<string>('');
  const [targetServiceKey, setTargetServiceKey] = useState<string>('');
  const [includeStorage, setIncludeStorage] = useState<boolean>(false);
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([
    {
      id: 'test_connections',
      title: 'Testar Conexões',
      description: 'Verificar conectividade com ambos os bancos de dados',
      status: 'pending'
    },
    {
      id: 'export_schema',
      title: 'Exportar Schema',
      description: 'Gerar SQL para recriar estrutura das tabelas',
      status: 'pending'
    },
    {
      id: 'export_data',
      title: 'Exportar Dados',
      description: 'Extrair todos os dados do banco de origem',
      status: 'pending'
    },
    {
      id: 'import_data',
      title: 'Importar Dados',
      description: 'Inserir dados no banco de destino',
      status: 'pending'
    },
    {
      id: 'migrate_storage',
      title: 'Migrar Storage',
      description: 'Copiar arquivos entre buckets (opcional)',
      status: 'pending'
    }
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [exportedSchema, setExportedSchema] = useState<string>('');
  const [exportedSQLFiles, setExportedSQLFiles] = useState<Record<string, string>>({});
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [storageStats, setStorageStats] = useState<{ buckets: number; totalFiles: number; totalSize: number } | null>(null);
  const [migratedFiles, setMigratedFiles] = useState<number>(0);

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (user && !canAccessAdvancedTools()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, canAccessAdvancedTools, navigate]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    
    // Update migrated files counter if it's a file migration log
    if (message.includes('✅') && (message.includes('Migrated file:') || message.includes('Updated file:'))) {
      setMigratedFiles(prev => prev + 1);
    }
  };

  const updateStepStatus = (stepId: string, status: MigrationStep['status'], error?: string) => {
    setMigrationSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, error }
        : step
    ));
  };

  const getSourceConfig = () => configs.find(c => c.id === sourceConfigId);
  const getTargetConfig = () => configs.find(c => c.id === targetConfigId);

  const canTestConnections = () => {
    const sourceConfig = getSourceConfig();
    const targetConfig = getTargetConfig();
    return sourceConfig && targetConfig && sourceConfig.id !== targetConfig.id;
  };

  const testConnectionsOnly = async () => {
    if (!canTestConnections()) return;

    const sourceConfig = getSourceConfig()!;
    const targetConfig = getTargetConfig()!;

    addLog('🔧 Testando apenas as conexões...');
    resetMigration();

    try {
      // Create migration instance
      const migrationConfig = migrationUtils.createMigrationConfig(
        {
          storage_url: sourceConfig.storage_url,
          storage_key: sourceConfig.storage_key,
          serviceKey: sourceServiceKey || undefined
        },
        {
          storage_url: targetConfig.storage_url,
          storage_key: targetConfig.storage_key,
          serviceKey: targetServiceKey || undefined
        }
      );

      const migration = new DatabaseMigration(migrationConfig);
      
      updateStepStatus('test_connections', 'running');
      const connectionResults = await migration.testConnections();
      
      if (connectionResults.source && connectionResults.target) {
        updateStepStatus('test_connections', 'completed');
        addLog('✅ Ambas as conexões testadas com sucesso!');
        addLog('🚀 Agora você pode executar a migração completa.');
      } else {
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
        
        const error = `Falha na conexão - ${errorDetails.join(', ')}`;
        updateStepStatus('test_connections', 'error', error);
        addLog(`❌ ${error}`);
        
        // Add specific troubleshooting guidance
        if (connectionResults.sourceError) {
          addLog(`💡 Detalhes do erro na origem: ${connectionResults.sourceError}`);
        }
        
        if (connectionResults.targetError) {
          addLog(`💡 Detalhes do erro no destino: ${connectionResults.targetError}`);
          
          if (connectionResults.targetError.includes('relation') && connectionResults.targetError.includes('does not exist')) {
            addLog('🛠️ PROBLEMA: O banco de destino não tem as tabelas necessárias.');
            addLog('📝 SOLUÇÃO: Execute primeiro o schema SQL no banco de destino:');
            addLog('   1. Vá para o Supabase Dashboard do destino');
            addLog('   2. Acesse "SQL Editor"');
            addLog('   3. Execute o schema exportado (botão "Exportar Schema" abaixo)');
            addLog('   4. Depois volte aqui e teste novamente.');
          } else if (connectionResults.targetError.includes('authentication') || connectionResults.targetError.includes('JWT')) {
            addLog('🔑 PROBLEMA: Autenticação falhou.');
            addLog('📝 SOLUÇÃO: Verifique se a chave anônima do destino está correta.');
            addLog('   1. Vá para Settings > API no painel do Supabase de destino');
            addLog('   2. Copie a "anon public" key (não a service_role)');
            addLog('   3. Cole na configuração de storage');
          } else if (connectionResults.targetError.includes('network') || connectionResults.targetError.includes('fetch')) {
            addLog('🌐 PROBLEMA: Erro de rede ou URL inválida.');
            addLog('📝 SOLUÇÃO: Verifique se a URL do Supabase de destino está correta.');
            addLog('   1. Confirme que a URL termina com ".supabase.co" ou seu domínio personalizado');
            addLog('   2. Teste acessando a URL no navegador');
            addLog('   3. Verifique se o projeto está pausado ou suspenso');
          } else {
            addLog('🤔 PROBLEMA: Erro desconhecido.');
            addLog('📝 SOLUÇÃO: Verifique:');
            addLog('   1. Se o projeto de destino existe e está ativo');
            addLog('   2. Se as configurações de rede/firewall permitem acesso');
            addLog('   3. Se não há problemas temporários no Supabase');
          }
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updateStepStatus('test_connections', 'error', errorMessage);
      addLog(`❌ Erro ao testar conexões: ${errorMessage}`);
    }
  };

  const exportSchemaOnly = async () => {
    const sourceConfig = getSourceConfig();
    if (!sourceConfig) {
      addLog('❌ Selecione um banco de origem primeiro.');
      return;
    }

    addLog('📝 Exportando apenas o schema...');
    resetMigration(); // Clear previous logs

    try {
      // Create a simple migration config just for schema export
      // Using valid dummy Supabase URLs that will pass validation
      const migrationConfig: any = {
        sourceUrl: sourceConfig.storage_url,
        sourceKey: sourceConfig.storage_key,
        sourceServiceKey: sourceServiceKey || undefined,
        targetUrl: 'https://dummy-project.supabase.co', // Valid dummy URL format
        targetKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY0NDM2MDAsImV4cCI6MTk2MjAxOTYwMH0.FAKE_KEY_FOR_SCHEMA_EXPORT_ONLY', // Valid dummy JWT format
        targetServiceKey: undefined,
        includeStorage: false
      };

      const migration = new DatabaseMigration(migrationConfig);
      
      updateStepStatus('export_schema', 'running');
      addLog('📝 Gerando SQL do schema...');
      
      const schema = await migration.exportSchema();
      setExportedSchema(schema);
      
      updateStepStatus('export_schema', 'completed');
      addLog('✅ Schema exportado com sucesso!');
      addLog('📥 Use o botão "Download Schema SQL" para baixar.');
      addLog('📝 Execute este SQL no banco de destino antes da migração.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updateStepStatus('export_schema', 'error', errorMessage);
      addLog(`❌ Erro ao exportar schema: ${errorMessage}`);
      console.error('Export schema error:', error);
    }
  };

  const exportDataAsSQL = async () => {
    const sourceConfig = getSourceConfig();
    if (!sourceConfig) {
      addLog('❌ Selecione um banco de origem primeiro.');
      return;
    }

    addLog('📦 Exportando dados como arquivos SQL...');
    resetMigration(); // Clear previous logs

    try {
      // Create a simple migration config just for data export
      const migrationConfig: any = {
        sourceUrl: sourceConfig.storage_url,
        sourceKey: sourceConfig.storage_key,
        sourceServiceKey: sourceServiceKey || undefined,
        targetUrl: 'https://dummy-project.supabase.co', // Valid dummy URL format
        targetKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDY0NDM2MDAsImV4cCI6MTk2MjAxOTYwMH0.FAKE_KEY_FOR_SCHEMA_EXPORT_ONLY', // Valid dummy JWT format
        targetServiceKey: undefined,
        includeStorage: false
      };

      const migration = new DatabaseMigration(migrationConfig);
      
      updateStepStatus('export_data', 'running');
      addLog('📋 Exportando dados das tabelas...');
      
      const sqlFiles = await migration.exportDataAsSQL({
        batchSize: 1000
      });
      setExportedSQLFiles(sqlFiles);
      
      updateStepStatus('export_data', 'completed');
      const tableCount = Object.keys(sqlFiles).length;
      const totalRecords = Object.values(sqlFiles).reduce((sum, sql) => {
        const matches = sql.match(/-- Total records: (\d+)/g);
        return sum + (matches ? matches.reduce((acc, match) => acc + parseInt(match.replace('-- Total records: ', '')), 0) : 0);
      }, 0);
      
      addLog(`✅ Dados exportados: ${tableCount} arquivos SQL gerados!`);
      addLog(`📊 Total de registros: ${totalRecords}`);
      addLog('📥 Use os botões "Download" para baixar os arquivos SQL.');
      addLog('🔄 NOVO: Arquivos incluem resolução automática de conflitos (ON CONFLICT).');
      addLog('🔧 NOVO: Mapeamento automático de nomes de colunas (camelCase → snake_case).');
      addLog('🚫 NOVO: Detecta e remove colunas duplicadas automaticamente.');
      addLog('📝 Execute os arquivos SQL no banco de destino na ordem correta.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      updateStepStatus('export_data', 'error', errorMessage);
      addLog(`❌ Erro ao exportar dados como SQL: ${errorMessage}`);
      console.error('Export data as SQL error:', error);
    }
  };

  const resetMigration = () => {
    setMigrationSteps(prev => prev.map(step => ({ ...step, status: 'pending', error: undefined })));
    setMigrationLogs([]);
    setExportedSchema('');
    setExportedSQLFiles({});
    setStorageStats(null);
    setMigratedFiles(0);
    
    // Add a log to show reset happened
    const timestamp = new Date().toLocaleTimeString();
    setMigrationLogs([`[${timestamp}] 🔄 Migração resetada - pronto para nova execução`]);
  };

  const canRunMigration = () => {
    const sourceConfig = getSourceConfig();
    const targetConfig = getTargetConfig();
    return sourceConfig && targetConfig && sourceConfig.id !== targetConfig.id && !isRunning;
  };

  const runMigration = async () => {
    if (!canRunMigration()) return;

    const sourceConfig = getSourceConfig()!;
    const targetConfig = getTargetConfig()!;

    setIsRunning(true);
    addLog('🚀 Iniciando migração de banco de dados...');

    try {
      // Create migration instance
      const migrationConfig = migrationUtils.createMigrationConfig(
        {
          storage_url: sourceConfig.storage_url,
          storage_key: sourceConfig.storage_key,
          serviceKey: sourceServiceKey || undefined
        },
        {
          storage_url: targetConfig.storage_url,
          storage_key: targetConfig.storage_key,
          serviceKey: targetServiceKey || undefined
        }
      );

      // Validate configuration
      const validationErrors = migrationUtils.validateConfig(migrationConfig);
      if (validationErrors.length > 0) {
        addLog(`❌ Erro de configuração: ${validationErrors.join(', ')}`);
        return;
      }

      const migration = new DatabaseMigration(migrationConfig);

      // Step 1: Test connections
      updateStepStatus('test_connections', 'running');
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
        
        const error = `Falha na conexão - ${errorDetails.join(', ')}`;
        updateStepStatus('test_connections', 'error', error);
        addLog(`❌ ${error}`);
        
        // Add specific troubleshooting guidance
        if (connectionResults.targetError) {
          addLog(`💡 Detalhes do erro no destino: ${connectionResults.targetError}`);
          
          if (connectionResults.targetError.includes('relation') && connectionResults.targetError.includes('does not exist')) {
            addLog('🛠️ O banco de destino não tem as tabelas necessárias.');
            addLog('📝 SOLUÇÃO: Execute primeiro o SQL do schema (veja etapa "Exportar Schema" abaixo).');
            addLog('📝 Depois volte aqui e execute a migração novamente.');
          } else if (connectionResults.targetError.includes('authentication') || connectionResults.targetError.includes('JWT')) {
            addLog('🔑 SOLUÇÃO: Verifique se a chave anônima do destino está correta.');
          } else if (connectionResults.targetError.includes('network') || connectionResults.targetError.includes('fetch')) {
            addLog('🌐 SOLUÇÃO: Verifique se a URL do Supabase de destino está correta e acessível.');
          }
        }
        
        return;
      }
      
      updateStepStatus('test_connections', 'completed');
      addLog('✅ Conexões testadas com sucesso');

      // Get storage statistics if storage migration is enabled
      if (includeStorage && sourceServiceKey) {
        addLog('📊 Obtendo estatísticas de storage...');
        try {
          const stats = await migration.getStorageStats();
          setStorageStats(stats);
          addLog(`📊 Storage: ${stats.buckets} buckets, ${stats.totalFiles} arquivos, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
        } catch (error) {
          addLog('⚠️ Não foi possível obter estatísticas de storage');
        }
      }

      // Step 2: Export schema
      updateStepStatus('export_schema', 'running');
      addLog('📄 Exportando schema...');
      
      const schema = await migration.exportSchema();
      setExportedSchema(schema);
      updateStepStatus('export_schema', 'completed');
      addLog('✅ Schema exportado - IMPORTANTE: Execute o SQL manualmente no banco de destino antes de continuar');

      // Step 3: Export data
      updateStepStatus('export_data', 'running');
      addLog('📋 Exportando dados...');
      
      const exportedData = await migration.exportData({
        batchSize: 1000
      });
      
      const totalRecords = Object.values(exportedData).reduce((sum, records) => sum + records.length, 0);
      updateStepStatus('export_data', 'completed');
      addLog(`✅ Dados exportados: ${totalRecords} registros`);

      // Step 4: Import data
      updateStepStatus('import_data', 'running');
      addLog('📥 Importando dados...');
      
      await migration.importData(exportedData, {
        batchSize: 100
      });
      
      updateStepStatus('import_data', 'completed');
      addLog('✅ Dados importados com sucesso');

      // Step 5: Migrate storage (if enabled and service keys provided)
      if (includeStorage && sourceServiceKey && targetServiceKey) {
        updateStepStatus('migrate_storage', 'running');
        addLog('🪣 Migrando storage...');
        
        await migration.migrateStorage();
        
        updateStepStatus('migrate_storage', 'completed');
        addLog('✅ Storage migrado com sucesso');
      } else {
        updateStepStatus('migrate_storage', 'pending');
        addLog('⏭️ Migration de storage pulada (não configurada ou chaves de serviço ausentes)');
      }

      addLog('🎉 Migração concluída com sucesso!');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      addLog(`❌ Erro durante a migração: ${errorMessage}`);
      console.error('Migration error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadSchema = () => {
    if (!exportedSchema) {
      addLog('❌ Nenhum schema para download. Execute "Exportar Schema" primeiro.');
      return;
    }
    
    try {
      const blob = new Blob([exportedSchema], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database_schema.sql';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addLog('✅ Schema SQL baixado com sucesso!');
      addLog('📝 Próximo passo: Execute este SQL no banco de destino.');
    } catch (error) {
      addLog('❌ Erro ao baixar o schema.');
      console.error('Download error:', error);
    }
  };

  const downloadSQLFile = (tableName: string) => {
    const sqlContent = exportedSQLFiles[tableName];
    if (!sqlContent) {
      addLog(`❌ Nenhum arquivo SQL para a tabela ${tableName}.`);
      return;
    }
    
    try {
      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_data.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addLog(`✅ Arquivo SQL da tabela ${tableName} baixado com sucesso!`);
    } catch (error) {
      addLog(`❌ Erro ao baixar arquivo SQL da tabela ${tableName}.`);
      console.error('Download error:', error);
    }
  };

  const downloadAllSQLFiles = () => {
    if (Object.keys(exportedSQLFiles).length === 0) {
      addLog('❌ Nenhum arquivo SQL para download. Execute "Exportar Dados como SQL" primeiro.');
      return;
    }
    
    try {
      // Create a ZIP-like structure by concatenating all files with separators
      let allContent = '-- ========================================\n';
      allContent += '-- MIGRATION DATA FILES\n';
      allContent += `-- Generated on: ${new Date().toISOString()}\n`;
      allContent += '-- ========================================\n\n';
      
      // Add execution order instructions
      allContent += '-- EXECUTION ORDER (run files in this sequence):\n';
      const tableOrder = [
        'profiles', 'categories', 'amenities', 'brokers', 
        'property_type_translations', 'resources', 'properties',
        'applications', 'tenants', 'conversations', 'messages',
        'ai_configs', 'storage_configs'
      ];
      
      tableOrder.forEach((table, index) => {
        if (exportedSQLFiles[table]) {
          allContent += `-- ${index + 1}. ${table}_data.sql\n`;
        }
      });
      
      allContent += '\n-- ========================================\n\n';
      
      // Add all SQL files
      tableOrder.forEach(table => {
        if (exportedSQLFiles[table]) {
          allContent += `-- ========================================\n`;
          allContent += `-- FILE: ${table}_data.sql\n`;
          allContent += `-- ========================================\n\n`;
          allContent += exportedSQLFiles[table];
          allContent += '\n\n';
        }
      });
      
      const blob = new Blob([allContent], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all_migration_data.sql';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addLog('✅ Todos os arquivos SQL baixados em um único arquivo!');
      addLog('📝 Execute o arquivo na ordem indicada nos comentários.');
    } catch (error) {
      addLog('❌ Erro ao baixar todos os arquivos SQL.');
      console.error('Download all error:', error);
    }
  };

  const StepIcon: React.FC<{ status: MigrationStep['status'] }> = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XIcon className="w-5 h-5 text-red-500" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <DocumentArrowUpIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Migração de Banco de Dados</h1>
            <p className="text-gray-600">Migre todos os dados, tabelas e configurações entre instâncias Supabase</p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Atenção - Processo Crítico</h3>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Esta operação irá migrar TODOS os dados entre bancos de dados</li>
              <li>• Certifique-se de que o banco de destino está vazio ou preparado para receber os dados</li>
              <li>• Você precisará executar manualmente o SQL do schema no banco de destino</li>
              <li>• Para migração de storage, você precisa das chaves de serviço (service role key)</li>
              <li>• A migração de arquivos inclui todos os buckets e arquivos automaticamente</li>
              <li>• Arquivos existentes no destino serão sobrescritos durante a migração</li>
              <li>• Faça backup dos dados importantes antes de iniciar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Migração</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banco de Origem
            </label>
            <select
              value={sourceConfigId}
              onChange={(e) => setSourceConfigId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            >
              <option value="">Selecione o banco de origem</option>
              {configs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.id === 'constantino' ? 'Constantino Supabase' : 
                   config.id === 'default' ? 'Supabase Principal' : 
                   config.storage_url}
                </option>
              ))}
            </select>
            
            {sourceConfigId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong> {getSourceConfig()?.storage_url}
                </p>
              </div>
            )}

            {/* Source Service Key */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave de Serviço - Origem (opcional, para storage)
              </label>
              <input
                type="password"
                value={sourceServiceKey}
                onChange={(e) => setSourceServiceKey(e.target.value)}
                placeholder="service_role key para migração de storage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              />
            </div>
          </div>

          {/* Target Configuration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banco de Destino
            </label>
            <select
              value={targetConfigId}
              onChange={(e) => setTargetConfigId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            >
              <option value="">Selecione o banco de destino</option>
              {configs.filter(config => config.id !== sourceConfigId).map(config => (
                <option key={config.id} value={config.id}>
                  {config.id === 'constantino' ? 'Constantino Supabase' : 
                   config.id === 'default' ? 'Supabase Principal' : 
                   config.storage_url}
                </option>
              ))}
            </select>
            
            {targetConfigId && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>URL:</strong> {getTargetConfig()?.storage_url}
                </p>
              </div>
            )}

            {/* Target Service Key */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave de Serviço - Destino (opcional, para storage)
              </label>
              <input
                type="password"
                value={targetServiceKey}
                onChange={(e) => setTargetServiceKey(e.target.value)}
                placeholder="service_role key para migração de storage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Storage Migration Option */}
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeStorage}
              onChange={(e) => setIncludeStorage(e.target.checked)}
              disabled={isRunning}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Incluir migração de storage (requer chaves de serviço)
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            onClick={testConnectionsOnly}
            disabled={!canTestConnections()}
            className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <DocumentArrowUpIcon className="w-4 h-4" />
            <span>Testar Conexões</span>
          </button>
          
          <button
            onClick={exportSchemaOnly}
            disabled={!getSourceConfig()}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Exportar Schema</span>
          </button>
          
          <button
            onClick={exportDataAsSQL}
            disabled={!getSourceConfig()}
            className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Exportar Dados como SQL</span>
          </button>
          
          <button
            onClick={runMigration}
            disabled={!canRunMigration()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <DocumentArrowUpIcon className="w-4 h-4" />
            <span>{isRunning ? 'Executando Migração...' : 'Iniciar Migração'}</span>
          </button>

          <button
            onClick={resetMigration}
            disabled={isRunning}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Resetar
          </button>

          {exportedSchema && (
            <>
              <button
                onClick={downloadSchema}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Download Schema SQL</span>
              </button>
              
              <button
                onClick={() => setShowSchemaModal(true)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
              >
                <EyeIcon className="w-4 h-4" />
                <span>Visualizar Schema</span>
              </button>
            </>
          )}
          
          {Object.keys(exportedSQLFiles).length > 0 && (
            <>
              <button
                onClick={downloadAllSQLFiles}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Download Todos os SQLs</span>
              </button>
            </>
          )}
        </div>
        
        {/* Quick Help */}
        {canTestConnections() && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Primeiros Passos</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>1. Teste as conexões</strong> - Use o botão "Testar Conexões" para verificar se ambos os bancos estão acessíveis</p>
              <p><strong>2. Se o destino falhar</strong> - Use "Exportar Schema" e execute o SQL no banco de destino</p>
              <p><strong>3. Execute a migração</strong> - Após as conexões funcionarem, use "Iniciar Migração"</p>
            </div>
          </div>
        )}
      </div>

      {/* Storage Statistics */}
      {storageStats && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Storage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Buckets</h3>
              <p className="text-2xl font-bold text-blue-600">{storageStats.buckets}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Arquivos Totais</h3>
              <p className="text-2xl font-bold text-green-600">{storageStats.totalFiles}</p>
              {migratedFiles > 0 && (
                <p className="text-sm text-green-700">{migratedFiles} migrados</p>
              )}
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">Tamanho Total</h3>
              <p className="text-2xl font-bold text-purple-600">
                {(storageStats.totalSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          {includeStorage && storageStats.totalFiles > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso da Migração de Arquivos</span>
                <span>{migratedFiles} / {storageStats.totalFiles}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(migratedFiles / storageStats.totalFiles) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SQL Data Files */}
      {Object.keys(exportedSQLFiles).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Arquivos SQL de Dados Exportados</h2>
          <div className="space-y-3">
            {[
              'profiles', 'categories', 'amenities', 'brokers', 
              'property_type_translations', 'resources', 'properties',
              'applications', 'tenants', 'conversations', 'messages',
              'ai_configs', 'storage_configs'
            ].map((tableName, index) => {
              if (!exportedSQLFiles[tableName]) return null;
              
              const recordCount = (exportedSQLFiles[tableName].match(/-- Total records: (\d+)/) || ['', '0'])[1];
              
              return (
                <div key={tableName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tableName}_data.sql</p>
                      <p className="text-sm text-gray-500">{recordCount} registros</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadSQLFile(tableName)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Instrucoes de Execucao</h4>
                <div className="text-sm text-yellow-700 mt-1 space-y-1">
                  <p>1. Execute os arquivos SQL <strong>na ordem numerada</strong> no banco de destino</p>
                  <p>2. Use o "Download Todos os SQLs" para um arquivo único com ordem de execucao</p>
                  <p>3. Execute primeiro o schema SQL antes de executar os dados</p>
                  <p>4. Cada arquivo contém comandos para desabilitar/habilitar triggers automaticamente</p>
                  <p><strong>5. NOVO:</strong> Arquivos incluem ON CONFLICT para evitar erros de chave duplicada</p>
                  <p><strong>6. NOVO:</strong> Mapeamento automático corrige nomes de colunas (updatedAt → updated_at)</p>
                  <p><strong>7. NOVO:</strong> Remove automaticamente colunas duplicadas (viewCount + view_count)</p>
                  <p><strong>8. Opcional:</strong> Descomente TRUNCATE para limpar dados existentes primeiro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso da Migração</h2>
        
        <div className="space-y-4">
          {migrationSteps.map((step, index) => (
            <div key={step.id} className="flex items-start space-x-3">
              <StepIcon status={step.status} />
              <div className="flex-1">
                <h3 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'error' ? 'text-red-700' :
                  step.status === 'running' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.error && (
                  <p className="text-sm text-red-600 mt-1">Erro: {step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Logs */}
      {migrationLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logs da Migração</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md max-h-96 overflow-y-auto font-mono text-sm">
            {migrationLogs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Schema Modal */}
      {showSchemaModal && exportedSchema && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Schema SQL Exportado</h3>
              <button
                onClick={() => setShowSchemaModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                {exportedSchema}
              </pre>
            </div>
            <div className="p-6 border-t flex justify-end space-x-4">
              <button
                onClick={downloadSchema}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download SQL
              </button>
              <button
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigrationPage;