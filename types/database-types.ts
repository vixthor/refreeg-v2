export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_prefix: string;
          key_hash: string;
          mode: "live" | "test";
          created_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_prefix: string;
          key_hash: string;
          mode?: "live" | "test";
          created_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_prefix?: string;
          key_hash?: string;
          mode?: "live" | "test";
          created_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          account_number: string | null;
          bank_name: string | null;
          account_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          account_number?: string | null;
          bank_name?: string | null;
          account_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          account_number?: string | null;
          bank_name?: string | null;
          account_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      causes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          goal: number;
          raised: number;
          status: string;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          image: string | null;
          days_active: number | null;
          trust_score: any; // jsonb
          verified_status: string;
          summary: string | null;
          location: string | null;
          multimedia: string[];
          video_links: string[];
          faqs: any; // jsonb
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          goal: number;
          raised?: number;
          status?: string;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          image?: string | null;
          days_active?: number | null;
          trust_score?: any; // jsonb
          verified_status?: string;
          summary?: string | null;
          location?: string | null;
          multimedia?: string[];
          video_links?: string[];
          faqs?: any; // jsonb
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          goal?: number;
          raised?: number;
          status?: string;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          image?: string | null;
          days_active?: number | null;
          trust_score?: any; // jsonb
          verified_status?: string;
          summary?: string | null;
          location?: string | null;
          multimedia?: string[];
          video_links?: string[];
          faqs?: any; // jsonb
        };
      };
      pledges: {
        Row: {
          id: string;
          cause_id: string;
          user_id: string | null;
          token: string | null;
          amount: number;
          currency: string;
          name: string;
          email: string;
          note: string | null;
          reminder_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cause_id: string;
          user_id?: string | null;
          token?: string | null;
          amount: number;
          currency?: string;
          name: string;
          email: string;
          note?: string | null;
          reminder_date: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cause_id?: string;
          user_id?: string | null;
          token?: string | null;
          amount?: number;
          currency?: string;
          name?: string;
          email?: string;
          note?: string | null;
          reminder_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          cause_id: string | null;
          paystack_subscription_code: string;
          paystack_email_token: string | null;
          amount: number;
          interval: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          cause_id?: string | null;
          paystack_subscription_code: string;
          paystack_email_token?: string | null;
          amount: number;
          interval: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          cause_id?: string | null;
          paystack_subscription_code?: string;
          paystack_email_token?: string | null;
          amount?: number;
          interval?: string;
          status?: string;
          created_at?: string;
        };
      };
      campaign_follows: {
        Row: {
          id: string;
          cause_id: string;
          user_id: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cause_id: string;
          user_id?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cause_id?: string;
          user_id?: string | null;
          email?: string;
          created_at?: string;
        };
      };
      petitions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          goal: number;
          raised: number;
          status: string;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
          image: string | null;
          days_active: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: string;
          goal: number;
          raised?: number;
          status?: string;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          image?: string | null;
          days_active?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          category?: string;
          goal?: number;
          raised?: number;
          status?: string;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
          image?: string | null;
          days_active?: number | null;
        };
      };
      donations: {
        Row: {
          id: string;
          cause_id: string;
          user_id: string | null;
          amount: number;
          name: string;
          email: string;
          message: string | null;
          is_anonymous: boolean;
          status: string;
          receipt_url: string | null;
          created_at: string;
          tip_amount: number;
        };
        Insert: {
          id?: string;
          cause_id: string;
          user_id?: string | null;
          amount: number;
          name: string;
          email: string;
          message?: string | null;
          is_anonymous?: boolean;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
          tip_amount?: number;
        };
        Update: {
          id?: string;
          cause_id?: string;
          user_id?: string | null;
          amount?: number;
          name?: string;
          email?: string;
          message?: string | null;
          is_anonymous?: boolean;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
          tip_amount?: number;
        };
      };
      signatures: {
        Row: {
          id: string;
          petition_id: string;
          user_id: string | null;
          amount: number;
          name: string;
          email: string;
          message: string | null;
          is_anonymous: boolean;
          status: string;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          petition_id: string;
          user_id?: string | null;
          amount: number;
          name: string;
          email: string;
          message?: string | null;
          is_anonymous?: boolean;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          petition_id?: string;
          user_id?: string | null;
          amount?: number;
          name?: string;
          email?: string;
          message?: string | null;
          is_anonymous?: boolean;
          status?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          cause_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          cause_id: string;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          cause_id?: string;
          user_id?: string;
          content?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
      };
    };
  };
}
