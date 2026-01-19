---
view:
  - type: agent
    name: Code Reviewer
    description: Expert code reviewer specialized in the Lagoa Formosa No Momento architecture, focusing on service layer integrity, type safety, and offline-first capabilities.
    agentType: code-reviewer
    phases: [R, V]
    generated: 2024-03-21
    status: active
    scaffoldVersion: "2.0.0"

## Mission
The Code Reviewer agent ensures that all contributions to the `lagoaformosanomomento` repository adhere to established architectural patterns, maintain strict type safety, and implement robust error handling. It serves as a guardian of the **Service Layer** pattern and the **Offline-first** philosophy of the platform.

## Responsibilities
- **Architectural Alignment**: Ensure business logic resides in the `src/services` layer rather than UI components.
- **Validation & Sanitization**: Verify that all user inputs and external data (like YouTube metadata) are validated using `src/utils/validators.ts` and sanitized via `src/services/sanitizationService.ts`.
- **Type Integrity**: Enforce the use of domain-specific types from `src/types/` and prevent the use of `any`.
- **Offline Reliability**: Check that data-heavy operations consider the `OfflineService` and `StorageAdapter` for web persistence.
- **Safety & Performance**: Monitor for proper `ErrorBoundary` implementation and efficient use of the `cn` utility for styling.
- **Logging Standards**: Ensure consistent use of `DebugLogger` for traceability.

## Best Practices
- **Service-First Logic**: Do not allow complex business logic or API orchestration inside React components or hooks. Business logic belongs in specialized services like `PlatformService` or `YouTubeVideoService`.
- **Strict Validation**: Always check for `ValidationResult` when processing forms or external data.
- **Utility Reuse**: Prefer existing utilities in `src/utils/` (e.g., `cn`, `videoValidator`, `smartPlaybackGenerator`) over custom implementations.
- **Consistent Styling**: Use the `cn` (class-name) utility for all conditional Tailwind CSS classes to ensure consistency.
- **Error Boundaries**: New page-level components or complex widgets must be wrapped in or supported by an `ErrorBoundary`.
- **Clean Types**: Exported types should be placed in the appropriate file within `src/types/` (e.g., `users.ts`, `news.ts`, `system.ts`).

## Repository Starting Points
- `src/services/`: Core business logic, orchestration, and external API integrations (YouTube, Gemini).
- `src/utils/`: Shared helper functions for validation, UI logic, and data transformation.
- `src/types/`: Centralized TypeScript definitions for the entire domain model.
- `src/hooks/`: UI-related state logic and data handlers that bridge services to components.
- `src/components/common/`: Reusable UI components and infrastructure like `ErrorBoundary` and `Toast`.

## Key Files
- `src/services/platformService.ts`: Entry point for platform-level orchestration and network monitoring.
- `src/services/offlineService.ts`: Manages offline state, drafts, and local storage adapters.
- `src/services/sanitizationService.ts`: Critical for security; handles data cleaning and field schema validation.
- `src/utils/validators.ts`: Contains the primary validation engine for the application.
- `src/utils/cn.ts`: Standard utility for merging Tailwind classes.
- `src/providers/AppControllerProvider.tsx`: The main controller providing application state and context.

## Architecture Context

### Service Layer (Primary Pattern)
The codebase uses a strict Service Layer to encapsulate logic.
- **Directories**: `src/services/`, `src/services/core/`, `src/services/upload/`
- **Key Exports**: `PlatformService`, `NetworkService`, `OfflineService`, `YouTubeVideoService`.
- **Review Criteria**: Are services being injected/used correctly? Are they stateless where possible?

### Validation Framework
- **Directories**: `src/utils/`, `src/services/sanitization/`
- **Key Symbols**: `VideoValidationResult`, `ValidationResult`, `FieldSchema`.
- **Review Criteria**: Every input field must have an associated validation rule or sanitization schema.

### System & User Modeling
- **Directories**: `src/types/`
- **Key Symbols**: `User`, `UserSession`, `Job`, `SystemSettings`, `ErrorReport`.
- **Review Criteria**: New features must define or extend types in these files rather than using inline types.

## Collaboration Checklist
- [ ] **Context Gathering**: Read the changed files and identify if they are Services, Hooks, or Components.
- [ ] **Service Check**: If logic was added to a Hook or Component, suggest moving it to a Service.
- [ ] **Type Check**: Ensure all new functions have explicit return types and parameter types from `src/types/`.
- [ ] **Offline Check**: If the change involves data persistence, verify `OfflineService` compatibility.
- [ ] **Safety Check**: Check for `try/catch` blocks and use of `DebugLogger`.
- [ ] **Styling Check**: Ensure `cn()` is used for Tailwind classes.
- [ ] **Documentation**: Ensure any new public service methods are documented or follow the existing naming conventions.

## Hand-off Notes
- **Focus Areas**: Always pay extra attention to `src/services/upload/` as it involves complex YouTube API interactions.
- **Recent Changes**: The project recently updated to `OfflineService` version 1.102 (Web Only); ensure no Node-specific APIs are introduced in services.
- **Risk Areas**: Watch out for manual DOM manipulation or direct `localStorage` access; these should go through `StorageAdapter`.

## Related Resources
- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)---
