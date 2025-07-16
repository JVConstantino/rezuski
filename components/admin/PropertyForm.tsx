
import React, { useState, useEffect } from 'react';
import { Property, PropertyType, PropertyPurpose, Amenity, PropertyStatus } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import { useImages } from '../../contexts/ImageContext';
import ImageGalleryModal from './ImageGalleryModal';
import { SparklesIcon, StarIcon, TrashIcon, PlusIcon } from '../Icons';
import { supabase } from '../../lib/supabaseClient';
import { GoogleGenAI, Type } from "@google/genai";

interface PropertyFormProps {
    initialData?: Property;
    onSubmit: (data: Omit<Property, 'id' | 'status' | 'priceHistory' | 'amenities'> & { amenities: Amenity[] }, status: PropertyStatus) => void;
    isEditing: boolean;
}

interface ImageState {
    preview: string;
    isPrimary: boolean;
}

const AVAILABLE_AMENITIES = [
    'Piscina', 'Churrasqueira', 'Salão de Festas', 'Academia', 'Playground',
    'Quadra Poliesportiva', 'Sauna', 'Portaria 24h', 'Garagem', 'Área de Serviço',
    'Cozinha Americana', 'Varanda Gourmet', 'Escritório', 'Mobiliado', 'Armários Embutidos',
    'Lareira', 'Ar Condicionado', 'Quintal'
];


const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const { categories } = useCategories();
    const { addImages: addImagesToGallery } = useImages();
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [isOptimizing, setIsOptimizing] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        address: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        description: '',
        purpose: PropertyPurpose.RENT,
        rentPrice: '',
        salePrice: '',
        propertyType: PropertyType.HOUSE,
        categoryId: '',
        bedrooms: '',
        bathrooms: '',
        areaM2: '',
        repairQuality: 'Bom',
        yearBuilt: '',
        availableDate: new Date().toISOString().split('T')[0],
        isPopular: false,
        tourUrl: '',
    });
    
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [newAmenity, setNewAmenity] = useState({ name: AVAILABLE_AMENITIES[0], quantity: 1 });

    const [images, setImages] = useState<ImageState[]>([]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                code: initialData.code || '',
                address: initialData.address,
                neighborhood: initialData.neighborhood || '',
                city: initialData.city,
                state: initialData.state,
                zipCode: initialData.zipCode,
                description: initialData.description,
                purpose: initialData.purpose,
                rentPrice: String(initialData.rentPrice || ''),
                salePrice: String(initialData.salePrice || ''),
                propertyType: initialData.propertyType,
                categoryId: initialData.categoryId || (categories.length > 0 ? categories[0].id : ''),
                bedrooms: String(initialData.bedrooms || ''),
                bathrooms: String(initialData.bathrooms || ''),
                areaM2: String(initialData.areaM2 || ''),
                repairQuality: initialData.repairQuality || 'Bom',
                yearBuilt: String(initialData.yearBuilt || ''),
                availableDate: initialData.availableDate ? new Date(initialData.availableDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                isPopular: initialData.isPopular || false,
                tourUrl: initialData.tourUrl || '',
            });
            setAmenities(initialData.amenities);
            const initialImages = initialData.images.map((img, index) => ({
                preview: img,
                isPrimary: index === 0,
            }));
            setImages(initialImages);
        } else if (categories.length > 0) {
            setFormData(prev => ({...prev, categoryId: categories[0].id}));
        }
    }, [initialData, categories]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
             return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const addAmenity = () => {
        if (newAmenity.name && !amenities.some(a => a.name === newAmenity.name)) {
            setAmenities([...amenities, { name: newAmenity.name, quantity: newAmenity.quantity || 1 }]);
            setNewAmenity({ name: AVAILABLE_AMENITIES[0], quantity: 1 });
        }
    };
    
    const removeAmenity = (indexToRemove: number) => {
        setAmenities(amenities.filter((_, index) => index !== indexToRemove));
    };

    const handleImageUpload = async (files: FileList) => {
        const totalFiles = files.length;
        if (totalFiles === 0) return;

        setUploadProgress({ current: 0, total: totalFiles });
        const uploadedUrls: string[] = [];

        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const filePath = `public/${Date.now()}-${file.name}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
                uploadedUrls.push(data.publicUrl);
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
                alert(`Erro ao enviar o arquivo: ${file.name}`);
            }
            
            setUploadProgress({ current: i + 1, total: totalFiles });
        }

        if (uploadedUrls.length > 0) {
            const newImageStates = uploadedUrls.map(url => ({ preview: url, isPrimary: false }));
            setImages(prev => {
                const updatedImages = [...prev, ...newImageStates];
                if (prev.length === 0 && updatedImages.length > 0) {
                    updatedImages[0].isPrimary = true;
                }
                return updatedImages;
            });
            addImagesToGallery(uploadedUrls);
        }

        setTimeout(() => {
            setUploadProgress({ current: 0, total: 0 });
        }, 1500);
    };

    const handleSelectFromGallery = (selectedImages: string[]) => {
        const newImageStates = selectedImages.map(img => ({
            preview: img,
            isPrimary: false
        }));
    
        setImages(prev => {
            const updatedImages = [...prev, ...newImageStates];
            if (prev.length === 0 && updatedImages.length > 0) {
                updatedImages[0].isPrimary = true;
            }
            return updatedImages;
        });
    };

    const handleSetPrimary = (index: number) => {
        const newImages = [...images];
        const primaryImage = newImages.splice(index, 1)[0];
        newImages.unshift(primaryImage);
        setImages(newImages.map((img, idx) => ({ ...img, isPrimary: idx === 0 })));
    };

    const handleDeleteImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        if (images[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }
        setImages(newImages);
    };

    const handleOptimizeWithAI = async () => {
        setIsOptimizing(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const amenitiesString = amenities.map(a => `${a.name}${a.quantity > 1 ? ` (${a.quantity})` : ''}`).join(', ');
            
            const prompt = `
                Você é um especialista em marketing imobiliário e SEO.
                Com base nos detalhes da propriedade a seguir, gere um título e uma descrição que sejam atraentes, profissionais e otimizados para SEO.
                O tom deve ser convidativo, destacando as principais características. Foque em um português claro e vendedor para o mercado brasileiro.

                Detalhes da Propriedade:
                - Tipo: ${formData.propertyType}
                - Finalidade: ${formData.purpose === 'RENT' ? 'Aluguel' : 'Venda'}
                - Localização: ${formData.address}, ${formData.neighborhood}, ${formData.city}, ${formData.state}
                - Quartos: ${formData.bedrooms || 'Não informado'}
                - Banheiros: ${formData.bathrooms || 'Não informado'}
                - Área: ${formData.areaM2 ? formData.areaM2 + ' m²' : 'Não informada'}
                - Comodidades: ${amenitiesString || 'Nenhuma listada'}
                - Título Atual (para referência): "${formData.title}"
                - Descrição Atual (para referência): "${formData.description}"

                Por favor, melhore o título e a descrição atuais. A resposta deve ser concisa e focada nos pontos fortes do imóvel.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "O título otimizado para SEO para o imóvel. Deve ser cativante e incluir detalhes chave como tipo do imóvel e localização.",
                    },
                    description: {
                        type: Type.STRING,
                        description: "A descrição otimizada, detalhada e engajante do imóvel. Deve ser bem estruturada, de fácil leitura e destacar os principais pontos de venda e comodidades.",
                    },
                },
                required: ["title", "description"],
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            const responseText = response.text.trim();
            const jsonResponse = JSON.parse(responseText);
            
            if (jsonResponse.title && jsonResponse.description) {
                setFormData(prev => ({
                    ...prev,
                    title: jsonResponse.title,
                    description: jsonResponse.description,
                }));
            } else {
                throw new Error("Formato de resposta da IA inválido.");
            }

        } catch (error) {
            console.error("Erro ao otimizar com IA:", error);
            alert("Ocorreu um erro durante a otimização com IA. Verifique o console para mais detalhes.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const triggerSubmit = (status: PropertyStatus) => {
        const parsedRentPrice = parseFloat(formData.rentPrice);
        const parsedSalePrice = parseFloat(formData.salePrice);
        const parsedBedrooms = parseInt(formData.bedrooms, 10);
        const parsedBathrooms = parseFloat(formData.bathrooms);
        const parsedAreaM2 = parseInt(formData.areaM2, 10);
        const parsedYearBuilt = parseInt(formData.yearBuilt, 10);

        const primaryImageFirst = [...images].sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));

        const propertyData = {
            ...formData,
            rentPrice: formData.purpose !== PropertyPurpose.SALE ? (isNaN(parsedRentPrice) ? undefined : parsedRentPrice) : undefined,
            salePrice: formData.purpose === PropertyPurpose.SALE ? (isNaN(parsedSalePrice) ? undefined : parsedSalePrice) : undefined,
            bedrooms: isNaN(parsedBedrooms) ? undefined : parsedBedrooms,
            bathrooms: isNaN(parsedBathrooms) ? undefined : parsedBathrooms,
            areaM2: isNaN(parsedAreaM2) ? undefined : parsedAreaM2,
            yearBuilt: isNaN(parsedYearBuilt) ? undefined : parsedYearBuilt,
            images: primaryImageFirst.map(img => img.preview),
            amenities: amenities,
        };
        onSubmit(propertyData, status);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mainActionStatus = (isEditing && initialData?.status !== PropertyStatus.DRAFT) ? initialData!.status : PropertyStatus.AVAILABLE;
        triggerSubmit(mainActionStatus);
    }

    return (
        <>
            <form onSubmit={handleFormSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-sm">
                <div className="space-y-6">
                     <div>
                        <h2 className="text-xl font-bold text-slate-800">Informações Básicas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Título</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Código do Imóvel</label>
                                <input type="text" name="code" value={formData.code} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                        </div>
                    </div>
                    
                    <hr/>

                     <div>
                        <h2 className="text-xl font-bold text-slate-800">Localização</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Rua / Logradouro</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Bairro</label>
                                <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cidade</label>
                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Estado</label>
                                <input type="text" name="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">CEP</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                        </div>
                    </div>

                    <hr/>
                    
                    <div>
                         <h2 className="text-xl font-bold text-slate-800">Preços e Finalidade</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Finalidade</label>
                                <select name="purpose" value={formData.purpose} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    <option value={PropertyPurpose.RENT}>Aluguel</option>
                                    <option value={PropertyPurpose.SALE}>Venda</option>
                                    <option value={PropertyPurpose.SEASONAL}>Temporada</option>
                                </select>
                            </div>

                            {formData.purpose !== PropertyPurpose.SALE && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Preço do Aluguel (/mês ou /diária)</label>
                                    <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                                </div>
                            )} 
                            
                            {formData.purpose === PropertyPurpose.SALE && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Preço de Venda</label>
                                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                                </div>
                            )}
                         </div>
                    </div>

                    <hr/>

                     <div>
                        <h2 className="text-xl font-bold text-slate-800">Descrição e Otimização</h2>
                         <div className="md:col-span-2 mt-4">
                            <label className="block text-sm font-medium text-slate-700">Descrição</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"></textarea>
                            <div className="mt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleOptimizeWithAI}
                                    disabled={isOptimizing}
                                    className="flex items-center bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-secondary-blue/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                                >
                                    <SparklesIcon className={`w-5 h-5 mr-2 ${isOptimizing ? 'animate-spin' : ''}`} />
                                    {isOptimizing ? 'Otimizando...' : 'Otimizar com IA'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr/>

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Detalhes do Imóvel</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Tipo de Imóvel</label>
                                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    {Object.values(PropertyType).map((type: string) => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Categoria</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Quartos</label>
                                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Banheiros</label>
                                <input type="number" step="0.5" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Área (m²)</label>
                                <input type="number" name="areaM2" value={formData.areaM2} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Qualidade da Manutenção</label>
                                <select name="repairQuality" value={formData.repairQuality} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    <option value="Excelente">Excelente</option>
                                    <option value="Bom">Bom</option>
                                    <option value="Razoável">Razoável</option>
                                    <option value="Ruim">Ruim</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Ano de Construção</label>
                                <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Data de Disponibilidade</label>
                                <input type="date" name="availableDate" value={formData.availableDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="isPopular" name="isPopular" checked={formData.isPopular} onChange={handleInputChange} className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-slate-300 rounded"/>
                                <label htmlFor="isPopular" className="ml-2 block text-sm text-slate-900">Marcar como Popular</label>
                            </div>
                        </div>
                    </div>

                    <hr/>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Características e Comodidades</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                                    <div>
                                        <span className="font-medium text-slate-700">{amenity.name}</span>
                                        <span className="text-slate-500 ml-2">(Qtd: {amenity.quantity})</span>
                                    </div>
                                    <button type="button" onClick={() => removeAmenity(index)} className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                         <div className="mt-6 p-4 border-t border-slate-200">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Adicionar nova característica</label>
                            <div className="flex items-end space-x-2">
                                <div className="flex-grow">
                                    <label htmlFor="amenity-name" className="sr-only">Característica</label>
                                    <select 
                                        id="amenity-name"
                                        value={newAmenity.name} 
                                        onChange={e => setNewAmenity(prev => ({...prev, name: e.target.value}))}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                    >
                                        {AVAILABLE_AMENITIES.map(name => <option key={name} value={name}>{name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="amenity-quantity" className="sr-only">Quantidade</label>
                                    <input 
                                        id="amenity-quantity"
                                        type="number" 
                                        value={newAmenity.quantity}
                                        min="1"
                                        onChange={e => setNewAmenity(prev => ({...prev, quantity: parseInt(e.target.value, 10)}))}
                                        className="block w-24 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={addAmenity} 
                                    className="flex items-center bg-primary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-blue/90"
                                >
                                    <PlusIcon className="w-5 h-5 mr-1"/>
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr/>
                    
                     <div>
                        <h2 className="text-xl font-bold text-slate-800">Mídia Adicional</h2>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">URL do Tour 3D (src do iframe)</label>
                            <input
                                type="url"
                                name="tourUrl"
                                value={formData.tourUrl}
                                onChange={handleInputChange}
                                placeholder="https://exemplo.com/tour-virtual"
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                            />
                            <p className="mt-2 text-xs text-slate-500">Cole aqui apenas o conteúdo do atributo "src" da tag iframe fornecida.</p>
                        </div>
                    </div>

                    <hr/>
                    
                    <div>
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Fotos</h2>
                             <button
                                type="button"
                                onClick={() => setGalleryOpen(true)}
                                className="flex items-center bg-white border border-primary-blue text-primary-blue font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-blue/10 transition-colors"
                             >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Selecionar da Galeria
                             </button>
                         </div>
                         <div className="mt-4 border-2 border-dashed border-slate-300 rounded-lg p-6">
                            <input 
                                type="file" 
                                multiple 
                                onChange={(e) => e.target.files && handleImageUpload(e.target.files)} 
                                accept="image/*" 
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-blue/10 file:text-primary-blue hover:file:bg-primary-blue/20" 
                                disabled={uploadProgress.total > 0} 
                            />
                            {uploadProgress.total > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-slate-600 mb-1">
                                        Enviando Imagem {uploadProgress.current} de {uploadProgress.total}... ({Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)
                                    </p>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div 
                                            className="bg-primary-blue h-2.5 rounded-full transition-all duration-300 ease-linear" 
                                            style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img src={image.preview} alt={`Preview ${index}`} className="w-full h-32 object-cover rounded-lg"/>
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2">
                                            <button type="button" onClick={() => handleSetPrimary(index)} className="p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Marcar como principal">
                                                <StarIcon className={`w-5 h-5 ${image.isPrimary ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}/>
                                            </button>
                                             <button type="button" onClick={() => handleDeleteImage(index)} className="p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Remover imagem">
                                                <TrashIcon className="w-5 h-5 text-red-600"/>
                                            </button>
                                        </div>
                                        {image.isPrimary && <div className="absolute top-1 left-1 bg-yellow-400 text-white text-xs font-bold px-1.5 py-0.5 rounded">PRINCIPAL</div>}
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
                <div className="pt-5">
                    <div className="flex justify-end">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</button>
                        
                        {(!isEditing || (isEditing && initialData?.status === PropertyStatus.DRAFT)) && (
                            <button
                                type="button"
                                onClick={() => triggerSubmit(PropertyStatus.DRAFT)}
                                disabled={uploadProgress.total > 0}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-600 hover:bg-slate-700 disabled:opacity-50"
                            >
                                Salvar Rascunho
                            </button>
                        )}

                        <button type="submit" disabled={uploadProgress.total > 0} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-green hover:opacity-95 disabled:opacity-50">
                             {isEditing 
                                ? (initialData?.status === PropertyStatus.DRAFT ? 'Salvar e Publicar' : 'Salvar Alterações') 
                                : 'Publicar Imóvel'
                             }
                        </button>
                    </div>
                </div>
            </form>
            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelectImages={handleSelectFromGallery}
                currentImages={images.map(i => i.preview)}
            />
        </>
    );
};

export default PropertyForm;
