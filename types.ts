

export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  TENANT = 'TENANT',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
}

export enum ApplicationStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  DRAFT = 'Draft',
}

export enum BackgroundCheckType {
  SSN_CPF_TRACKING = 'SSN/CPF Tracking',
  EVICTION_SEARCH = 'Eviction Search',
  SEX_OFFENDER_SEARCH = 'Sex Offender Search',
  GLOBAL_WATCHLIST = 'Global Watchlist Search',
  NATIONAL_CRIMINAL = 'National Criminal Search',
}

export enum BackgroundCheckStatus {
  CLEAN = 'Clean',
  FLAGGED = 'Flagged',
  PENDING = 'Pending',
  NOT_APPLICABLE = 'N/A',
}

export enum PriceHistoryEvent {
  LISTED = 'Listed',
  PRICE_CHANGE = 'Price Change',
  RENTED = 'Rented',
  SOLD = 'Sold',
}

export enum PropertyPurpose {
  RENT = 'RENT',
  SALE = 'SALE',
  SEASONAL = 'SEASONAL',
}

export enum PropertyType {
    HOUSE = 'Casa',
    APARTMENT = 'Apartamento',
    CONDO = 'Condomínio',
    COMMERCIAL = 'Comercial',
    LAND = 'Terreno',
    TOWNHOUSE = 'Sobrado'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface PriceHistory {
  id: string;
  date: string;
  price: number;
  event: PriceHistoryEvent;
  source?: string;
}

export interface Category {
  id:string;
  name: string;
  iconUrl: string;
}

export interface Amenity {
  name: string;
  quantity: number;
}

export interface Property {
  id: string;
  title: string;
  code?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  purpose: PropertyPurpose;
  rentPrice?: number;
  salePrice?: number;
  propertyType: PropertyType;
  categoryId?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  repairQuality?: string;
  status: PropertyStatus;
  yearBuilt?: number;
  images: string[];
  amenities: Amenity[];
  availableDate?: string;
  listedByUserId?: string;
  priceHistory: PriceHistory[];
  isPopular?: boolean;
  tourUrl?: string;
  viewCount?: number;
}

export interface BackgroundCheck {
  id: string;
  type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  details?: string;
}

export interface CreditReport {
  id: string;
  score?: number;
  onTimePayment?: string;
  creditUtilized?: string;
  estimatedMonthlyPayments?: number;
  totalDebt?: number;
}

export interface Reference {
  id: string;
  name: string;
  contact?: string;
  verificationStatus?: string;
  notes?: string;
}

export interface Application {
  id: string;
  propertyId: string;
  applicantId: string;
  applicationDate: string;
  status: ApplicationStatus;
  totalIncome?: number;
  incomeToRentRatio?: number;
  occupants?: number;
  moveInDate?: string;
  vehicles?: string;
  backgroundChecks: BackgroundCheck[];
  creditReport?: CreditReport;
  reference?: Reference;
}

export interface Tenant {
  id: string;
  userId: string;
  propertyId: string;
  leaseEndDate: string;
  rentAmount: number;
}

export interface Activity {
  id: string;
  date: string;
  time: string;
  type: 'Locação' | 'Tarefas' | 'Visitas' | 'Recorrente';
  user: string;
  property: string;
  status: 'Concluído' | 'Pendente';
}

export interface Broker {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  phone: string;
  email: string;
}

export interface Testimonial {
  id: string;
  text: string;
  authorName: string;
  authorTitle: string;
  avatarUrl: string;
}

export interface ResourceDocument {
    id: string;
    title: string;
    fileUrl: string;
}