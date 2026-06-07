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
          score: number;
          total_possible: number;
          created_at: string;
          clips: unknown | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: string;
          format: string;
          score: number;
          total_possible: number;
          created_at?: string;
          clips?: unknown | null;
        };
        Update: {
          score?: number;
          total_possible?: number;
          clips?: unknown | null;
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
