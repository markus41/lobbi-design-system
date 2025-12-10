# GitHub Copilot Custom Agents

This directory contains specialized GitHub Copilot custom agents for the Lobbi Design System workspace.

## Available Agents

### 🎨 Design System Agent (`design-system.agent.md`)
Expert in applying and managing the AI-powered design system with 255+ curated styles.

**Use for:**
- Applying design styles to components
- Blending multiple styles
- Working with design tokens
- Creating styled components
- Avoiding generic "AI slop" patterns

**Example prompts:**
- "Apply the art-deco style to this component"
- "Blend japandi with scandinavian aesthetics 80/20"
- "Show me the color palette for the cyberpunk style"

### ⚛️ React Agent (`react.agent.md`)
Expert React developer specializing in hooks, components, state management, and modern patterns.

**Use for:**
- Creating React components
- Implementing custom hooks
- State management with Context API
- Performance optimization
- Form handling with React Hook Form

**Example prompts:**
- "Create a custom hook for fetching styles"
- "Build a memoized component for the style grid"
- "Set up Context provider for favorite styles"

### 🧪 Testing Agent (`testing.agent.md`)
Expert in testing patterns including pytest, unittest, mocking, fixtures, and TDD.

**Use for:**
- Writing unit tests
- Creating test fixtures
- Mocking dependencies
- Test-driven development
- Coverage analysis

**Example prompts:**
- "Write tests for the style filter component"
- "Create fixtures for sample design styles"
- "Add tests with 80% coverage for this module"

### 🐛 Debugging Agent (`debugging.agent.md`)
Expert in debugging techniques for Python, JavaScript, distributed systems, and troubleshooting.

**Use for:**
- Troubleshooting errors
- Analyzing logs
- Performance debugging
- Container debugging
- Memory leak investigation

**Example prompts:**
- "Debug why the style preview isn't loading"
- "Analyze these error logs"
- "Help me find the performance bottleneck"

### 🔀 Git Workflows Agent (`git-workflows.agent.md`)
Expert in Git workflows including branching strategies, commits, merging, rebasing, and GitHub collaboration.

**Use for:**
- Git operations and best practices
- Commit message formatting
- Branch management
- Pull request workflows
- Conflict resolution

**Example prompts:**
- "Create a feature branch for the new export feature"
- "Help me write a proper commit message for these changes"
- "Resolve this merge conflict"

### 🐳 Docker Agent (`docker.agent.md`)
Expert in Docker container building, management, optimization, and multi-stage builds.

**Use for:**
- Writing Dockerfiles
- Container optimization
- Docker Compose configurations
- Multi-stage builds
- Container debugging

**Example prompts:**
- "Create a production Dockerfile for this static site"
- "Optimize this Docker image size"
- "Set up Docker Compose for local development"

### ⚡ Next.js Agent (`nextjs.agent.md`)
Expert in Next.js development including App Router, Server Components, API routes, SSR, and SSG.

**Use for:**
- Next.js App Router applications
- Server and Client Components
- API route handlers
- Data fetching patterns
- Performance optimization

**Example prompts:**
- "Convert this to a Next.js app with App Router"
- "Create an API route for style data"
- "Implement ISR for style pages"

### 📚 Documentation Agent (`documentation.agent.md`)
Expert in creating comprehensive, clear, and user-friendly documentation.

**Use for:**
- Writing README files
- API documentation
- User guides and tutorials
- Code comments
- Documentation structure

**Example prompts:**
- "Improve this README"
- "Document this API endpoint"
- "Create a getting started guide"

## How to Use

### In VS Code with GitHub Copilot

1. **Invoke an agent**: Type `@` in a chat conversation to see available agents
2. **Select agent**: Choose the relevant agent from the dropdown
3. **Ask your question**: The agent will respond with specialized knowledge

Example:
```
@design-system Apply the byzantine-luxury style to this button component
```

### In GitHub Copilot CLI

```bash
# Use agent in terminal
gh copilot suggest --agent design-system "Apply art deco style"
```

### Agent Selection Tips

- Use **design-system** for styling, design tokens, and visual design
- Use **react** for component development and state management
- Use **testing** when writing or debugging tests
- Use **debugging** when troubleshooting issues
- Use **git-workflows** for version control operations
- Use **docker** for containerization tasks
- Use **nextjs** for Next.js-specific development
- Use **documentation** for writing or improving docs

## Creating New Agents

To add a new custom agent:

1. Create a new `.agent.md` file in this directory
2. Add YAML frontmatter with agent metadata:
   ```yaml
   ---
   name: agent-name
   description: Brief description of agent expertise
   tools: ['read', 'search', 'edit', 'bash']
   ---
   ```
3. Write the agent's instructions, examples, and boundaries
4. Update this README to include the new agent

## Agent File Format

Each agent file follows this structure:

```markdown
---
name: agent-name
description: Expert in [domain]
tools: ['read', 'search', 'edit', 'bash']
---

# Agent Name

Brief introduction to the agent's role and expertise.

## Your Expertise

### Core Capabilities
List of main skills and areas of knowledge.

## [Domain-Specific Content]
Examples, patterns, best practices, commands, etc.

## Boundaries
What the agent should and shouldn't do.

## Quick Reference
Common commands, patterns, and tips.
```

## Best Practices

1. **Be Specific**: Choose the agent that best matches your task
2. **Provide Context**: Give the agent relevant information about your project
3. **Iterate**: If the response isn't quite right, refine your prompt
4. **Combine Agents**: Use different agents for different parts of a complex task
5. **Trust the Expert**: Agents are tuned for their domain - leverage their expertise

## Learn More

- [GitHub Copilot Custom Agents Documentation](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Creating Custom Agents](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-custom-agents)
- [Writing Great Agents](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)

---

**Note**: These agents are based on the Claude skills from `.claude/skills/` and have been adapted for GitHub Copilot's custom agent format.
