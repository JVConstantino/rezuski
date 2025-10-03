// Script de teste para debug do upload de PDF
// Execute este script no console do navegador na página de propriedades

(async function testUpload() {
    console.log('🔍 Iniciando teste de upload de PDF...');
    
    // Verificar se as variáveis estão disponíveis
    console.log('Environment variables:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado');
    
    // Importar o cliente de storage
    const { getStorageClient } = await import('./lib/storageClient.js');
    const client = getStorageClient();
    
    if (!client) {
        console.error('❌ Não foi possível criar o cliente de storage');
        return;
    }
    
    console.log('✅ Cliente de storage criado com sucesso');
    
    // Testar listagem de buckets
    try {
        console.log('🔍 Testando listagem de buckets...');
        const { data: buckets, error: bucketsError } = await client.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ Erro ao listar buckets:', bucketsError);
        } else {
            console.log('✅ Buckets disponíveis:', buckets);
            
            const propertyDocsBucket = buckets.find(b => b.id === 'property-documents');
            if (propertyDocsBucket) {
                console.log('✅ Bucket property-documents encontrado:', propertyDocsBucket);
            } else {
                console.error('❌ Bucket property-documents NÃO encontrado');
                console.log('Buckets disponíveis:', buckets.map(b => b.id));
            }
        }
    } catch (error) {
        console.error('❌ Erro ao testar buckets:', error);
    }
    
    // Testar acesso ao bucket property-documents
    try {
        console.log('🔍 Testando acesso ao bucket property-documents...');
        const { data: files, error: listError } = await client.storage
            .from('property-documents')
            .list('', { limit: 1 });
            
        if (listError) {
            console.error('❌ Erro ao acessar bucket property-documents:', listError);
            console.log('Detalhes do erro:', {
                message: listError.message,
                statusCode: listError.statusCode,
                error: listError
            });
        } else {
            console.log('✅ Bucket property-documents acessível. Arquivos:', files);
        }
    } catch (error) {
        console.error('❌ Erro ao testar acesso ao bucket:', error);
    }
    
    console.log('🔍 Teste de upload concluído. Verifique os logs acima.');
})();