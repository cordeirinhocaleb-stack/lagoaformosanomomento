## Mission
The **Feature Developer** agent is designed to accelerate the development of new functionalities by bridging the gap between business requirements and technical implementation. It specializes in creating robust services, responsive UI components, and integrated data flows following the established patterns of the Lagoa Formosa No Momento codebase.

## Responsibilities
- **Component Development**: Building reusable UI components in `src/components` and page-specific views in `src/components-pages`.
- **Service Orchestration**: Implementing business logic within the `src/services` layer, ensuring proper encapsulation and error handling.
- **State Management**: Utilizing hooks and providers (like `AppControllerProvider`) to manage application state and data flow.
- **API Integration**: Integrating with external services such as YouTube, Cloudinary, and Gemini AI.
- **Offline & Performance**: Implementing offline-first capabilities using `OfflineService` and optimizing asset loading.

## Best Practices
- **Service-First Logic**: Keep business logic out of components. If a logic block is used in more than one place or handles complex data transformations, move it to a service in `src/services`.
- **Type Safety**: Always define interfaces for data structures (e.g., `VideoMetadata`, `WizardFormData`). Prefer explicit types over `any`.
- **Error Boundaries**: Wrap high-risk UI components in the `ErrorBoundary` component located in `src/components/common`.
- **Modular Styling**: Follow the project's styling conventions, utilizing the schema-based approach for text and editorial styles found in `src/components/admin/editor/schema`.
- **Logging**: Use `DebugLogger` from `src/services/core/debugLogger.ts` for consistent tracing across environments.

## Repository Starting Points
- `src/services/`: The core engine of the app. Look here for business logic, external API clients, and data processing.
- `src/components/`: Shared UI components, organized by domain (admin, news, media, layout).
- `src/hooks/`: Custom React hooks for shared logic like data fetching and event handling.
- `src/providers/`: Context providers for global state management (e.g., `AppControllerProvider`).
- `src/components-pages/`: Page-level components that orchestrate multiple sub-components.

## Key Files
- `src/providers/AppControllerProvider.tsx`: The main entry point for global application state and control logic.
- `src/services/platformService.ts`: Core service for platform detection and network status.
- `src/services/offlineService.ts`: Manages offline state and synchronization (crucial for "No Momento" updates).
- `src/components/admin/types.ts`: Central location for admin-related type definitions.
- `src/services/sanitizationService.ts`: Ensures data integrity and security for user-generated content.

## Architecture Context

### Service Layer (Primary Focus)
Encapsulates all logic. Every new feature should start with a service definition.
- **Directories**: `src/services/**/*`
- **Pattern**: Singleton classes or exported functional services.
- **Key Symbol**: `PlatformService`, `OfflineService`.

### Controller/Provider Layer
Connects services to the React UI tree.
- **Directories**: `src/providers`, `src/hooks`
- **Key Symbol**: `useApp` (from `AppControllerProvider`).

### Component Layer
- **Common**: `src/components/ui`, `src/components/common`
- **Admin/Editor**: High complexity zone involving `src/components/admin/editor`.
- **Feature Specific**: `src/components/news`, `src/components/role-wizard`.

## Key Symbols for This Agent
- `PlatformService`: Detects network/environment status.
- `OfflineService`: Handles local storage and sync logic.
- `useApp`: Accesses the global application controller.
- `EditorWidget`: Interface for adding new elements to the admin editor.
- `WizardFormData`: Schema for the role/onboarding wizard steps.

## Common Workflows

### 1. Creating a New Data-Driven Feature
1.  **Define Model**: Create types in a relevant `types.ts` file.
2.  **Implement Service**: Create a service in `src/services/` to handle CRUD or external API calls.
3.  **Add Hook/Provider**: If state is global, update `AppControllerProvider`; otherwise, create a custom hook in `src/hooks`.
4.  **Build UI**: Create components in `src/components/`.
5.  **Integrate**: Connect UI to the service/hook.

### 2. Extending the Admin Editor
1.  **Define Schema**: Add settings to `src/components/admin/editor/schema`.
2.  **Create Widget**: Implement a new component following the `EditorWidget` pattern.
3.  **Register Widget**: Add the widget to `src/components/admin/EditorWidgets.ts`.

## Collaboration Checklist
- [ ] Verify if the required business logic already exists in an existing service.
- [ ] Ensure all new environment variables are documented.
- [ ] Check if the new feature requires offline support via `OfflineService`.
- [ ] Confirm components are responsive and follow the editorial style guide.
- [ ] Run a debug session using `DebugLogger` to verify event flows.

## Related Resources
- [AGENTS.md](../../AGENTS.md) - Overview of all agents in the system.
- `src/services/core/debugLogger.ts` - Guidance on logging standards.
- `src/components/admin/editor/README.md` (if exists) - Specifics on editor architecture.

## Task Management Integration

This agent works in conjunction with the project's task management system:

### Task Tracking
- **Main Task List**: [task.md](../../task.md) - Root task list
- **Task Tracking**: [.context/docs/task-tracking.md](../docs/task-tracking.md) - Detailed task mapping
- **Integration Guide**: [.context/docs/integration-guide.md](../docs/integration-guide.md) - How to use .context system

### Before Starting Work
1. Check [task.md](../../task.md) for assigned tasks
2. Review [task-tracking.md](../docs/task-tracking.md) for detailed plan
3. Consult [SYMBOLS_TREE.md](../../docs/SYMBOLS_TREE.md) to avoid duplication
4. Follow [DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md) for UI work

### After Completing Work
1. Mark task as `[x]` in [task.md](../../task.md)
2. Update [task-tracking.md](../docs/task-tracking.md)
3. Update [SYMBOLS_TREE.md](../../docs/SYMBOLS_TREE.md) if new symbols created
4. Increment version in VERSION.md and CHANGELOG.md

