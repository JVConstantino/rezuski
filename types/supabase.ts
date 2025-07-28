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
          amenities: any
          priceHistory: any
          availableDate?: string
          listedByUserId?: string
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          translations?: any
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
          amenities: any
          priceHistory: any
          availableDate?: string
          listedByUserId?: string
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          translations?: any
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
          amenities?: any
          availableDate?: string
          listedByUserId?: string
          priceHistory?: any
          isPopular?: boolean
          tourUrl?: string
          viewCount?: number
          translations?: any
        }
      },
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
      },
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
      },
      categories: {
        Row: {
          id: string
          name: string
          iconUrl: string
          translations: any
        }
        Insert: {
          id?: string
          name: string
          iconUrl: string
          translations?: any
        }
        Update: {
          id?: string
          name?: string
          iconUrl?: string
          translations?: any
        }
      },
      property_type_translations: {
        Row: {
            id: string;
            name: string;
            translations: any;
        };
        Insert: {
            id?: string;
            name: string;
            translations?: any;
        };
        Update: {
            id?: string;
            name?: string;
            translations?: any;
        };
      },
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
      },
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
      },
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