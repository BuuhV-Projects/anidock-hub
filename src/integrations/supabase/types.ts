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
  public: {
    Tables: {
      animes: {
        Row: {
          alternative_titles: string[] | null
          banner_url: string | null
          cover_url: string | null
          created_at: string
          driver_id: number | null
          id: number
          metadata: Json | null
          public_id: string
          source_url: string
          synopsis: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          alternative_titles?: string[] | null
          banner_url?: string | null
          cover_url?: string | null
          created_at?: string
          driver_id?: number | null
          id?: number
          metadata?: Json | null
          public_id?: string
          source_url: string
          synopsis?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          alternative_titles?: string[] | null
          banner_url?: string | null
          cover_url?: string | null
          created_at?: string
          driver_id?: number | null
          id?: number
          metadata?: Json | null
          public_id?: string
          source_url?: string
          synopsis?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          catalog_url: string | null
          config: Json
          created_at: string
          domain: string
          id: number
          indexed_data: Json | null
          is_public: boolean
          last_indexed_at: string | null
          name: string
          public_id: string
          source_url: string | null
          total_animes: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          catalog_url?: string | null
          config: Json
          created_at?: string
          domain: string
          id?: number
          indexed_data?: Json | null
          is_public?: boolean
          last_indexed_at?: string | null
          name: string
          public_id?: string
          source_url?: string | null
          total_animes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          catalog_url?: string | null
          config?: Json
          created_at?: string
          domain?: string
          id?: number
          indexed_data?: Json | null
          is_public?: boolean
          last_indexed_at?: string | null
          name?: string
          public_id?: string
          source_url?: string | null
          total_animes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      episodes: {
        Row: {
          anime_id: number | null
          created_at: string
          duration: number | null
          episode_number: number
          id: number
          public_id: string
          source_url: string
          thumbnail_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          anime_id?: number | null
          created_at?: string
          duration?: number | null
          episode_number: number
          id?: number
          public_id?: string
          source_url: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          anime_id?: number | null
          created_at?: string
          duration?: number | null
          episode_number?: number
          id?: number
          public_id?: string
          source_url?: string
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "animes"
            referencedColumns: ["id"]
          },
        ]
      }
      indexes: {
        Row: {
          created_at: string
          driver_id: number | null
          id: number
          index_data: Json
          is_public: boolean
          metadata: Json | null
          name: string
          public_id: string
          source_url: string
          total_animes: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          driver_id?: number | null
          id?: number
          index_data: Json
          is_public?: boolean
          metadata?: Json | null
          name: string
          public_id?: string
          source_url: string
          total_animes?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          driver_id?: number | null
          id?: number
          index_data?: Json
          is_public?: boolean
          metadata?: Json | null
          name?: string
          public_id?: string
          source_url?: string
          total_animes?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indexes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: number
          nickname: string | null
          public_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: number
          nickname?: string | null
          public_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: number
          nickname?: string | null
          public_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          public_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          public_id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          public_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: number
          public_id: string
          type: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: number
          public_id?: string
          type?: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: number
          public_id?: string
          type?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          anime_cover: string | null
          anime_source_url: string
          anime_title: string
          created_at: string
          driver_id: number | null
          episode_number: number
          episode_title: string | null
          episode_url: string
          id: number
          public_id: string
          updated_at: string
          user_id: string
          watched_at: string
        }
        Insert: {
          anime_cover?: string | null
          anime_source_url: string
          anime_title: string
          created_at?: string
          driver_id?: number | null
          episode_number: number
          episode_title?: string | null
          episode_url: string
          id?: number
          public_id?: string
          updated_at?: string
          user_id: string
          watched_at?: string
        }
        Update: {
          anime_cover?: string | null
          anime_source_url?: string
          anime_title?: string
          created_at?: string
          driver_id?: number | null
          episode_number?: number
          episode_title?: string | null
          episode_url?: string
          id?: number
          public_id?: string
          updated_at?: string
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_verification_codes: { Args: never; Returns: undefined }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "free" | "premium" | "premium_plus"
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
  public: {
    Enums: {
      app_role: ["free", "premium", "premium_plus"],
    },
  },
} as const
