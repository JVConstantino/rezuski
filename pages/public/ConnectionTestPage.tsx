import React, { useState, useEffect, useRef } from 'react';
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
    const [lastPingType, setLastPingType] = useState<'manual' | 'auto' | null>(null);

    const [autoPingEnabled, setAutoPingEnabled] = useState(false);
    const [lastAutoPingTime, setLastAutoPingTime] = useState<string | null>(null);
    const [nextPingTime, setNextPingTime] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const PING_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos

    const executePing = async (type: 'manual' | 'auto') => {
        setPingStatus('pending');
        setPingError(null);
        setLastPingType(type);

        try {
            const message = `${type === 'auto' ? 'Automatic' : 'Manual'} keep-alive ping from web app at ${new Date().toISOString()}`;
            const { data, error } = await supabase
                .from('logs')
                .insert([{ message }])
                .select();

            if (error) {
                throw error;
            }
            
            setPingStatus('success');
            setPingData(data);
            if (type === 'auto') {
                setLastAutoPingTime(new Date().toLocaleTimeString());
            }

        } catch (err: any) {
            setPingStatus('error');
            setPingError(err.message || 'Ocorreu um erro desconhecido.');
            console.error("Supabase keep-alive error:", err);
        }
    };
    
    useEffect(() => {
        const cleanup = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        if (autoPingEnabled) {
            const scheduleNextPing = () => {
                const nextTime = new Date(Date.now() + PING_INTERVAL_MS);
                setNextPingTime(nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            };
            
            scheduleNextPing();
            
            intervalRef.current = window.setInterval(() => {
                executePing('auto');
                scheduleNextPing();
            }, PING_INTERVAL_MS);

        } else {
            cleanup();
            setNextPingTime(null);
            setLastAutoPingTime(null);
        }

        return cleanup;
    }, [autoPingEnabled, PING_INTERVAL_MS]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg mt-8 w-full">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Database Keep-Alive</h2>
            <p className="text-slate-500 mt-2 text-center">Use as ferramentas abaixo para manter sua instância gratuita do Supabase ativa.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Manual Ping */}
                <div className="border border-slate-200 rounded-lg p-6 h-full flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800">Ping Manual</h3>
                    <p className="text-sm text-slate-500 mt-1 flex-grow">Clique para enviar um ping imediatamente para o banco de dados.</p>
                    <div className="mt-4 flex justify-center">
                        <button 
                            onClick={() => executePing('manual')}
                            disabled={pingStatus === 'pending'}
                            className="bg-primary-blue text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary-blue/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {pingStatus === 'pending' && lastPingType === 'manual' ? 'Enviando...' : 'Enviar Ping Manual'}
                        </button>
                    </div>
                </div>

                {/* Auto Ping */}
                <div className="border border-slate-200 rounded-lg p-6 h-full flex flex-col">
                    <h3 className="font-bold text-lg text-slate-800">Ping Automático</h3>
                    <p className="text-sm text-slate-500 mt-1 flex-grow">Deixe esta página aberta para enviar pings a cada 15 minutos.</p>
                    <div className="mt-4">
                        <label className="flex items-center justify-center cursor-pointer">
                            <span className="mr-3 text-slate-700 font-medium">Desativado</span>
                            <div className="relative">
                                <input type="checkbox" checked={autoPingEnabled} onChange={(e) => setAutoPingEnabled(e.target.checked)} className="sr-only peer" />
                                <div className="block bg-slate-200 w-14 h-8 rounded-full peer-checked:bg-primary-green transition-colors"></div>
                                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform peer-checked:translate-x-6"></div>
                            </div>
                            <span className="ml-3 text-slate-700 font-medium">Ativado</span>
                        </label>
                    </div>
                     {autoPingEnabled && (
                        <div className="text-center text-xs text-slate-500 mt-3 space-y-1">
                            {lastAutoPingTime && <p>Último ping automático: <span className="font-semibold">{lastAutoPingTime}</span></p>}
                            {nextPingTime && <p>Próximo ping agendado para: <span className="font-semibold">{nextPingTime}</span></p>}
                        </div>
                    )}
                </div>
            </div>

            {pingStatus !== 'idle' && (
                <div className="mt-8">
                    {pingStatus === 'pending' && (
                        <div className="bg-blue-50 p-4 rounded-lg text-center flex items-center justify-center">
                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-blue mr-3"></div>
                            <p className="font-semibold text-blue-800">Enviando ping {lastPingType === 'auto' ? 'automático' : 'manual'}...</p>
                        </div>
                    )}
                    {pingStatus === 'success' && (
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-green-800">Ping {lastPingType === 'auto' ? 'automático' : 'manual'} enviado com sucesso!</h3>
                            <p className="mt-2 text-sm text-green-700">Resposta do banco de dados:</p>
                            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
                                {JSON.stringify(pingData, null, 2)}
                            </pre>
                        </div>
                    )}
                    {pingStatus === 'error' && (
                         <div className="bg-red-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-red-800">Falha ao enviar o ping {lastPingType === 'auto' ? 'automático' : 'manual'}.</h3>
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
                <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
