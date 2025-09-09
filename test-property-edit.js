import { createClient } from '@supabase/supabase-js';

// Usar as credenciais reais do Supabase
const supabaseUrl = 'https://constantino-rezuski-db.62mil3.easypanel.host';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPropertyEdit() {
    console.log('🔍 Testando edição de propriedade...');
    
    try {
        // 1. Buscar uma propriedade existente
        console.log('\n1. Buscando propriedades existentes...');
        const { data: properties, error: fetchError } = await supabase
            .from('properties')
            .select('*')
            .limit(1);
            
        if (fetchError) {
            console.error('❌ Erro ao buscar propriedades:', fetchError);
            return;
        }
        
        if (!properties || properties.length === 0) {
            console.log('❌ Nenhuma propriedade encontrada para testar');
            return;
        }
        
        const property = properties[0];
        console.log('✅ Propriedade encontrada:', {
            id: property.id,
            title: property.title,
            youtubeUrl: property.youtubeUrl
        });
        
        // 2. Tentar atualizar a propriedade com youtubeUrl
        console.log('\n2. Testando atualização com youtubeUrl...');
        const testYoutubeUrl = 'https://www.youtube.com/watch?v=test123';
        
        const updateData = {
            title: property.title + ' (Teste)',
            youtubeUrl: testYoutubeUrl,
            description: property.description || 'Descrição de teste'
        };
        
        console.log('📤 Dados de atualização:', updateData);
        
        const { data: updatedData, error: updateError } = await supabase
            .from('properties')
            .update(updateData)
            .eq('id', property.id)
            .select();
            
        if (updateError) {
            console.error('❌ Erro ao atualizar propriedade:', updateError);
            console.error('Detalhes do erro:', {
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint,
                code: updateError.code
            });
            return;
        }
        
        if (updatedData && updatedData.length > 0) {
            console.log('✅ Propriedade atualizada com sucesso!');
            console.log('📋 Dados atualizados:', {
                id: updatedData[0].id,
                title: updatedData[0].title,
                youtubeUrl: updatedData[0].youtubeUrl
            });
        }
        
        // 3. Reverter as alterações
        console.log('\n3. Revertendo alterações...');
        const { error: revertError } = await supabase
            .from('properties')
            .update({
                title: property.title,
                youtubeUrl: property.youtubeUrl,
                description: property.description
            })
            .eq('id', property.id);
            
        if (revertError) {
            console.error('❌ Erro ao reverter alterações:', revertError);
        } else {
            console.log('✅ Alterações revertidas com sucesso!');
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Executar o teste
testPropertyEdit().then(() => {
    console.log('\n🏁 Teste concluído!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});