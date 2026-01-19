# Tooling & Productivity Guide

This guide outlines the scripts, automation tools, and editor configurations used in the Lagoa Formosa No Momento codebase. Following these conventions ensures consistency across the project and maximizes developer efficiency when building features or managing infrastructure.

## Required Tooling

To contribute to this repository, you must have the following tools installed and configured:

- **Node.js (v18.x or higher):** The primary runtime for the frontend and build scripts.
- **PNPM (v8.x or higher):** Used for package management. It is preferred over npm or yarn for its efficiency and strict dependency handling.
- **Vite:** Powers the development server and build pipeline.
- **Supabase CLI:** Required for local database development, migrations, and edge function testing.
- **Git:** Version control, with a recommended configuration for handling line endings (`core.autocrlf = input`).
- **PostgreSQL Client (Optional):** Helpful for running the inspection scripts found in `src/scripts/inspect-db.mjs`.

## Recommended Automation

The codebase includes several utility scripts and automation hooks to streamline repetitive tasks.

### Utility Scripts
These scripts are located in the root and `src/scripts` directories and can be executed via `node` or `npm run`:

| Script | Purpose |
| :--- | :--- |
| `src/scripts/verify_supabase.js` | Validates connection to the Supabase backend. |
| `src/scripts/audit_rules.js` | Runs a check against system audit rules and permissions. |
| `src/scripts/clean_console_logs.cjs` | Scans and removes `console.log` statements from production-ready code. |
| `src/scripts/fix_any_types.cjs` | Analyzes the codebase for implicit `any` types and suggests/applies fixes. |
| `deploy_v2.js` | Main deployment script for the web platform. |
| `cleanup_ftp.js` | Utility to clean up remote production assets. |

### Development Commands
- **Linting:** Use `pnpm lint` to check for code style issues.
- **Formatting:** Code is formatted using Prettier. Run `pnpm format` to fix style issues automatically.
- **Type Checking:** Run `pnpm type-check` to validate TypeScript types across the entire project without emitting files.
- **Watch Mode:** `pnpm dev` starts the Vite development server with Hot Module Replacement (HMR) enabled for rapid UI iteration.

## IDE / Editor Setup

We officially support **VS Code**, though any editor supporting LSP (Language Server Protocol) will work.

### Recommended Extensions
- **ESLint & Prettier:** Essential for real-time feedback on code quality and formatting.
- **Tailwind CSS IntelliSense:** Provides autocomplete and linting for the utility classes used in the project.
- **Console Ninja:** (Recommended) Displays `console.log` output and errors directly in your editor next to your code.
- **Vitest:** Extension to run and debug tests directly from the sidebar.

### Workspace Settings
The `.vscode/settings.json` file in the repository (if present) is configured to:
- Enable `editor.formatOnSave`.
- Set Prettier as the default formatter.
- Configure `editor.codeActionsOnSave` to run ESLint fixes.

### Code Snippets
Commonly used patterns for creating new admin components or hooks are being integrated into the project. Use the `rfce` snippet for React Functional Components and look for custom snippets in the `.vscode` folder for project-specific patterns like `useAppController` implementation.

## Productivity Tips

### Terminal Aliases
To speed up common workflows, consider adding these aliases to your `.zshrc` or `.bashrc`:
```bash
alias lfm-dev="pnpm dev"
alias lfm-verify="node src/scripts/verify_supabase.js"
alias lfm-clean="node src/scripts/clean_console_logs.cjs"
```

### Local Debugging
- **DebugLogger:** Utilize the `DebugLogger` class found in `src/services/core/debugLogger.ts` for structured logging that can be toggled via environment variables without polluting the production console.
- **Offline Mode Testing:** Use the `OfflineService` in `src/services/offlineService.ts` to simulate low-connectivity environments, particularly useful when working on the news editor rascunhos (drafts).
- **Network Inspection:** The `debug_remote.js` script allows for remote debugging of production issues by proxying traffic or logs where applicable.

### Database Inspection
When working with complex data relations (Advertisers, News, Users), use the `inspect_ftp.js` and `inspect-db.mjs` tools to quickly verify the state of the remote or local database without opening a full GUI client.

## Related Resources
- [Development Workflow](./development-workflow.md) - Learn how to use these tools within our branching and deployment strategy.
