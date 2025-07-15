

import { Activity, UserRole, PropertyStatus, ApplicationStatus, PriceHistoryEvent, BackgroundCheckType, BackgroundCheckStatus, PropertyPurpose, Broker, Testimonial, Category, Tenant, PropertyType, ResourceDocument, User, Property, Application, Amenity } from './types';


export const USERS: User[] = [
  { id: 'user-1', email: 'admin@rezuski.com', role: UserRole.ADMIN, name: 'Admin Rezuski', avatarUrl: `https://i.pravatar.cc/150?u=user-1` },
  { id: 'user-2', email: 'comprador@email.com', role: UserRole.BUYER, name: 'João Comprador', avatarUrl: `https://i.pravatar.cc/150?u=user-2` },
  { id: 'user-3', email: 'inquilino@email.com', role: UserRole.TENANT, name: 'Maria Inquilina', avatarUrl: `https://i.pravatar.cc/150?u=user-3` },
];

export const CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Casa', iconUrl: 'https://img.icons8.com/plasticine/100/000000/exterior.png' },
    { id: 'cat-2', name: 'Apartamento', iconUrl: 'https://img.icons8.com/plasticine/100/000000/apartment.png' },
    { id: 'cat-3', name: 'Condomínio', iconUrl: 'https://img.icons8.com/plasticine/100/000000/condominium.png' },
    { id: 'cat-4', name: 'Comercial', iconUrl: 'https://img.icons8.com/plasticine/100/000000/shop.png' },
    { id: 'cat-5', name: 'Terreno', iconUrl: 'https://img.icons8.com/plasticine/100/000000/property.png' },
    { id: 'cat-6', name: 'Sobrado', iconUrl: 'https://img.icons8.com/plasticine/100/000000/home.png' },
];

const defaultAmenities: Amenity[] = [
    { name: 'Piscina', quantity: 1 }, { name: 'Churrasqueira', quantity: 1 }, { name: 'Garagem', quantity: 2 }, { name: 'Cozinha Americana', quantity: 1 }, { name: 'Varanda Gourmet', quantity: 1 }
];

export const PROPERTIES: Property[] = [
    { id: 'prop-1', title: 'Casa Espaçosa com Piscina', code: 'C001', address: 'Rua das Flores, 123, Jardim Primavera', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Uma casa incrível e espaçosa, perfeita para a família. Possui uma grande área de lazer com piscina e churrasqueira.', purpose: PropertyPurpose.SALE, salePrice: 750000, propertyType: PropertyType.HOUSE, categoryId: 'cat-1', bedrooms: 4, bathrooms: 3, areaM2: 250, repairQuality: 'Excellent', status: PropertyStatus.AVAILABLE, yearBuilt: 2018, images: ['https://picsum.photos/seed/prop1/800/600', 'https://picsum.photos/seed/prop1a/800/600', 'https://picsum.photos/seed/prop1b/800/600'], amenities: defaultAmenities, availableDate: '2023-01-15', isPopular: true, viewCount: 1250, priceHistory: [{ id: 'ph-1', date: '2023-01-01', price: 750000, event: PriceHistoryEvent.LISTED, source: 'Admin' }], tourUrl: 'https://www.youtube.com/embed/cyo2_A8m5L0' },
    { id: 'prop-2', title: 'Apartamento Moderno no Centro', code: 'A002', address: 'Av. Principal, 456, Centro', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Apartamento com design moderno, totalmente mobiliado e pronto para morar. Perto de tudo.', purpose: PropertyPurpose.RENT, rentPrice: 2500, propertyType: PropertyType.APARTMENT, categoryId: 'cat-2', bedrooms: 2, bathrooms: 2, areaM2: 90, repairQuality: 'Good', status: PropertyStatus.AVAILABLE, yearBuilt: 2020, images: ['https://picsum.photos/seed/prop2/800/600', 'https://picsum.photos/seed/prop2a/800/600'], amenities: [{name: 'Mobiliado', quantity: 1}, {name: 'Ar Condicionado', quantity: 2}], availableDate: '2023-02-01', isPopular: true, viewCount: 2100, priceHistory: [{ id: 'ph-2', date: '2023-01-10', price: 2500, event: PriceHistoryEvent.LISTED, source: 'Admin' }] },
    { id: 'prop-3', title: 'Terreno Amplo em Condomínio', code: 'T003', address: 'Rua do Lago, 789, Condomínio Green Valley', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Excelente terreno plano em condomínio fechado com segurança 24h e área de lazer completa.', purpose: PropertyPurpose.SALE, salePrice: 300000, propertyType: PropertyType.LAND, categoryId: 'cat-5', areaM2: 1000, repairQuality: 'N/A', status: PropertyStatus.AVAILABLE, images: ['https://picsum.photos/seed/prop3/800/600'], amenities: [], priceHistory: [{ id: 'ph-3', date: '2023-01-15', price: 300000, event: PriceHistoryEvent.LISTED, source: 'Admin' }], isPopular: true, viewCount: 850, },
    { id: 'prop-4', title: 'Sala Comercial na Avenida', code: 'S004', address: 'Av. Comercial, 101, Centro', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Sala comercial de 50m² em prédio com portaria e elevador. Ideal para escritórios e consultórios.', purpose: PropertyPurpose.RENT, rentPrice: 1200, propertyType: PropertyType.COMMERCIAL, categoryId: 'cat-4', bathrooms: 1, areaM2: 50, repairQuality: 'Good', status: PropertyStatus.RENTED, yearBuilt: 2015, images: ['https://picsum.photos/seed/prop4/800/600'], amenities: [], priceHistory: [{ id: 'ph-4', date: '2023-01-05', price: 1200, event: PriceHistoryEvent.LISTED, source: 'Admin' }], },
    { id: 'prop-5', title: 'Sobrado Aconchegante', code: 'C005', address: 'Rua das Acácias, 321, Bela Vista', city: 'Papucaia', state: 'RJ', zipCode: '28680-000', description: 'Lindo sobrado com 3 quartos, sendo uma suíte. Espaço gourmet nos fundos e garagem para dois carros.', purpose: PropertyPurpose.SALE, salePrice: 550000, propertyType: PropertyType.TOWNHOUSE, categoryId: 'cat-6', bedrooms: 3, bathrooms: 2.5, areaM2: 180, repairQuality: 'Good', status: PropertyStatus.AVAILABLE, yearBuilt: 2019, images: ['https://picsum.photos/seed/prop5/800/600'], amenities: defaultAmenities.slice(1, 4), availableDate: '2023-03-01', priceHistory: [{ id: 'ph-5', date: '2023-02-20', price: 550000, event: PriceHistoryEvent.LISTED, source: 'Admin' }] },
    { id: 'prop-6', title: 'Aluguel por Temporada na Serra', code: 'T006', address: 'Estrada da Montanha, km 5', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Casa de campo para temporada, com vista para as montanhas, lareira e piscina natural.', purpose: PropertyPurpose.SEASONAL, rentPrice: 450, propertyType: PropertyType.HOUSE, categoryId: 'cat-1', bedrooms: 3, bathrooms: 2, areaM2: 150, repairQuality: 'Good', status: PropertyStatus.AVAILABLE, yearBuilt: 2010, images: ['https://picsum.photos/seed/prop6/800/600'], amenities: [{name: 'Lareira', quantity: 1}, {name: 'Piscina', quantity: 1}], priceHistory: [{ id: 'ph-6', date: '2023-01-01', price: 450, event: PriceHistoryEvent.LISTED, source: 'Admin' }], isPopular: false, viewCount: 980 },
    { id: 'prop-7', title: 'Kitnet para Estudantes', code: 'A007', address: 'Rua da Universidade, 777', city: 'Cachoeiras de Macacu', state: 'RJ', zipCode: '28680-000', description: 'Kitnet mobiliada, ideal para estudantes. Próximo a ponto de ônibus e comércio.', purpose: PropertyPurpose.RENT, rentPrice: 800, propertyType: PropertyType.APARTMENT, categoryId: 'cat-2', bedrooms: 1, bathrooms: 1, areaM2: 30, repairQuality: 'Fair', status: PropertyStatus.AVAILABLE, yearBuilt: 2005, images: ['https://picsum.photos/seed/prop7/800/600'], amenities: [{name: 'Mobiliado', quantity: 1}], priceHistory: [{ id: 'ph-7', date: '2023-01-01', price: 800, event: PriceHistoryEvent.LISTED, source: 'Admin' }], },
];

export const BROKERS: Broker[] = [
    { id: 'broker-1', name: 'Carlos Rezuski', title: 'Corretor Sênior', avatarUrl: `https://i.pravatar.cc/150?u=broker-1`, phone: '(21) 99999-1111', email: 'carlos@rezuski.com' },
    { id: 'broker-2', name: 'Fernanda Lima', title: 'Corretora de Vendas', avatarUrl: `https://i.pravatar.cc/150?u=broker-2`, phone: '(21) 99999-2222', email: 'fernanda@rezuski.com' },
    { id: 'broker-3', name: 'Ricardo Alves', title: 'Especialista em Locação', avatarUrl: `https://i.pravatar.cc/150?u=broker-3`, phone: '(21) 99999-3333', email: 'ricardo@rezuski.com' },
    { id: 'broker-4', name: 'Beatriz Costa', title: 'Corretora Associada', avatarUrl: `https://i.pravatar.cc/150?u=broker-4`, phone: '(21) 99999-4444', email: 'beatriz@rezuski.com' },
];

export const TESTIMONIALS: Testimonial[] = [
    { id: 'test-1', text: 'Excelente atendimento! Encontrei o imóvel dos meus sonhos com a ajuda da equipe Rezuski. Super recomendo!', authorName: 'Ana Paula', authorTitle: 'Compradora Satisfeita', avatarUrl: `https://i.pravatar.cc/150?u=test-1` },
    { id: 'test-2', text: 'Processo de aluguel rápido e sem burocracia. O corretor Ricardo foi muito atencioso e prestativo.', authorName: 'Marcos Silva', authorTitle: 'Inquilino Feliz', avatarUrl: `https://i.pravatar.cc/150?u=test-2` },
    { id: 'test-3', text: 'Vendi meu imóvel em tempo recorde e pelo preço justo. Profissionais de alta competência!', authorName: 'Juliana Ribeiro', authorTitle: 'Vendedora Realizada', avatarUrl: `https://i.pravatar.cc/150?u=test-3` },
];


export const APPLICATIONS: Application[] = [
    { id: 'app-1', propertyId: 'prop-2', applicantId: 'user-2', applicationDate: '2023-10-20', status: ApplicationStatus.PENDING, totalIncome: 8000, incomeToRentRatio: 3.2, occupants: 2, backgroundChecks: [{ id: 'bc-1', type: BackgroundCheckType.EVICTION_SEARCH, status: BackgroundCheckStatus.CLEAN }], creditReport: { id: 'cr-1', score: 750, onTimePayment: '100%', creditUtilized: '30%', totalDebt: 15000 }, },
    { id: 'app-2', propertyId: 'prop-4', applicantId: 'user-3', applicationDate: '2023-10-22', status: ApplicationStatus.ACCEPTED, totalIncome: 5000, incomeToRentRatio: 4.1, occupants: 1, backgroundChecks: [{ id: 'bc-2', type: BackgroundCheckType.EVICTION_SEARCH, status: BackgroundCheckStatus.CLEAN }], creditReport: { id: 'cr-2', score: 680, onTimePayment: '98%', creditUtilized: '50%', totalDebt: 8000 }, },
];

export const TENANTS: Tenant[] = [
    { id: 'ten-1', userId: 'user-3', propertyId: 'prop-4', leaseEndDate: '2024-10-21', rentAmount: 1200 },
];

export const ACTIVITIES: Activity[] = [];
export const RESOURCES: ResourceDocument[] = [];


export const SEARCH_TRENDS: string[] = [
    'casa com piscina',
    'terreno em condomínio',
    'apartamento centro',
    'chácara papucaia',
    'aluguel temporada',
    'imóvel comercial',
];

export const dummyPdfUrl = 'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUiBdCi9Db3VudCAxCi9NZWRpYUJveCBbMCAwIDM1MCAxNDRdCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgPCA8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+Pgo+PgovUHJvY1NldCBbIC9QREYvIFRleHQgXQo+PgovQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA4NQo+PgpzdHJlYW0KQkQKQlQKL0YxIDEyIFRmCjUwIDcwIFRkCihFbSBicmV2ZSwgbyBkb2N1bWVudG8gZXN0YXLhIGRpc3Bvbml2ZWwuKSBUagpFVApFUAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxNzcgMDAwMDAwIG4gCjAwMDAwMDA1MjMgMDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNTk3CiUlRU9GCg==';

// This is just to prevent breaking changes if some component still imports it directly
// but it will be empty if not fetched from context.
export const getInitialResources = (): ResourceDocument[] => [
    { id: 'res-1', title: 'SOLICITAÇÃO DE SUBLOCAÇÃO', fileUrl: dummyPdfUrl },
    { id: 'res-2', title: 'SOLICITAÇÃO DE REPARO', fileUrl: dummyPdfUrl },
    { id: 'res-3', title: 'ALTERAÇÃO DE VENCIMENTO', fileUrl: dummyPdfUrl },
    { id: 'res-4', title: 'PROCEDIMENTOS PARA DESOCUPAÇÃO', fileUrl: dummyPdfUrl },
    { id: 'res-5', title: 'MANUAL DO LOCATÁRIO', fileUrl: dummyPdfUrl },
    { id: 'res-6', title: 'LEI 8.245 LEI DO INQUILINATO', fileUrl: dummyPdfUrl },
    { id: 'res-7', title: 'FICHA DE PRETENSO LOCATÁRIO', fileUrl: dummyPdfUrl },
    { id: 'res-8', title: 'COMUNICADO DE RECISÃO', fileUrl: dummyPdfUrl },
];