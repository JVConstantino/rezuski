import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Category } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNavBar from '../../components/BottomNavBar';
import { CheckCircleIcon, XIcon } from '../../components/Icons';

type Status = 'pending' | 'success' | 'error';

const KeepAliveCard = () => {
    const [pingStatus, setPingStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [pingError, setPingError] = useState<string | null>(null);
    const [pingData, setPingData] = useState<any | null>(null);

    const handlePing = async () => {
        setPingStatus('pending');
        setPingError(null);
        setPingData(null);

        try {
            const message = `Keep-alive ping from web app at ${new Date().toISOString()}`;
            const { data, error } = await supabase
                .from('logs')
                .insert([{ message }])
                .select();

            if (error) {
                throw error;
            }
            
            setPingStatus('success');
            setPingData(data);

        } catch (err: any) {
            setPingStatus('error');
            setPingError(err.message || 'Ocorreu um erro desconhecido.');
            console.error("Supabase keep-alive error:", err);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg mt-8 w-full">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Database Keep-Alive</h2>
            <p className="text-slate-500 mt-2 text-center">Clique no botão abaixo para enviar um 'ping' (inserir um registro de log) para o banco de dados. Isso pode ser útil para manter ativas as instâncias de banco de dados gratuitas que pausam após inatividade.</p>
            <div className="mt-6 flex justify-center">
                <button 
                    onClick={handlePing} 
                    disabled={pingStatus === 'pending'}
                    className="bg-primary-blue text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary-blue/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                >
                    {pingStatus === 'pending' ? 'Enviando Ping...' : 'Enviar Ping para o Banco de Dados'}
                </button>
            </div>
            {pingStatus !== 'idle' && (
                <div className="mt-6">
                    {pingStatus === 'success' && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800">Ping enviado com sucesso!</h3>
                            <p className="mt-2 text-sm text-green-700">Resposta do banco de dados:</p>
                            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                                {JSON.stringify(pingData, null, 2)}
                            </pre>
                        </div>
                    )}
                    {pingStatus === 'error' && (
                         <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-red-800">Falha ao enviar o ping.</h3>
                            <p className="mt-2 text-sm text-red-700 font-mono break-words">{pingError}</p>
                            {pingError?.includes('relation "public.logs" does not exist') && (
                                <div className="mt-4 text-sm text-red-700">
                                    <p className="font-semibold">Ação necessária:</p>
                                    <p>A tabela 'logs' parece não existir. Execute o seguinte comando SQL no seu editor de SQL do Supabase para criá-la:</p>
                                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto font-mono">
{`CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT
);`}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ConnectionTestPage: React.FC = () => {
    const [status, setStatus] = useState<Status>('pending');
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Category[] | null>(null);

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Tenta buscar dados de uma tabela simples, como 'categories'
                const { data: categories, error: fetchError } = await supabase
                    .from('categories')
                    .select('*')
                    .limit(5);

                if (fetchError) {
                    throw fetchError;
                }

                setStatus('success');
                setData(categories);
                setError(null);

            } catch (err: any) {
                setStatus('error');
                setError(err.message || 'Ocorreu um erro desconhecido.');
                setData(null);
                console.error("Supabase connection error:", err);
            }
        };

        testConnection();
    }, []);

    const renderStatus = () => {
        switch (status) {
            case 'pending':
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
                        <h2 className="mt-4 text-xl font-semibold text-slate-700">Testando Conexão...</h2>
                        <p className="text-slate-500">Aguarde, estamos tentando nos conectar ao banco de dados.</p>
                    </div>
                );
            case 'success':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-green-600">Conexão Bem-Sucedida!</h2>
                        <p className="text-slate-500">A conexão com o Supabase foi estabelecida com sucesso.</p>
                        {data && (
                            <div className="mt-6 text-left bg-slate-100 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-800">Dados de Exemplo (Categorias):</h3>
                                <pre className="mt-2 text-sm bg-slate-200 p-3 rounded overflow-auto">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                            <XIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-red-600">Falha na Conexão</h2>
                        <p className="text-slate-500">Não foi possível conectar ao Supabase.</p>
                        {error && (
                            <div className="mt-6 text-left bg-red-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-red-800">Detalhes do Erro:</h3>
                                <p className="mt-2 text-sm text-red-700 font-mono break-words">{error}</p>
                            </div>
                        )}
                        <div className="mt-4 text-left text-sm text-slate-600">
                            <h4 className="font-semibold">Possíveis Causas:</h4>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>A URL ou a Chave de API (anon key) do Supabase estão incorretas em `lib/supabaseClient.ts`.</li>
                                <li>O servidor do Supabase pode estar temporariamente offline.</li>
                                <li>Problemas de rede ou firewall bloqueando a conexão.</li>
                                <li>As políticas de RLS (Row Level Security) podem estar bloqueando a leitura da tabela `categories` para usuários anônimos.</li>
                            </ul>
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        {renderStatus()}
                    </div>
                    <KeepAliveCard />
                </div>
            </main>
            <Footer />
            <BottomNavBar />
        </div>
    );
};

export default ConnectionTestPage;
