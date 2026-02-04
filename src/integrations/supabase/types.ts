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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_comments: {
        Row: {
          action_plan_id: string
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          action_plan_id: string
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action_plan_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_comments_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plan_tasks: {
        Row: {
          action_plan_id: string
          completed: boolean | null
          created_at: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          action_plan_id: string
          completed?: boolean | null
          created_at?: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          action_plan_id?: string
          completed?: boolean | null
          created_at?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plan_tasks_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_plans: {
        Row: {
          ai_generated: boolean | null
          assessment_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          framework_id: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          risk_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean | null
          assessment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          framework_id?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          risk_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean | null
          assessment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          framework_id?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          risk_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_plans_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_comments: {
        Row: {
          assessment_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          parent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_comments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "assessment_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_evidences: {
        Row: {
          assessment_id: string
          created_at: string
          evidence_id: string
          id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          evidence_id: string
          id?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          evidence_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_evidences_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_evidences_evidence_id_fkey"
            columns: ["evidence_id"]
            isOneToOne: false
            referencedRelation: "evidences"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessed_at: string | null
          assessed_by: string | null
          control_id: string
          created_at: string
          id: string
          maturity_level: Database["public"]["Enums"]["maturity_level"]
          observations: string | null
          organization_id: string
          status: Database["public"]["Enums"]["conformity_status"]
          target_maturity: Database["public"]["Enums"]["maturity_level"]
          updated_at: string
        }
        Insert: {
          assessed_at?: string | null
          assessed_by?: string | null
          control_id: string
          created_at?: string
          id?: string
          maturity_level?: Database["public"]["Enums"]["maturity_level"]
          observations?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["conformity_status"]
          target_maturity?: Database["public"]["Enums"]["maturity_level"]
          updated_at?: string
        }
        Update: {
          assessed_at?: string | null
          assessed_by?: string | null
          control_id?: string
          created_at?: string
          id?: string
          maturity_level?: Database["public"]["Enums"]["maturity_level"]
          observations?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["conformity_status"]
          target_maturity?: Database["public"]["Enums"]["maturity_level"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          emoji: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "assessment_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          company: string
          company_size: string | null
          contacted_at: string | null
          contacted_by: string | null
          created_at: string
          email: string
          how_found: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          role: string | null
          status: string
        }
        Insert: {
          company: string
          company_size?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          email: string
          how_found?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          role?: string | null
          status?: string
        }
        Update: {
          company?: string
          company_size?: string | null
          contacted_at?: string | null
          contacted_by?: string | null
          created_at?: string
          email?: string
          how_found?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          role?: string | null
          status?: string
        }
        Relationships: []
      }
      controls: {
        Row: {
          category: string | null
          code: string
          created_at: string
          criticality: string | null
          description: string | null
          evidence_example: string | null
          framework_id: string
          id: string
          implementation_example: string | null
          name: string
          order_index: number
          parent_id: string | null
          weight: number | null
          weight_reason: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          criticality?: string | null
          description?: string | null
          evidence_example?: string | null
          framework_id: string
          id?: string
          implementation_example?: string | null
          name: string
          order_index?: number
          parent_id?: string | null
          weight?: number | null
          weight_reason?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          criticality?: string | null
          description?: string | null
          evidence_example?: string | null
          framework_id?: string
          id?: string
          implementation_example?: string | null
          name?: string
          order_index?: number
          parent_id?: string | null
          weight?: number | null
          weight_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controls_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "controls_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_snapshots: {
        Row: {
          created_at: string
          created_by: string | null
          framework_id: string
          id: string
          name: string
          organization_id: string
          snapshot_data: Json
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          framework_id: string
          id?: string
          name: string
          organization_id: string
          snapshot_data: Json
        }
        Update: {
          created_at?: string
          created_by?: string | null
          framework_id?: string
          id?: string
          name?: string
          organization_id?: string
          snapshot_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_snapshots_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "evidence_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      evidences: {
        Row: {
          classification: Database["public"]["Enums"]["evidence_classification"]
          created_at: string
          description: string | null
          expires_at: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          folder_id: string | null
          framework_id: string | null
          id: string
          name: string
          organization_id: string
          tags: string[] | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          classification?: Database["public"]["Enums"]["evidence_classification"]
          created_at?: string
          description?: string | null
          expires_at?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          framework_id?: string | null
          id?: string
          name: string
          organization_id: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          classification?: Database["public"]["Enums"]["evidence_classification"]
          created_at?: string
          description?: string | null
          expires_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder_id?: string | null
          framework_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidences_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "evidence_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          created_at: string | null
          id: string
          liked: string | null
          module: string
          organization_id: string | null
          rating: number | null
          suggestions: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked?: string | null
          module: string
          organization_id?: string | null
          rating?: number | null
          suggestions?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          liked?: string | null
          module?: string
          organization_id?: string | null
          rating?: number | null
          suggestions?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedbacks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_mappings: {
        Row: {
          created_at: string
          id: string
          mapping_type: string
          source_control_id: string
          target_control_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mapping_type?: string
          source_control_id: string
          target_control_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mapping_type?: string
          source_control_id?: string
          target_control_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "framework_mappings_source_control_id_fkey"
            columns: ["source_control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "framework_mappings_target_control_id_fkey"
            columns: ["target_control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
        ]
      }
      frameworks: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_custom: boolean
          name: string
          organization_id: string | null
          version: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_custom?: boolean
          name: string
          organization_id?: string | null
          version?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_custom?: boolean
          name?: string
          organization_id?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "frameworks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          organization_id: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          organization_id?: string | null
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          organization_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          due_date_reminders: boolean | null
          email_notifications: boolean | null
          full_name: string | null
          id: string
          layout_density: string | null
          organization_id: string | null
          risk_alerts: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          due_date_reminders?: boolean | null
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          layout_density?: string | null
          organization_id?: string | null
          risk_alerts?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          due_date_reminders?: boolean | null
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          layout_density?: string | null
          organization_id?: string | null
          risk_alerts?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_controls: {
        Row: {
          control_id: string
          created_at: string
          id: string
          risk_id: string
        }
        Insert: {
          control_id: string
          created_at?: string
          id?: string
          risk_id: string
        }
        Update: {
          control_id?: string
          created_at?: string
          id?: string
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_controls_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_controls_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_history: {
        Row: {
          change_type: string
          changed_by: string | null
          created_at: string
          field_changed: string | null
          id: string
          new_level: number | null
          new_value: string | null
          old_level: number | null
          old_value: string | null
          risk_id: string
        }
        Insert: {
          change_type: string
          changed_by?: string | null
          created_at?: string
          field_changed?: string | null
          id?: string
          new_level?: number | null
          new_value?: string | null
          old_level?: number | null
          old_value?: string | null
          risk_id: string
        }
        Update: {
          change_type?: string
          changed_by?: string | null
          created_at?: string
          field_changed?: string | null
          id?: string
          new_level?: number | null
          new_value?: string | null
          old_level?: number | null
          old_value?: string | null
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_history_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: string | null
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          framework_id: string | null
          id: string
          inherent_impact: number
          inherent_probability: number
          organization_id: string
          owner_id: string | null
          residual_impact: number | null
          residual_probability: number | null
          title: string
          treatment: Database["public"]["Enums"]["risk_treatment"]
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_id?: string | null
          id?: string
          inherent_impact?: number
          inherent_probability?: number
          organization_id: string
          owner_id?: string | null
          residual_impact?: number | null
          residual_probability?: number | null
          title: string
          treatment?: Database["public"]["Enums"]["risk_treatment"]
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_id?: string | null
          id?: string
          inherent_impact?: number
          inherent_probability?: number
          organization_id?: string
          owner_id?: string | null
          residual_impact?: number | null
          residual_probability?: number | null
          title?: string
          treatment?: Database["public"]["Enums"]["risk_treatment"]
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_action_plans: {
        Row: {
          assessment_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          priority: Database["public"]["Enums"]["task_priority"]
          requirement_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          assessment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          priority?: Database["public"]["Enums"]["task_priority"]
          requirement_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          assessment_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          requirement_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_action_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_action_plans_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "vendor_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_action_plans_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessment_domains: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
        }
        Relationships: []
      }
      vendor_assessment_responses: {
        Row: {
          assessment_id: string
          compliance_level: number
          created_at: string | null
          evidence_provided: boolean | null
          id: string
          observations: string | null
          requirement_id: string
          updated_at: string | null
        }
        Insert: {
          assessment_id: string
          compliance_level?: number
          created_at?: string | null
          evidence_provided?: boolean | null
          id?: string
          observations?: string | null
          requirement_id: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string
          compliance_level?: number
          created_at?: string | null
          evidence_provided?: boolean | null
          id?: string
          observations?: string | null
          requirement_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assessment_responses_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "vendor_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_assessments: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assessed_by: string | null
          assessment_date: string
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          overall_score: number | null
          risk_level: string | null
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          overall_score?: number | null
          risk_level?: string | null
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assessed_by?: string | null
          assessment_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          overall_score?: number | null
          risk_level?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_evidence_vault: {
        Row: {
          category: string
          classification: string
          created_at: string | null
          description: string | null
          expires_at: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          organization_id: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          vendor_id: string
        }
        Insert: {
          category?: string
          classification?: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          organization_id: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id: string
        }
        Update: {
          category?: string
          classification?: string
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          organization_id?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_evidence_vault_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_evidence_vault_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_evidences: {
        Row: {
          assessment_id: string
          created_at: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          organization_id: string
          requirement_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          organization_id: string
          requirement_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          organization_id?: string
          requirement_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_evidences_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_evidences_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "vendor_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_requirements: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          domain_id: string
          evidence_example: string | null
          id: string
          is_active: boolean | null
          name: string
          order_index: number | null
          organization_id: string | null
          weight: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          domain_id: string
          evidence_example?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          order_index?: number | null
          organization_id?: string | null
          weight?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          domain_id?: string
          evidence_example?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          organization_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_requirements_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "vendor_assessment_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_requirements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: string | null
          code: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          created_by: string | null
          criticality: string
          description: string | null
          id: string
          name: string
          next_assessment_date: string | null
          organization_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string
          description?: string | null
          id?: string
          name: string
          next_assessment_date?: string | null
          organization_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string
          description?: string | null
          id?: string
          name?: string
          next_assessment_date?: string | null
          organization_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_organization_invite: { Args: { _token: string }; Returns: boolean }
      check_deadline_notifications: { Args: never; Returns: undefined }
      check_organization_access: { Args: { _org_id: string }; Returns: boolean }
      create_notification: {
        Args: {
          _link?: string
          _message?: string
          _organization_id: string
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      create_organization_with_admin: {
        Args: { org_description?: string; org_name: string }
        Returns: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_organization: { Args: { _org_id: string }; Returns: boolean }
      get_user_organization: { Args: { _user_id: string }; Returns: string }
      get_user_organizations: {
        Args: never
        Returns: {
          created_at: string
          description: string
          id: string
          logo_url: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { check_user_id: string }; Returns: boolean }
      leave_organization: { Args: { _org_id: string }; Returns: boolean }
      log_access_event: {
        Args: {
          _action: string
          _details?: Json
          _entity_id?: string
          _entity_type?: string
          _ip_address?: string
        }
        Returns: string
      }
      set_active_organization: { Args: { _org_id: string }; Returns: boolean }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "auditor" | "analyst"
      conformity_status:
        | "conforme"
        | "parcial"
        | "nao_conforme"
        | "nao_aplicavel"
      evidence_classification: "publico" | "interno" | "confidencial"
      framework_type: "nist_csf" | "iso_27001" | "bcb_cmn"
      maturity_level: "0" | "1" | "2" | "3" | "4" | "5"
      risk_treatment: "mitigar" | "aceitar" | "transferir" | "evitar"
      task_priority: "critica" | "alta" | "media" | "baixa"
      task_status: "backlog" | "todo" | "in_progress" | "review" | "done"
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
      app_role: ["admin", "auditor", "analyst"],
      conformity_status: [
        "conforme",
        "parcial",
        "nao_conforme",
        "nao_aplicavel",
      ],
      evidence_classification: ["publico", "interno", "confidencial"],
      framework_type: ["nist_csf", "iso_27001", "bcb_cmn"],
      maturity_level: ["0", "1", "2", "3", "4", "5"],
      risk_treatment: ["mitigar", "aceitar", "transferir", "evitar"],
      task_priority: ["critica", "alta", "media", "baixa"],
      task_status: ["backlog", "todo", "in_progress", "review", "done"],
    },
  },
} as const
