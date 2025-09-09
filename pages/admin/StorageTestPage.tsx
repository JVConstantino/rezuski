import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { getStorageClient } from '../../lib/storageClient';
import { useUserPermissions } from '../../hooks/useUserPermissions';

const StorageTestPage: React.FC = () => {
    const { activeConfig } = useStorageConfig();
    const { user, canAccessAdvancedTools } = useUserPermissions();
    const navigate = useNavigate();
    const [testResult, setTestResult] = useState<string>('');
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        // Redirect if user doesn't have permission
        if (user && !canAccessAdvancedTools()) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, canAccessAdvancedTools, navigate]);

    const runStorageTest = async () => {
        setTesting(true);
        setTestResult('Iniciando testes...\n');

        try {
            if (!activeConfig) {
                setTestResult(prev => prev + '❌ Nenhuma configuração de storage ativa encontrada.\n');
                return;
            }

            setTestResult(prev => prev + `📋 Configuração ativa:\n`);
            setTestResult(prev => prev + `   - URL: ${activeConfig.storage_url}\n`);
            setTestResult(prev => prev + `   - Bucket: ${activeConfig.bucket_name}\n\n`);

            const client = getStorageClient(activeConfig.storage_url, activeConfig.storage_key);

            // Test 1: List bucket contents
            setTestResult(prev => prev + '🔍 Testando acesso ao bucket...\n');
            const { data: listData, error: listError } = await client.storage
                .from(activeConfig.bucket_name)
                .list('', { limit: 1 });

            if (listError) {
                setTestResult(prev => prev + `❌ Erro ao listar bucket: ${listError.message}\n`);
                
                if (listError.message.includes('not found')) {
                    setTestResult(prev => prev + `💡 O bucket '${activeConfig.bucket_name}' não foi encontrado.\n`);
                    setTestResult(prev => prev + `   Vá para o painel do Supabase e:\n`);
                    setTestResult(prev => prev + `   1. Acesse Storage\n`);
                    setTestResult(prev => prev + `   2. Crie um bucket chamado '${activeConfig.bucket_name}'\n`);
                    setTestResult(prev => prev + `   3. Configure o bucket como PÚBLICO\n`);
                }
                return;
            }

            setTestResult(prev => prev + '✅ Bucket acessível!\n');
            setTestResult(prev => prev + `   Itens encontrados: ${listData?.length || 0}\n\n`);

            // Test 2: Test public folder access
            setTestResult(prev => prev + '🔍 Testando acesso à pasta public...\n');
            const { data: publicData, error: publicError } = await client.storage
                .from(activeConfig.bucket_name)
                .list('public');

            if (publicError) {
                setTestResult(prev => prev + `❌ Erro ao acessar pasta public: ${publicError.message}\n`);
                return;
            }

            setTestResult(prev => prev + '✅ Pasta public acessível!\n');
            setTestResult(prev => prev + `   Itens encontrados: ${publicData?.length || 0}\n\n`);

            // Test 3: Test upload permissions with a small test file
            setTestResult(prev => prev + '🔍 Testando permissões de upload...\n');
            const testFileName = `test-upload-${Date.now()}.txt`;
            const testFilePath = `public/${testFileName}`;
            const testFileContent = new Blob(['Test upload file'], { type: 'text/plain' });

            const { data: uploadData, error: uploadError } = await client.storage
                .from(activeConfig.bucket_name)
                .upload(testFilePath, testFileContent);

            if (uploadError) {
                setTestResult(prev => prev + `❌ Erro no upload de teste: ${uploadError.message}\n`);
                
                if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
                    setTestResult(prev => prev + `💡 Problema de permissão (RLS):\n`);
                    setTestResult(prev => prev + `   Vá para o painel do Supabase e:\n`);
                    setTestResult(prev => prev + `   1. Acesse Storage > ${activeConfig.bucket_name}\n`);
                    setTestResult(prev => prev + `   2. Vá para Policies\n`);
                    setTestResult(prev => prev + `   3. Crie ou ajuste policies para permitir INSERT/SELECT público\n`);
                }
                return;
            }

            setTestResult(prev => prev + '✅ Upload de teste bem-sucedido!\n');
            setTestResult(prev => prev + `   Arquivo criado: ${testFilePath}\n\n`);

            // Test 4: Clean up test file
            setTestResult(prev => prev + '🧹 Limpando arquivo de teste...\n');
            const { error: deleteError } = await client.storage
                .from(activeConfig.bucket_name)
                .remove([testFilePath]);

            if (deleteError) {
                setTestResult(prev => prev + `⚠️ Aviso: Não foi possível remover arquivo de teste: ${deleteError.message}\n`);
            } else {
                setTestResult(prev => prev + '✅ Arquivo de teste removido!\n');
            }

            setTestResult(prev => prev + '\n🎉 Todos os testes passaram! O storage está funcionando corretamente.\n');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setTestResult(prev => prev + `❌ Erro inesperado: ${errorMessage}\n`);
        } finally {
            setTesting(false);
        }
    };

    // Render nothing until the redirect logic has a chance to run
    if (user && !canAccessAdvancedTools()) {
        return null;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Teste de Storage</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-700">Diagnóstico de Upload</h2>
                    <button
                        onClick={runStorageTest}
                        disabled={testing}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            testing
                                ? 'bg-slate-400 text-white cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {testing ? 'Testando...' : 'Executar Teste'}
                    </button>
                </div>
                
                <div className="bg-slate-100 rounded-lg p-4 min-h-[300px]">
                    <pre className="whitespace-pre-wrap text-sm text-slate-800 font-mono">
                        {testResult || 'Clique em "Executar Teste" para começar o diagnóstico...'}
                    </pre>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Problemas Comuns:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>Bucket não encontrado:</strong> Crie o bucket no painel do Supabase</li>
                    <li>• <strong>Erro de permissão:</strong> Configure o bucket como público ou ajuste as RLS policies</li>
                    <li>• <strong>Erro de autenticação:</strong> Verifique a storage_key na configuração</li>
                    <li>• <strong>URL incorreta:</strong> Confirme a storage_url na configuração</li>
                </ul>
            </div>
        </div>
    );
};

export default StorageTestPage;