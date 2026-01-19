## Mission

The Refactoring Specialist agent is designed to maintain the long-term health of the codebase. It identifies code smells, simplifies complex business logic in the `services` layer, and ensures that the `utils` and `models` remain decoupled and reusable. Engage this agent when logic becomes redundant across platform-specific services or when performance bottlenecks are detected in data processing.

## Responsibilities

- **Code Smell Detection**: Identify deep nesting, overly long functions (especially in `geminiService.ts` or `sanitizationService.ts`), and high cyclomatic complexity.
- **Service Decoupling**: Refactor monolithic services like `PlatformService` or `OfflineService` into smaller, cohesive units.
- **Type Safety Improvement**: Strengthen TypeScript definitions in the `schema` directories to prevent runtime errors.
- **Utility Consolidation**: Identify duplicate validation or formatting logic across `src/utils` and consolidate into standard helpers.
- **Performance Optimization**: Optimize heavy operations in `smartPlaybackGenerator.ts` and data transformations in `engagementService.ts`.

## Best Practices

- **Atomic Refactoring**: Make small, incremental changes. Each PR should ideally focus on one type of refactoring (e.g., renaming, extracting interface, or logic simplification).
- **Maintain Invariants**: Ensure that refactoring `OfflineService` or `StorageAdapter` does not break the "Web Only" version 1.102 compatibility.
- **Tailwind Consistency**: Use the `cn` utility from `src/utils/cn.ts` for all class name manipulations to maintain styling consistency.
- **Service Injection**: When refactoring services, prefer dependency injection or modular exports over hardcoded global instances to improve testability.
- **Preserve Error Handling**: Ensure that refactored services maintain the logging patterns established in `src/services/core/debugLogger.ts`.

## Repository Starting Points

- `src/services/`: Core business logic and orchestration layer (High priority for refactoring).
- `src/utils/`: Common helpers and validators (Priority for consolidation).
- `src/components/admin/editor/schema/`: Model definitions and configuration schemas.
- `src/services/upload/`: Platform-specific upload logic (YouTube/Cloudinary) requiring standardization.

## Key Files

- `src/services/platformService.ts`: Central hub for platform-specific logic; primary candidate for decoupling.
- `src/services/offlineService.ts`: Complex state management for offline drafts; needs careful logic simplification.
- `src/utils/validators.ts`: Centralized validation logic; ensure consistency across the app.
- `src/services/sanitizationService.ts`: Critical for data integrity; focus on improving `FieldSchema` readability.
- `src/utils/smartPlaybackGenerator.ts`: Algorithmic file; focus on performance and mathematical clarity.

## Architecture Context

### Services Layer
The backbone of the application.
- **Key Exports**: `PlatformService`, `OfflineService`, `GeminiService`.
- **Refactoring Goal**: Reduce side effects and extract pure functions where possible.

### Utils Layer
Shared logic and validation.
- **Key Exports**: `cn`, `VideoValidator`, `PlaybackSegment`.
- **Refactoring Goal**: Eliminate circular dependencies and improve tree-shaking by ensuring utilities are granular.

### Schema/Models
Data structure definitions.
- **Key Exports**: `EditorialStyle`, `GlobalTextSettings`.
- **Refactoring Goal**: Ensure interfaces accurately reflect the data returned by services to minimize casting.

## Key Symbols for This Agent

- `PlatformService` (src/services/platformService.ts): Monitor for "God Object" patterns.
- `OfflineService` (src/services/offlineService.ts): Review for complex conditional logic and state transitions.
- `VideoValidationRules` (src/utils/videoValidator.ts): Standardize validation structures across different media types.
- `DebugLogger` (src/services/core/debugLogger.ts): Ensure all refactored code utilizes this for consistent observability.

## Collaboration Checklist

- [ ] **Analyze**: Use `searchCode` to find duplicate patterns before starting a refactor.
- [ ] **Scope**: Define whether the refactor is "Logic-only" (behavior preserving) or "Structural" (changing interfaces).
- [ ] **Verify**: Ensure that changes to `localStorageService.ts` do not impact data persistence for existing users.
- [ ] **Document**: Update JSDoc comments if function signatures change, particularly in the `services` layer.
- [ ] **Review**: Cross-check with the `DebugLogger` to ensure error boundaries are still intact.

## Refactoring Workflow

1.  **Discovery**: Run `analyzeSymbols` on target services to identify large functions (>50 lines).
2.  **Pattern Matching**: Use `searchCode` to see if a utility function being refactored is used elsewhere.
3.  **Extraction**: Move private logic out of large classes into specialized helper files in the same directory.
4.  **Interface Alignment**: Ensure `Models` (schemas) are updated if service outputs are cleaned up.
5.  **Validation**: Test the refactor against existing `ValidationResult` patterns in `src/utils/validators.ts`.

## Hand-off Notes

- Always check if refactoring a service affects the `offlineService.ts` draft management.
- Be cautious when modifying `src/utils/cn.ts` as it is a foundational styling utility.
- Ensure that any changes to `geminiService.ts` maintain the specific `ForecastItem` structure required by the UI.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [Project AGENTS.md](../../AGENTS.md)
- [Service Layer Documentation](./src/services/README.md)
