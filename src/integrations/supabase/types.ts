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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          downloads: number
          id: string
          question_id: string
          search_hits: number
          shares: number
          views: number
        }
        Insert: {
          downloads?: number
          id?: string
          question_id: string
          search_hits?: number
          shares?: number
          views?: number
        }
        Update: {
          downloads?: number
          id?: string
          question_id?: string
          search_hits?: number
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_cache: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          question_id: string
          voice_mode: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id?: string
          question_id: string
          voice_mode: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          question_id?: string
          voice_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_cache_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          age: number | null
          avatar_emoji: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          image_url: string | null
          question_id: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          image_url?: string | null
          question_id: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      metaphor_images: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          keywords: string[] | null
          public_url: string
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          keywords?: string[] | null
          public_url: string
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          keywords?: string[] | null
          public_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      public_questions: {
        Row: {
          age_band: string | null
          canonical_question: string
          created_at: string
          featured_story_id: string | null
          id: string
          normalized_question: string
          public_count: number
          theme: string | null
        }
        Insert: {
          age_band?: string | null
          canonical_question: string
          created_at?: string
          featured_story_id?: string | null
          id?: string
          normalized_question: string
          public_count?: number
          theme?: string | null
        }
        Update: {
          age_band?: string | null
          canonical_question?: string
          created_at?: string
          featured_story_id?: string | null
          id?: string
          normalized_question?: string
          public_count?: number
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_questions_featured_story_id_fkey"
            columns: ["featured_story_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_themes: {
        Row: {
          id: string
          question_id: string
          theme_id: string
        }
        Insert: {
          id?: string
          question_id: string
          theme_id: string
        }
        Update: {
          id?: string
          question_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_themes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          age_group: string
          audio_uploaded: boolean
          audio_url: string | null
          child_age: number
          child_name: string
          child_profile_id: string | null
          context: string | null
          created_at: string
          id: string
          image_prompt: string | null
          image_url: string | null
          is_public: boolean
          metaphor_answer: string
          metaphor_title: string
          normalized_question: string | null
          parent_explanation: string
          parent_note: string | null
          question_text: string
          transcription: string | null
          user_id: string | null
        }
        Insert: {
          age_group: string
          audio_uploaded?: boolean
          audio_url?: string | null
          child_age: number
          child_name: string
          child_profile_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          is_public?: boolean
          metaphor_answer: string
          metaphor_title: string
          normalized_question?: string | null
          parent_explanation: string
          parent_note?: string | null
          question_text: string
          transcription?: string | null
          user_id?: string | null
        }
        Update: {
          age_group?: string
          audio_uploaded?: boolean
          audio_url?: string | null
          child_age?: number
          child_name?: string
          child_profile_id?: string | null
          context?: string | null
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          is_public?: boolean
          metaphor_answer?: string
          metaphor_title?: string
          normalized_question?: string | null
          parent_explanation?: string
          parent_note?: string | null
          question_text?: string
          transcription?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_questions: {
        Row: {
          collection_id: string | null
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_questions_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          id: string
          slug: string
          theme_name: string
        }
        Insert: {
          id?: string
          slug: string
          theme_name: string
        }
        Update: {
          id?: string
          slug?: string
          theme_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weekly_questions: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          question: string
          story: string
          story_title: string | null
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question: string
          story: string
          story_title?: string | null
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question?: string
          story?: string
          story_title?: string | null
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      normalize_question: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "member" | "admin"
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
      app_role: ["member", "admin"],
    },
  },
} as const
