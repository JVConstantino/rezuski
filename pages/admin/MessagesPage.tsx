import React from 'react';
import { MessageSquareIcon } from '../../components/Icons';

const MessagesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Mensagens</h1>
      <div className="bg-white p-12 rounded-lg shadow-sm text-center h-[calc(100vh-12rem)] flex flex-col justify-center items-center">
        <MessageSquareIcon className="w-16 h-16 mx-auto text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Funcionalidade de Mensagens em Desenvolvimento</h2>
        <p className="mt-2 text-slate-500">Estamos trabalhando para trazer uma central de mensagens completa para você.</p>
      </div>
    </div>
  );
};

export default MessagesPage;