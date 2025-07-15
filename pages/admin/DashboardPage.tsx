import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProperties } from '../../contexts/PropertyContext';
import { PropertyStatus, PropertyType } from '../../types';
import { SEARCH_TRENDS } from '../../constants';
import { SearchIcon } from '../../components/Icons';

const MostAccessedPropertiesCard = () => {
    const { properties } = useProperties();
    
    const sortedProperties = [...properties]
        .filter(p => p.viewCount && p.viewCount > 0)
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 5)
        .reverse();

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Imóveis Mais Acessados</h3>
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
        </div>
    );
};

const PropertyStatusCard = () => {
    const { properties } = useProperties();

    const statusCounts = properties.reduce((acc, property) => {
        const status = property.status;
        if(status === PropertyStatus.ARCHIVED) return acc;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {} as Record<PropertyStatus, number>);

    const data = [
        { name: 'Disponível', value: statusCounts.AVAILABLE || 0 },
        { name: 'Alugado', value: statusCounts.RENTED || 0 },
        { name: 'Vendido', value: statusCounts.SOLD || 0 },
    ];
    
    const COLORS = ['#61CE70', '#FFC107', '#2A7ADA'];
    const totalUnits = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-semibold text-slate-800">Status dos Imóveis</h3>
            <div className="h-48 relative flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie 
                            data={data} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={70} 
                            fill="#8884d8" 
                            paddingAngle={5} 
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
                 <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">{totalUnits}</span>
                    <span className="text-sm text-slate-500">Total</span>
                </div>
            </div>
            <div className="mt-4 space-y-2">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></span>
                            <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-medium text-slate-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryDistributionCard = () => {
    const { properties } = useProperties();
    
    const categoryCounts = properties.reduce((acc, property) => {
        const type = property.propertyType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<PropertyType, number>);
    
    const data = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    const COLORS = ['#2A7ADA', '#61CE70', '#FFC107', '#FF5722', '#8BC34A', '#009688'];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribuição por Categoria</h3>
             <div style={{ width: '100%', height: 300 }}>
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SearchTrendsCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tendências de Busca</h3>
        <ul className="space-y-3 mt-4">
            {SEARCH_TRENDS.slice(0, 7).map((trend, index) => (
                <li key={index} className="flex items-center text-slate-600 text-sm">
                    <SearchIcon className="w-4 h-4 mr-3 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{trend}</span>
                </li>
            ))}
        </ul>
    </div>
);


const DashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel de Controle</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                    <MostAccessedPropertiesCard />
                </div>
                <div className="lg:col-span-1">
                    <PropertyStatusCard />
                </div>
                 <div className="lg:col-span-2">
                    <CategoryDistributionCard />
                </div>
                 <div className="lg:col-span-1">
                    <SearchTrendsCard />
                </div>
            </div>
        </div>
    )
};

export default DashboardPage;