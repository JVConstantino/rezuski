import { PropertyPurpose, PropertyStatus, PropertyType, UserRole } from "../types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          createdAt?: string;
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
          amenities: Json;
          availableDate?: string;
          listedByUserId?: string;
          priceHistory: Json;
          isPopular?: boolean;
          tourUrl?: string;
          viewCount?: number;
        };
        Insert: {
          id?: string;
          createdAt?: string;
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
          amenities: Json;
          availableDate?: string;
          listedByUserId?: string;
          priceHistory: Json;
          isPopular?: boolean;
          tourUrl?: string;
          viewCount?: number;
        };
        Update: {
          id?: string;
          createdAt?: string;
          title?: string;
          code?: string;
          address?: string;
          city?: string;
          state?: string;
          zipCode?: string;
          description?: string;
          purpose?: PropertyPurpose;
          rentPrice?: number;
          salePrice?: number;
          propertyType?: PropertyType;
          categoryId?: string;
          bedrooms?: number;
          bathrooms?: number;
          areaM2?: number;
          repairQuality?: string;
          status?: PropertyStatus;
          yearBuilt?: number;
          images?: string[];
          amenities?: Json;
          availableDate?: string;
          listedByUserId?: string;
          priceHistory?: Json;
          isPopular?: boolean;
          tourUrl?: string;
          viewCount?: number;
        };
      };
      profiles: {
        Row: {
          id: string
          updatedAt?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: UserRole
        }
        Insert: {
          id: string
          updatedAt?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: UserRole
        }
        Update: {
          id?: string
          updatedAt?: string | null
          email?: string
          name?: string
          avatarUrl?: string
          role?: UserRole
        }
      };
      brokers: {
        Row: {
          id: string
          name: string
          title: string
          avatarUrl: string
          phone: string
          email: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          avatarUrl: string
          phone: string
          email: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          avatarUrl?: string
          phone?: string
          email?: string
        }
      };
      categories: {
        Row: {
          id: string
          name: string
          iconUrl: string
        }
        Insert: {
          id?: string
          name: string
          iconUrl: string
        }
        Update: {
          id?: string
          name?: string
          iconUrl?: string
        }
      };
      resources: {
        Row: {
            id: string;
            title: string;
            fileUrl: string;
        };
        Insert: {
            id?: string;
            title: string;
            fileUrl: string;
        };
        Update: {
            id?: string;
            title?: string;
            fileUrl?: string;
        };
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}