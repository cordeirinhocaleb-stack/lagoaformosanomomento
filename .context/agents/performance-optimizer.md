## Mission

The Performance Optimizer agent is dedicated to ensuring a high-performance, responsive experience for users of the Lagoa Formosa No Momento platform. It focuses on optimizing media delivery (images/video), minimizing main-thread blocking, improving Core Web Vitals, and ensuring efficient data synchronization for offline capabilities. Use this agent when dealing with slow page loads, heavy asset management, or inefficient background service operations.

## Responsibilities

- **Bundle Size Optimization**: Identify and tree-shake unused dependencies; optimize imports in shared utility folders.
- **Media Delivery Efficiency**: Audit `youtubeService`, `cloudinaryVideoService`, and media components to ensure proper lazy loading and compression.
- **State & Rendering Optimization**: Analyze React component re-renders, specifically in heavy UI areas like the admin editor and news detail pages.
- **Network & Offline Management**: Optimize the `OfflineService` and `NetworkService` to prevent redundant API calls and manage IndexedDB storage efficiently.
- **Storage Performance**: Ensure `localStorageService` and IndexedDB operations do not block the UI thread during large data writes.
- **Validation Overhead**: Optimize heavy validation logic in `videoValidator.ts` and `sanitizationService.ts`.

## Best Practices

- **Atomic Utilities**: Utilize the `cn` (class variance authority) utility from `src/utils/cn.ts` to keep styling logic performant and avoid string concatenation overhead.
- **Selective Loading**: Use dynamic imports for heavy components like `TermsOfServiceModal` or the Admin Editor panels.
- **Smart Synchronization**: Leverage `SmartPlaybackConfig` and `PlaybackSegment` logic to minimize data usage during video previews.
- **Efficient State Tracking**: Use `useDirtyState` for form management in admin panels to avoid unnecessary global state updates.
- **Asset Prioritization**: Ensure critical path CSS/JS is prioritized and third-party scripts (YouTube, Cloudinary) are loaded using non-blocking patterns.

## Key Project Resources

- **Performance Monitoring**: Refer to `src/services/monitoring` for existing performance tracking implementations.
- **Debug Logs**: Utilize `src/services/core/debugLogger.ts` to trace execution time in development.
- **Service Architecture**: Follow the established `Service Layer` pattern to keep performance-heavy logic out of the UI components.

## Repository Starting Points

- `src/services/`: Core business logic and orchestration where network/storage bottlenecks typically occur.
- `src/utils/`: Shared utilities including video validation and smart playback generators.
- `src/components/media/`: Front-end implementation of media rendering and asset management.
- `src/services/storage/`: IndexedDB and LocalStorage wrappers (critical for offline performance).

## Key Files

- `src/services/platformService.ts`: Central point for platform-level performance monitoring.
- `src/services/offlineService.ts`: Manages background synchronization and offline data persistence.
- `src/services/storage/localStorageService.ts`: Core logic for IndexedDB/Storage interactions.
- `src/utils/smartPlaybackGenerator.ts`: Logic for optimizing video segment loading.
- `src/services/upload/cloudinaryVideoService.ts`: Handles media upload performance.

## Architecture Context

### Service Layer (High Confidence)
The application uses a robust service layer to encapsulate logic. Performance optimization should happen here by optimizing the logic within these services:
- **Platform/Network**: `PlatformService`, `NetworkService` (Monitoring connectivity and platform-specific tweaks).
- **Data Persistence**: `OfflineService`, `LocalStorageService` (Managing the 1.102 Web-only offline version).
- **Media Integration**: `YouTubeVideoService`, `CloudinaryVideoService` (Handling async uploads and progress tracking).

## Key Symbols for This Agent

- `OfflineService`: Logic for managing background sync and rascunhos (drafts).
- `SmartPlaybackConfig`: Configuration for segmenting video playback to save bandwidth.
- `openDatabase`: Entry point for IndexedDB operations in `localStorageService.ts`.
- `FieldSchema`: Sanitization logic that may impact input latency in large forms.
- `InteractionStats`: Used for calculating engagement without blocking user interactions.

## Documentation Touchpoints

- **Service Documentation**: Any internal docs regarding the `Service Layer` pattern.
- **Media Guidelines**: Standards for Cloudinary/YouTube integration.
- **Offline Protocol**: Version 1.102 specs for Web-only offline rascunhos.

## Workflow & Collaboration Checklist

- [ ] **Initial Audit**: Analyze the specific service or component using `debugLogger`.
- [ ] **Resource Profiling**: Check if `localStorageService` operations are exceeding 50ms.
- [ ] **Network Check**: Verify if `NetworkService` is correctly throttling calls during poor connectivity.
- [ ] **Dependency Review**: Ensure no duplicate versions of heavy libraries (like Gemini or Cloudinary SDKs).
- [ ] **Verification**: Validate that optimizations don't break the `ValidationResult` contracts in `validators.ts`.
- [ ] **Hand-off**: Document any changes to the `SmartPlaybackConfig` or storage schemas.

## Hand-off Notes

- **IndexedDB**: If modifying `openDatabase`, ensure migrations are handled to prevent data loss for offline drafts.
- **Video Logic**: Changes to `PlaybackSegment` logic must be tested across both YouTube and Cloudinary providers.
- **Admin Panels**: Performance tweaks in `commercialOperations.ts` should be verified against the `PurchaseValidationResult` schema.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [Project Overview](../../README.md)
- [Agent Handbook](../../AGENTS.md)
