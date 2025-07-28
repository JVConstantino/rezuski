
import React, { useState, useEffect } from 'react';
import { useProperties } from '../../contexts/PropertyContext';
import { useBrokers } from '../../contexts/BrokerContext';
import { supabase } from '../../lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSignIcon, HomeIcon, UsersIcon, MessageSquareIcon, CheckCircleIcon } from '../../components/Icons';

const StatCard: React.FC<{title: string; value: string; icon: React.ReactNode}> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm flex items-center space-x-4">
    <div className="bg-primary-blue/10 p-4 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const MostAccessedPropertiesChart: React.FC = () => {
    const { properties } = useProperties();
    const sortedProperties = [...properties]
        .filter(p => p.viewCount && p.viewCount > 0)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .reverse();

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={sortedProperties}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis
                        dataKey="title"
                        type="category"
                        width={120}
                        tick={{ fill: '#475569', fontSize: 12, textAnchor: 'end' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
                        cursor={{ fill: 'rgba(42, 122, 218, 0.1)' }}
                    />
                    <Bar dataKey="viewCount" name="Visualizações" fill="#2A7ADA" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const ReportsPage: React.FC = () => {
    const { properties } = useProperties();
    const { brokers } = useBrokers();
    const [conversationCount, setConversationCount] = useState(0);

    useEffect(() => {
        const fetchConversationCount = async () => {
            const { count, error } = await supabase
                .from('conversations')
                .select('*', { count: 'exact', head: true });
            if (!error && count !== null) {
                setConversationCount(count);
            }
        };
        fetchConversationCount();
    }, []);

    const totalProperties = properties.length;
    const propertiesForSale = properties.filter(p => p.purpose === 'SALE').length;
    const propertiesForRent = properties.filter(p => p.purpose === 'RENT' || p.purpose === 'SEASONAL').length;
    const totalBrokers = brokers.length;
    
    const totalRevenue = properties.reduce((acc, p) => {
        if (p.status === 'SOLD' && p.salePrice) {
            return acc + p.salePrice;
        }
        return acc;
    }, 0);
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <StatCard title="Receita Total (Vendas)" value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} icon={<DollarSignIcon className="w-6 h-6 text-primary-blue"/>} />
                <StatCard title="Imóveis Ativos" value={totalProperties.toString()} icon={<HomeIcon className="w-6 h-6 text-primary-blue"/>} />
                <StatCard title="Total de Corretores" value={totalBrokers.toString()} icon={<UsersIcon className="w-6 h-6 text-primary-blue"/>} />
                <StatCard title="Conversas Ativas" value={conversationCount.toString()} icon={<MessageSquareIcon className="w-6 h-6 text-primary-blue"/>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Imóveis Mais Acessados</h3>
                    <MostAccessedPropertiesChart />
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Finalidade dos Imóveis</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={[{name: 'Venda', value: propertiesForSale}, {name: 'Aluguel', value: propertiesForRent}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                    <Cell key="cell-0" fill="#2A7ADA"/>
                                    <Cell key="cell-1" fill="#61CE70"/>
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
