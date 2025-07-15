

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import PropertyListItem from '../../components/PropertyListItem';
import { useProperties } from '../../contexts/PropertyContext';
import { MapPinIcon, DollarSignIcon, ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon, ListIcon, HashIcon, FilterIcon, XIcon, ChevronsLeftIcon, ChevronsRightIcon } from '../../components/Icons';
import { PropertyStatus, PropertyPurpose } from '../../types';
import BottomNavBar from '../../components/BottomNavBar';

const FilterPanel = ({ filters, onFilterChange, onApply }) => {
    const handleFormSubmit = (e) => {
        e.preventDefault();
        onApply();
    };

    return (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Filtros</h2>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Finalidade</label>
                    <div className="grid grid-cols-3 rounded-md shadow-sm">
                        <button type="button" onClick={() => onFilterChange('purpose', PropertyPurpose.RENT)} className={`px-4 py-2 text-sm font-medium border border-slate-300 rounded-l-md w-full transition-colors ${filters.purpose === PropertyPurpose.RENT ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Alugar</button>
                        <button type="button" onClick={() => onFilterChange('purpose', PropertyPurpose.SALE)} className={`px-4 py-2 text-sm font-medium border-t border-b border-slate-300 w-full transition-colors ${filters.purpose === PropertyPurpose.SALE ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Comprar</button>
                        <button type="button" onClick={() => onFilterChange('purpose', PropertyPurpose.SEASONAL)} className={`px-4 py-2 text-sm font-medium border border-slate-300 rounded-r-md w-full transition-colors ${filters.purpose === PropertyPurpose.SEASONAL ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Temporada</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Localização</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPinIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input type="text" name="location" value={filters.location} onChange={e => onFilterChange(e.target.name, e.target.value)} placeholder="Cidade ou bairro" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Código</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <HashIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input type="text" name="code" value={filters.code} onChange={e => onFilterChange(e.target.name, e.target.value)} placeholder="Código do imóvel" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Faixa de Preço</label>
                    <div className="mt-2 pt-2">
                        <div className="flex justify-between items-center text-sm text-slate-600 mb-2">
                            <span>R$ {Number(filters.minPrice).toLocaleString('pt-BR')}</span>
                            <span>R$ {Number(filters.maxPrice).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="relative h-5">
                            <div className="absolute w-full h-1 bg-slate-200 rounded-full top-1/2 -translate-y-1/2"></div>
                            <div
                                className="absolute h-1 bg-primary-blue rounded-full top-1/2 -translate-y-1/2"
                                style={{
                                    left: `${(Number(filters.minPrice) / 2000000) * 100}%`,
                                    right: `${100 - (Number(filters.maxPrice) / 2000000) * 100}%`
                                }}
                            ></div>
                            <div className="absolute w-full h-5 -top-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="2000000"
                                    step="10000"
                                    value={filters.minPrice}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                        const value = Math.min(Number(e.currentTarget.value), Number(filters.maxPrice) - 10000);
                                        onFilterChange('minPrice', String(value));
                                    }}
                                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-500 [&::-moz-range-thumb]:cursor-pointer"
                                    style={{ zIndex: 3 }}
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="2000000"
                                    step="10000"
                                    value={filters.maxPrice}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                        const value = Math.max(Number(e.currentTarget.value), Number(filters.minPrice) + 10000);
                                        onFilterChange('maxPrice', String(value));
                                    }}
                                    className="absolute w-full h-1 bg-transparent appearance-none pointer-events-none top-1/2 -translate-y-1/2 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-500 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-slate-500 [&::-moz-range-thumb]:cursor-pointer"
                                    style={{ zIndex: 4 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="md:hidden pt-4 mb-4">
                    <button type="submit" className="w-full bg-primary-green text-white font-semibold py-3 rounded-lg hover:opacity-95">Aplicar Filtros</button>
                </div>
            </div>
        </form>
    );
};

const SearchResultsPage: React.FC = () => {
    const { properties } = useProperties();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [filters, setFilters] = useState({
        purpose: searchParams.get('purpose') || PropertyPurpose.RENT,
        location: searchParams.get('location') || '',
        minPrice: searchParams.get('minPrice') || '0',
        maxPrice: searchParams.get('maxPrice') || '2000000',
        code: searchParams.get('code') || '',
    });
    
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    
    useEffect(() => {
        const urlFilters = {
            purpose: searchParams.get('purpose') || PropertyPurpose.RENT,
            location: searchParams.get('location') || '',
            minPrice: searchParams.get('minPrice') || '0',
            maxPrice: searchParams.get('maxPrice') || '2000000',
            code: searchParams.get('code') || '',
        };
        setFilters(urlFilters);
    }, [searchParams]);

    const applyFilters = (currentFilters) => {
        const newParams = new URLSearchParams();
        newParams.set('purpose', currentFilters.purpose as string);
        if (currentFilters.location) newParams.set('location', currentFilters.location);
        if (currentFilters.code) newParams.set('code', currentFilters.code);

        if (currentFilters.minPrice !== '0' || currentFilters.maxPrice !== '2000000') {
            newParams.set('minPrice', currentFilters.minPrice);
            newParams.set('maxPrice', currentFilters.maxPrice);
        }
        
        setSearchParams(newParams, { replace: true });
        setFilterModalOpen(false);
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        if (field === 'purpose') {
            newFilters.minPrice = '0';
            newFilters.maxPrice = '2000000';
        }
        setFilters(newFilters);
        // Auto-apply on desktop
        if (window.innerWidth >= 768) {
             applyFilters(newFilters);
        }
    };
    
    const filteredProperties = useMemo(() => {
        let results = properties.filter(p => p.status === PropertyStatus.AVAILABLE);
        const purpose = searchParams.get('purpose');
        const location = searchParams.get('location')?.toLowerCase();
        const minPrice = parseFloat(searchParams.get('minPrice') || '0');
        const maxPrice = parseFloat(searchParams.get('maxPrice') || '2000000');
        const code = searchParams.get('code')?.toLowerCase();

        if (purpose) { results = results.filter(p => p.purpose === purpose); }
        if (location) { results = results.filter(p => p.address.toLowerCase().includes(location) || p.city.toLowerCase().includes(location)); }
        if (code) { results = results.filter(p => p.code?.toLowerCase().includes(code)); }

        if (minPrice > 0 || maxPrice < 2000000) {
            results = results.filter(p => {
                const pPrice = p.purpose === PropertyPurpose.SALE ? p.salePrice : p.rentPrice;
                if (pPrice === undefined) return false;
                return pPrice >= minPrice && pPrice <= maxPrice;
            });
        }
        return results;
    }, [properties, searchParams]);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => { setCurrentPage(1); }, [filteredProperties, viewMode]);

    const itemsPerPage = viewMode === 'grid' ? 8 : 5;
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const renderPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (currentPage > totalPages - 4) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };
    
    return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24 md:pb-8">
                <div className="md:grid md:grid-cols-4 md:gap-8">
                    <aside className="hidden md:block md:col-span-1">
                        <div className="sticky top-24">
                            <FilterPanel filters={filters} onFilterChange={handleFilterChange} onApply={() => applyFilters(filters)} />
                        </div>
                    </aside>
                    <div className="md:col-span-3">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-slate-600">{filteredProperties.length} resultados encontrados</p>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-primary-blue/20 text-primary-blue' : 'text-slate-500 hover:bg-slate-100'}`}><ListIcon className="w-5 h-5" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-primary-blue/20 text-primary-blue' : 'text-slate-500 hover:bg-slate-100'}`}><LayoutGridIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                        {filteredProperties.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-lg shadow-sm"><p className="text-xl text-slate-600">Nenhum imóvel encontrado.</p><p className="text-slate-500 mt-2">Tente ajustar os seus filtros de busca.</p></div>
                        ) : (
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4"><>{paginatedProperties.map(p => <PropertyCard key={p.id} property={p} />)}</></div>
                                ) : (
                                    <div className="space-y-4"><>{paginatedProperties.map(p => <PropertyListItem key={p.id} property={p} />)}</></div>
                                )}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center space-x-1 mt-12">
                                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Primeira página"><ChevronsLeftIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Página anterior"><ChevronLeftIcon className="w-5 h-5"/></button>
                                        
                                        {renderPageNumbers().map((page, index) =>
                                            page === '...' ? (
                                                <span key={`dots-${index}`} className="px-4 py-2 text-slate-500">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page as number)}
                                                    className={`px-4 py-2 rounded-md text-sm font-medium ${currentPage === page ? 'bg-primary-blue text-white' : 'hover:bg-slate-200'}`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        )}

                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Próxima página"><ChevronRightIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Última página"><ChevronsRightIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Filter Modal for Mobile */}
            {isFilterModalOpen && (
                <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setFilterModalOpen(false)}>
                    <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-slate-50 shadow-lg p-4 transform transition-transform" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setFilterModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"><XIcon className="w-6 h-6"/></button>
                        <FilterPanel filters={filters} onFilterChange={handleFilterChange} onApply={() => applyFilters(filters)} />
                    </div>
                </div>
            )}
            
            {/* Filter Toggle Button for Mobile */}
            <div className="md:hidden fixed bottom-20 right-4 z-30">
                <button onClick={() => setFilterModalOpen(true)} className="bg-primary-blue text-white p-4 rounded-full shadow-lg flex items-center">
                    <FilterIcon className="w-6 h-6"/>
                </button>
            </div>
            
            <Footer />
            <BottomNavBar />
        </div>
    );
};

export default SearchResultsPage;
