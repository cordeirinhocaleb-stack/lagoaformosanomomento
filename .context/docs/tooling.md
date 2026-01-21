# Tooling & Productivity Guide

This guide provides a comprehensive overview of the tools, automation scripts, and environment configurations used in the **Lagoa Formosa No Momento** project. Adhering to these standards ensures development consistency and streamlines the path from local coding to production deployment.

## Prerequisites

Before starting development, ensure your environment meets the following requirements:

- **Node.js**: Version 18.x or higher (LTS recommended).
- **PNPM**: Version 8.x or higher. This project uses PNPM for strict dependency management and performance.
- **Supabase CLI**: Required for managing database migrations, Edge Functions, and local development.
- **Git**: Configured with `core.autocrlf = input` to avoid line-ending issues across different operating systems.

## Core Development Commands

Run these commands from the project root:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `pnpm build` | Compiles the TypeScript code and bundles assets for production. |
| `pnpm lint` | Runs ESLint to check for code quality and style violations. |
| `pnpm type-check` | Runs the TypeScript compiler (`tsc`) in no-emit mode to validate types. |
| `pnpm format` | Formats all source files using Prettier. |

## Automation & Maintenance Scripts

The repository includes a suite of specialized scripts located in the root and `src/scripts/` to handle infrastructure tasks and code maintenance.

### Database & Backend Utilities
- `scripts/verify_supabase.js`: Tests the connection to the Supabase instance and validates API keys.
- `scripts/seed_test_news.js`: Populates the database with mock news data for UI testing.
- `scripts/debug_content.js`: Inspects the JSON structure of content stored in the database.

### Code Quality & Refactoring
- `src/scripts/fix_any_types.cjs`: Scans for implicit `any` types and attempts to replace them with specific interfaces or types.
- `src/scripts/clean_console_logs.cjs`: Removes `console.log` statements before production builds.
- `src/scripts/rename_components.js`: A utility for bulk renaming and updating imports across the project.
- `src/scripts/audit_admin.js`: Audits administrative components for permission compliance.

### Deployment & Infrastructure
- `deploy_v2.js`: The primary script for deploying the web application.
- `inspect_ftp.js`: Lists and validates files on the remote FTP server.
- `cleanup_ftp.js`: Safely removes legacy or unused assets from the production server.

## IDE Configuration (VS Code)

While any editor is supported, **Visual Studio Code** is the recommended environment. The project includes a `.vscode` directory with optimized settings.

### Recommended Extensions
1. **ESLint**: Real-time linting feedback.
2. **Prettier - Code formatter**: Automatic code formatting on save.
3. **Tailwind CSS IntelliSense**: Autocomplete for utility classes.
4. **Console Ninja**: High-speed console output visualization inside the editor.
5. **Vitest**: Integration for running unit and integration tests.

### Project Settings
The repository is pre-configured to:
- Enable **Format on Save**.
- Automatically run **ESLint fix** on save.
- Use the workspace version of TypeScript.

## Key Developer Services

The codebase provides internal services to assist with debugging and platform-specific features.

### Structured Logging (`DebugLogger`)
Located in `services/core/debugLogger.ts`, this class allows for categorized logging. Unlike standard `console.log`, these logs can be filtered or disabled globally via environment variables.

```typescript
import { debugLogger } from '@/services/core/debugLogger';

debugLogger.log('Auth', 'User logged in successfully', { userId: 123 });
```

### Offline Capability (`OfflineService`)
The `OfflineService` (found in `services/offlineService.ts`) manages data persistence for the web when connectivity is lost. It is primarily used for the **News Editor** to save rascunhos (drafts) in `IndexedDB` or `localStorage` via the `StorageAdapter`.

### Platform Detection (`PlatformService`)
Provides unified access to environment properties, helping the application distinguish between development, staging, and production behaviors, as well as detecting network status via `NetworkService`.

## Productivity Workflows

### Database Inspection
Instead of using a heavy GUI, use the `inspect-db.mjs` tool for quick terminal-based queries against the local or remote Supabase instance. This is particularly useful for verifying **Advertiser** plan configurations or **Audit Logs**.

### Component Generation
When creating new modules, refer to the `src/components/admin/advertisers/popupBuilder` patterns. It uses a "Generator" architecture that separates the logic hooks from the UI components, ensuring high reusability.

### Error Monitoring
Wrap complex UI segments in the `ErrorBoundary` component (found in `components/common/ErrorBoundary.tsx`) to prevent application crashes and generate `ErrorReport` logs that are visible to administrators.
