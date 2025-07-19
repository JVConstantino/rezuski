
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

    const MostAccessedPropertiesChart = () => {
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
                            width={150}
                            tick={{ fill: '#475569', fontSize: 12, textAnchor: 'end' }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
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

    const PropertyStatusChart = () => {
        const statusCounts = properties.reduce((acc, property) => {
            if (property.status === 'ARCHIVED') return acc;
            const status = property.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const data = [
            { name: 'Disponível', value: statusCounts['AVAILABLE'] || 0 },
            { name: 'Alugado', value: statusCounts['RENTED'] || 0 },
            { name: 'Vendido', value: statusCounts['SOLD'] || 0 },
        ];
        const COLORS = ['#61CE70', '#FFC107', '#2A7ADA'];

        return (
            <div className="h-full flex flex-col justify-center items-center">
                <div className="w-full h-56">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 w-full max-w-xs">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                                <span className="text-slate-600">{item.name}</span>
                            </div>
                            <span className="font-medium text-slate-800">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };


  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Relatórios</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Receita de Vendas" value={`R$ ${totalRevenue.toLocaleString('pt-BR')}`} icon={<DollarSignIcon className="w-6 h-6 text-primary-blue"/>} />
            <StatCard title="Total de Imóveis" value={totalProperties.toString()} icon={<HomeIcon className="w-6 h-6 text-primary-blue"/>} />
            <StatCard title="Total de Corretores" value={totalBrokers.toString()} icon={<UsersIcon className="w-6 h-6 text-primary-blue"/>} />
            <StatCard title="Imóveis à Venda" value={propertiesForSale.toString()} icon={<CheckCircleIcon className="w-6 h-6 text-primary-blue"/>} />
            <StatCard title="Imóveis para Alugar" value={propertiesForRent.toString()} icon={<CheckCircleIcon className="w-6 h-6 text-primary-blue"/>} />
            <StatCard title="Total de Conversas" value={conversationCount.toString()} icon={<MessageSquareIcon className="w-6 h-6 text-primary-blue"/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
             <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Imóveis Mais Acessados</h3>
                <MostAccessedPropertiesChart />
            </div>
             <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                 <h3 className="text-lg font-semibold text-slate-800">Status dos Imóveis</h3>
                 <PropertyStatusChart />
             </div>
        </div>
    </div>
  );
};

export default ReportsPage;
