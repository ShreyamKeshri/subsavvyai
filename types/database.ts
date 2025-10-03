export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cancellation_guides: {
        Row: {
          created_at: string
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time_minutes: number | null
          id: string
          last_verified_at: string | null
          service_id: string
          steps: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          service_id: string
          steps: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_time_minutes?: number | null
          id?: string
          last_verified_at?: string | null
          service_id?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_guides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "mv_popular_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_guides_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          fcm_token: string | null
          id: string
          push_enabled: boolean
          reminder_1_day: boolean
          reminder_3_days: boolean
          reminder_same_day: boolean
          updated_at: string
          user_id: string
          weekly_summary: boolean
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          fcm_token?: string | null
          id?: string
          push_enabled?: boolean
          reminder_1_day?: boolean
          reminder_3_days?: boolean
          reminder_same_day?: boolean
          updated_at?: string
          user_id: string
          weekly_summary?: boolean
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          fcm_token?: string | null
          id?: string
          push_enabled?: boolean
          reminder_1_day?: boolean
          reminder_3_days?: boolean
          reminder_same_day?: boolean
          updated_at?: string
          user_id?: string
          weekly_summary?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          delivery_status: Database["public"]["Enums"]["notification_delivery_status"]
          fcm_token: string | null
          id: string
          message: string
          read_at: string | null
          scheduled_for: string
          sent_at: string | null
          subscription_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"]
          fcm_token?: string | null
          id?: string
          message: string
          read_at?: string | null
          scheduled_for: string
          sent_at?: string | null
          subscription_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_status?: Database["public"]["Enums"]["notification_delivery_status"]
          fcm_token?: string | null
          id?: string
          message?: string
          read_at?: string | null
          scheduled_for?: string
          sent_at?: string | null
          subscription_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          payment_date: string | null
          payment_method_id: string | null
          payment_provider:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          payment_date?: string | null
          payment_method_id?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          payment_date?: string | null
          payment_method_id?: string | null
          payment_provider?:
            | Database["public"]["Enums"]["payment_provider"]
            | null
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          last_four_digits: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id: string | null
          provider_method_id: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_four_digits?: string | null
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_method_id?: string | null
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          card_brand?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_four_digits?: string | null
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_method_id?: string | null
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          currency_preference: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          currency_preference?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          currency_preference?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          cancellation_url: string | null
          category: Database["public"]["Enums"]["subscription_category"]
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          typical_price_inr: number | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          cancellation_url?: string | null
          category: Database["public"]["Enums"]["subscription_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          typical_price_inr?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          cancellation_url?: string | null
          category?: Database["public"]["Enums"]["subscription_category"]
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          typical_price_inr?: number | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          billing_date: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cost: number
          created_at: string
          currency: string
          custom_service_name: string | null
          deleted_at: string | null
          id: string
          next_billing_date: string
          notes: string | null
          paused_at: string | null
          paused_until: string | null
          payment_method_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          billing_date: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cost: number
          created_at?: string
          currency?: string
          custom_service_name?: string | null
          deleted_at?: string | null
          id?: string
          next_billing_date: string
          notes?: string | null
          paused_at?: string | null
          paused_until?: string | null
          payment_method_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          billing_date?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cost?: number
          created_at?: string
          currency?: string
          custom_service_name?: string | null
          deleted_at?: string | null
          id?: string
          next_billing_date?: string
          notes?: string | null
          paused_at?: string | null
          paused_until?: string | null
          payment_method_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "mv_popular_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics_cache: {
        Row: {
          active_subscriptions_count: number | null
          category_breakdown: Json | null
          created_at: string
          id: string
          last_calculated_at: string
          spending_trend: Json | null
          total_monthly_spend: number | null
          total_yearly_spend: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_subscriptions_count?: number | null
          category_breakdown?: Json | null
          created_at?: string
          id?: string
          last_calculated_at?: string
          spending_trend?: Json | null
          total_monthly_spend?: number | null
          total_yearly_spend?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_subscriptions_count?: number | null
          category_breakdown?: Json | null
          created_at?: string
          id?: string
          last_calculated_at?: string
          spending_trend?: Json | null
          total_monthly_spend?: number | null
          total_yearly_spend?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_popular_services: {
        Row: {
          avg_cost: number | null
          category: Database["public"]["Enums"]["subscription_category"] | null
          id: string | null
          name: string | null
          subscriber_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_monthly_cost: {
        Args: {
          cost: number
          cycle: Database["public"]["Enums"]["billing_cycle"]
        }
        Returns: number
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      refresh_user_analytics: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      billing_cycle: "monthly" | "quarterly" | "yearly" | "custom"
      difficulty_level: "easy" | "medium" | "hard"
      notification_delivery_status: "pending" | "sent" | "failed" | "cancelled"
      notification_type:
        | "renewal_reminder"
        | "payment_success"
        | "payment_failed"
        | "subscription_cancelled"
        | "weekly_summary"
        | "custom"
      payment_method_type: "card" | "upi" | "netbanking" | "wallet" | "other"
      payment_provider: "razorpay" | "stripe" | "upi" | "manual"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "cancelled"
      subscription_category:
        | "OTT"
        | "Music"
        | "Food Delivery"
        | "SaaS"
        | "Fitness"
        | "News"
        | "Gaming"
        | "Education"
        | "Other"
      subscription_status:
        | "active"
        | "cancellation_initiated"
        | "cancelled"
        | "paused"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      billing_cycle: ["monthly", "quarterly", "yearly", "custom"],
      difficulty_level: ["easy", "medium", "hard"],
      notification_delivery_status: ["pending", "sent", "failed", "cancelled"],
      notification_type: [
        "renewal_reminder",
        "payment_success",
        "payment_failed",
        "subscription_cancelled",
        "weekly_summary",
        "custom",
      ],
      payment_method_type: ["card", "upi", "netbanking", "wallet", "other"],
      payment_provider: ["razorpay", "stripe", "upi", "manual"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      subscription_category: [
        "OTT",
        "Music",
        "Food Delivery",
        "SaaS",
        "Fitness",
        "News",
        "Gaming",
        "Education",
        "Other",
      ],
      subscription_status: [
        "active",
        "cancellation_initiated",
        "cancelled",
        "paused",
        "expired",
      ],
    },
  },
} as const
