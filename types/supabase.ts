
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
          id: string
          createdAt?: string
          title: string
          code?: string
          address: string
          neighborhood: string
          city: string
          state: string
          zipCode: string
          description: string
          purpose: "RENT" | "SALE" | "SEASONAL"
          rentPrice?: number
          salePrice?: number
          propertyType: "Casa" | "Apartamento" | "Condomínio" | "Comercial" | "Terreno" | "Sobrado"
          categoryId?: string
          bedrooms?: number
          bathrooms?: number
          areaM2?: number
          repairQuality?: string
          status: "AVAILABLE" | "RENTED" | "SOLD" | "ARCHIVED"
          yearBuilt?: number
          images: string[]
          amenities: Json[]
          availableDate?: string
          listedByUserId?: string
          priceHistory: Json[]
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
        }
        Insert: {
          id?: string
          createdAt?: string
          title: string
          code?: string
          address: string
          neighborhood: string
          city: string
          state: string
          zipCode: string
          description: string
          purpose: "RENT" | "SALE" | "SEASONAL"
          rentPrice?: number
          salePrice?: number
          propertyType: "Casa" | "Apartamento" | "Condomínio" | "Comercial" | "Terreno" | "Sobrado"
          categoryId?: string
          bedrooms?: number
          bathrooms?: number
          areaM2?: number
          repairQuality?: string
          status: "AVAILABLE" | "RENTED" | "SOLD" | "ARCHIVED"
          yearBuilt?: number
          images: string[]
          amenities: Json[]
          availableDate?: string
          listedByUserId?: string
          priceHistory: Json[]
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
        }
        Update: {
          id?: string
          createdAt?: string
          title?: string
          code?: string
          address?: string
          neighborhood?: string
          city?: string
          state?: string
          zipCode?: string
          description?: string
          purpose?: "RENT" | "SALE" | "SEASONAL"
          rentPrice?: number
          salePrice?: number
          propertyType?: "Casa" | "Apartamento" | "Condomínio" | "Comercial" | "Terreno" | "Sobrado"
          categoryId?: string
          bedrooms?: number
          bathrooms?: number
          areaM2?: number
          repairQuality?: string
          status?: "AVAILABLE" | "RENTED" | "SOLD" | "ARCHIVED"
          yearBuilt?: number
          images?: string[]
          amenities?: Json[]
          availableDate?: string
          listedByUserId?: string
          priceHistory?: Json[]
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
        }
      }
      profiles: {
        Row: {
          id: string
          updatedAt?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
        Insert: {
          id: string
          updatedAt?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
        Update: {
          id?: string
          updatedAt?: string | null
          email?: string
          name?: string
          avatarUrl?: string
          role?: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
      }
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
      }
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
      }
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
      conversations: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_email: string
          property_id: string | null
          last_message_at: string
          last_message_preview: string | null
          admin_has_unread: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_email: string
          property_id?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          admin_has_unread?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_email?: string
          property_id?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          admin_has_unread?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          conversation_id: string
          sender: "ADMIN" | "CUSTOMER"
          content: string
        }
        Insert: {
          id?: string
          created_at?: string
          conversation_id: string
          sender: "ADMIN" | "CUSTOMER"
          content: string
        }
        Update: {
          id?: string
          created_at?: string
          conversation_id?: string
          sender?: "ADMIN" | "CUSTOMER"
          content?: string
        }
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