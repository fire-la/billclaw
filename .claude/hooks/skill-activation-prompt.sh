#!/bin/bash
# Skill Activation Prompt Hook
# Automatically detects and suggests relevant skills when user submits a prompt
set -e
cd "$CLAUDE_PROJECT_DIR/.claude/hooks"
cat | npx tsx skill-activation-prompt.ts
