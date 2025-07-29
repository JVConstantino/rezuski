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
          amenities: Json
          priceHistory: Json
          availableDate?: string
          listedByUserId?: string
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          display_order?: number
          translations?: Json | null
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
          amenities: Json
          priceHistory: Json
          availableDate?: string
          listedByUserId?: string
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          display_order?: number
          translations?: Json | null
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
          amenities?: Json
          availableDate?: string
          listedByUserId?: string
          priceHistory?: Json
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          display_order?: number
          translations?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          updated_at?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
        Insert: {
          id: string
          updated_at?: string | null
          email: string
          name?: string
          avatarUrl?: string
          role: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
        Update: {
          id?: string
          updated_at?: string | null
          email?: string
          name?: string
          avatarUrl?: string
          role?: "ADMIN" | "OWNER" | "TENANT" | "BUYER" | "SELLER"
        }
        Relationships: []
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
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          iconUrl: string
          translations: Json | null
        }
        Insert: {
          id?: string
          name: string
          iconUrl: string
          translations?: Json | null
        }
        Update: {
          id?: string
          name?: string
          iconUrl?: string
          translations?: Json | null
        }
        Relationships: []
      }
      property_type_translations: {
        Row: {
            id: string;
            name: string;
            translations: Json | null;
        };
        Insert: {
            id?: string;
            name: string;
            translations?: Json | null;
        };
        Update: {
            id?: string;
            name?: string;
            translations?: Json | null;
        };
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          prop_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}