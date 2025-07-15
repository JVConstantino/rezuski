
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNavBar from '../../components/BottomNavBar';
import { ShieldIcon, XIcon, CheckCircleIcon } from '../../components/Icons';
import { supabase } from '../../lib/supabaseClient';

type Status = 'pending' | 'connected' | 'error';

const ConnectionTestPage: React.FC = () => {
    const [status, setStatus] = useState<Status>('pending');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const testConnection = async () => {
            try {
                // Test the connection by trying to fetch from a simple query
                const { data, error } = await supabase
                    .from('profiles')
                    .select('count')
                    .limit(1);
                
                if (error) {
                    console.error('Supabase connection error:', error);
                    setErrorMessage(error.message);
                    setStatus('error');
                } else {
                    setStatus('connected');
                }
            } catch (err) {
                console.error('Connection test failed:', err);
                setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
                setStatus('error');
            }
        };

        const timer = setTimeout(testConnection, 1000);
        return () => clearTimeout(timer);
    }, []);

    const renderStatus = () => {
        switch (status) {
            case 'pending':
                return (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
                        <h2 className="mt-4 text-xl font-semibold text-slate-700">Verificando...</h2>
                        <p className="text-slate-500">Aguarde, estamos checando o status da conexão.</p>
                    </div>
                );
            case 'connected':
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-green-600">Conexão Ativa</h2>
                        <p className="text-slate-600 mt-2">
                            A conexão com o banco de dados (Supabase) está funcionando corretamente.
                        </p>
                        <p className="text-slate-500 mt-1 text-sm">Todos os dados estão sendo sincronizados em tempo real.</p>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                            <XIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-red-600">Ocorreu um Erro</h2>
                        <p className="text-slate-600 mt-2">Não foi possível conectar ao banco de dados.</p>
                        <p className="text-slate-500 mt-1 text-sm">{errorMessage}</p>
                    </div>
                );
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        {renderStatus()}
                    </div>
                </div>
            </main>
            <Footer />
            <BottomNavBar />
        </div>
    );
};

export default ConnectionTestPage;