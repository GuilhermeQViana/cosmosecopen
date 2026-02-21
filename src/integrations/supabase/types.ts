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
          {
            foreignKeyName: "access_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
            foreignKeyName: "action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          interest_type: string | null
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
          interest_type?: string | null
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
          interest_type?: string | null
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
          {
            foreignKeyName: "diagnostic_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
            foreignKeyName: "evidence_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "feedbacks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "frameworks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_reports: {
        Row: {
          created_at: string
          file_name: string
          framework_id: string | null
          id: string
          organization_id: string
          period: string | null
          report_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          framework_id?: string | null
          id?: string
          organization_id: string
          period?: string | null
          report_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          framework_id?: string | null
          id?: string
          organization_id?: string
          period?: string | null
          report_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_reports_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      policies: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          category: string | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          framework_id: string | null
          id: string
          next_review_at: string | null
          organization_id: string
          owner_id: string | null
          published_at: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          framework_id?: string | null
          id?: string
          next_review_at?: string | null
          organization_id: string
          owner_id?: string | null
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          framework_id?: string | null
          id?: string
          next_review_at?: string | null
          organization_id?: string
          owner_id?: string | null
          published_at?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "policies_framework_id_fkey"
            columns: ["framework_id"]
            isOneToOne: false
            referencedRelation: "frameworks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acceptance_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          organization_id: string
          policy_id: string
          status: string
          target_audience: string
          target_roles: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          organization_id: string
          policy_id: string
          status?: string
          target_audience?: string
          target_roles?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          policy_id?: string
          status?: string
          target_audience?: string
          target_roles?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acceptance_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acceptance_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_acceptance_campaigns_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_acceptances: {
        Row: {
          accepted_at: string
          campaign_id: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          campaign_id: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          campaign_id?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acceptances_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "policy_acceptance_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_approvals: {
        Row: {
          approval_level: number
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string
          id: string
          policy_id: string
          status: string
          version_number: number
        }
        Insert: {
          approval_level?: number
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          policy_id: string
          status?: string
          version_number: number
        }
        Update: {
          approval_level?: number
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string
          id?: string
          policy_id?: string
          status?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_approvals_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          parent_id: string | null
          policy_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          policy_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          parent_id?: string | null
          policy_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "policy_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_comments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_controls: {
        Row: {
          control_id: string
          created_at: string
          id: string
          policy_id: string
        }
        Insert: {
          control_id: string
          created_at?: string
          id?: string
          policy_id: string
        }
        Update: {
          control_id?: string
          created_at?: string
          id?: string
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_controls_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_controls_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_risks: {
        Row: {
          created_at: string
          id: string
          policy_id: string
          risk_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          policy_id: string
          risk_id: string
        }
        Update: {
          created_at?: string
          id?: string
          policy_id?: string
          risk_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_risks_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_risks_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          framework_code: string | null
          id: string
          is_system: boolean
          organization_id: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_code?: string | null
          id?: string
          is_system?: boolean
          organization_id?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          framework_code?: string | null
          id?: string
          is_system?: boolean
          organization_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_versions: {
        Row: {
          change_summary: string | null
          changed_by: string | null
          content: string
          created_at: string
          id: string
          policy_id: string
          title: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          changed_by?: string | null
          content?: string
          created_at?: string
          id?: string
          policy_id: string
          title: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          changed_by?: string | null
          content?: string
          created_at?: string
          id?: string
          policy_id?: string
          title?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_workflows: {
        Row: {
          approval_levels: number
          approvers: Json
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          level1_approver_id: string | null
          level1_role: string | null
          level2_approver_id: string | null
          level2_role: string | null
          name: string
          notify_approver: boolean
          organization_id: string
          sla_days: number | null
          updated_at: string
        }
        Insert: {
          approval_levels?: number
          approvers?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          level1_approver_id?: string | null
          level1_role?: string | null
          level2_approver_id?: string | null
          level2_role?: string | null
          name: string
          notify_approver?: boolean
          organization_id: string
          sla_days?: number | null
          updated_at?: string
        }
        Update: {
          approval_levels?: number
          approvers?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          level1_approver_id?: string | null
          level1_role?: string | null
          level2_approver_id?: string | null
          level2_role?: string | null
          name?: string
          notify_approver?: boolean
          organization_id?: string
          sla_days?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          due_date_reminders: boolean | null
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_campaigns: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          ko_triggered: boolean
          organization_id: string
          reviewer_notes: string | null
          risk_classification: string | null
          score: number | null
          status: string
          template_id: string
          template_version: number
          token: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          ko_triggered?: boolean
          organization_id: string
          reviewer_notes?: string | null
          risk_classification?: string | null
          score?: number | null
          status?: string
          template_id: string
          template_version?: number
          token?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          ko_triggered?: boolean
          organization_id?: string
          reviewer_notes?: string | null
          risk_classification?: string | null
          score?: number | null
          status?: string
          template_id?: string
          template_version?: number
          token?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualification_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "qualification_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_campaigns_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_questions: {
        Row: {
          conditional_on: string | null
          conditional_value: string | null
          created_at: string
          id: string
          is_ko: boolean
          is_required: boolean
          ko_value: string | null
          label: string
          options: Json | null
          order_index: number
          template_id: string
          type: string
          weight: number
        }
        Insert: {
          conditional_on?: string | null
          conditional_value?: string | null
          created_at?: string
          id?: string
          is_ko?: boolean
          is_required?: boolean
          ko_value?: string | null
          label: string
          options?: Json | null
          order_index?: number
          template_id: string
          type?: string
          weight?: number
        }
        Update: {
          conditional_on?: string | null
          conditional_value?: string | null
          created_at?: string
          id?: string
          is_ko?: boolean
          is_required?: boolean
          ko_value?: string | null
          label?: string
          options?: Json | null
          order_index?: number
          template_id?: string
          type?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "qualification_questions_conditional_on_fkey"
            columns: ["conditional_on"]
            isOneToOne: false
            referencedRelation: "qualification_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "qualification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_responses: {
        Row: {
          answer_file_url: string | null
          answer_option: Json | null
          answer_text: string | null
          campaign_id: string
          created_at: string
          id: string
          question_id: string
          score_awarded: number | null
          updated_at: string
        }
        Insert: {
          answer_file_url?: string | null
          answer_option?: Json | null
          answer_text?: string | null
          campaign_id: string
          created_at?: string
          id?: string
          question_id: string
          score_awarded?: number | null
          updated_at?: string
        }
        Update: {
          answer_file_url?: string | null
          answer_option?: Json | null
          answer_text?: string | null
          campaign_id?: string
          created_at?: string
          id?: string
          question_id?: string
          score_awarded?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualification_responses_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "qualification_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "qualification_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      qualification_templates: {
        Row: {
          auto_approve_threshold: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          score_ranges: Json
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          auto_approve_threshold?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          score_ranges?: Json
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          auto_approve_threshold?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          score_ranges?: Json
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "qualification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
            foreignKeyName: "vendor_action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
            foreignKeyName: "vendor_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      vendor_contracts: {
        Row: {
          auto_renewal: boolean | null
          billing_frequency: string | null
          contract_number: string | null
          contract_type: string
          created_at: string | null
          created_by: string | null
          currency: string
          end_date: string | null
          file_path: string | null
          id: string
          lgpd_clauses: boolean | null
          notes: string | null
          organization_id: string
          renewal_date: string | null
          security_clauses: boolean | null
          sla_defined: boolean | null
          start_date: string | null
          status: string
          updated_at: string | null
          value: number | null
          vendor_id: string
        }
        Insert: {
          auto_renewal?: boolean | null
          billing_frequency?: string | null
          contract_number?: string | null
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string
          end_date?: string | null
          file_path?: string | null
          id?: string
          lgpd_clauses?: boolean | null
          notes?: string | null
          organization_id: string
          renewal_date?: string | null
          security_clauses?: boolean | null
          sla_defined?: boolean | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
          vendor_id: string
        }
        Update: {
          auto_renewal?: boolean | null
          billing_frequency?: string | null
          contract_number?: string | null
          contract_type?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string
          end_date?: string | null
          file_path?: string | null
          id?: string
          lgpd_clauses?: boolean | null
          notes?: string | null
          organization_id?: string
          renewal_date?: string | null
          security_clauses?: boolean | null
          sla_defined?: boolean | null
          start_date?: string | null
          status?: string
          updated_at?: string | null
          value?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_due_diligence: {
        Row: {
          approved_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          inherent_risk_score: number | null
          notes: string | null
          organization_id: string
          started_at: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inherent_risk_score?: number | null
          notes?: string | null
          organization_id: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          inherent_risk_score?: number | null
          notes?: string | null
          organization_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_due_diligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_due_diligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_due_diligence_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_due_diligence_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          due_diligence_id: string
          id: string
          item_name: string
          observations: string | null
          order_index: number
          status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          due_diligence_id: string
          id?: string
          item_name: string
          observations?: string | null
          order_index?: number
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          due_diligence_id?: string
          id?: string
          item_name?: string
          observations?: string | null
          order_index?: number
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_due_diligence_items_due_diligence_id_fkey"
            columns: ["due_diligence_id"]
            isOneToOne: false
            referencedRelation: "vendor_due_diligence"
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
            foreignKeyName: "vendor_evidence_vault_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
            foreignKeyName: "vendor_evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
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
      vendor_incidents: {
        Row: {
          category: string
          corrective_actions: string | null
          created_at: string | null
          description: string | null
          id: string
          impact_description: string | null
          incident_date: string
          organization_id: string
          reported_by: string | null
          reported_date: string | null
          resolved_by: string | null
          resolved_date: string | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          category?: string
          corrective_actions?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          incident_date?: string
          organization_id: string
          reported_by?: string | null
          reported_date?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          category?: string
          corrective_actions?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact_description?: string | null
          incident_date?: string
          organization_id?: string
          reported_by?: string | null
          reported_date?: string | null
          resolved_by?: string | null
          resolved_date?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_incidents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_offboarding: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          initiated_at: string | null
          initiated_by: string | null
          notes: string | null
          organization_id: string
          reason: string
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          notes?: string | null
          organization_id: string
          reason?: string
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          notes?: string | null
          organization_id?: string
          reason?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_offboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_offboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_offboarding_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_offboarding_tasks: {
        Row: {
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          observations: string | null
          offboarding_id: string
          order_index: number
          status: string
          task_name: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          observations?: string | null
          offboarding_id: string
          order_index?: number
          status?: string
          task_name: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          observations?: string | null
          offboarding_id?: string
          order_index?: number
          status?: string
          task_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_offboarding_tasks_offboarding_id_fkey"
            columns: ["offboarding_id"]
            isOneToOne: false
            referencedRelation: "vendor_offboarding"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_portal_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          id: string
          organization_id: string
          scope: string
          status: string
          token: string
          used_at: string | null
          vendor_id: string
          vendor_response: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          id?: string
          organization_id: string
          scope?: string
          status?: string
          token?: string
          used_at?: string | null
          vendor_id: string
          vendor_response?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          id?: string
          organization_id?: string
          scope?: string
          status?: string
          token?: string
          used_at?: string | null
          vendor_id?: string
          vendor_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_portal_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_portal_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_portal_tokens_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          {
            foreignKeyName: "vendor_requirements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_risk_analyses: {
        Row: {
          analyzed_by: string | null
          created_at: string
          id: string
          organization_id: string
          recommendation: string
          risk_score: number
          summary: string
          top_concerns: string[]
          trend: string
          vendor_id: string
        }
        Insert: {
          analyzed_by?: string | null
          created_at?: string
          id?: string
          organization_id: string
          recommendation: string
          risk_score: number
          summary: string
          top_concerns?: string[]
          trend: string
          vendor_id: string
        }
        Update: {
          analyzed_by?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          recommendation?: string
          risk_score?: number
          summary?: string
          top_concerns?: string[]
          trend?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_risk_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_risk_analyses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_risk_analyses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_slas: {
        Row: {
          compliance_status: string
          contract_id: string | null
          created_at: string | null
          current_value: number | null
          id: string
          measured_at: string | null
          metric_name: string
          notes: string | null
          organization_id: string
          period: string
          target_value: number
          unit: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          compliance_status?: string
          contract_id?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          measured_at?: string | null
          metric_name: string
          notes?: string | null
          organization_id: string
          period?: string
          target_value: number
          unit?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          compliance_status?: string
          contract_id?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          measured_at?: string | null
          metric_name?: string
          notes?: string | null
          organization_id?: string
          period?: string
          target_value?: number
          unit?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_slas_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "vendor_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_slas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_slas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_slas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          contract_currency: string
          contract_end: string | null
          contract_start: string | null
          contract_value: number | null
          created_at: string | null
          created_by: string | null
          criticality: string
          data_classification: string | null
          description: string | null
          id: string
          lifecycle_stage: string
          name: string
          next_assessment_date: string | null
          organization_id: string
          service_type: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_currency?: string
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string
          data_classification?: string | null
          description?: string | null
          id?: string
          lifecycle_stage?: string
          name: string
          next_assessment_date?: string | null
          organization_id: string
          service_type?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_currency?: string
          contract_end?: string | null
          contract_start?: string | null
          contract_value?: number | null
          created_at?: string | null
          created_by?: string | null
          criticality?: string
          data_classification?: string | null
          description?: string | null
          id?: string
          lifecycle_stage?: string
          name?: string
          next_assessment_date?: string | null
          organization_id?: string
          service_type?: string | null
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
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organizations_safe: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          logo_url: string | null
          name: string | null
          subscription_ends_at: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          logo_url?: string | null
          name?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
