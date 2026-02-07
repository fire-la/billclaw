#!/bin/bash
# Validate billclaw skill before publishing to ClawHub
# Usage: ./validate-skill.sh /path/to/skills/billclaw

set -e

SKILL_PATH="${1:-./skills/billclaw}"

echo "🔍 Validating billclaw skill at: $SKILL_PATH"
echo ""

# Check if skill directory exists
if [ ! -d "$SKILL_PATH" ]; then
  echo "❌ Error: Skill directory not found: $SKILL_PATH"
  exit 1
fi

# Check SKILL.md exists
if [ ! -f "$SKILL_PATH/SKILL.md" ]; then
  echo "❌ Error: SKILL.md not found in skill directory"
  exit 1
fi

# Check YAML frontmatter
if ! grep -q "^---" "$SKILL_PATH/SKILL.md"; then
  echo "❌ Error: SKILL.md missing YAML frontmatter (must start with ---)"
  exit 1
fi

# Extract and validate YAML frontmatter
FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$SKILL_PATH/SKILL.md")

# Check for required fields
if ! echo "$FRONTMATTER" | grep -q "name:"; then
  echo "❌ Error: SKILL.md missing 'name' field in frontmatter"
  exit 1
fi

if ! echo "$FRONTMATTER" | grep -q "description:"; then
  echo "❌ Error: SKILL.md missing 'description' field in frontmatter"
  echo "   Add: description: This skill should be used when..."
  exit 1
fi

# Extract skill name
SKILL_NAME=$(echo "$FRONTMATTER" | grep "name:" | sed 's/name: *//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Validate skill name format
if [[ ! "$SKILL_NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "❌ Error: Skill name '$SKILL_NAME' must be lowercase with hyphens only (a-z, 0-9, -)"
  echo "   Current value: $(echo "$FRONTMATTER" | grep "name:" | sed 's/name: *//')"
  exit 1
fi

# Check description quality
DESCRIPTION=$(echo "$FRONTMATTER" | grep "description:" | sed 's/description: *//')

if [ ${#DESCRIPTION} -lt 10 ]; then
  echo "❌ Error: Description too short (minimum 10 characters)"
  echo "   Current length: ${#DESCRIPTION}"
  exit 1
fi

if [ ${#DESCRIPTION} -gt 500 ]; then
  echo "⚠️  Warning: Description too long (>500 characters)"
  echo "   Current length: ${#DESCRIPTION}"
fi

# Check for third-person description
if echo "$DESCRIPTION" | grep -qiE "use this skill|you should|when you"; then
  echo "⚠️  Warning: Description should use third person"
  echo "   Recommended: \"This skill should be used when...\""
  echo "   Current: $DESCRIPTION"
fi

# Check file sizes
MAX_SIZE=$((200 * 1024))  # 200KB limit
find "$SKILL_PATH" -type f -size +${MAX_SIZE}c 2>/dev/null | while read -r file; do
  echo "⚠️  Warning: File exceeds 200KB limit:"
  echo "   $file ($(stat -f "$file" | grep Size: | awk '{print $2}'))"
done

# Count skill files
FILE_COUNT=$(find "$SKILL_PATH" -type f | wc -l)
echo "📄 Skill file count: $FILE_COUNT"

# Check for optional directories
echo ""
echo "📁 Directory Structure:"
if [ -d "$SKILL_PATH/scripts" ]; then
  SCRIPT_COUNT=$(find "$SKILL_PATH/scripts" -type f | wc -l)
  echo "   ✅ scripts/ ($SCRIPT_COUNT files)"
else
  echo "   ⚪  scripts/ (not present)"
fi

if [ -d "$SKILL_PATH/references" ]; then
  REF_COUNT=$(find "$SKILL_PATH/references" -type f | wc -l)
  echo "   ✅ references/ ($REF_COUNT files)"
else
  echo "   ⚪  references/ (not present)"
fi

if [ -d "$SKILL_PATH/assets" ]; then
  ASSET_COUNT=$(find "$SKILL_PATH/assets" -type f 2>/dev/null | wc -l)
  echo "   ✅ assets/ ($ASSET_COUNT files)"
else
  echo "   ⚪  assets/ (not present)"
fi

echo ""
echo "✅ Validation passed! Skill is ready for publishing."
echo ""
echo "Next steps:"
echo "  1. Ensure ClawHub CLI is installed: npm i -g clawhub"
echo "  2. Login to ClawHub: clawhub login --token clh_..."
echo "  3. Publish skill: clawhub publish $SKILL_PATH --slug $SKILL_NAME"
