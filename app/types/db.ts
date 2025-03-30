export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string;
          device_id: string;
          created_at: string;
          last_seen: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          created_at?: string;
          last_seen?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          created_at?: string;
          last_seen?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          device_id: string;
          start_time: string;
          end_time: string | null;
          summary: string | null;
          mood_score: number;
          mood_label: string | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          start_time?: string;
          end_time?: string | null;
          summary?: string | null;
          mood_score: number;
          mood_label?: string | null;
        };
        Update: {
          id?: string;
          device_id?: string;
          start_time?: string;
          end_time?: string | null;
          summary?: string | null;
          mood_score?: number;
          mood_label?: string | null;
        };
      };
    };
    Functions: {
      set_device_id_claim: {
        Args: {
          device_id: string;
        };
        Returns: void;
      };
    };
  };
}
