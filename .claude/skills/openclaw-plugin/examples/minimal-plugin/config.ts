/**
 * Config schema for minimal plugin example
 */

export type MinimalConfig = {
  apiKey: string;
  endpoint: string;
  timeout: number;
};

export const minimalConfigSchema = {
  parse(value: unknown): MinimalConfig {
    if (!value || typeof value !== "object") {
      throw new Error("Minimal plugin config required");
    }

    const cfg = value as Record<string, unknown>;

    return {
      apiKey: typeof cfg.apiKey === "string" ? cfg.apiKey : "",
      endpoint: typeof cfg.endpoint === "string"
        ? cfg.endpoint
        : "https://api.example.com",
      timeout: typeof cfg.timeout === "number" ? cfg.timeout : 5000,
    };
  },

  uiHints: {
    "apiKey": {
      label: "API Key",
      type: "password",
      placeholder: "Enter your API key",
      help: "Get your API key from the developer dashboard",
    },
    "endpoint": {
      label: "API Endpoint",
      type: "url",
      placeholder: "https://api.example.com",
      default: "https://api.example.com",
    },
    "timeout": {
      label: "Request Timeout (ms)",
      type: "number",
      default: 5000,
      min: 1000,
      max: 30000,
    },
  },
};
