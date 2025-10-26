export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          qr_code: string;
          name: string;
          brand: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          qr_code: string;
          name: string;
          brand?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          qr_code?: string;
          name?: string;
          brand?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          store_id: string;
          price: number;
          latitude: number | null;
          longitude: number | null;
          scanned_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          store_id: string;
          price: number;
          latitude?: number | null;
          longitude?: number | null;
          scanned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          store_id?: string;
          price?: number;
          latitude?: number | null;
          longitude?: number | null;
          scanned_at?: string;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          spending_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          spending_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          spending_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          session_id: string | null;
          price: number;
          quantity: number;
          added_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          session_id?: string | null;
          price: number;
          quantity?: number;
          added_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          session_id?: string | null;
          price?: number;
          quantity?: number;
          added_at?: string;
          created_at?: string;
        };
      };
      grocery_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_active: boolean;
          store_name: string | null;
          store_location: string | null;
          spending_limit: number | null;
          grocery_type: 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';
          started_at: string | null;
          ended_at: string | null;
          status: 'created' | 'in_progress' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_active?: boolean;
          store_name?: string | null;
          store_location?: string | null;
          spending_limit?: number | null;
          grocery_type?: 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';
          started_at?: string | null;
          ended_at?: string | null;
          status?: 'created' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          is_active?: boolean;
          store_name?: string | null;
          store_location?: string | null;
          spending_limit?: number | null;
          grocery_type?: 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';
          started_at?: string | null;
          ended_at?: string | null;
          status?: 'created' | 'in_progress' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      checkout_sessions: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          item_count: number;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          item_count: number;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          item_count?: number;
          completed_at?: string;
          created_at?: string;
        };
      };
      checkout_items: {
        Row: {
          id: string;
          session_id: string;
          product_id: string;
          price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          product_id: string;
          price: number;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          product_id?: string;
          price?: number;
          quantity?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      grocery_type_enum: 'regular' | 'special_event' | 'bulk' | 'weekly' | 'monthly';
      session_status: 'created' | 'in_progress' | 'completed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;