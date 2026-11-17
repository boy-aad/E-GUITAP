// Fichier généré depuis le schéma Supabase (generate_typescript_types).
// Ne pas modifier à la main : le régénérer après chaque migration.

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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_domains: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          cover_media_id: string | null
          created_at: string
          description: string | null
          id: string
          letter: string
          publication: Database["public"]["Enums"]["publication_status"]
          short_title: string
          slug: string
          sort_order: number
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          cover_media_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          letter: string
          publication?: Database["public"]["Enums"]["publication_status"]
          short_title: string
          slug: string
          sort_order?: number
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          cover_media_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          letter?: string
          publication?: Database["public"]["Enums"]["publication_status"]
          short_title?: string
          slug?: string
          sort_order?: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_domains_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_services: {
        Row: {
          availability: Database["public"]["Enums"]["availability_status"]
          created_at: string
          description: string | null
          domain_id: string
          id: string
          publication: Database["public"]["Enums"]["publication_status"]
          sort_order: number
          title: string
          updated_at: string
          cover_media_id: string | null
          is_featured: boolean
          quote_enabled: boolean
          slug: string
          summary: string | null
          updated_by: string | null
        }
        Insert: {
          availability?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          description?: string | null
          domain_id: string
          id?: string
          publication?: Database["public"]["Enums"]["publication_status"]
          sort_order?: number
          title: string
          updated_at?: string
          cover_media_id?: string | null
          is_featured?: boolean
          quote_enabled?: boolean
          slug: string
          summary?: string | null
          updated_by?: string | null
        }
        Update: {
          availability?: Database["public"]["Enums"]["availability_status"]
          created_at?: string
          description?: string | null
          domain_id?: string
          id?: string
          publication?: Database["public"]["Enums"]["publication_status"]
          sort_order?: number
          title?: string
          updated_at?: string
          cover_media_id?: string | null
          is_featured?: boolean
          quote_enabled?: boolean
          slug?: string
          summary?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_services_cover_media_id_fkey"
            columns: ["cover_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_services_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "activity_domains"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          row_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          row_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          row_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      company_contacts: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          kind: Database["public"]["Enums"]["contact_kind"]
          label: string
          raw_value: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          kind: Database["public"]["Enums"]["contact_kind"]
          label: string
          raw_value: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          kind?: Database["public"]["Enums"]["contact_kind"]
          label?: string
          raw_value?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      company_profile: {
        Row: {
          ambition: string | null
          brand_name: string
          country: string
          full_name: string
          head_office: string
          host_name: string | null
          id: boolean
          legal_form: string | null
          mission: string | null
          nif: string | null
          presentation: string[]
          publication_manager: string | null
          rccm: string | null
          signature_brand: string | null
          signature_institutional: string | null
          signature_sectoral: string | null
          updated_at: string
          updated_by: string | null
          vision: string | null
        }
        Insert: {
          ambition?: string | null
          brand_name: string
          country: string
          full_name: string
          head_office: string
          host_name?: string | null
          id?: boolean
          legal_form?: string | null
          mission?: string | null
          nif?: string | null
          presentation?: string[]
          publication_manager?: string | null
          rccm?: string | null
          signature_brand?: string | null
          signature_institutional?: string | null
          signature_sectoral?: string | null
          updated_at?: string
          updated_by?: string | null
          vision?: string | null
        }
        Update: {
          ambition?: string | null
          brand_name?: string
          country?: string
          full_name?: string
          head_office?: string
          host_name?: string | null
          id?: boolean
          legal_form?: string | null
          mission?: string | null
          nif?: string | null
          presentation?: string[]
          publication_manager?: string | null
          rccm?: string | null
          signature_brand?: string | null
          signature_institutional?: string | null
          signature_sectoral?: string | null
          updated_at?: string
          updated_by?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      company_values: {
        Row: {
          created_at: string
          description: string | null
          id: string
          publication: Database["public"]["Enums"]["publication_status"]
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          publication?: Database["public"]["Enums"]["publication_status"]
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          publication?: Database["public"]["Enums"]["publication_status"]
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          body: string | null
          key: string
          media_id: string | null
          publication: Database["public"]["Enums"]["publication_status"]
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          key: string
          media_id?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          key?: string
          media_id?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          background_media_id: string | null
          created_at: string
          eyebrow: string | null
          id: string
          is_active: boolean
          primary_cta_href: string | null
          primary_cta_label: string | null
          secondary_cta_href: string | null
          secondary_cta_label: string | null
          show_signature: boolean
          sort_order: number
          subtitle: string | null
          title: string
          title_highlight: string | null
          updated_at: string
        }
        Insert: {
          background_media_id?: string | null
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          primary_cta_href?: string | null
          primary_cta_label?: string | null
          secondary_cta_href?: string | null
          secondary_cta_label?: string | null
          show_signature?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          title_highlight?: string | null
          updated_at?: string
        }
        Update: {
          background_media_id?: string | null
          created_at?: string
          eyebrow?: string | null
          id?: string
          is_active?: boolean
          primary_cta_href?: string | null
          primary_cta_label?: string | null
          secondary_cta_href?: string | null
          secondary_cta_label?: string | null
          show_signature?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          title_highlight?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_background_media_id_fkey"
            columns: ["background_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          consent: boolean
          consent_at: string
          created_at: string
          domain_id: string | null
          email: string | null
          full_name: string
          id: string
          internal_notes: string | null
          land_project_id: string | null
          message: string
          notification_error: string | null
          notified_at: string | null
          organization: string | null
          phone: string
          service_id: string | null
          source_page: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string | null
          type: Database["public"]["Enums"]["inquiry_type"]
          updated_at: string
          request_details: Json | null
        }
        Insert: {
          assigned_to?: string | null
          consent: boolean
          consent_at?: string
          created_at?: string
          domain_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          land_project_id?: string | null
          message: string
          notification_error?: string | null
          notified_at?: string | null
          organization?: string | null
          phone: string
          service_id?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          request_details?: Json | null
        }
        Update: {
          assigned_to?: string | null
          consent?: boolean
          consent_at?: string
          created_at?: string
          domain_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          land_project_id?: string | null
          message?: string
          notification_error?: string | null
          notified_at?: string | null
          organization?: string | null
          phone?: string
          service_id?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string | null
          type?: Database["public"]["Enums"]["inquiry_type"]
          updated_at?: string
          request_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "activity_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_land_project_id_fkey"
            columns: ["land_project_id"]
            isOneToOne: false
            referencedRelation: "land_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "activity_services"
            referencedColumns: ["id"]
          },
        ]
      }
      land_project_documents: {
        Row: {
          created_at: string
          doc_type: Database["public"]["Enums"]["land_document_type"]
          id: string
          notes: string | null
          project_id: string
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: Database["public"]["Enums"]["land_document_type"]
          id?: string
          notes?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: Database["public"]["Enums"]["land_document_type"]
          id?: string
          notes?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "land_project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "land_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      land_project_media: {
        Row: {
          is_cover: boolean
          media_id: string
          project_id: string
          sort_order: number
        }
        Insert: {
          is_cover?: boolean
          media_id: string
          project_id: string
          sort_order?: number
        }
        Update: {
          is_cover?: boolean
          media_id?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "land_project_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "land_project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "land_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      land_project_milestones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          occurred_on: string | null
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          occurred_on?: string | null
          project_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          occurred_on?: string | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "land_project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "land_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      land_project_objectives: {
        Row: {
          id: string
          label: string
          project_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          project_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "land_project_objectives_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "land_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      land_projects: {
        Row: {
          approx_lat: number | null
          approx_lng: number | null
          area_ha: number
          area_is_declared: boolean
          commercial_status:
            | Database["public"]["Enums"]["land_commercial_status"]
            | null
          created_at: string
          created_by: string | null
          description: string
          development_status:
            | Database["public"]["Enums"]["land_dev_status"]
            | null
          document_status: Database["public"]["Enums"]["document_status"]
          id: string
          is_featured: boolean
          locality: string | null
          name: string
          prefecture: string | null
          publication: Database["public"]["Enums"]["publication_status"]
          slug: string
          sort_order: number
          sous_prefecture: string | null
          summary: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approx_lat?: number | null
          approx_lng?: number | null
          area_ha: number
          area_is_declared?: boolean
          commercial_status?:
            | Database["public"]["Enums"]["land_commercial_status"]
            | null
          created_at?: string
          created_by?: string | null
          description?: string
          development_status?:
            | Database["public"]["Enums"]["land_dev_status"]
            | null
          document_status?: Database["public"]["Enums"]["document_status"]
          id?: string
          is_featured?: boolean
          locality?: string | null
          name: string
          prefecture?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          slug: string
          sort_order?: number
          sous_prefecture?: string | null
          summary: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approx_lat?: number | null
          approx_lng?: number | null
          area_ha?: number
          area_is_declared?: boolean
          commercial_status?:
            | Database["public"]["Enums"]["land_commercial_status"]
            | null
          created_at?: string
          created_by?: string | null
          description?: string
          development_status?:
            | Database["public"]["Enums"]["land_dev_status"]
            | null
          document_status?: Database["public"]["Enums"]["document_status"]
          id?: string
          is_featured?: boolean
          locality?: string | null
          name?: string
          prefecture?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          slug?: string
          sort_order?: number
          sous_prefecture?: string | null
          summary?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt: string
          created_at: string
          created_by: string | null
          credit: string | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          path: string
          width: number | null
        }
        Insert: {
          alt?: string
          created_at?: string
          created_by?: string | null
          credit?: string | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          path: string
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          created_by?: string | null
          credit?: string | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          path?: string
          width?: number | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          full_name: string
          is_active: boolean
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      availability_status:
        | "operationnelle"
        | "en_developpement"
        | "non_confirmee"
      contact_kind: "phone" | "whatsapp" | "email" | "address" | "social"
      document_status:
        | "non_fourni"
        | "en_attente"
        | "verifie_interne"
        | "valide_juridiquement"
      inquiry_status: "nouveau" | "en_cours" | "traite" | "archive"
      inquiry_type:
        | "contact"
        | "renseignement_activite"
        | "renseignement_projet"
        | "demande_devis"
      land_commercial_status:
        | "non_commercialise"
        | "pre_commercialisation"
        | "commercialisation_ouverte"
        | "suspendu"
        | "cloture"
      land_dev_status:
        | "identification"
        | "etudes"
        | "amenagement_en_cours"
        | "morcellement_en_cours"
        | "viabilisation_en_cours"
        | "suspendu"
      land_document_type:
        | "titre_foncier"
        | "plan_lotissement"
        | "acte_cession"
        | "autorisation"
        | "plan_situation"
        | "etude_technique"
        | "autre"
      media_kind: "photo_reelle" | "illustration" | "plan" | "logo"
      publication_status: "brouillon" | "publie" | "archive"
      staff_role: "admin" | "editeur"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      availability_status: [
        "operationnelle",
        "en_developpement",
        "non_confirmee",
      ],
      contact_kind: ["phone", "whatsapp", "email", "address", "social"],
      document_status: [
        "non_fourni",
        "en_attente",
        "verifie_interne",
        "valide_juridiquement",
      ],
      inquiry_status: ["nouveau", "en_cours", "traite", "archive"],
      inquiry_type: [
        "contact",
        "renseignement_activite",
        "renseignement_projet",
        "demande_devis",
      ],
      land_commercial_status: [
        "non_commercialise",
        "pre_commercialisation",
        "commercialisation_ouverte",
        "suspendu",
        "cloture",
      ],
      land_dev_status: [
        "identification",
        "etudes",
        "amenagement_en_cours",
        "morcellement_en_cours",
        "viabilisation_en_cours",
        "suspendu",
      ],
      land_document_type: [
        "titre_foncier",
        "plan_lotissement",
        "acte_cession",
        "autorisation",
        "plan_situation",
        "etude_technique",
        "autre",
      ],
      media_kind: ["photo_reelle", "illustration", "plan", "logo"],
      publication_status: ["brouillon", "publie", "archive"],
      staff_role: ["admin", "editeur"],
    },
  },
} as const
