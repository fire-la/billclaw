# OpenClaw Plugin Validation Checklist

Use this checklist to validate that your plugin follows all OpenClaw SDK conventions and best practices.

## Official Reference

**Always verify against official sources:**
- [Plugin System Overview](https://docs.openclaw.ai/plugin)
- [Agent Tools Guide](https://docs.openclaw.ai/plugins/agent-tools)
- [Official Repository](https://github.com/openclaw/openclaw)
- [Reference Plugin: voice-call](https://github.com/openclaw/openclaw/tree/main/extensions/voice-call)

## Plugin Structure

- [ ] **REQUIRED**: `openclaw.plugin.json` exists in plugin root
- [ ] `openclaw.plugin.json` contains `id` field
- [ ] `openclaw.plugin.json` contains `uiHints` object
- [ ] `openclaw.plugin.json` contains `configSchema` (JSON Schema format)

- [ ] Plugin exports a default object (not named export)
- [ ] Plugin has `id` field (simple kebab-case, e.g., "my-plugin")
- [ ] Plugin has `name` field (human-readable)
- [ ] Plugin has `kind` field (e.g., "integrations", "tools")
- [ ] Plugin has `description` field
- [ ] Plugin has `configSchema` object with `parse()` method
- [ ] Plugin has `register(api: OpenClawPluginApi)` method
- [ ] No separate register methods (registerCLI, registerTools, etc.)

## Configuration

- [ ] Config schema has `parse(value: unknown): MyConfig` method
- [ ] Config schema has `uiHints` object embedded
- [ ] uiHints use dot-notation keys (e.g., "apiKey", "nested.value")
- [ ] Each config field has corresponding uiHint entry
- [ ] Parse method provides defaults for missing values
- [ ] Parse method validates and throws on invalid input
- [ ] No Zod or other external validation libraries used

## Tools

- [ ] Tools registered via `api.registerTool(tool, options)`
- [ ] Tool name uses `snake_case` (e.g., `my_tool`, `voice_call`)
- [ ] Tool has `label` field (human-readable)
- [ ] Tool has `description` field
- [ ] Tool parameters use TypeBox schemas (`Type.Object()`, `Type.String()`, etc.)
- [ ] Tool has `execute(toolCallId, params)` method (not `handler`)
- [ ] Tool implementation uses dynamic imports
- [ ] Tool implementation receives `api` or `context` as first parameter
- [ ] Tool options object passed to registerTool with `{ name: "tool_name" }`
- [ ] **REQUIRED**: Tool returns OpenClaw format `{ content: [{ type: "text", text: "..." }] }`

## CLI

- [ ] CLI registered via `api.registerCli(callback, options)`
- [ ] CLI callback receives `{ program }` parameter
- [ ] CLI uses commander.js pattern (program.command(), .action())
- [ ] CLI commands use dynamic imports for handlers
- [ ] CLI options object declares all commands array
- [ ] Commands follow naming pattern: "plugin-name", "plugin-name:subcommand"

## Services

- [ ] Services registered via `api.registerService(config)`
- [ ] Service has `id` field
- [ ] Service has `start()` async method
- [ ] Service has `stop()` async method
- [ ] Service logs startup/shutdown

## OAuth

- [ ] OAuth registered via `api.registerOAuth(config)`
- [ ] OAuth has `name` field
- [ ] OAuth has `description` field
- [ ] OAuth has `handler(context)` method

## Types

- [ ] Types imported from `openclaw/plugin-sdk`, not local stubs
- [ ] `OpenClawPluginApi` used for context type
- [ ] No `openclaw-types.d.ts` or similar stub files
- [ ] Enums replaced with const arrays + type inference
- [ ] Import extensions use `.ts` not `.js`

## Package.json

- [ ] Has `peerDependencies.openclaw: "workspace:*"`
- [ ] Has `openclaw.extensions: ["./index.ts"]`
- [ ] **REQUIRED**: `openclaw.plugin.json` exists in plugin root
- [ ] Main entry points to compiled JS (if applicable)

## Testing

- [ ] E2E test for plugin registration exists
- [ ] Test verifies plugin metadata (id, name, kind, description)
- [ ] Test verifies configSchema has parse() and uiHints
- [ ] Test verifies all tools are registered
- [ ] Test verifies CLI commands are registered
- [ ] Test verifies services are registered
- [ ] All tests pass

## Build

- [ ] `npm run build` completes without errors
- [ ] `npx tsc --noEmit` passes
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## File Structure

```
expected-structure/
├── openclaw.plugin.json  ✓ REQUIRED: Plugin manifest
├── index.ts              ✓ Plugin registration
├── config.ts             ✓ Config schema
├── package.json          ✓ openclaw.extensions
├── src/
│   ├── tools/            ✓ Tool implementations
│   ├── cli/              ✓ CLI handlers
│   ├── services/         ✓ Background services
│   └── oauth/            ✓ OAuth handlers (if applicable)
└── *.test.ts             ✓ Test files
```

## Common Mistakes Check

- [ ] Not using Zod schemas for config
- [ ] Not using plain objects for tool parameters
- [ ] Not using `handler(params, context)` pattern
- [ ] Not defining enums (use const arrays)
- [ ] Not using `.js` imports in TypeScript files
- [ ] Missing `openclaw.plugin.json` file (REQUIRED)
- [ ] Not exporting separate register functions
- [ ] Not importing from `openclaw/plugin-sdk`
- [ ] Not returning correct tool format `{ content: [{ type: "text", text: "..." }] }`

## Quick Validation Commands

```bash
# Build check
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Tests
npm test

# Verify exports
cat package.json | grep -A2 "openclaw"
```

## Final Verification

Before releasing, verify:
- [ ] All checklist items complete
- [ ] Documentation updated
- [ ] README.md created
- [ ] Examples provided
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Git tag created
