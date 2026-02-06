/**
 * Skill Activation Prompt Hook
 *
 * Analyzes user prompts and matches skill rules to automatically suggest relevant skills
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input structure
interface HookInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  prompt: string;
}

// Skill rule structure
interface SkillRule {
  name: string;
  description: string;
  keywords: string[];
  intent_patterns: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  auto_invoke?: boolean;  // When true, automatically inject skill content
  skill_path?: string;    // Path to SKILL.md relative to .claude/skills/
}

interface SkillRulesConfig {
  skills: SkillRule[];
}

// Match result
interface MatchedSkill {
  name: string;
  description: string;
  priority: string;
  matchType: 'keyword' | 'intent';
  matchedBy: string;
  auto_invoke?: boolean;
  skill_path?: string;
}

/**
 * Find SKILL.md path for a given skill name
 * Searches in .claude/skills/{category}/{skill-name}/SKILL.md
 */
function findSkillPath(skillName: string, cwd: string): string | null {
  const skillsDir = path.join(cwd, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) {
    return null;
  }

  // Search all subdirectories for the skill
  try {
    const categories = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const category of categories) {
      const skillPath = path.join(skillsDir, category, skillName, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        return skillPath;
      }
    }
  } catch (e) {
    // Directory read error, skip
  }
  return null;
}

/**
 * Read skill content from SKILL.md file
 */
function readSkillContent(skillPath: string): string | null {
  try {
    return fs.readFileSync(skillPath, 'utf-8');
  } catch (e) {
    return null;
  }
}

async function main() {
  // Read stdin
  let inputData = '';
  for await (const chunk of process.stdin) {
    inputData += chunk;
  }

  let input: HookInput;
  try {
    input = JSON.parse(inputData);
  } catch (e) {
    // Cannot parse input, exit silently
    process.exit(0);
  }

  const prompt = input.prompt?.toLowerCase() || '';
  if (!prompt) {
    process.exit(0);
  }

  // Load skill rules
  const rulesPath = path.join(__dirname, 'skill-rules.json');
  if (!fs.existsSync(rulesPath)) {
    process.exit(0);
  }

  let config: SkillRulesConfig;
  try {
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');
    config = JSON.parse(rulesContent);
  } catch (e) {
    process.exit(0);
  }

  // Match skills
  const matchedSkills: MatchedSkill[] = [];

  for (const skill of config.skills) {
    // Keyword matching
    for (const keyword of skill.keywords) {
      if (prompt.includes(keyword.toLowerCase())) {
        matchedSkills.push({
          name: skill.name,
          description: skill.description,
          priority: skill.priority,
          matchType: 'keyword',
          matchedBy: keyword,
          auto_invoke: skill.auto_invoke,
          skill_path: skill.skill_path
        });
        break;
      }
    }

    // Intent pattern matching (regex)
    if (!matchedSkills.find(m => m.name === skill.name)) {
      for (const pattern of skill.intent_patterns) {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(prompt)) {
            matchedSkills.push({
              name: skill.name,
              description: skill.description,
              priority: skill.priority,
              matchType: 'intent',
              matchedBy: pattern,
              auto_invoke: skill.auto_invoke,
              skill_path: skill.skill_path
            });
            break;
          }
        } catch (e) {
          // Invalid regex, skip
        }
      }
    }
  }

  // If no matched skills, exit silently
  if (matchedSkills.length === 0) {
    process.exit(0);
  }

  // Group by priority
  const priorityOrder = ['critical', 'high', 'medium', 'low'];
  const groupedSkills: Record<string, MatchedSkill[]> = {};

  for (const skill of matchedSkills) {
    if (!groupedSkills[skill.priority]) {
      groupedSkills[skill.priority] = [];
    }
    groupedSkills[skill.priority].push(skill);
  }

  // Separate auto-invoke skills from regular suggestions
  const autoInvokeSkills = matchedSkills.filter(s => s.auto_invoke);
  const suggestionSkills = matchedSkills.filter(s => !s.auto_invoke);

  // Output auto-loaded skill contents first
  for (const skill of autoInvokeSkills) {
    // Find skill path
    let skillPath = skill.skill_path
      ? path.join(input.cwd, '.claude', 'skills', skill.skill_path)
      : findSkillPath(skill.name, input.cwd);

    if (skillPath) {
      const content = readSkillContent(skillPath);
      if (content) {
        console.log('\n┌─────────────────────────────────────────────────────────┐');
        console.log(`│  📖 Auto-Loaded: ${skill.name.padEnd(40)}│`);
        console.log('└─────────────────────────────────────────────────────────┘');
        console.log(content);
        console.log('───────────────────────────────────────────────────────────');
      }
    }
  }

  // Output suggestions for non-auto-invoke skills
  if (suggestionSkills.length > 0) {
    // Group by priority
    const groupedSuggestions: Record<string, MatchedSkill[]> = {};
    for (const skill of suggestionSkills) {
      if (!groupedSuggestions[skill.priority]) {
        groupedSuggestions[skill.priority] = [];
      }
      groupedSuggestions[skill.priority].push(skill);
    }

    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│  🎯 Skills Detected                                     │');
    console.log('└─────────────────────────────────────────────────────────┘');

    const priorityLabels: Record<string, string> = {
      critical: '⚠️  CRITICAL',
      high: '🔴 HIGH',
      medium: '🟡 MEDIUM',
      low: '🟢 OPTIONAL'
    };

    for (const priority of priorityOrder) {
      const skills = groupedSuggestions[priority];
      if (skills && skills.length > 0) {
        console.log(`\n${priorityLabels[priority]}:`);
        for (const skill of skills) {
          console.log(`  • /${skill.name} - ${skill.description}`);
        }
      }
    }

    console.log('\n💡 Use Skill tool to invoke relevant skills for best guidance.');
    console.log('───────────────────────────────────────────────────────────\n');
  }
}

main().catch(() => process.exit(0));
