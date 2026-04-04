export interface RefreeGOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface CampaignCreateInput {
  title: string;
  description: string;
  goal_amount: number;
  payout_mode: "immediate" | "after_deadline";
  bank_account_number: string;
  bank_code: string;
  bank_account_name: string;
  deadline?: string;
}

export interface DonationInitializeInput {
  campaign_id: string;
  amount: number;
  name: string;
  email: string;
  message?: string;
  is_anonymous?: boolean;
  tip_amount?: number;
  callback_url?: string;
}

declare class RefreeG {
  constructor(apiKey: string, options?: RefreeGOptions);

  campaigns: {
    create(payload: CampaignCreateInput): Promise<any>;
    list(query?: Record<string, string | number | boolean>): Promise<any>;
    retrieve(id: string): Promise<any>;
    update(id: string, payload: Partial<CampaignCreateInput>): Promise<any>;
  };

  donations: {
    initialize(payload: DonationInitializeInput): Promise<any>;
    verify(reference: string): Promise<any>;
    retrieve(id: string): Promise<any>;
  };

  webhooks: {
    create(payload: { url: string; events: string[] }): Promise<any>;
    list(): Promise<any>;
    update(id: string, payload: { url?: string; events?: string[]; is_active?: boolean }): Promise<any>;
    delete(id: string): Promise<any>;
  };
}

export default RefreeG;