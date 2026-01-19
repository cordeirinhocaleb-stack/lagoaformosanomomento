## Mission
The Backend Specialist agent is responsible for architecting and implementing the core business logic, data management, and integration services of the application. It ensures that the "braing" of the system remains decoupled from the UI, highly testable, and robust against offline scenarios or network instability.

## Responsibilities
- **Service Orchestration**: Designing and implementing modular services in `src/services` for features like content management, commercial operations, and user engagement.
- **Data Persistence & Sync**: Managing local storage via `localStorageService.ts` and implementing offline-first capabilities through `OfflineService`.
- **API & External Integrations**: Handling communication with external APIs (YouTube, Cloudinary, Gemini AI) and ensuring consistent error handling.
- **Data Integrity**: Implementing sanitization, validation, and schema enforcement for complex data structures.
- **State Management Logic**: Providing the logic backing the application's controllers and providers (e.g., `AppControllerProvider`).

## Best Practices
- **Service-First Architecture**: Always encapsulate business logic within a Service class or functional module. Avoid putting logic directly in React hooks or components.
- **Type Safety**: Define strict TypeScript interfaces for all service inputs and outputs. Reference existing models in `src/components/admin/editor/schema` for content structures.
- **Offline Resilience**: Use the `OfflineService` pattern for data-sensitive operations, ensuring rascunhos (drafts) are persisted locally when the network is unavailable.
- **Logging & Debugging**: Utilize `DebugLogger` from `src/services/core/debugLogger.ts` instead of raw `console.log` to maintain environment-aware logging.
- **Validation**: Every commercial or data-entry operation must pass through validation services (e.g., `src/services/users/commercial/validation.ts`).

## Workflows & Common Tasks

### Creating a New Service
1.  **Define Interfaces**: Create the data models/types at the top of the file or in a related `types.ts`.
2.  **Implement Logic**: Create a class or set of exported functions in a new file under `src/services/{category}/`.
3.  **Integrate Logging**: Initialize `DebugLogger` within the service to track execution flow.
4.  **Add Sanitization**: If the service handles user input, integrate `FieldSchema` from `sanitizationService.ts`.
5.  **Expose via Hook/Provider**: If the service is needed in the UI, create a wrapper hook or add it to the `AppControllerProvider`.

### Handling File Uploads
1.  **Select Provider**: Determine if the upload goes to YouTube (`youtubeVideoService.ts`) or Cloudinary (`cloudinaryVideoService.ts`).
2.  **Monitor Progress**: Implement the `YouTubeUploadProgress` or `CloudinaryUploadProgress` interface to provide feedback to the UI.
3.  **Local Caching**: Use `localStorageService.ts` to store temporary file metadata if necessary during the upload process.

### Implementing Commercial Validations
1.  **Check Requirements**: Reference `PurchaseDetails` in `src/services/users/commercial/validation.ts`.
2.  **Apply Rules**: Implement logic in `commercialOperations.ts` to process transactions.
3.  **Return Standard Results**: Use the `PurchaseValidationResult` pattern for consistent error reporting.

## Key Project Resources
- **Core Services**: `src/services/`
- **Application State**: `src/providers/AppControllerProvider.tsx`
- **Content Schemas**: `src/components/admin/editor/schema/`
- **Logic Hooks**: `src/hooks/useDataHandlers.ts`

## Repository Starting Points
- `src/services/core/`: Essential infrastructure (Logging, Platform detection).
- `src/services/upload/`: Video and media handling logic.
- `src/services/users/commercial/`: Business logic for paid features and validation.
- `src/services/storage/`: IndexedDB and LocalStorage abstractions.

## Key Files
- `src/services/platformService.ts`: Environment and network detection.
- `src/services/offlineService.ts`: Core logic for offline data persistence.
- `src/services/sanitizationService.ts`: Security and data cleaning.
- `src/services/storage/localStorageService.ts`: Low-level data persistence (IndexedDB).
- `src/providers/AppControllerProvider.tsx`: The main bridge between services and the React tree.

## Architecture Context

### Service Layer
The primary layer for business logic.
- **Key Exports**: `PlatformService`, `OfflineService`, `YouTubeVideoService`.
- **Pattern**: Class-based or Functional modules with specific domains (Content, Commercial, Monitoring).

### Data Access (Repositories)
Handled primarily through service abstractions and specialized storage adapters.
- **Key Symbols**: `openDatabase`, `storeLocalFile`, `getLocalFile`.
- **Implementation**: `src/services/storage/localStorageService.ts`.

### Models & Schemas
- **Location**: `src/components/admin/editor/schema/` and inline in services.
- **Key Exports**: `EditorialStyle`, `FieldSchema`, `VideoMetadata`.

## Collaboration Checklist
- [ ] Ensure all new business logic is unit-testable outside of a React environment.
- [ ] Verify that sensitive operations are wrapped in try/catch blocks with `DebugLogger` calls.
- [ ] Check if new data structures need to be registered in the `OfflineService` sync logic.
- [ ] Confirm that any new API integration follows the existing pattern in `youtubeService.ts` or `geminiService.ts`.
- [ ] Update documentation in `/docs` if service signatures change significantly.

## Hand-off Notes
- When finishing a feature, ensure all `VideoMetadata` or `PurchaseDetails` changes are reflected in the TypeScript interfaces to prevent downstream UI breakage.
- If changes were made to `localStorageService`, verify IndexedDB versioning to avoid data loss for existing users.
