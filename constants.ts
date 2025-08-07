import { Activity, ApplicationStatus, PriceHistoryEvent, BackgroundCheckType, BackgroundCheckStatus, Broker, Testimonial, Category, Tenant, ResourceDocument, User, Property, Application } from './types';

export const LOGO_URL = 'https://emofviiywuhaxqoqowup.supabase.co/storage/v1/object/public/general-files/public/LOGO.png';

// Mock data has been migrated to Supabase. These constants are kept for reference or for parts of the app not yet migrated.
// In a full migration, these would be removed entirely.
export const USERS: User[] = [];
export const CATEGORIES: Category[] = [];
export const PROPERTIES: Property[] = [];
export const APPLICATIONS: Application[] = [];
export const TENANTS: Tenant[] = [];
export const ACTIVITIES: Activity[] = [];
export const BROKERS: Broker[] = [];
export const TESTIMONIALS: Testimonial[] = [
    {
        id: 'test-1',
        authorName: 'Fabiana Madruga',
        authorTitle: 'Avaliação do Google',
        text: 'Aluguei com eles por passarem uma imensa credibilidade desde o início do atendimento. Foram muito sinceros em relação aos imóveis e claros nas informações. Recomendo.',
        avatarUrl: '',
    },
    {
        id: 'test-2',
        authorName: 'Clerio Joanir',
        authorTitle: 'Avaliação do Google',
        text: 'Excelente atendimento e grande profissionalismo quanto à orientações e avaliações. Local muito acolhedor. Recomendo a todos.',
        avatarUrl: '',
    },
    {
        id: 'test-3',
        authorName: 'Thiago Wermelinger',
        authorTitle: 'Avaliação do Google',
        text: 'Pessoal muito simpático, profissionais, e tem um diferencial que outras não tem vai lá para conferir!',
        avatarUrl: '',
    },
    {
        id: 'test-4',
        authorName: 'José Fabio do Amaral',
        authorTitle: 'Avaliação do Google',
        text: 'Realizei a compra de um imóvel e fui muito bem atendido, com responsabilidade e profissionalismo. Recomendo.',
        avatarUrl: '',
    },
    {
        id: 'test-5',
        authorName: 'Rafael Nascimento',
        authorTitle: 'Comentário do Google',
        text: 'Bom atendimento e excelentes oportunidades.',
        avatarUrl: '',
    },
    {
        id: 'test-6',
        authorName: 'Diego Ribeiro',
        authorTitle: 'Avaliação do Google',
        text: 'Excelente imobiliaria! Excelentes profissionais! Recomendo',
        avatarUrl: '',
    },
];
export const RESOURCES: ResourceDocument[] = [];


export const SEARCH_TRENDS: string[] = [
    'casa com piscina',
    'terreno em condomínio',
    'apartamento centro',
    'chácara papucaia',
    'aluguel temporada',
    'imóvel comercial',
];

export const RENT_PRICE_RANGES: Record<string, string> = {
  'any': 'Qualquer Valor',
  '200-500': 'R$ 200 - R$ 500',
  '501-1000': 'R$ 501 - R$ 1.000',
  '1001-1500': 'R$ 1.001 - R$ 1.500',
  '1501-2000': 'R$ 1.501 - R$ 2.000',
  '2001+': 'Acima de R$ 2.001',
};

export const SALE_PRICE_RANGES: Record<string, string> = {
  'any': 'Qualquer Valor',
  '10000-50000': 'R$ 10.000 - R$ 50.000',
  '50001-100000': 'R$ 50.001 - R$ 100.000',
  '100001-150000': 'R$ 100.001 - R$ 150.000',
  '150001-200000': 'R$ 150.001 - R$ 200.000',
  '200001-300000': 'R$ 200.001 - R$ 300.000',
  '300001-400000': 'R$ 300.001 - R$ 400.000',
  '400001+': 'Acima de R$ 400.001',
};

export const BEDROOM_OPTIONS: Record<string, string> = {
    'any': 'Qualquer',
    '1': '1+',
    '2': '2+',
    '3': '3+',
    '4': '4+',
    '5': '5+',
};

export const BATHROOM_OPTIONS: Record<string, string> = {
    'any': 'Qualquer',
    '1': '1+',
    '2': '2+',
    '3': '3+',
    '4': '4+',
};


const dummyPdfUrl = 'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUiBdCi9Db3VudCAxCi9NZWRpYUJveCBbMCAwIDM1MCAxNDRdCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgPCA8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+Pgo+PgovUHJvY1NldCBbIC9QREYvIFRleHQgXQo+PgovQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA4NQo+PgpzdHJlYW0KQkQKQlQKL0YxIDEyIFRmCjUwIDcwIFRkCihFbSBicmV2ZSwgbyBkb2N1bWVudG8gZXN0YXLhIGRpc3Bvbml2ZWwuKSBUagpFVApFUAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDgxMCAwMDAwMCBuIAowMDAwMDAwMDc5IDAwMDAwIG4gCjAwMDAwMDAxNzcgMDAwMDAwIG4gCjAwMDAwMDA1MjMgMDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNTk3CiUlRU9GCg==';

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
