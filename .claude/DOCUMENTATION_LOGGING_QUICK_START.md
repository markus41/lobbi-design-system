# Documentation and Activity Logging - Quick Start Guide

> **Streamline documentation workflows and track agent activity automatically**

This guide helps you get started with the comprehensive documentation and activity logging system for the Golden Armada agent platform.

## Overview

The system provides:

✅ **Automatic Documentation Logging** - All documentation changes tracked automatically
✅ **Obsidian Vault Sync** - Seamless integration with your research vault
✅ **Activity Tracking** - Comprehensive agent activity monitoring
✅ **Audit Reports** - Documentation coverage and quality analytics
✅ **Zero Manual Effort** - Hooks trigger everything automatically

## Quick Start (5 Minutes)

### 1. Initialize the Database

The database is created automatically when first used, or initialize manually:

\`\`\`bash
# Using Python
python .claude/orchestration/apply_migration.py

# Or using orchestrator
python .claude/orchestration/orchestrator.py init
\`\`\`

### 2. Make Hooks Executable

\`\`\`bash
# Windows PowerShell
icacls .claude\hooks\*.sh /grant Everyone:RX

# Linux/Mac
chmod +x .claude/hooks/*.sh
\`\`\`

### 3. Test Documentation Logging

\`\`\`bash
# Create a test document
echo "# Test Document" > docs/test.md
echo "This is a test." >> docs/test.md

# Log it manually
bash .claude/hooks/doc-logging.sh --file docs/test.md --action created --summary "Test documentation"
\`\`\`

**Expected Output:**
\`\`\`
[DocLog] Processing: docs/test.md
[DocLog] Type: guide
[DocLog] Title: Test Document
[DocLog] Lines: 2 | Words: 5
[DocLog] ✓ Logged to database (ID: 1)
[DocLog] Syncing to Obsidian: Repositories/Alpha-1.4/Guides/test.md
[DocLog] ✓ Copied to: C:\Users\MarkusAhling\obsidian\Repositories\Alpha-1.4\Guides\test.md
[DocLog] ✓ Documentation logged successfully (ID: 1)
\`\`\`

### 4. Verify Database Entry

\`\`\`bash
# View recent documentation logs
python .claude/orchestration/orchestrator.py logs --limit 10
\`\`\`

## Commands Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/doc-sync` | Sync documentation to Obsidian | `/doc-sync` |
| `/doc-log` | Manually log documentation | `/doc-log --file README.md --action updated` |
| `/doc-audit` | Generate audit report | `/doc-audit --export obsidian` |

## Python API Usage

### Documentation Logging

\`\`\`python
from claude.orchestration.utils.doc_logger import DocumentationLogger

# Initialize logger
logger = DocumentationLogger()

# Log documentation creation
doc_id = logger.log_created(
    file_path="docs/setup-guide.md",
    agent_id="docs-writer-001",
    summary="Initial setup documentation"
)

# Log documentation update
logger.log_updated(
    file_path="README.md",
    agent_id="coder-001",
    summary="Added installation instructions",
    lines_added=25,
    lines_removed=3
)

# Get agent statistics
stats = logger.get_agent_stats(agent_id="docs-writer-001")
print(f"Total docs: {stats['total_docs']}")
print(f"Docs synced: {stats['docs_synced']}")
\`\`\`

### Activity Tracking

\`\`\`python
from claude.orchestration.utils.activity_tracker import ActivityTracker

# Initialize tracker
tracker = ActivityTracker(agent_id="my-agent")

# Log simple activity
tracker.log(
    action="data_processed",
    message="Processed user data successfully",
    category="task_execution",
    details={'records': 1000}
)

# Use context manager for automatic task tracking
with tracker.track_task("Process invoices", "Processing monthly invoices"):
    # Do work
    process_invoices()
    # Automatically logs start, completion, and duration

# Log errors
try:
    risky_operation()
except Exception as e:
    tracker.log_error(
        error_message=str(e),
        error_type=type(e).__name__,
        stack_trace=traceback.format_exc()
    )

# Get agent summary
summary = tracker.get_agent_summary()
print(f"Total activities: {summary['total_activities']}")
print(f"By category: {summary['by_category']}")
\`\`\`

## Hooks Integration

### Automatic Documentation Logging

The `post-edit.sh` hook automatically logs documentation when you edit files:

\`\`\`bash
# Edit a markdown file
echo "## New Section" >> README.md

# Hook automatically triggers:
# 1. Detects it's a documentation file
# 2. Logs to documentation_log table
# 3. Queues for Obsidian sync
# 4. Updates activity_log
\`\`\`

### Manual Hook Execution

\`\`\`bash
# Log documentation
.claude/hooks/doc-logging.sh \
  --file docs/api.md \
  --action created \
  --summary "API endpoint documentation"

# Test post-edit hook
export EDIT_FILE_PATH="docs/guide.md"
bash .claude/hooks/post-edit-documentation.sh docs/guide.md
\`\`\`

## Obsidian Integration

### Configure Obsidian MCP (Optional)

If you want to use the MCP server for sync:

\`\`\`json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "obsidian-mcp-server"],
      "env": {
        "OBSIDIAN_API_URL": "http://localhost:27123",
        "OBSIDIAN_VAULT_PATH": "C:\\Users\\MarkusAhling\\obsidian"
      }
    }
  }
}
\`\`\`

### Direct File Copy (Default)

The system automatically falls back to direct file copy if MCP is unavailable:

\`\`\`
docs/architecture/system-design.md
  ↓
C:\Users\MarkusAhling\obsidian\Repositories\Alpha-1.4\Architecture\system-design.md
\`\`\`

## Database Queries

### View Recent Documentation Activity

\`\`\`sql
-- Recent documentation logs
SELECT * FROM v_recent_doc_activity LIMIT 10;

-- Agent documentation stats
SELECT * FROM v_agent_doc_stats WHERE agent_name = 'docs-writer';

-- Unsynced documents
SELECT * FROM v_unsynced_docs;

-- Documentation quality metrics
SELECT * FROM v_doc_quality_metrics;
\`\`\`

### Python Queries

\`\`\`python
import sqlite3

conn = sqlite3.connect('.claude/orchestration/db/agents.db')
conn.row_factory = sqlite3.Row

# Get recent documentation
cursor = conn.execute("""
    SELECT * FROM documentation_log
    ORDER BY timestamp DESC
    LIMIT 10
""")

for row in cursor:
    print(f"{row['timestamp']}: {row['action']} - {row['doc_path']}")

conn.close()
\`\`\`

## Common Workflows

### Workflow 1: Agent Creates Documentation

\`\`\`
Agent creates README.md
        ↓
post-edit.sh hook triggered
        ↓
post-edit-documentation.sh detects .md file
        ↓
doc-logging.sh logs to database
        ↓
File copied to Obsidian vault
        ↓
documentation_log updated (vault_synced=1)
        ↓
activity_log updated with doc_created action
\`\`\`

### Workflow 2: Manual Documentation Audit

\`\`\`bash
# Run audit
/doc-audit --export obsidian

# Generates report:
# - Documentation coverage: 42%
# - Unsynced documents: 14
# - Quality score: 78/100
# - Missing documentation: 5 critical gaps

# Report saved to:
# C:\Users\MarkusAhling\obsidian\Repositories\Alpha-1.4\Documentation-Audit-2025-01-29.md
\`\`\`

### Workflow 3: Bulk Documentation Sync

\`\`\`bash
# Sync all documentation
/doc-sync

# Or sync specific type
/doc-sync --type adr

# Or specific path
/doc-sync --path docs/guides/
\`\`\`

## Environment Variables

Set these in your shell or `.env` file:

\`\`\`bash
# Required
export CLAUDE_AGENT_ID="my-agent-001"

# Optional (auto-detected from orchestration)
export CLAUDE_SESSION_ID="session-xyz"
export CLAUDE_TASK_ID="task-123"

# Obsidian configuration
export OBSIDIAN_VAULT="C:/Users/MarkusAhling/obsidian"
export OBSIDIAN_API_URL="http://localhost:27123"

# Database path (default shown)
export DB_PATH=".claude/orchestration/db/agents.db"
\`\`\`

## Troubleshooting

### Database Not Found

\`\`\`bash
# Initialize database
python .claude/orchestration/orchestrator.py init

# Or apply migration manually
python .claude/orchestration/apply_migration.py
\`\`\`

### Obsidian Sync Fails

\`\`\`bash
# Check Obsidian is running
# Check Local REST API plugin is enabled
# Check port 27123 is not blocked

# View failed syncs
sqlite3 .claude/orchestration/db/agents.db \
  "SELECT * FROM v_unsynced_docs WHERE sync_status = 'failed'"

# Retry failed syncs
/doc-sync --force
\`\`\`

### Hooks Not Executing

\`\`\`bash
# Make hooks executable
chmod +x .claude/hooks/*.sh

# Test hook manually
bash .claude/hooks/doc-logging.sh --file test.md --action created
\`\`\`

### Database Locked

\`\`\`bash
# Check for running processes
ps aux | grep sqlite3

# Close stale connections
python -c "import sqlite3; conn = sqlite3.connect('.claude/orchestration/db/agents.db'); conn.close()"
\`\`\`

## Performance Tips

1. **Use batch operations** - Sync multiple files at once
2. **Enable content hashing** - Avoid re-syncing unchanged files
3. **Run audits off-peak** - Scheduled audits during low-activity periods
4. **Clean up old logs** - Regularly archive logs older than 30 days

## Next Steps

- [Full Architecture Documentation](.claude/orchestration/DOCUMENTATION_LOGGING_ARCHITECTURE.md)
- [Command Reference](.claude/commands/)
- [Database Schema](.claude/orchestration/db/migration_documentation_log.sql)
- [Python API Documentation](.claude/orchestration/utils/)

## Examples

### Example 1: Agent Workflow with Documentation

\`\`\`python
from claude.orchestration.utils.activity_tracker import ActivityTracker
from claude.orchestration.utils.doc_logger import DocumentationLogger

tracker = ActivityTracker(agent_id="coder-001")
doc_logger = DocumentationLogger()

# Start task
with tracker.track_task("Implement authentication", "Building JWT authentication"):
    # Implement feature
    implement_auth()

    # Create documentation
    with open("docs/authentication.md", "w") as f:
        f.write("# Authentication\n\nJWT-based authentication system...")

    # Log documentation
    doc_logger.log_created(
        file_path="docs/authentication.md",
        agent_id="coder-001",
        summary="JWT authentication documentation",
        doc_type="guide"
    )

    # Log file operation
    tracker.log_file_operation(
        operation="create",
        file_path="lib/auth.ts",
        lines_changed=156
    )

# Task automatically logged as completed with duration
\`\`\`

### Example 2: Documentation Quality Monitoring

\`\`\`bash
# Generate weekly audit
/doc-audit --format json > audit-$(date +%Y-%m-%d).json

# Extract quality score
jq '.quality.average_quality_score' audit-*.json

# Find low-quality docs
sqlite3 .claude/orchestration/db/agents.db <<SQL
  SELECT doc_path, word_count
  FROM documentation_log
  WHERE word_count < 100
  AND doc_type IN ('readme', 'guide')
  ORDER BY word_count ASC;
SQL
\`\`\`

## Support

For issues or questions:
- GitHub: [Create an issue](https://github.com/your-org/Alpha-1.4/issues)
- Documentation: `.claude/orchestration/DOCUMENTATION_LOGGING_ARCHITECTURE.md`
- Database Schema: `.claude/orchestration/db/migration_documentation_log.sql`
