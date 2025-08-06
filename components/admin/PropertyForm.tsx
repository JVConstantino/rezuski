import React, { useState, useEffect } from 'react';
import { Property, PropertyType, PropertyPurpose, Amenity, PropertyStatus } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import { useAmenities } from '../../contexts/AmenityContext';
import { useImages } from '../../contexts/ImageContext';
import ImageGalleryModal from './ImageGalleryModal';
import { SparklesIcon, StarIcon, TrashIcon, PlusIcon } from '../Icons';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";

interface PropertyFormProps {
    initialData?: Property;
    onSubmit: (data: Omit<Property, 'id' | 'status' | 'priceHistory' | 'amenities'> & { amenities: Amenity[]; translations: Property['translations'] }, status: PropertyStatus) => void;
    isEditing: boolean;
}

interface ImageState {
    preview: string;
    isPrimary: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isEditing }) => {
    const { categories } = useCategories();
    const { amenities: managedAmenities, loading: amenitiesLoading } = useAmenities();
    const { refresh: refreshGallery } = useImages();
    const { t, propertyTypes, supportedLanguages } = useLanguage();
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState('pt-BR');

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        address: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        description: '',
        purpose: 'RENT' as PropertyPurpose,
        rentPrice: '',
        salePrice: '',
        propertyType: 'Casa' as PropertyType,
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
    const [newAmenity, setNewAmenity] = useState({ name: '', quantity: 1 });
    const [images, setImages] = useState<ImageState[]>([]);
    const [translations, setTranslations] = useState<Property['translations']>({});

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
                categoryId: initialData.categoryId || '',
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
            setTranslations(initialData.translations || {});
        }
    }, [initialData]);
    
    useEffect(() => {
        if (!amenitiesLoading && managedAmenities.length > 0) {
            setNewAmenity(prev => ({ ...prev, name: prev.name || managedAmenities[0].name }));
        }
    }, [amenitiesLoading, managedAmenities]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
             setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
             return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTranslationChange = (locale: string, field: 'title' | 'description', value: string) => {
        setTranslations(prev => ({
            ...prev,
            [locale]: {
                ...prev?.[locale],
                [field]: value,
            }
        }));
    };
    
    const addAmenity = () => {
        if (newAmenity.name && !amenities.some(a => a.name === newAmenity.name)) {
            setAmenities([...amenities, { name: newAmenity.name, quantity: newAmenity.quantity || 1 }]);
            setNewAmenity({ name: managedAmenities[0]?.name || '', quantity: 1 });
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
            refreshGallery();
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
    
    const checkApiKey = () => {
        if (!process.env.API_KEY) {
            alert('A chave da API do Gemini não está configurada. Por favor, certifique-se de que a variável de ambiente API_KEY está definida.');
            return false;
        }
        return true;
    };

    const handleGenerateContentWithAI = async () => {
        if (!checkApiKey()) return;
        if (!formData.title || !formData.description) {
            alert('Por favor, preencha o título e a descrição em português primeiro para servirem de base para a IA.');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const amenitiesString = amenities.map(a => `${a.name}${a.quantity > 1 ? ` (${a.quantity})` : ''}`).join(', ');
            const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR').map(l => `${l.name} (${l.code})`).join(', ');

            const systemInstruction = `Você é um especialista em marketing imobiliário e tradutor profissional. Sua tarefa é otimizar um anúncio de imóvel em português e depois traduzir o conteúdo otimizado para inglês (en-US), espanhol (es-ES), francês (fr-FR) e italiano (it-IT). Você DEVE retornar um único objeto JSON. A estrutura do JSON deve ter chaves para cada código de localidade ('pt-BR', 'en-US', 'es-ES', 'fr-FR', 'it-IT'), e cada valor deve ser um objeto com as chaves "title" e "description". Mantenha a estrutura e a formatação (como listas com '▫️') nas descrições traduzidas.`;
            
            const userPrompt = `
                Otimize o título e a descrição a seguir para o mercado imobiliário brasileiro, seguindo o formato de exemplo para a descrição em português. Depois, traduza o título e a descrição OTIMIZADOS para os seguintes idiomas: ${languagesToTranslate}.

                ## Exemplo de Formato para a Descrição em Português (pt-BR):
                [Parágrafo Introdutório Gerado]

                [Parágrafo com detalhes de área construída, terreno, etc.]

                Entre os ambientes, destacam-se:

                ▫️ [Item 1 da lista de ambientes]
                ▫️ [Item 2 da lista de ambientes]

                Detalhes de estrutura e acabamento:

                ▫️ [Item 1 da lista de detalhes]
                ▫️ [Item 2 da lista de detalhes]

                [Parágrafo de Conclusão, ideal para quem o imóvel se destina]

                ## Detalhes da Propriedade para Usar:
                - Tipo: ${formData.propertyType}
                - Finalidade: ${formData.purpose === 'RENT' ? 'Aluguel' : 'Venda'}
                - Localização: ${formData.address}, ${formData.neighborhood}, ${formData.city}, ${formData.state}
                - Quartos: ${formData.bedrooms || 'Não informado'}
                - Banheiros: ${formData.bathrooms || 'Não informado'}
                - Área Construída: ${formData.areaM2 ? formData.areaM2 + ' m²' : 'Não informada'}
                - Ano de Construção: ${formData.yearBuilt || 'Não informado'}
                - Qualidade da Manutenção: ${formData.repairQuality}
                - Comodidades: ${amenitiesString || 'Nenhuma listada'}
                - Conteúdo Atual (para referência):
                  - Título: ${JSON.stringify(formData.title)}
                  - Descrição: ${JSON.stringify(formData.description)}

                Gere o JSON completo com todas as otimizações e traduções.
            `;

            const langSchema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['title', 'description']
            };

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    'pt-BR': langSchema,
                    'en-US': langSchema,
                    'es-ES': langSchema,
                    'fr-FR': langSchema,
                    'it-IT': langSchema,
                },
            };

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userPrompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema,
                }
            });

            const content = response.text;
            if (content) {
                const jsonResponse = JSON.parse(content);
                
                const allTranslations: Property['translations'] = {};
                
                for (const lang of supportedLanguages) {
                    const langData = jsonResponse[lang.code];
                    if (langData && langData.title && langData.description) {
                        if (lang.code === 'pt-BR') {
                            setFormData(prev => ({
                                ...prev,
                                title: langData.title,
                                description: langData.description,
                            }));
                        } else {
                            allTranslations[lang.code] = {
                                title: langData.title,
                                description: langData.description
                            };
                        }
                    }
                }
                setTranslations(allTranslations);

            } else {
                throw new Error("Resposta da IA vazia.");
            }

        } catch (error) {
            console.error("Erro ao gerar conteúdo com IA:", error);
            alert("Ocorreu um erro durante a geração de conteúdo com IA. Verifique se sua chave de API está configurada corretamente. Detalhes no console.");
        } finally {
            setIsGeneratingAI(false);
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
            categoryId: formData.categoryId || undefined,
            rentPrice: formData.purpose !== 'SALE' ? (isNaN(parsedRentPrice) ? undefined : parsedRentPrice) : undefined,
            salePrice: formData.purpose === 'SALE' ? (isNaN(parsedSalePrice) ? undefined : parsedSalePrice) : undefined,
            bedrooms: isNaN(parsedBedrooms) ? undefined : parsedBedrooms,
            bathrooms: isNaN(parsedBathrooms) ? undefined : parsedBathrooms,
            areaM2: isNaN(parsedAreaM2) ? undefined : parsedAreaM2,
            yearBuilt: isNaN(parsedYearBuilt) ? undefined : parsedYearBuilt,
            images: primaryImageFirst.map(img => img.preview),
            amenities: amenities,
            translations: translations,
        };
        onSubmit(propertyData, status);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const mainActionStatus = (isEditing && initialData?.status) ? initialData.status : 'AVAILABLE';
        triggerSubmit(mainActionStatus);
    };

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
                                    <option value={'RENT'}>Aluguel</option>
                                    <option value={'SALE'}>Venda</option>
                                    <option value={'SEASONAL'}>Temporada</option>
                                </select>
                            </div>

                            {formData.purpose !== 'SALE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Preço do Aluguel (/mês ou /diária)</label>
                                    <input type="number" name="rentPrice" value={formData.rentPrice} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                                </div>
                            )} 
                            
                            {formData.purpose === 'SALE' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Preço de Venda</label>
                                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                                </div>
                            )}
                         </div>
                    </div>

                    <hr/>

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Descrição e Traduções</h2>
                        <div className="border-b border-slate-200">
                            <nav className="-mb-px flex space-x-6">
                                {supportedLanguages.map(lang => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setActiveLangTab(lang.code)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeLangTab === lang.code
                                            ? 'border-primary-blue text-primary-blue'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        {lang.flag} {lang.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div className="mt-6">
                            {activeLangTab === 'pt-BR' ? (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Descrição (Português)</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={10} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"></textarea>
                                    <div className="mt-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleGenerateContentWithAI}
                                            disabled={isGeneratingAI}
                                            className="flex items-center bg-secondary-blue text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-secondary-blue/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            <SparklesIcon className={`w-5 h-5 mr-2 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                                            {isGeneratingAI ? 'Otimizando e Traduzindo...' : 'Otimizar com IA'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-slate-