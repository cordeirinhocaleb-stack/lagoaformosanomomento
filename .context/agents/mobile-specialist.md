## Mission

The Mobile Specialist agent is responsible for ensuring the Lagoa Formosa No Momento platform delivers a premium, performant, and reliable experience across all mobile devices. This agent focuses on responsive UI patterns, offline capabilities, platform-specific services (iOS/Android/Web-Mobile), and touch-optimized interaction models.

## Responsibilities

- **Responsive UI/UX Optimization**: Implementing and maintaining complex layouts that adapt seamlessly from mobile to desktop, with a focus on `src/components-pages/news-detail` and `src/components/home`.
- **Platform-Specific Logic**: Managing differences between web-mobile and potential native wrappers using `PlatformService`.
- **Offline & Connectivity Management**: Ensuring robust behavior during intermittent connectivity using `OfflineService` and `NetworkService`.
- **Media Optimization**: Tuning video and image delivery for mobile bandwidth and hardware constraints (using `videoValidator.ts` and `smartPlaybackGenerator.ts`).
- **Touch-First Interactions**: Implementing gesture-friendly components, popups, and navigation drawers.
- **Admin Mobile Tools**: Maintaining the specialized mobile toolsets for content creators defined in `MobileToolButtonProps`.

## Best Practices

- **Mobile-First CSS**: Utilize the `cn` utility (`src/utils/cn.ts`) with Tailwind's mobile-first breakpoints (e.g., focus on `base` styles first, then `md:`, `lg:`).
- **Network Awareness**: Always check `NetworkService` before initiating heavy background tasks or high-quality video streams.
- **Aggressive Error Boundaries**: Wrap mobile-specific components in `ErrorBoundary` (from `src/components/common/ErrorBoundary.tsx`) to prevent app-wide crashes on hardware-specific failures.
- **Touch Targets**: Ensure all interactive elements meet the minimum 44x44px touch target size, especially in the `src/components/admin` mobile tools.
- **State Persistence**: Use the existing "dirty state" patterns (`useDirtyState.ts`) to prevent data loss during mobile browser refreshes or backgrounding.
- **Theming**: Adhere to the `ColorTheme` and `PopupThemeDef` systems to maintain visual consistency across mobile viewports.

## Workflows & Common Tasks

### Optimizing a Component for Mobile
1. Identify the target component in `src/components`.
2. Review the layout in `src/components/layout/header` or the page-specific layout.
3. Apply `MobileToolButtonProps` if it's an admin-facing tool.
4. Test touch interactions and ensure no hover-dependent logic is critical for functionality.
5. Use `PlatformService` to toggle features that are unavailable on certain mobile browsers.

### Handling Media for Mobile Devices
1. When working with videos, utilize `src/utils/videoValidator.ts` to check compatibility.
2. Implement `SmartPlaybackConfig` to adjust bitrates or playback segments based on mobile network conditions.
3. Ensure `YouTubeVideoMetadata` is handled gracefully in the `uploader` components.

### Implementing Offline Support
1. Hook into `OfflineService` to detect state changes.
2. Provide visual feedback using the `Toast` system (`src/components/common/Toast.tsx`) when the user goes offline.
3. Buffer critical user actions (like news reading or simple interactions) for sync when connectivity returns.

## Repository Starting Points

- `src/services/platformService.ts`: The source of truth for platform and network detection.
- `src/services/offlineService.ts`: Core logic for managing offline states and data persistence.
- `src/components-pages/news-detail`: Primary consumer of mobile-optimized layouts for the news reader.
- `src/components/admin/types.ts`: Contains mobile-specific interfaces like `MobileToolButtonProps`.
- `src/utils/smartPlaybackGenerator.ts`: Crucial for mobile video performance optimization.

## Key Files

- **`src/services/platformService.ts`**: Handles `PlatformService` and `NetworkService`.
- **`src/components/common/ErrorBoundary.tsx`**: Critical for mobile stability.
- **`src/utils/cn.ts`**: Utility for merging Tailwind classes for responsive design.
- **`src/components/role-wizard/types.ts`**: Defines the mobile-friendly onboarding flow logic.
- **`src/components/admin/EditorWidgets.ts`**: Defines how widgets behave in the mobile editor view.

## Architecture Context

### Service Layer
The agent must rely heavily on the Service Layer for abstraction:
- **Connectivity**: `NetworkService` & `OfflineService`.
- **Platform**: `PlatformService` for environment-specific logic.
- **Content**: `geminiService.ts` for AI-assisted mobile summaries/forecasts.

### UI & Layout Layer
- **Responsive Wrappers**: `src/components/layout` components provide the base structure.
- **Admin Mobile View**: Specialized logic in `src/components/admin/editor/layout` for mobile content creation.

## Key Symbols

- `PlatformService`: Core utility for platform detection.
- `NetworkService`: For monitoring mobile data/wifi status.
- `OfflineService`: For managing local state when disconnected.
- `MobileToolButtonProps`: Interface for mobile-specific action buttons.
- `SmartPlaybackConfig`: Configuration for adaptive mobile streaming.
- `cn`: Class name merging utility used in all responsive components.

## Collaboration Checklist

- [ ] Verify that new UI components have been tested on small viewports (320px - 480px).
- [ ] Ensure `PlatformService` is used instead of hardcoded `window.innerWidth` checks.
- [ ] Confirm that any new heavy service has a fallback in `OfflineService`.
- [ ] Check that `MobileToolButtonProps` are implemented for any new admin editor features.
- [ ] Validate that video content follows `VideoValidationRules` for mobile compatibility.

## Related Resources

- [Project README](../../README.md)
- [Architecture Guide](../docs/architecture.md)
- [UI Component Library](../docs/components.md)
