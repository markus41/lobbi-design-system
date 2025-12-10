# Golden Armada - Minimal Entry Point (Context-Optimized)

**Token Budget:** ~500 tokens (vs 15,000 tokens in full CLAUDE.md)

## Quick Reference

| Resource Type | Load Command |
|---------------|--------------|
| **Agent** | `mcp__obsidian__get_file_contents("System/Context-Management/Agents/{name}.md")` |
| **Skill** | `mcp__obsidian__get_file_contents("System/Context-Management/Skills/{name}.md")` |
| **MCP Tool** | `mcp__obsidian__get_file_contents("System/Context-Management/MCP-Tools/{name}.md")` |
| **Workflow** | `mcp__obsidian__get_file_contents("System/Context-Management/Workflows/{name}.md")` |
| **Checkpoint** | `mcp__obsidian__get_file_contents("System/Context-Management/Checkpoints/{task_id}/{phase}.md")` |

## Core System

### Context Management
- **Budget:** 100,000 tokens total
- **Auto-checkpoint:** Enabled at phase completion
- **Auto-compress:** Triggered at 75% usage
- **Vault Path:** `C:\Users\MarkusAhling\obsidian`

### Orchestration Protocol (6 Phases)
1. **EXPLORE** → Checkpoint (200 tokens) | Full: 5,000 tokens
2. **PLAN** → Checkpoint (150 tokens) | Full: 3,000 tokens
3. **CODE** → Checkpoint (300 tokens) | Full: 15,000 tokens
4. **TEST** → Checkpoint (200 tokens) | Full: 8,000 tokens
5. **FIX** → Checkpoint (150 tokens) | Full: 5,000 tokens
6. **DOCUMENT** → Checkpoint (200 tokens) | Full: 4,000 tokens

**Active Context:** ~1,200 tokens | **External Storage:** ~40,000 tokens

### Registry Indexes (Minimal)
```python
# Load compressed indexes
agents_index = load_json("System/Context-Management/Indexes/agents.index.json")  # 67 agents, ~3,350 tokens
skills_index = load_json("System/Context-Management/Indexes/skills.index.json")  # 25 skills, ~750 tokens
mcps_index = load_json("System/Context-Management/Indexes/mcps.index.json")      # 8 MCPs, ~800 tokens
workflows_index = load_json("System/Context-Management/Indexes/workflows.index.json")  # 10 workflows, ~500 tokens
```

## Context-Aware Loading

### By Task Type
- **Infrastructure:** Load DevOps section from vault
- **Documentation:** Load Obsidian section from vault
- **Orchestration:** Load Protocol section from vault
- **Security:** Load Security section from vault

### By File Pattern
- `*.tf` → Load terraform skill
- `*.ts` → Load typescript specialist
- `*.py` → Load python specialist
- `*.md` → Load docs-writer agent
- `docker-compose.yml` → Load docker-builder agent
- `.github/workflows/*` → Load cicd-engineer agent

## Essential Commands

| Command | Purpose |
|---------|---------|
| `/context-optimize status` | Check context health |
| `/context-optimize checkpoint {phase}` | Save phase externally |
| `/context-optimize load agent {name}` | Load agent definition |
| `/context-optimize compress` | Compress context now |
| `/help {topic}` | Load topic-specific docs |

## MCP Servers (8 Available)

- **supabase:** Database, migrations, types
- **vercel:** Deployment, projects, domains
- **github:** Git, PRs, issues, repos
- **upstash:** Redis cache, QStash queues
- **playwright:** Browser automation, E2E testing
- **context7:** Library documentation lookup
- **ide:** VS Code diagnostics, Jupyter
- **obsidian:** Documentation vault, templates, ADRs

## Environment

- **Working Dir:** `C:\Users\MarkusAhling\dev\new-alpa-1.4\Alpha-1.4`
- **Git Repo:** Yes
- **Platform:** Windows (win32)
- **Main Branch:** main

## Load Full Documentation

When needed, load complete CLAUDE.md sections:

```python
# Load full docs for specific topic
full_docs = mcp__obsidian__simple_search(query="your topic")

# Or load specific section
orchestration_docs = mcp__obsidian__get_file_contents(
    filepath="System/Context-Management/Workflows/README.md"
)
```

## Progressive Disclosure

1. **Start:** This minimal file (~500 tokens)
2. **On Trigger:** Load relevant section (e.g., "deploy" → Load DevOps)
3. **On Completion:** Unload section, keep only summary

## See Also

- Full docs: `.claude/CLAUDE.md` (load only when needed)
- Context management: `[[System/Context-Management/README]]`
- Integration guide: `[[System/Context-Management/INTEGRATION-GUIDE]]`

---

**Token Savings:** ~14,500 tokens (97% reduction from full CLAUDE.md)
