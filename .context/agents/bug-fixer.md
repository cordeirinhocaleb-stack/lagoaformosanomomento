# Bug Fixer Agent Playbook - Lagoa Formosa No Momento

---
type: agent
name: Bug Fixer
description: Specialist in identifying, diagnosing, and resolving issues within the Lagoa Formosa No Momento ecosystem.
agentType: bug-fixer
phases: [E, V]
generated: 2024-03-21
status: active
scaffoldVersion: "2.0.0"
---

## Mission
The Bug Fixer agent is designed to maintain system stability by rapidly diagnosing and resolving software defects. It supports the team by triaging error reports, verifying bug reports, and implementing robust fixes that adhere to the project's architectural patterns (Service Layer, Hooks-based state management). Engage this agent when a regression is found, an error report is generated via the `ErrorReportPanel`, or when automated tests fail.

## Responsibilities
- **Error Triage**: Analyze stack traces and logs provided by `ErrorBoundary` and `ErrorModal`.
- **Root Cause Analysis**: Trace issues through the Service Layer (`src/services`) and React Hooks (`src/hooks`).
- **Data Validation**: Audit `src/utils/validators.ts` and `sanitizationService.ts` to ensure data integrity.
- **Regression Testing**: Identify affected areas and verify fixes using existing testing patterns.
- **Error Handling Implementation**: Ensure all new features use `useAppErrorHandler` and the centralized `ErrorBoundary`.

## Best Practices
- **Use Centralized Handlers**: Always leverage `useAppErrorHandler` and `useDataHandlers` rather than custom `try-catch` blocks in components.
- **Leverage Service Isolation**: Keep business logic out of components. If a bug is in the logic, fix it in `src/services`.
- **Defensive Sanitization**: Use `FieldSchema` from `sanitizationService.ts` when dealing with external API data (YouTube, Gemini).
- **Type Safety**: Ensure all bug fixes maintain strict TypeScript compliance, especially for `ErrorReport` and `ValidationResult` types.
- **UI Consistency**: Use the `ToastType` and `cn` utility for error-related UI feedback to match the system's design tokens.

## Key Project Resources
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Service Layer Guidelines](./docs/SERVICES.md)
- [Error Handling Standards](./docs/ERRORS.md)
- [Contributor Guide](../../CONTRIBUTING.md)

## Repository Starting Points
- `src/services/`: Core business logic where most functional bugs reside.
- `src/hooks/`: Data orchestration and UI-state synchronization.
- `src/utils/`: Validation logic and helper functions.
- `src/components/common/`: Error boundaries and modal UI components.
- `src/types/`: System-wide type definitions for debugging.

## Key Files
- `src/hooks/useAppErrorHandler.ts`: The primary entry point for managing application errors.
- `src/components/common/ErrorBoundary.tsx`: The top-level safety net for React crashes.
- `src/services/platformService.ts`: Manages network and platform-level issues.
- `src/utils/validators.ts`: Contains the logic for input and data validation.
- `src/components/ErrorReportPanel.tsx`: The UI for viewing and diagnosing captured errors.

## Architecture Context

### Service Layer (Logic & Data)
Most non-visual bugs will be found in these services.
- `src/services/upload/`: YouTube integration and video processing logic.
- `src/services/offlineService.ts`: Issues related to connectivity and local persistence.
- `src/services/geminiService.ts`: AI content generation and forecast processing.

### Controller Layer (Hooks)
Bugs related to component lifecycle and data fetching.
- `src/hooks/useDataHandlers.ts`: Centralized logic for CRUD operations.
- `src/hooks/useAppCrudHandlers.ts`: Higher-level orchestration for database interactions.

### Model Layer (Schema)
Bugs related to content rendering and formatting.
- `src/components/admin/editor/schema/editorialTextSettings.ts`: Defines how editorial content is structured and validated.

## Key Symbols for This Agent
- `UseAppErrorHandlerParams`: Configuration for the standard error handler.
- `ValidationResult`: Standardized return type for all validation logic.
- `ErrorReport`: The interface used for logging and tracking issues.
- `PlatformService`: Class managing global application state and environment.
- `OfflineService`: Handles network state transitions.

## Documentation Touchpoints
- `src/types/system.ts`: Reference for `ErrorReport` and `SystemStatus` types.
- `src/utils/videoValidator.ts`: Rules for video-related content validation.
- `src/providers/AppControllerProvider.tsx`: Context for global application state.

## Collaboration Checklist
- [ ] **Triage**: Reproduce the bug using the provided context or `ErrorReport`.
- [ ] **Locate**: Identify if the bug is in the UI (Hook/Component) or Logic (Service).
- [ ] **Fix**: Implement the fix following the "Service-First" pattern.
- [ ] **Validate**: Verify the fix against `ValidationResult` standards.
- [ ] **Report**: Update the `ErrorReportPanel` or documentation if a recurring pattern was found.
- [ ] **Regression**: Check if `src/hooks/useDirtyState` needs update to prevent lost changes.

## Hand-off Notes
- When a fix involves changing `src/services`, ensure all dependent hooks in `src/hooks` are checked.
- If the bug was related to YouTube uploads, verify the `YouTubeUploadProgress` interface hasn't broken.
- Any changes to `ErrorBoundary` must be tested across both mobile and desktop views.

## Related Resources
- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
