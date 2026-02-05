/**
 * Type definitions for OpenClaw Plugin SDK
 *
 * These are stub types to allow compilation during development.
 * In actual OpenClaw runtime, these are provided by the @openclaw/plugin-sdk.
 */

/**
 * Plugin interface
 */
export interface Plugin {
  name: string;
  version: string;

  registerCLI?(cli: CLIRegistry): Promise<void> | void;

  registerTools?(tools: ToolRegistry): Promise<void> | void;

  registerOAuth?(oauth: OAuthRegistry): Promise<void> | void;

  registerServices?(services: ServiceRegistry): Promise<void> | void;
}

/**
 * CLI Registry
 */
export interface CLIRegistry {
  registerCommand(command: CLICommand): void;
}

export interface CLICommand {
  name?: string;
  description: string;
  handler?: (args?: any) => Promise<any> | any;
  subcommands?: Record<string, CLICommand>;
}

/**
 * Tool Registry
 */
export interface ToolRegistry {
  register(tool: ToolDefinition): void;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters?: {
    type: "object";
    properties?: Record<string, {
      type: string;
      description?: string;
    }>;
    required?: string[];
  };
  handler: (params: any, context: ToolContext) => Promise<any> | any;
}

/**
 * OAuth Registry
 */
export interface OAuthRegistry {
  register(provider: OAuthProvider): void;
}

export interface OAuthProvider {
  name: string;
  description: string;
  handler: (context: OAuthContext) => Promise<any> | any;
}

/**
 * Service Registry
 */
export interface ServiceRegistry {
  register(service: ServiceDefinition): void;
}

export interface ServiceDefinition {
  name: string;
  description: string;
  handler: (context: ServiceContext) => Promise<void> | void;
  routes?: HttpRoute[];
}

/**
 * Context interfaces
 */
export interface ToolContext {
  logger: Logger;
  config: Config;
}

export interface OAuthContext {
  logger: Logger;
  config: Config;
  http: HttpServer;
}

export interface ServiceContext {
  logger: Logger;
  config: Config;
  scheduler: Scheduler;
  http: HttpServer;
}

export interface Logger {
  info(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  debug(...args: any[]): void;
}

export interface Config {
  get(key: string): any;
  set(key: string, value: any): Promise<void>;
}

export interface HttpServer {
  register(route: HttpRoute): void;
}

export interface HttpRoute {
  path: string;
  method: string;
  handler?: (request: HttpRequest, context?: ServiceContext) => Promise<HttpResponse> | HttpResponse;
}

export interface HttpRequest {
  body: any;
  headers: Record<string, string>;
  query: Record<string, string>;
}

export interface HttpResponse {
  status: number;
  body: any;
}

export interface Scheduler {
  schedule(cronExpression: string, callback: () => void): void;
}
