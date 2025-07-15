import React from 'react';
import { BarChartIcon, DollarSignIcon, HomeIcon } from '../../components/Icons';

const StatCard: React.FC<{title: string; value: string; icon: React.ReactNode}> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
    <div className="bg-primary-blue/20 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ReportsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Relatórios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Receita Total (Mês)" value="$45,231.89" icon={<DollarSignIcon className="w-6 h-6 text-primary-blue"/>} />
        <StatCard title="Taxa de Ocupação" value="92%" icon={<HomeIcon className="w-6 h-6 text-primary-blue"/>} />
      </div>
      <div className="mt-8 bg-white p-12 rounded-lg shadow-sm text-center h-[calc(100vh-20rem)] flex flex-col justify-center items-center">
        <BarChartIcon className="w-16 h-16 mx-auto text-slate-400" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">Gráficos Detalhados em Breve</h2>
        <p className="mt-2 text-slate-500">Relatórios visuais e interativos estarão disponíveis aqui em breve.</p>
      </div>
    </div>
  );
};

export default ReportsPage;