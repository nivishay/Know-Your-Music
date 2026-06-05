export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          spotify_id: string;
          refresh_token: string;
          last_daily_played: string | null;
          created_at: string;
        };
        Insert: {
          spotify_id: string;
          refresh_token: string;
          last_daily_played?: string | null;
          created_at?: string;
        };
        Update: {
          spotify_id?: string;
          refresh_token?: string;
          last_daily_played?: string | null;
        };
        Relationships: [];
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          mode: string;
          format: string;
          score: number | null;
          total_possible: number;
          clips: Json;
          answers: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: string;
          format: string;
          score?: number | null;
          total_possible: number;
          clips: Json;
          answers?: Json | null;
          created_at?: string;
        };
        Update: {
          score?: number | null;
          total_possible?: number;
          clips?: Json;
          answers?: Json | null;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          user_id: string;
          longest_streak: number;
        };
        Insert: {
          user_id: string;
          longest_streak: number;
        };
        Update: {
          longest_streak?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
