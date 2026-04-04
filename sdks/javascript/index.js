const DEFAULT_BASE_URL = "https://refreeg.com/api/bot";

class RefreeGResource {
  constructor(client, basePath) {
    this.client = client;
    this.basePath = basePath;
  }

  create(payload) {
    return this.client.request(this.basePath, {
      method: "POST",
      body: payload,
    });
  }

  list(query) {
    return this.client.request(this.basePath, {
      method: "GET",
      query,
    });
  }

  retrieve(id) {
    return this.client.request(`${this.basePath}/${id}`, {
      method: "GET",
    });
  }

  update(id, payload) {
    return this.client.request(`${this.basePath}/${id}`, {
      method: "PATCH",
      body: payload,
    });
  }
}

export default class RefreeG {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error("A RefreeG API key is required");
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || DEFAULT_BASE_URL;
    this.fetch = options.fetch || globalThis.fetch;

    if (!this.fetch) {
      throw new Error("Fetch is required. Pass a fetch implementation in non-browser environments.");
    }

    this.campaigns = new RefreeGResource(this, "/campaigns");
    this.donations = {
      initialize: (payload) =>
        this.request("/donations/initialize", {
          method: "POST",
          body: payload,
        }),
      verify: (reference) =>
        this.request(`/donations/verify/${reference}`, {
          method: "GET",
        }),
      retrieve: (id) =>
        this.request(`/donations/${id}`, {
          method: "GET",
        }),
    };
    this.webhooks = {
      create: (payload) =>
        this.request("/webhooks", {
          method: "POST",
          body: payload,
        }),
      list: () =>
        this.request("/webhooks", {
          method: "GET",
        }),
      update: (id, payload) =>
        this.request(`/webhooks/${id}`, {
          method: "PATCH",
          body: payload,
        }),
      delete: (id) =>
        this.request(`/webhooks/${id}`, {
          method: "DELETE",
        }),
    };
  }

  async request(path, { method = "GET", body, query } = {}) {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await this.fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();
    if (!response.ok) {
      const message = json?.error?.message || json?.error || "RefreeG API request failed";
      const error = new Error(message);
      error.status = response.status;
      error.details = json;
      throw error;
    }

    return json.data ?? json;
  }
}