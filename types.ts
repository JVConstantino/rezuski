

export type UserRole = 'ADMIN' | 'OWNER' | 'TENANT' | 'BUYER' | 'SELLER';

export type PropertyStatus = 'AVAILABLE' | 'RENTED' | 'SOLD' | 'ARCHIVED';

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

export type PropertyPurpose = 'RENT' | 'SALE' | 'SEASONAL';

export type PropertyType = 'Casa' | 'Apartamento' | 'Condomínio' | 'Comercial' | 'Terreno' | 'Sobrado';

export const PropertyTypes: PropertyType[] = ['Casa', 'Apartamento', 'Condomínio', 'Comercial', 'Terreno', 'Sobrado'];


export type MessageSender = 'ADMIN' | 'CUSTOMER';

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
  translations?: {
      [locale: string]: string;
  }
}

export interface Amenity {
  name: string;
  quantity: number;
}

export interface ManagedAmenity {
  id: string;
  name: string;
  translations?: { [locale: string]: string; };
}

export interface Property {
  id: string;
  title: string;
  code?: string;
  address: string;
  neighborhood: string;
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
  display_order?: number;
  translations?: {
    [locale: string]: {
        title?: string;
        description?: string;
    }
  }
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

export interface Conversation {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  property_id?: string;
  last_message_at: string;
  last_message_preview?: string;
  admin_has_unread: boolean;
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender: MessageSender;
  content: string;
}