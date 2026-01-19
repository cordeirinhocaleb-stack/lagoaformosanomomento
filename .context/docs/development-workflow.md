# Development Workflow

This document outlines the standard engineering processes for contributing to the Lagoa Formosa No Momento repository. Our workflow is designed to maintain high code quality, ensure platform stability, and facilitate seamless collaboration between human developers and AI agents.

The engineering process generally follows a cycle of task identification, local feature development, rigorous testing, and peer review before merging into the primary codebase.

### Core Principles
- **Type Safety First**: All new features must be fully typed. Avoid using `any` and leverage the existing definitions in `src/types`.
- **Component Driven**: Build UI in isolation using the existing component hierarchy in `src/components`.
- **Logic Separation**: Keep business logic in `src/hooks` and infrastructure logic (API calls, storage) in `src/services`.
- **Clean Code**: Use the provided utility scripts (like `clean_console_logs.cjs`) to ensure production code is free of debugging artifacts.

---

## Branching & Releases

We follow a feature-branch workflow. This keeps the main lines of development stable while allowing for rapid iteration on new capabilities.

- **Main Branch (`main`)**: Represents the production-ready state. Code is only merged here after passing all staging tests.
- **Staging Branch (`develop` or `staging`)**: Used for integration testing and pre-production previews.
- **Feature Branches**: Created for every new feature or bug fix.
    - Naming convention: `feature/[task-name]`, `fix/[issue-id]`, or `refactor/[module]`.
- **Tagging**: Releases are tagged using Semantic Versioning (e.g., `v1.2.0`). Significant UI updates or database schema changes should trigger a minor version bump.
- **Merge Strategy**: We prefer "Squash and Merge" for feature branches to keep the git history clean and readable.

---

## Local Development

Follow these steps to set up and run the environment on your local machine. Ensure you have Node.js (LTS) installed.

### Setup and Installation
- Install dependencies: `npm install`
- Configure Environment: Copy `.env.example` to `.env` and populate with your Supabase and Cloudinary credentials.

### Development Commands
- **Start Development Server**: `npm run dev` (Starts the Vite development server with Hot Module Replacement).
- **Build for Production**: `npm run build` (Compiles and minifies assets for distribution).
- **Preview Production Build**: `npm run preview` (Locally serve the built application).
- **Linting**: `npm run lint` (Check for code style and syntax issues).

### Utility Scripts
The repository includes several specialized scripts for maintenance:
- **Verify Database**: `node src/scripts/verify_supabase.js`
- **Clean Logs**: `node src/scripts/clean_console_logs.cjs`
- **Seed News**: `node src/scripts/seed_test_news.js`

---

## Code Review Expectations

All Pull Requests (PRs) must undergo a review process. This ensures consistency across the architecture—from `src/services` to the UI layer.

### Review Checklist
1. **Functionality**: Does the code perform the intended task without side effects?
2. **Type Coverage**: Are all new interfaces and types defined in `src/types` or local to the component?
3. **Performance**: Are expensive hooks (like `useAppController`) used efficiently without causing unnecessary re-renders?
4. **Style**: Does the code follow the Tailwind CSS patterns used throughout the project? Use the `cn` utility for conditional classes.
5. **Logs**: Ensure no `console.log` statements remain in production-level code.

### Agent Collaboration
When working with AI agents, please refer to `AGENTS.md`. Always verify agent-generated code against the existing [Tooling Strategy](./tooling.md) to ensure it uses the project's specific architectural patterns (e.g., using `PlatformService` for network calls).

---

## Onboarding Tasks

If you are new to the project, complete these tasks to familiarize yourself with the codebase:

1. **Environment Verification**: Run the `verify_supabase.js` script to ensure your local connection to the backend is stable.
2. **Explore Schema**: Review `src/components/admin/editor/schema` to understand how the editorial content is structured.
3. **First Issue**: Look for tickets labeled `good-first-issue` in the repository manager. These typically involve UI adjustments in `src/components/ui` or adding new utility types.
4. **Local Audit**: Run `node src/scripts/audit_rules.js` to see the current state of architectural compliance.

## Related Resources

- [Testing Strategy](./testing-strategy.md): Detailed guide on unit and integration testing.
- [Tooling Guide](./tooling.md): Overview of the build tools, IDE extensions, and CLI utilities used.
