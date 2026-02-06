# OpenClaw Plugin Development Skill

A comprehensive skill for developing OpenClaw plugins following official SDK conventions and best practices.

## When to Use This Skill

Use this skill when:
- Creating a new OpenClaw plugin from scratch
- Refactoring an existing plugin to align with SDK standards
- Debugging plugin registration or integration issues
- Validating plugin structure before release
- Learning OpenClaw plugin development patterns

## What This Skill Provides

- **Code Patterns**: Complete examples of all plugin components
- **Checklist**: Validation checklist for plugin compliance
- **Best Practices**: Learned patterns from official plugins
- **Common Pitfalls**: Mistakes to avoid during development

## Official Documentation References

**Primary Sources:**
- [Plugin System Overview](https://docs.openclaw.ai/plugin)
- [Agent Tools Guide](https://docs.openclaw.ai/plugins/agent-tools)
- [Official Repository](https://github.com/openclaw/openclaw)
- [Reference Plugin: voice-call](https://github.com/openclaw/openclaw/tree/main/extensions/voice-call)

**Key Specifications:**

| Aspect | Specification | Source |
|--------|--------------|--------|
| Tool names | `snake_case` (e.g., `voice_call`) | docs.openclaw.ai/plugin#naming-conventions |
| Gateway methods | `pluginId.action` (e.g., `voicecall.initiate`) | docs.openclaw.ai/plugin#naming-conventions |
| CLI commands | kebab-case (e.g., `voicecall`) | voice-call reference |
| Required files | `openclaw.plugin.json` in plugin root | docs.openclaw.ai/plugin#plugin-manifest |
| Tool returns | `{ content: [{ type: "text", text: "..." }] }` | docs.openclaw.ai/plugins/agent-tools |
| Config schema | TypeBox with embedded `uiHints` | voice-call reference |

## How to Invoke

Simply mention this skill when working on OpenClaw plugins:

```
"Use the openclaw-plugin skill to validate my plugin structure"
"Help me create a new plugin using openclaw-plugin patterns"
"Check if my plugin follows openclaw-plugin conventions"
```

## Skill Contents

1. **patterns.md** - Core code patterns and examples
2. **checklist.md** - Validation checklist
3. **examples/** - Complete working examples

## Expected Output

When using this skill, you'll receive:
- Validated plugin structure
- Code pattern examples
- Compliance checklist results
- Specific improvement suggestions
