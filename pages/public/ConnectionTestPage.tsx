
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomNavBar from '../../components/BottomNavBar';
import { ShieldIcon, XIcon } from '../../components/Icons';

type Status = 'pending' | 'disabled' | 'error';

const ConnectionTestPage: React.FC = () => {
    const [status, setStatus] = useState<Status>('pending');

    useEffect(() => {
        const timer = setTimeout(() => {
            // Since Supabase is disabled, we directly set the status to 'disabled'.
            setStatus('disabled');
        }, 1000);

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
            case 'disabled':
                return (
                    <div className="text-center">
                        <ShieldIcon className="w-16 h-16 mx-auto text-slate-400" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800">Conexão Desativada</h2>
                        <p className="text-slate-600 mt-2">
                            A integração com o banco de dados (Supabase) está temporariamente desativada para desenvolvimento.
                        </p>
                        <p className="text-slate-500 mt-1 text-sm">O aplicativo está operando com dados de exemplo locais.</p>
                    </div>
                );
            case 'error': // Fallback, though not expected in disabled mode
                 return (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
                            <XIcon className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="mt-4 text-2xl font-bold text-red-600">Ocorreu um Erro</h2>
                        <p className="text-slate-500">Não foi possível verificar o status da conexão.</p>
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