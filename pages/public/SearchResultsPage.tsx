



import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PropertyCard from '../../components/PropertyCard';
import PropertyListItem from '../../components/PropertyListItem';
import { useProperties } from '../../contexts/PropertyContext';
import { MapPinIcon, DollarSignIcon, ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon, ListIcon, HashIcon, FilterIcon, XIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronDownIcon, BedIcon, BathIcon } from '../../components/Icons';
import { PropertyStatus, PropertyPurpose } from '../../types';
import { RENT_PRICE_RANGES, SALE_PRICE_RANGES, BEDROOM_OPTIONS, BATHROOM_OPTIONS, COMMON_AMENITIES } from '../../constants';
import BottomNavBar from '../../components/BottomNavBar';

const FilterPanel = ({ filters, onFilterChange, onApply }) => {
    const handleFormSubmit = (e) => {
        e.preventDefault();
        onApply();
    };
    
    const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        const currentAmenities = filters.amenities || [];
        const newAmenities = checked
            ? [...currentAmenities, name]
            : currentAmenities.filter(a => a !== name);
        onFilterChange('amenities', newAmenities);
    };

    const currentPriceRanges = (filters.purpose === 'SALE') ? SALE_PRICE_RANGES : RENT_PRICE_RANGES;

    return (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Filtros</h2>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Finalidade</label>
                    <div className="grid grid-cols-3 rounded-md shadow-sm">
                        <button type="button" onClick={() => onFilterChange('purpose', 'RENT')} className={`px-4 py-2 text-sm font-medium border border-slate-300 rounded-l-md w-full transition-colors ${filters.purpose === 'RENT' ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Alugar</button>
                        <button type="button" onClick={() => onFilterChange('purpose', 'SALE')} className={`px-4 py-2 text-sm font-medium border-t border-b border-slate-300 w-full transition-colors ${filters.purpose === 'SALE' ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Comprar</button>
                        <button type="button" onClick={() => onFilterChange('purpose', 'SEASONAL')} className={`px-4 py-2 text-sm font-medium border border-slate-300 rounded-r-md w-full transition-colors ${filters.purpose === 'SEASONAL' ? 'bg-primary-blue text-white' : 'bg-white hover:bg-slate-50'}`}>Temporada</button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nome, Bairro ou Cidade</label>
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPinIcon className="w-5 h-5 text-slate-400" />
                        </span>
                        <input type="text" name="location" value={filters.location} onChange={e => onFilterChange(e.target.name, e.target.value)} placeholder="Busque por nome ou local" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue" />
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
                    <div className="relative mt-1">
                        <select name="priceRange" value={filters.priceRange} onChange={e => onFilterChange(e.target.name, e.target.value)} className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none">
                             {Object.entries(currentPriceRanges).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                         <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Quartos</label>
                        <div className="relative mt-1">
                           <select name="bedrooms" value={filters.bedrooms} onChange={e => onFilterChange(e.target.name, e.target.value)} className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none">
                                {Object.entries(BEDROOM_OPTIONS).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                           </select>
                           <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                            </span>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Banheiros</label>
                        <div className="relative mt-1">
                           <select name="bathrooms" value={filters.bathrooms} onChange={e => onFilterChange(e.target.name, e.target.value)} className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg focus:ring-primary-blue focus:border-primary-blue appearance-none">
                                {Object.entries(BATHROOM_OPTIONS).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                           </select>
                           <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                            </span>
                        </div>
                    </div>
                </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Comodidades</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {COMMON_AMENITIES.map((amenity) => (
                            <label key={amenity} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={amenity}
                                    checked={filters.amenities.includes(amenity)}
                                    onChange={handleAmenityChange}
                                    className="h-4 w-4 rounded border-slate-300 text-primary-blue focus:ring-primary-blue"
                                />
                                <span className="text-slate-700">{amenity}</span>
                            </label>
                        ))}
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
        purpose: (searchParams.get('purpose') as PropertyPurpose) || 'RENT',
        location: searchParams.get('location') || '',
        priceRange: searchParams.get('priceRange') || 'any',
        code: searchParams.get('code') || '',
        bedrooms: searchParams.get('bedrooms') || 'any',
        bathrooms: searchParams.get('bathrooms') || 'any',
        amenities: searchParams.getAll('amenities') || [],
    });
    
    const [isFilterModalOpen, setFilterModalOpen] = useState(false);
    
    useEffect(() => {
        const urlFilters = {
            purpose: (searchParams.get('purpose') as PropertyPurpose) || 'RENT',
            location: searchParams.get('location') || '',
            priceRange: searchParams.get('priceRange') || 'any',
            code: searchParams.get('code') || '',
            bedrooms: searchParams.get('bedrooms') || 'any',
            bathrooms: searchParams.get('bathrooms') || 'any',
            amenities: searchParams.getAll('amenities') || [],
        };
        setFilters(urlFilters);
    }, [searchParams]);

    const applyFilters = (currentFilters) => {
        const newParams = new URLSearchParams();
        newParams.set('purpose', currentFilters.purpose as string);
        if (currentFilters.location) newParams.set('location', currentFilters.location);
        if (currentFilters.code) newParams.set('code', currentFilters.code);
        if (currentFilters.priceRange && currentFilters.priceRange !== 'any') newParams.set('priceRange', currentFilters.priceRange);
        if (currentFilters.bedrooms && currentFilters.bedrooms !== 'any') newParams.set('bedrooms', currentFilters.bedrooms);
        if (currentFilters.bathrooms && currentFilters.bathrooms !== 'any') newParams.set('bathrooms', currentFilters.bathrooms);
        
        newParams.delete('amenities');
        if (currentFilters.amenities && currentFilters.amenities.length > 0) {
            currentFilters.amenities.forEach(amenity => newParams.append('amenities', amenity));
        }
        
        setSearchParams(newParams, { replace: true });
        setFilterModalOpen(false);
    };

    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        if (field === 'purpose') {
            newFilters.priceRange = 'any';
        }
        setFilters(newFilters);
        // Auto-apply on desktop
        if (window.innerWidth >= 768) {
             applyFilters(newFilters);
        }
    };
    
    const filteredProperties = useMemo(() => {
        let results = properties.filter(p => p.status === 'AVAILABLE');
        
        const purpose = searchParams.get('purpose');
        const location = searchParams.get('location')?.toLowerCase();
        const code = searchParams.get('code')?.toLowerCase();
        const priceRangeKey = searchParams.get('priceRange');
        const bedrooms = searchParams.get('bedrooms');
        const bathrooms = searchParams.get('bathrooms');
        const amenities = searchParams.getAll('amenities');

        if (purpose) { results = results.filter(p => p.purpose === purpose); }
        if (location) { 
            results = results.filter(p => 
                p.title.toLowerCase().includes(location) || 
                p.address.toLowerCase().includes(location) || 
                p.city.toLowerCase().includes(location) ||
                (p.neighborhood && p.neighborhood.toLowerCase().includes(location))
            ); 
        }
        if (code) { results = results.filter(p => p.code?.toLowerCase().includes(code)); }
        
        if (priceRangeKey && priceRangeKey !== 'any') {
            const [minStr, maxStr] = priceRangeKey.split('-');
            const minPrice = parseInt(minStr);
            const maxPrice = maxStr.includes('+') ? Infinity : parseInt(maxStr);

            results = results.filter(p => {
                const pPrice = p.purpose === 'SALE' ? p.salePrice : p.rentPrice;
                if (pPrice === undefined) return false;
                return pPrice >= minPrice && pPrice <= maxPrice;
            });
        }
        
        if (bedrooms && bedrooms !== 'any') {
            const minBedrooms = parseInt(bedrooms, 10);
            results = results.filter(p => p.bedrooms !== undefined && p.bedrooms >= minBedrooms);
        }

        if (bathrooms && bathrooms !== 'any') {
            const minBathrooms = parseInt(bathrooms, 10);
            results = results.filter(p => p.bathrooms !== undefined && p.bathrooms >= minBathrooms);
        }

        if (amenities.length > 0) {
            results = results.filter(p => 
                amenities.every(am => 
                    p.amenities.some(propAm => propAm.name === am)
                )
            );
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
                                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-3"><>{paginatedProperties.map(p => <PropertyCard key={p.id} property={p} />)}</></div>
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