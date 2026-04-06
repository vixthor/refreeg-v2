export interface RefreegOptions {
  apiKey: string;
  baseUrl?: string;
}

export class Refreeg {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: RefreegOptions) {
    if (!options.apiKey) {
      throw new Error("RefreeG API key is required");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://refreeg.com/api/bot";
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `RefreeG API Error: ${response.statusText}`);
    }

    return data.data || data;
  }

  public get campaigns() {
    return {
      create: (payload: any) => this.fetchApi("/campaigns", { method: "POST", body: JSON.stringify(payload) }),
      get: (id: string) => this.fetchApi(`/campaigns/${id}`),
      list: (query?: URLSearchParams) => {
        const q = query ? `?${query.toString()}` : "";
        return this.fetchApi(`/campaigns${q}`);
      },
      update: (id: string, payload: any) => this.fetchApi(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
      cancel: (id: string) => this.fetchApi(`/campaigns/${id}`, { method: "DELETE" }),
      pause: (id: string) => this.fetchApi(`/campaigns/${id}/pause`, { method: "POST" }),
      resume: (id: string) => this.fetchApi(`/campaigns/${id}/resume`, { method: "POST" }),
      donations: (id: string) => this.fetchApi(`/campaigns/${id}/donations`),
    };
  }

  public get donations() {
    return {
      initialize: (payload: any) => this.fetchApi("/donations/initialize", { method: "POST", body: JSON.stringify(payload) }),
      verify: (reference: string) => this.fetchApi(`/donations/verify/${reference}`),
      get: (id: string) => this.fetchApi(`/donations/${id}`),
    };
  }

  public get webhooks() {
    return {
      register: (payload: any) => this.fetchApi("/webhooks", { method: "POST", body: JSON.stringify(payload) }),
      list: () => this.fetchApi("/webhooks"),
      update: (id: string, payload: any) => this.fetchApi(`/webhooks/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
      delete: (id: string) => this.fetchApi(`/webhooks/${id}`, { method: "DELETE" }),
    };
  }

  public get banks() {
    return {
      register: (payload: any) => this.fetchApi("/banks", { method: "POST", body: JSON.stringify(payload) }),
      list: () => this.fetchApi("/banks"),
    };
  }
}
