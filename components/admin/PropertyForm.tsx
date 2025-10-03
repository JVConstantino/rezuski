import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Property, PropertyType, PropertyPurpose, Amenity, PropertyStatus } from '../../types';
import { useCategories } from '../../contexts/CategoryContext';
import { useAmenities } from '../../contexts/AmenityContext';
import { useImages } from '../../contexts/ImageContext';
import { useAIConfig } from '../../contexts/AIConfigContext';
import { useStorageConfig } from '../../contexts/StorageConfigContext';
import { useAuth } from '../../contexts/AuthContext';
import { getStorageClient, getRelativePath } from '../../lib/storageClient';
import { getOptimizedImageUrl } from '../../lib/localize';
import ImageGalleryModal from './ImageGalleryModal';
import { SparklesIcon, StarIcon, TrashIcon, PlusIcon, DownloadIcon } from '../Icons';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from 'openai';
import LazyImage from '../LazyImage';

interface PropertyFormProps {
    initialData?: Property;
    onSubmit: (data: Omit<Property, 'id' | 'status' | 'priceHistory' | 'amenities'> & { amenities: Amenity[]; translations: Property['translations'] }, status: PropertyStatus) => Promise<Property | undefined>;
    isEditing: boolean;
    isSubmitting?: boolean;
}

interface ImageState {
    preview: string;
    isPrimary: boolean;
}

interface DocumentState {
    id?: string;
    name: string;
    url: string;
    size: number;
    uploadedAt?: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isEditing, isSubmitting = false }) => {
    const { categories } = useCategories();
    const { amenities: managedAmenities, loading: amenitiesLoading } = useAmenities();
    const { refresh: refreshGallery } = useImages();
    const { t, propertyTypes, supportedLanguages } = useLanguage();
    const { activeConfig: aiConfig, loading: aiConfigLoading } = useAIConfig();
    const { activeConfig: storageConfig } = useStorageConfig();
    const { user } = useAuth();
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState('pt-BR');
    const navigate = useNavigate();

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
        youtubeUrl: '',
    });
    
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [newAmenity, setNewAmenity] = useState({ name: '', quantity: 1 });
    const [images, setImages] = useState<ImageState[]>([]);
    const [documents, setDocuments] = useState<DocumentState[]>([]);
    const [translations, setTranslations] = useState<Property['translations']>({});
    const [docUploadProgress, setDocUploadProgress] = useState({ current: 0, total: 0 });
    const [docUploadStatus, setDocUploadStatus] = useState<string | null>(null);

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
                youtubeUrl: initialData.youtubeUrl || '',
            });
            setAmenities(initialData.amenities);
            const initialImages = initialData.images.map((img, index) => ({
                preview: img,
                isPrimary: index === 0,
            }));
            setImages(initialImages);
            setTranslations(initialData.translations || {});
            
            // Carregar documentos existentes se estiver editando
            if (initialData.id) {
                loadExistingDocuments(initialData.id);
            }
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

    const loadExistingDocuments = async (propertyId: string) => {
        try {
            const { data, error } = await supabase
                .from('property_documents')
                .select('*')
                .eq('property_id', propertyId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            const documentStates: DocumentState[] = data.map(doc => ({
                id: doc.id,
                name: doc.document_name,
                url: doc.document_url,
                size: doc.file_size || 0,
                uploadedAt: doc.uploaded_at
            }));

            setDocuments(documentStates);
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
        }
    };

    const handleDocumentUpload = async (files: FileList) => {
        const totalFiles = files.length;
        if (totalFiles === 0) return;

        // Inicia barra de progresso
        setDocUploadProgress({ current: 0, total: totalFiles });

        const client = getStorageClient(storageConfig?.storage_url, storageConfig?.storage_key);
        const bucketName = 'property-documents';
        const uploadedDocs: DocumentState[] = [];

        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            
            // Validar tipo de arquivo
            if (file.type !== 'application/pdf') {
                if (user?.email === 'joaovictor.priv@gmail.com') {
                    console.log('🔍 DEBUG - Tipo de arquivo inválido:', {
                        fileName: file.name,
                        fileType: file.type,
                        expectedType: 'application/pdf',
                        timestamp: new Date().toISOString()
                    });
                    alert(`❌ DEBUG - Tipo inválido:\n\nArquivo: ${file.name}\nTipo detectado: ${file.type}\nTipo esperado: application/pdf`);
                } else {
                    alert(`O arquivo ${file.name} não é um PDF válido.`);
                }
                setDocUploadProgress({ current: i + 1, total: totalFiles });
                continue;
            }

            // Validar tamanho (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                if (user?.email === 'joaovictor.priv@gmail.com') {
                    console.log('🔍 DEBUG - Arquivo muito grande:', {
                        fileName: file.name,
                        fileSize: file.size,
                        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
                        maxSizeMB: 10,
                        timestamp: new Date().toISOString()
                    });
                    alert(`❌ DEBUG - Arquivo muito grande:\n\nArquivo: ${file.name}\nTamanho: ${(file.size / 1024 / 1024).toFixed(2)} MB\nTamanho máximo: 10 MB`);
                } else {
                    alert(`O arquivo ${file.name} é muito grande. Máximo 10MB.`);
                }
                setDocUploadProgress({ current: i + 1, total: totalFiles });
                continue;
            }

            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
            const filePath = `public/documents/${fileName}`;

            try {
                const { error: uploadError } = await client.storage
                    .from(bucketName)
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                uploadedDocs.push({
                    name: file.name,
                    url: filePath,
                    size: file.size
                });
            } catch (error) {
                console.error(`Erro ao enviar o arquivo ${file.name}:`, error);
                
                // Debug detalhado apenas para o usuário específico
                if (user?.email === 'joaovictor.priv@gmail.com') {
                    const errorDetails = {
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type,
                        filePath: filePath,
                        bucketName: bucketName,
                        storageUrl: storageConfig?.storage_url,
                        hasStorageKey: !!storageConfig?.storage_key,
                        error: error,
                        errorMessage: error instanceof Error ? error.message : JSON.stringify(error),
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('🔍 DEBUG DETALHADO - Upload PDF Error:', errorDetails);
                    
                    alert(`❌ ERRO DETALHADO (Debug para ${user.email}):\n\n` +
                          `Arquivo: ${file.name}\n` +
                          `Tamanho: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
                          `Tipo: ${file.type}\n` +
                          `Caminho: ${filePath}\n` +
                          `Bucket: ${bucketName}\n` +
                          `Storage URL: ${storageConfig?.storage_url || 'Não configurado'}\n` +
                          `Storage Key: ${storageConfig?.storage_key ? 'Configurado' : 'Não configurado'}\n` +
                          `Erro: ${error instanceof Error ? error.message : JSON.stringify(error)}\n` +
                          `Timestamp: ${new Date().toLocaleString('pt-BR')}`);
                } else {
                    alert(`Erro ao enviar o arquivo: ${file.name}`);
                }
            }

            setDocUploadProgress({ current: i + 1, total: totalFiles });
        }

        if (uploadedDocs.length > 0) {
            setDocuments(prev => [...prev, ...uploadedDocs]);
            setDocUploadStatus(`${uploadedDocs.length} PDF(s) enviados com sucesso`);
            setTimeout(() => setDocUploadStatus(null), 3000);
        }

        setTimeout(() => {
            setDocUploadProgress({ current: 0, total: 0 });
        }, 1500);
    };

    const handleDeleteDocument = async (index: number) => {
        const document = documents[index];
        
        try {
            // Se o documento tem ID, deletar do banco
            if (document.id) {
                const { error: dbError } = await supabase
                    .from('property_documents')
                    .delete()
                    .eq('id', document.id);

                if (dbError) throw dbError;
            }

            // Deletar do storage
            const client = getStorageClient(storageConfig?.storage_url, storageConfig?.storage_key);
            const { error: storageError } = await client.storage
                .from('property-documents')
                .remove([document.url]);

            if (storageError) {
                console.warn('Erro ao deletar arquivo do storage:', storageError);
            }

            // Remover da lista local
            setDocuments(prev => prev.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Erro ao deletar documento:', error);
            alert('Erro ao deletar documento.');
        }
    };

    const handleDownloadDocument = async (document: DocumentState) => {
        const client = getStorageClient(storageConfig?.storage_url, storageConfig?.storage_key);

        // Tenta criar URL assinada (ideal para buckets privados)
        const { data: signedData } = await client.storage
            .from('property-documents')
            .createSignedUrl(document.url, 60);

        let url = signedData?.signedUrl;

        // Fallback para URL pública
        if (!url) {
            const { data: publicData } = client.storage
                .from('property-documents')
                .getPublicUrl(document.url);
            url = publicData?.publicUrl;
        }

        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Não foi possível obter o link do PDF. Verifique as permissões do bucket.');
        }
    };

    const handleImageUpload = async (files: FileList) => {
        const totalFiles = files.length;
        if (totalFiles === 0) return;

        setUploadProgress({ current: 0, total: totalFiles });
        const uploadedPaths: string[] = [];
        const client = getStorageClient(storageConfig?.storage_url, storageConfig?.storage_key);
        const bucketName = storageConfig?.bucket_name || 'property-images';

        for (let i = 0; i < totalFiles; i++) {
            const file = files[i];
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
            const filePath = `public/properties/${fileName}`;

            try {
                const { error: uploadError } = await client.storage
                    .from(bucketName)
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Armazena apenas o caminho relativo
                uploadedPaths.push(filePath);
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
                alert(`Erro ao enviar o arquivo: ${file.name}`);
            }
            
            setUploadProgress({ current: i + 1, total: totalFiles });
        }

        if (uploadedPaths.length > 0) {
            const newImageStates = uploadedPaths.map(path => ({ preview: path, isPrimary: false }));
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
        // Converte URLs completas para caminhos relativos se necessário
        const bucketName = storageConfig?.bucket_name || 'property-images';
        const relativePaths = selectedImages.map(img => {
            const relativePath = getRelativePath(img, bucketName);
            return relativePath || img;
        });
        
        const newImageStates = relativePaths.map(img => ({
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

    const handleGenerateContentWithAI = async () => {
        if (aiConfigLoading) {
            alert('Carregando configurações de IA, por favor aguarde.');
            return;
        }
    
        if (!aiConfig?.api_key || !aiConfig?.model) {
            alert('Nenhum provedor de IA ativo foi configurado. Por favor, configure e ative um provedor no painel de Configurações.');
            navigate('/admin/settings');
            return;
        }
        
        if (!formData.title || !formData.description) {
            alert('Por favor, preencha o título e a descrição em português primeiro para servirem de base para a IA.');
            return;
        }
        setIsGeneratingAI(true);
        try {
            const languagesToTranslate = supportedLanguages.filter(l => l.code !== 'pt-BR').map(l => `${l.name} (${l.code})`).join(', ');
            const purposeMap = {
                'RENT': 'LOCAÇÃO',
                'SALE': 'VENDA',
                'SEASONAL': 'LOCAÇÃO POR TEMPORADA'
            };
            const ptPurpose = purposeMap[formData.purpose];
            const ptPrice = formData.purpose === 'SALE' ? formData.salePrice : formData.rentPrice;

            const systemInstruction = `Você é um especialista em marketing imobiliário e tradutor profissional. Sua tarefa é gerar um título e uma descrição para um anúncio de imóvel em português, seguindo um formato MUITO ESTRITO. Depois, você deve traduzir o conteúdo gerado para inglês (en-US), espanhol (es-ES), francês (fr-FR) e italiano (it-IT), mantendo a estrutura.

Você DEVE retornar um único objeto JSON válido, sem nenhum texto ou formatação adicional fora dele. A estrutura do JSON deve ter chaves para cada código de localidade ('pt-BR', 'en-US', 'es-ES', 'fr-FR', 'it-IT'), e cada valor deve ser um objeto com as chaves "title" e "description".

Para as traduções, traduza as chaves (ex: 'TIPO' para 'TYPE') e os valores. Mantenha o formato de preço como 'R$ 000.000,00'.`;
            
            const userPrompt = `Com base nos dados do imóvel fornecidos, gere o título e a descrição em português seguindo ESTRITAMENTE os formatos abaixo. Depois, traduza-os para os outros idiomas solicitados.

## DADOS DO IMÓVEL:
- Título Base: ${formData.title}
- Descrição Base: ${formData.description}
- Finalidade: ${formData.purpose}
- Tipo de Imóvel: ${formData.propertyType}
- Bairro: ${formData.neighborhood}
- Cidade: ${formData.city}
- Endereço: ${formData.address}
- Código: ${formData.code || 'N/A'}
- Quartos: ${formData.bedrooms || 'Não informado'}
- Banheiros: ${formData.bathrooms || 'Não informado'}
- Área: ${formData.areaM2 ? `${formData.areaM2} m²` : 'Não informada'}
- Comodidades: ${amenities.map(a => a.name).join(', ') || 'Nenhuma'}
- Preço: ${ptPrice ? `R$ ${parseFloat(ptPrice).toLocaleString('pt-BR')}` : 'Sob Consulta'}

## FORMATO OBRIGATÓRIO (Português):

### Título (Use este formato exato):
\`${ptPurpose} – ${formData.propertyType.toUpperCase()} NO ${formData.neighborhood.toUpperCase()} – C.M-RJ, COD. ${formData.code || 'N/A'}\`

### Descrição (Use este formato exato, extraindo as características principais da descrição base e das comodidades):
\`${ptPurpose} – ${formData.propertyType.toUpperCase()} NO ${formData.neighborhood.toUpperCase()} – C.M-RJ, CÓD. ${formData.code || 'N/A'}

TIPO: ${formData.propertyType}

DESCRIÇÃO: 
▫ [Característica 1. Ex: 02 Dormitórios]
▫ [Característica 2. Ex: Sala]
▫ [Característica 3. Ex: Cozinha]
... (liste as características mais importantes)

ENDEREÇO: ${formData.address}

REFERÊNCIA: [Crie um ponto de referência plausível com base no endereço. Ex: Próximo ao mercado local.]

ÁREA: ${formData.areaM2 ? `${formData.areaM2},00 m²` : 'Não informada'}

DOCUMENTAÇÃO: Escriturada

VALOR: ${ptPrice ? `R$ ${parseFloat(ptPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Sob Consulta'}
\`

## IDIOMAS PARA TRADUÇÃO:
${languagesToTranslate}

Agora, gere o objeto JSON completo.`;
    
            let content: string | null = null;
            const provider = aiConfig.provider.toLowerCase();
            
            if (provider === 'gemini') {
                const ai = new GoogleGenAI({ apiKey: aiConfig.api_key });
                const langSchema = { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] };
                const responseSchema = { type: Type.OBJECT, properties: { 'pt-BR': langSchema, 'en-US': langSchema, 'es-ES': langSchema, 'fr-FR': langSchema, 'it-IT': langSchema } };
                const configPayload: any = { systemInstruction, responseMimeType: "application/json", responseSchema };
                if (aiConfig.max_tokens) {
                    configPayload.maxOutputTokens = aiConfig.max_tokens;
                    if (aiConfig.model.includes('flash')) {
                        configPayload.thinkingConfig = { thinkingBudget: Math.floor(aiConfig.max_tokens / 2) };
                    }
                }
    
                const response = await ai.models.generateContent({ model: aiConfig.model, contents: userPrompt, config: configPayload });
                content = response.text;
            } else { // OpenAI and compatible providers
                let baseURL = 'https://api.openai.com/v1'; // Default for OpenAI
                if (provider === 'openrouter') {
                    baseURL = 'https://openrouter.ai/api/v1';
                }
                
                const openai = new OpenAI({ 
                    apiKey: aiConfig.api_key,
                    baseURL: baseURL,
                    dangerouslyAllowBrowser: true 
                });
    
                const response = await openai.chat.completions.create({
                    model: aiConfig.model,
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" },
                    max_tokens: aiConfig.max_tokens || 4096,
                });
                content = response.choices[0].message.content;
            }
    
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
            alert("Ocorreu um erro durante a geração de conteúdo com IA. Verifique se sua chave de API e modelo estão configurados corretamente. Detalhes no console.");
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const triggerSubmit = async (status: PropertyStatus) => {
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
            // Garantir que tourUrl e youtubeUrl sejam enviados corretamente
            tourUrl: formData.tourUrl || undefined,
            youtubeUrl: formData.youtubeUrl || undefined,
        };
        
        // Debug: verificar se youtubeUrl está sendo enviado
        console.log('PropertyForm - Dados sendo enviados:', {
            tourUrl: propertyData.tourUrl,
            youtubeUrl: propertyData.youtubeUrl,
            formDataYoutubeUrl: formData.youtubeUrl
        });
        
        // Salvar documentos PDF se houver
        if (documents.length > 0) {
            try {
                const savedProperty = await onSubmit(propertyData, status);
                const propertyId = savedProperty?.id || initialData?.id;
                
                if (propertyId) {
                    // Salvar apenas documentos novos (sem ID)
                    const newDocuments = documents.filter(doc => !doc.id);
                    
                    for (const doc of newDocuments) {
                        const { error: docError } = await supabase
                            .from('property_documents')
                            .insert({
                                property_id: propertyId,
                                document_name: doc.name,
                                document_url: doc.url,
                                file_size: doc.size
                            });
                        
                        if (docError) {
                            console.error('Erro ao salvar documento:', docError);
                        }
                    }
                }
                return savedProperty;
            } catch (error) {
                console.error('Erro ao salvar propriedade com documentos:', error);
                throw error;
            }
        } else {
            onSubmit(propertyData, status);
        }
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
                                            disabled={isGeneratingAI || aiConfigLoading}
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
                                        <h3 className="text-lg font-semibold text-slate-800">Tradução: {supportedLanguages.find(l => l.code === activeLangTab)?.name}</h3>
                                    </div>
                                    <div>
                                        <label htmlFor={`title-${activeLangTab}`} className="block text-sm font-medium text-slate-700">Título ({activeLangTab})</label>
                                        <input
                                            id={`title-${activeLangTab}`}
                                            type="text"
                                            value={translations?.[activeLangTab]?.title || ''}
                                            onChange={e => handleTranslationChange(activeLangTab, 'title', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <label htmlFor={`description-${activeLangTab}`} className="block text-sm font-medium text-slate-700">Descrição ({activeLangTab})</label>
                                        <textarea
                                            id={`description-${activeLangTab}`}
                                            rows={10}
                                            value={translations?.[activeLangTab]?.description || ''}
                                            onChange={e => handleTranslationChange(activeLangTab, 'description', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                        ></textarea>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Detalhes e Características</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Tipo de Imóvel</label>
                                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    {propertyTypes.map(type => <option key={type.name} value={type.name}>{t(`propertyType:${type.name}`)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Categoria</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm">
                                    <option value="">Nenhuma</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{t(`category:${cat.id}`)}</option>)}
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
                                <label className="block text-sm font-medium text-slate-700">Qualidade</label>
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">URL do Tour Virtual 3D</label>
                                <input type="url" name="tourUrl" value={formData.tourUrl} onChange={handleInputChange} placeholder="https://..." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700">URL do Vídeo do YouTube</label>
                                <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange} placeholder="https://www.youtube.com/watch?v=..." className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"/>
                                <p className="mt-1 text-sm text-slate-500">Cole o link completo do vídeo do YouTube para ser exibido na página do imóvel</p>
                            </div>
                            <div className="flex items-center pt-6">
                                <input id="isPopular" name="isPopular" type="checkbox" checked={formData.isPopular} onChange={handleInputChange} className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-slate-300 rounded" />
                                <label htmlFor="isPopular" className="ml-2 block text-sm text-slate-900">Marcar como popular</label>
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Comodidades</h2>
                        <div className="mt-4 space-y-3">
                            {amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                                    <span className="text-slate-700">{amenity.name} ({amenity.quantity})</span>
                                    <button type="button" onClick={() => removeAmenity(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                            <select
                                value={newAmenity.name}
                                onChange={e => setNewAmenity({ ...newAmenity, name: e.target.value })}
                                className="flex-grow px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                            >
                                <option value="" disabled>{amenitiesLoading ? 'Carregando...' : 'Selecione'}</option>
                                {managedAmenities.map(ma => <option key={ma.id} value={ma.name}>{ma.name}</option>)}
                            </select>
                            <input
                                type="number"
                                value={newAmenity.quantity}
                                onChange={e => setNewAmenity({ ...newAmenity, quantity: parseInt(e.target.value) || 1 })}
                                className="w-20 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue sm:text-sm"
                                min="1"
                            />
                            <button type="button" onClick={addAmenity} className="flex items-center bg-secondary-blue text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-secondary-blue/90">
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Imagens</h2>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <LazyImage 
                                      src={getOptimizedImageUrl(image.preview, { width: 200, height: 128 }, storageConfig)} 
                                      alt={`Preview ${index}`} 
                                      className="w-full h-32 object-cover rounded-lg" 
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-2">
                                        <button type="button" onClick={() => handleSetPrimary(index)} disabled={index === 0} className="text-white disabled:opacity-50">
                                            <StarIcon className={`w-6 h-6 ${index === 0 ? 'text-yellow-400 fill-current' : ''}`} />
                                        </button>
                                        <button type="button" onClick={() => handleDeleteImage(index)} className="text-red-500">
                                            <TrashIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                    {index === 0 && <div className="absolute top-1 right-1 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">Principal</div>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                            <button type="button" onClick={() => setGalleryOpen(true)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">Selecionar da Galeria</button>
                            <label className="cursor-pointer px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">
                                <span>Enviar Arquivos</span>
                                <input type="file" multiple onChange={(e) => e.target.files && handleImageUpload(e.target.files)} className="hidden" />
                            </label>
                        </div>
                        {uploadProgress.total > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}></div>
                            </div>
                        )}
                    </div>

                    {/* Documentos PDF */}
                    <hr />

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Documentos PDF</h2>
                        <div className="mt-4 flex items-center space-x-2">
                            <label className="cursor-pointer px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-100">
                                <span>Enviar PDF</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    onChange={(e) => e.target.files && handleDocumentUpload(e.target.files)}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-slate-500">Apenas PDF. Máx. 10MB por arquivo.</p>
                        </div>

                        {docUploadProgress.total > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-primary-blue h-2.5 rounded-full" style={{ width: `${(docUploadProgress.current / docUploadProgress.total) * 100}%` }}></div>
                            </div>
                        )}
                        {docUploadStatus && (
                            <p className="mt-2 text-sm text-green-600">{docUploadStatus}</p>
                        )}

                        {documents.length > 0 && (
                            <div className="mt-4 space-y-3">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-slate-700 font-medium">{doc.name}</span>
                                            {doc.size ? (
                                                <span className="text-xs text-slate-500">({(doc.size / 1024).toFixed(1)} KB)</span>
                                            ) : null}
                                            {doc.uploadedAt ? (
                                                <span className="text-xs text-slate-500">• Enviado em {new Date(doc.uploadedAt).toLocaleString()}</span>
                                            ) : null}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => handleDownloadDocument(doc)}
                                                className="p-1 text-primary-blue hover:bg-slate-200 rounded-full"
                                            >
                                                <DownloadIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteDocument(index)}
                                                className="p-1 text-red-500 hover:bg-red-100 rounded-full"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-8 flex justify-end space-x-3">
                    <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Cancelar</button>
                    {isEditing && (
                        <button type="button" onClick={() => triggerSubmit('ARCHIVED')} disabled={isSubmitting} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? 'Salvando...' : 'Salvar e Arquivar'}
                        </button>
                    )}
                    <button type="submit" disabled={isSubmitting} className="bg-primary-green text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Adicionar Propriedade')}
                    </button>
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
