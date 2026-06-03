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
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          mode: string;
          format: string;
          score: number;
          total_possible: number;
          created_at?: string;
        };
        Update: {
          score?: number;
          total_possible?: number;
        };
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
      };
    };
  };
};
