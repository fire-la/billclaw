/**
 * Type definitions for OpenClaw plugin SDK
 *
 * These are minimal type definitions for OpenClaw's plugin API.
 * In production, the actual @types/openclaw package should be used.
 */

export interface OpenClawPluginApi {
  logger: {
    info?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    debug?: (...args: unknown[]) => void;
  };
  pluginConfig: Record<string, unknown>;

  registerTool(tool: ToolRegistration): void;
  registerCli(cli: CliRegistration): void;
  registerOAuth(oauth: OAuthRegistration): void;
  registerService(service: ServiceRegistration): void;
}

export interface ToolRegistration {
  name: string;
  label?: string;
  description: string;
  parameters?: any;
  execute: (toolCallId: string, params: any) => Promise<ToolReturn>;
}

export interface ToolReturn {
  content: Array<{ type: string; text: string }>;
}

export interface CliRegistration {
  commands?: string[];
  handler: (cli: { program: any }) => void;
}

export interface OAuthRegistration {
  name: string;
  description?: string;
  handler: (context: any) => Promise<OAuthResult>;
}

export interface OAuthResult {
  url: string;
  token?: string;
}

export interface ServiceRegistration {
  id: string;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}
