// src/lib/types/database.ts
// Database type definitions

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string;
          role?: 'seller' | 'buyer';
          onboarding_completed: boolean;
          phone_verified: boolean;
          email_verified: boolean;
          last_sign_in?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          avatar_url?: string;
          role?: 'seller' | 'buyer';
          onboarding_completed?: boolean;
          phone_verified?: boolean;
          email_verified?: boolean;
          last_sign_in?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          avatar_url?: string;
          role?: 'seller' | 'buyer';
          onboarding_completed?: boolean;
          phone_verified?: boolean;
          email_verified?: boolean;
          last_sign_in?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      oauth_states: {
        Row: {
          id: string;
          state_value: string;
          code_verifier: string;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          state_value: string;
          code_verifier: string;
          expires_at: string;
          used?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          state_value?: string;
          code_verifier?: string;
          expires_at?: string;
          used?: boolean;
          created_at?: string;
        };
      };
      auth_audit_log: {
        Row: {
          id: string;
          user_id?: string;
          event_type: string;
          ip_address?: string;
          user_agent?: string;
          success: boolean;
          error_message?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          event_type: string;
          ip_address?: string;
          user_agent?: string;
          success: boolean;
          error_message?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          ip_address?: string;
          user_agent?: string;
          success?: boolean;
          error_message?: string;
          created_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          refresh_token: string;
          ip_address?: string;
          user_agent?: string;
          expires_at: string;
          last_used: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          refresh_token: string;
          ip_address?: string;
          user_agent?: string;
          expires_at: string;
          last_used?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          refresh_token?: string;
          ip_address?: string;
          user_agent?: string;
          expires_at?: string;
          last_used?: string;
          created_at?: string;
        };
      };
    };
  };
}