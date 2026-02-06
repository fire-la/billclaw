# OpenClaw Plugin Development Patterns

This document contains all the core code patterns for developing OpenClaw plugins following the official SDK conventions.

## Official Reference

**Always verify against official sources:**
- [Plugin System Overview](https://docs.openclaw.ai/plugin)
- [Agent Tools Guide](https://docs.openclaw.ai/plugins/agent-tools)
- [Official Repository](https://github.com/openclaw/openclaw)
- [Reference Plugin: voice-call](https://github.com/openclaw/openclaw/tree/main/extensions/voice-call)

## Table of Contents

1. [Plugin Registration Pattern](#plugin-registration-pattern)
2. [Config Schema Pattern](#config-schema-pattern)
3. [Tool Registration Pattern](#tool-registration-pattern)
4. [CLI Registration Pattern](#cli-registration-pattern)
5. [Service Registration Pattern](#service-registration-pattern)
6. [OAuth Registration Pattern](#oauth-registration-pattern)
7. [Type Usage Patterns](#type-usage-patterns)

---

## Plugin Registration Pattern

### Basic Plugin Structure

```typescript
// index.ts
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { myConfigSchema } from "./config.ts";

const myPlugin = {
  // Required: Simple kebab-case ID
  id: "my-plugin",

  // Required: Human-readable name
  name: "My Plugin",

  // Required: Plugin kind
  kind: "integrations" as const,

  // Required: Description
  description: "Brief description of what this plugin does",

  // Required: Config schema with parse() method
  configSchema: myConfigSchema,

  // Required: Single registration function
  register(api: OpenClawPluginApi) {
    // Parse and validate config
    const config = myConfigSchema.parse(api.pluginConfig);

    // Log plugin registration
    api.logger.info(`${this.id}: plugin registered`);

    // Register tools, CLI, services, etc.
    // See patterns below
  },
};

export default myPlugin;
```

### package.json Configuration

```json
{
  "name": "@scope/my-plugin",
  "peerDependencies": {
    "openclaw": "workspace:*"
  },
  "openclaw": {
    "extensions": ["./index.ts"]
  }
}
```

---

## Config Schema Pattern

### Parseable Schema with Embedded uiHints

```typescript
// config.ts
import * as os from "node:os";
import * as path from "node:path";

// Type definitions
export type MyConfig = {
  apiKey: string;
  endpoint: string;
  retries: number;
};

// Parseable schema object
export const myConfigSchema = {
  // Required: Parse method with validation
  parse(value: unknown): MyConfig {
    if (!value || typeof value !== "object") {
      throw new Error("Config required");
    }

    const cfg = value as Record<string, unknown>;

    // Validate and parse with defaults
    return {
      apiKey: typeof cfg.apiKey === "string" ? cfg.apiKey : "",
      endpoint: typeof cfg.endpoint === "string" ? cfg.endpoint : "https://api.example.com",
      retries: typeof cfg.retries === "number" ? cfg.retries : 3,
    };
  },

  // Required: Embedded UI hints for config UI
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
    },
    "retries": {
      label: "Max Retries",
      type: "number",
      default: 3,
      min: 0,
      max: 10,
    },
  },
};
```

---

## Tool Registration Pattern

### Using TypeBox for Parameters

```typescript
// In register() function
import { Type } from "@sinclair/typebox";

api.registerTool(
  {
    name: "my_tool",
    label: "My Tool",
    description: "What this tool does",

    // Use TypeBox for parameter schema
    parameters: Type.Object({
      stringParam: Type.Optional(Type.String({
        description: "A string parameter",
      })),
      numberParam: Type.Optional(Type.Number({
        description: "A number parameter",
      })),
    }),

    // Execute signature: (toolCallId, params) => result
    async execute(_toolCallId, params) {
      // Dynamic import for tool implementation
      const { myToolImplementation } = await import("./tools/my-tool.ts");
      return myToolImplementation(api, params);
    },
  },
  // Tool metadata
  { name: "my_tool" }
);
```

### Tool Implementation Pattern

```typescript
// tools/my-tool.ts
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

export interface MyToolParams {
  stringParam?: string;
  numberParam?: number;
}

export interface MyToolResult {
  success: boolean;
  data: unknown;
}

// OpenClaw tool return format (required)
interface ToolReturn {
  content: Array<{ type: string; text: string }>;
}

// Helper to convert result to OpenClaw format
export function toToolReturn(result: MyToolResult): ToolReturn {
  return {
    content: [{
      type: "text",
      text: JSON.stringify(result, null, 2)
    }]
  };
}

export async function myToolImplementation(
  context: OpenClawPluginApi,
  params: MyToolParams
): Promise<MyToolResult> {
  // Access config via context.pluginConfig
  const config = context.pluginConfig as MyConfig;

  // Use logger
  context.logger.info?.("Executing my tool");

  // Return result in OpenClaw format
  const result: MyToolResult = {
    success: true,
    data: { /* ... */ },
  };

  return toToolReturn(result) as unknown as MyToolResult;
}
```

---

## CLI Registration Pattern

### Commander.js Pattern

```typescript
api.registerCli(
  ({ program }) => {
    // Create command group
    const myCmd = program
      .command("my-plugin")
      .description("My plugin commands");

    // Add subcommands
    myCmd
      .command("run")
      .description("Run the plugin")
      .argument("[input]", "Optional input argument")
      .option("-v, --verbose", "Verbose output")
      .action(async (input = undefined, options) => {
        const { runCommand } = await import("./cli/commands.ts");
        return runCommand(input, options);
      });

    myCmd
      .command("status")
      .description("Show plugin status")
      .action(async () => {
        const { statusCommand } = await import("./cli/commands.ts");
        return statusCommand();
      });
  },
  // Declare all commands for discovery
  { commands: ["my-plugin", "my-plugin:run", "my-plugin:status"] }
);
```

---

## Service Registration Pattern

### Lifecycle Methods

```typescript
api.registerService({
  id: "my-plugin-service",

  // Start: Called when service is started
  start: async () => {
    api.logger.info("my-plugin service starting");

    // Initialize service
    await initializeService();

    api.logger.info("my-plugin service started");
  },

  // Stop: Called when service is stopped
  stop: async () => {
    api.logger.info("my-plugin service stopping");

    // Cleanup
    await cleanupService();

    api.logger.info("my-plugin service stopped");
  },
});
```

---

## OAuth Registration Pattern

### OAuth Provider

```typescript
api.registerOAuth({
  name: "my-service",
  description: "My Service OAuth flow",

  handler: async (context: OpenClawPluginApi) => {
    const { handleOAuth } = await import("./oauth/my-service.ts");

    // Return OAuth flow result or redirect URL
    return handleOAuth(context);
  },
});
```

---

## Type Usage Patterns

### Import Types from SDK

```typescript
// Use SDK types, not local definitions
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

// For logger
context.logger.info?.("message");

// For HTTP (optional)
context.http?.register({
  path: "/webhook",
  method: "POST",
  handler: async (req) => ({ status: 200, body: {} }),
});
```

### Config Access Pattern

```typescript
// In register() - parse once
const config = myConfigSchema.parse(api.pluginConfig);

// In tools/services - access via context
const config = context.pluginConfig as MyConfig;
```

### Const Arrays Instead of Enums

```typescript
// Use const arrays with type inference
export const SYNC_FREQUENCIES = ["realtime", "hourly", "daily", "weekly", "manual"] as const;
export type SyncFrequency = (typeof SYNC_FREQUENCIES)[number];

// Usage
const frequency: SyncFrequency = "daily";
if (SYNC_FREQUENCIES.includes(frequency)) {
  // ...
}
```

---

## Common Mistakes to Avoid

1. **Don't use Zod** - Use parseable schema objects with `parse()` method
2. **Don't use local type stubs** - Import from `openclaw/plugin-sdk`
3. **Don't export separate register functions** - Use single `register()` method
4. **Don't use plain objects for tool params** - Use TypeBox schemas
5. **Don't use `handler(params, context)`** - Use `execute(toolCallId, params)`
6. **Don't use npm enums** - Use const arrays with type inference
7. **Don't skip openclaw.plugin.json** - This file is REQUIRED in plugin root
8. **Don't use `.js` imports in TypeScript** - Use `.ts` extensions
9. **Don't return plain objects from tools** - Use `{ content: [{ type: "text", text: "..." }] }` format

---

## File Structure Checklist

```
my-plugin/
├── openclaw.plugin.json  # REQUIRED: Plugin manifest (id, uiHints, configSchema)
├── index.ts              # Plugin registration (default export)
├── config.ts             # Config schema with parse() + uiHints
├── package.json          # peerDependencies: openclaw, openclaw.extensions
├── src/
│   ├── tools/            # Tool implementations
│   ├── cli/              # CLI command handlers
│   ├── services/         # Background services
│   └── oauth/            # OAuth handlers
└── index.test.ts         # E2E registration tests
```

---

## openclaw.plugin.json Structure (REQUIRED)

The `openclaw.plugin.json` file is **required** in the plugin root directory. Based on the official voice-call plugin:

```json
{
  "id": "my-plugin",
  "uiHints": {
    "apiKey": {
      "label": "API Key",
      "sensitive": true,
      "help": "Your API key for the service"
    },
    "endpoint": {
      "label": "API Endpoint",
      "placeholder": "https://api.example.com"
    }
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "enabled": { "type": "boolean" },
      "apiKey": { "type": "string" },
      "endpoint": { "type": "string" }
    }
  }
}
```

**Reference**: https://github.com/openclaw/openclaw/blob/main/extensions/voice-call/openclaw.plugin.json
