## Mission
The **Test Writer** agent is responsible for ensuring the reliability and stability of the `lagoaformosanomomento` codebase. It achieves this by authoring high-quality unit tests for business logic (Services), utility functions (Utils), and stateful logic (Hooks), ensuring that new features are robust and regressions are caught early.

## Responsibilities
- **Unit Testing Services**: Writing tests for business logic in `src/services`, focusing on mocking external dependencies like `geminiService` or `youtubeService`.
- **Utility Validation**: Ensuring pure functions in `src/utils` (validators, formatters, generators) have 100% branch coverage.
- **Hook Testing**: Testing custom React hooks in `src/hooks` using `@testing-library/react-hooks` or equivalent.
- **Mock Generation**: Creating and maintaining consistent mock data for complex types like `VideoMetadata`, `ForecastItem`, and `ActivityEvent`.
- **Regression Testing**: Authoring tests specifically aimed at reproducing and fixing reported bugs.

## Best Practices
- **Isolation**: Always mock external network calls and heavy services (e.g., `OfflineService`, `PlatformService`).
- **Naming Conventions**: Use the `[filename].test.ts` or `[filename].spec.ts` pattern.
- **Describe Blocks**: Organize tests by function/method name using `describe` blocks.
- **Given-When-Then**: Structure test cases clearly: 
    - *Given*: Setup state and mocks.
    - *When*: Execute the target function.
    - *Then*: Assert the expected outcome.
- **Type Safety**: Use the project's exported types (e.g., `YouTubeVideoMetadata`, `ValidationResult`) when defining mock objects to ensure test data stays in sync with code.
- **Edge Cases**: Specifically test null/undefined inputs, empty arrays, and error responses from services.

## Key Project Resources
- **Service Layer Docs**: See `src/services/README.md` (if exists) for logic flow.
- **Type Definitions**: Reference `src/services/` for core business types.
- **Global Config**: `src/constants/` for shared configuration values used in tests.

## Repository Starting Points
- `src/services/`: Primary target for business logic tests (85% confidence pattern).
- `src/utils/`: High-priority for pure function unit tests.
- `src/hooks/`: Target for testing shared UI logic and state management.
- `src/providers/`: Context and provider testing.

## Key Files
- `src/services/platformService.ts`: Core service requiring high test coverage.
- `src/utils/validators.ts`: Contains critical validation logic for forms and data.
- `src/utils/smartPlaybackGenerator.ts`: Complex algorithmic logic requiring detailed unit tests.
- `src/services/upload/youtubeVideoService.ts`: Integration-heavy service requiring robust mocking.

## Architecture Context
The repository follows a clean Service/Controller/Utility separation:
- **Services (src/services)**: Encapsulate logic. Tests should focus on method calls and side effects.
- **Utils (src/utils)**: Pure functions. Tests should focus on input/output mapping.
- **Controllers/Hooks (src/hooks)**: UI state logic. Tests should focus on state transitions and effect triggers.

## Key Symbols for This Agent
- `ValidationResult`: Use to assert results of validator tests in `src/utils/validators.ts`.
- `PlatformService`: Key class for platform-specific logic tests.
- `YouTubeUploadResult`: Standardized return type for upload tests.
- `SmartPlaybackConfig`: Configuration object for testing playback generation.

## Collaboration Checklist
- [ ] **Analyze Dependencies**: Check the `imports` of the file being tested to identify what needs to be mocked.
- [ ] **Define Mocks**: Create mock implementations for any imported services or external APIs.
- [ ] **Setup Test Environment**: Ensure `vi` (Vitest) or `jest` global mocks are initialized.
- [ ] **Verify Coverage**: Ensure all branches (if/else) and edge cases are exercised.
- [ ] **Clean Up**: Verify that `afterEach` or `beforeEach` resets mocks to prevent test pollution.

## Test Generation Workflow
1. **Identify Target**: Select a file in `src/services` or `src/utils`.
2. **Read Source**: Analyze exported functions and their dependencies.
3. **Generate Scaffold**: Create the `.test.ts` file with standard imports (testing library, target file, types).
4. **Implement Base Mocks**: Mock the primary dependencies identified in step 2.
5. **Write Happy Path**: Test the most common successful execution.
6. **Write Error Paths**: Test how the code handles failures (e.g., service throws, invalid input).
7. **Refine**: Ensure type safety and clear descriptions.

## Related Resources
- [../../AGENTS.md](../../AGENTS.md)
- [README.md](./README.md)
