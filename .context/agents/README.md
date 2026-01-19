# Feature Developer Playbook - Lagoa Formosa No Momento

This playbook provides a structured guide for AI agents and developers implementing new features in the Lagoa Formosa No Momento repository.

## 1. Role Overview
The **Feature Developer** is responsible for end-to-end implementation of new capabilities, from data modeling and business logic (Services) to state management (Hooks/Controllers) and UI implementation (Components).

## 2. Core Focus Areas

### Business Logic & Orchestration
- **`src/services/`**: The primary location for all domain logic. Before writing UI code, ensure the underlying service exists.
- **Key Services**:
    - `PlatformService`: Device and network environment abstraction.
    - `OfflineService`: Local storage and draft management (crucial for "Web Only" versioning).
    - `SanitizationService`: Input validation using `FieldSchema`.
    - `EngagementService`: User interactions and stats.

### UI & Presentation
- **`src/components/`**: Modular components.
- **`src/components-pages/`**: Page-specific layouts (e.g., `news-detail`, `Admin`).
- **`src/components/admin/editor/`**: Specialized area for content creation tools and widgets.

### State & Controllers
- **`src/hooks/`**: Reusable logic for data fetching and state.
- **`src/providers/`**: Global application state (e.g., `AppControllerProvider`).

## 3. Implementation Workflow

### Step 1: Data Modeling
Define or update schemas before implementing logic.
- **Files**: `src/components/admin/editor/schema/` or relevant `types.ts` in the feature directory.
- **Action**: Identify if the feature requires new persistent data or ephemeral state.

### Step 2: Service Layer Implementation
Encapsulate business logic to keep components "dumb" and testable.
- **Action**: Create/Update a service in `src/services/`.
- **Pattern**: Follow the class-based or functional singleton pattern seen in `PlatformService`.
- **Integration**: Use `DebugLogger` for tracing and `SanitizationService` for data integrity.

### Step 3: Controller/Hook Creation
Bridge the service layer with the React UI.
- **Files**: `src/hooks/use[FeatureName].ts`.
- **Action**: Use `useDataHandlers` (from `src/hooks/useDataHandlers.ts`) if the feature involves standard CRUD or data fetching.

### Step 4: UI Development
- **Standard Components**: Use `src/components/ui/` for basic atoms.
- **Admin/Editor**: If building editor tools, register new widgets in `src/components/admin/EditorWidgets.ts` and use `WidgetStyle` presets.
- **Error Handling**: Wrap new UI sections in the `ErrorBoundary` component from `src/components/common/ErrorBoundary.tsx`.

## 4. Codebase Patterns & Best Practices

### The Service Pattern
Always separate side effects (API calls, localStorage, external APIs like Gemini/YouTube) from UI components.
```typescript
// Good: Service handles the logic
export const MyNewService = {
  async processData(data: Input): Promise<Output> {
    const sanitized = SanitizationService.sanitize(data, schema);
    // ... logic
  }
}
```

### Offline-First Mentality
Given the existence of `OfflineService` and `StorageAdapter`, features should gracefully handle offline states.
- Use `NetworkService` to check connectivity.
- Use `localStorageService` for persistence of drafts or user preferences.

### Media Handling
- For video features, utilize `youtubeVideoService.ts` or `cloudinaryVideoService.ts` rather than implementing raw upload logic.
- Always handle `YouTubeUploadProgress` for a better user experience.

### Admin Editor Extensibility
The editor is schema-driven. When adding new content types:
1. Define the style in `editorialTextSettings.ts`.
2. Create a renderer in `src/components/admin/editor/blocks/textblock/render/`.
3. Add an inspector panel in `src/components/admin/editor/blocks/textblock/inspector/`.

## 5. Key Files for Reference

| File | Purpose |
| :--- | :--- |
| `src/services/platformService.ts` | Global environment and network status. |
| `src/providers/AppControllerProvider.tsx` | Main application controller and entry point. |
| `src/components/admin/types.ts` | Shared types for the administrative dashboard. |
| `src/services/core/debugLogger.ts` | Standardized logging for feature debugging. |
| `src/components/role-wizard/types.ts` | Schema for the user onboarding/role selection flow. |

## 6. Feature Completion Checklist
- [ ] Business logic implemented in a dedicated Service.
- [ ] Data validation handled via `SanitizationService`.
- [ ] UI components are responsive and use existing design system tokens.
- [ ] Error boundaries implemented for high-risk UI sections.
- [ ] Offline behavior considered (drafts saved/network status checked).
- [ ] Debug logs added using `DebugLogger`.
- [ ] Types exported and documented in relevant `types.ts` files.
