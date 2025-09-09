import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://yfqjqjqvqvqvqvqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmcWpxanF2cXZxdnF2cXYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNTg2NzU0NCwiZXhwIjoyMDQxNDQzNTQ0fQ.VgCJjqL7X8vQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findProperty727() {
    console.log('🔍 Buscando propriedade com código 727...');
    
    try {
        // Buscar por código 727
        const { data: propertiesByCode, error: codeError } = await supabase
            .from('properties')
            .select('*')
            .eq('code', '727');
            
        if (codeError) {
            console.error('❌ Erro ao buscar por código:', codeError);
        } else {
            console.log('📋 Propriedades encontradas por código 727:', propertiesByCode?.length || 0);
            if (propertiesByCode && propertiesByCode.length > 0) {
                propertiesByCode.forEach((prop, index) => {
                    console.log(`\n🏠 Propriedade ${index + 1}:`);
                    console.log('  ID:', prop.id);
                    console.log('  Título:', prop.title);
                    console.log('  Código:', prop.code);
                    console.log('  YouTube URL:', prop.youtubeUrl);
                    console.log('  Status:', prop.status);
                    console.log('  Endereço:', prop.address);
                    console.log('  Bairro:', prop.neighborhood);
                });
            }
        }
        
        // Buscar por título contendo PAPUCAIA
        const { data: propertiesByTitle, error: titleError } = await supabase
            .from('properties')
            .select('*')
            .ilike('title', '%PAPUCAIA%');
            
        if (titleError) {
            console.error('❌ Erro ao buscar por título:', titleError);
        } else {
            console.log('\n📋 Propriedades encontradas com PAPUCAIA no título:', propertiesByTitle?.length || 0);
            if (propertiesByTitle && propertiesByTitle.length > 0) {
                propertiesByTitle.forEach((prop, index) => {
                    console.log(`\n🏠 Propriedade ${index + 1}:`);
                    console.log('  ID:', prop.id);
                    console.log('  Título:', prop.title);
                    console.log('  Código:', prop.code);
                    console.log('  YouTube URL:', prop.youtubeUrl);
                    console.log('  Status:', prop.status);
                    console.log('  Endereço:', prop.address);
                    console.log('  Bairro:', prop.neighborhood);
                });
            }
        }
        
        // Buscar por título contendo CASA e código 727
        const { data: propertiesByCasa, error: casaError } = await supabase
            .from('properties')
            .select('*')
            .ilike('title', '%CASA%')
            .ilike('title', '%727%');
            
        if (casaError) {
            console.error('❌ Erro ao buscar por CASA e 727:', casaError);
        } else {
            console.log('\n📋 Propriedades encontradas com CASA e 727 no título:', propertiesByCasa?.length || 0);
            if (propertiesByCasa && propertiesByCasa.length > 0) {
                propertiesByCasa.forEach((prop, index) => {
                    console.log(`\n🏠 Propriedade ${index + 1}:`);
                    console.log('  ID:', prop.id);
                    console.log('  Título:', prop.title);
                    console.log('  Código:', prop.code);
                    console.log('  YouTube URL:', prop.youtubeUrl);
                    console.log('  Status:', prop.status);
                    console.log('  Endereço:', prop.address);
                    console.log('  Bairro:', prop.neighborhood);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
    }
}

// Executar a busca
findProperty727().then(() => {
    console.log('\n🏁 Busca concluída!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});