# Testing Strategy

The quality of the Lagoa Formosa No Momento platform is maintained through a layered testing approach that ensures reliability from low-level utility functions to complex administrative workflows. Given the application's heavy reliance on real-time data, offline capabilities (IndexedDB/LocalStorage), and complex media handling, our strategy emphasizes:

1.  **Isolation**: Ensuring utility functions and business logic are tested independently of UI components.
2.  **State Management**: Validating that hooks and providers correctly manage the application state, especially during asynchronous operations like authentication and media uploads.
3.  **Resilience**: Testing offline scenarios and synchronization logic handled by the `OfflineService`.
4.  **Security**: Verifying that field permissions and sanitization rules are strictly enforced.

## Test Types

- **Unit Tests**
    - **Framework**: Vitest / Jest
    - **Naming Convention**: `*.test.ts` or `*.test.tsx`
    - **Scope**: Foundational utilities in `src/utils` (e.g., `videoValidator.ts`, `cn.ts`), pure service logic, and individual UI components.
    - **Tooling**: `react-testing-library` for component rendering and `msw` (Mock Service Worker) for API mocking.

- **Integration Tests**
    - **Framework**: Vitest + React Testing Library
    - **Naming Convention**: `*.spec.ts`
    - **Scope**: Complex interactions between hooks and services. Specifically targeting `src/hooks` (e.g., `useAuth.ts`, `useDataHandlers.ts`) and the interaction between the `EditorCanvas` and its various block components.
    - **Tooling**: Custom wrappers for `AppControllerProvider` and `DialogProvider` to simulate the full application context.

- **End-to-End (E2E) Tests**
    - **Framework**: Playwright
    - **Scope**: Critical user journeys including User Login, News Publication workflow, and Advertiser Configuration.
    - **Environments**: These tests run against a staging environment or a local production build with a dedicated test Supabase instance.
    - **Naming Convention**: `tests/e2e/*.spec.ts`

- **Database & Backend Validation**
    - **Tooling**: Custom scripts in `src/scripts` (e.g., `verify_supabase.js`, `test-reset.js`).
    - **Scope**: Ensuring Supabase RLS (Row Level Security) rules and schema migrations are correct before deployment.

## Running Tests

Execution commands are managed via `npm`. Ensure all dependencies are installed before running.

- **Run all unit and integration tests**:
  ```bash
  npm run test
  ```

- **Run tests in watch mode (Development)**:
  ```bash
  npm run test -- --watch
  ```

- **Generate coverage report**:
  ```bash
  npm run test -- --coverage
  ```

- **Run E2E tests (UI mode)**:
  ```bash
  npx playwright show-report
  ```

- **Database Verification**:
  ```bash
  node src/scripts/verify_supabase.js
  ```

## Quality Gates

Before any code is merged into the `main` or `develop` branches, it must pass the following gates:

- **Linting & Formatting**: No ESLint errors are permitted. Code must be formatted via Prettier.
- **Type Safety**: The project must pass a full TypeScript check (`npm run type-check`).
- **Code Coverage**: 
    - **Utils & Services**: Minimum 80% coverage.
    - **Hooks**: Minimum 70% coverage.
    - **Components**: Minimum 50% coverage (focusing on logic over styling).
- **Critical Path Success**: All E2E tests related to authentication and the Admin Editor must pass.
- **Console Audit**: No `console.log` statements should remain in production code (verified via `clean_console_logs.cjs`).

## Troubleshooting

### Flaky Tests in Offline Mode
Tests involving `OfflineService` or `localStorageService` may fail if the IndexedDB state is not cleaned up between runs. Always use the `clearAllFiles()` utility in the `afterEach` block to ensure a clean slate.

### Asynchronous Component Rendering
When testing components that use `useAppController` or `useAuth`, ensure you use `findBy*` queries or `waitFor` from React Testing Library to account for the initialization of global providers.

### Supabase Connection Issues
If integration tests fail due to connection timeouts, verify your `.env.test` file is pointing to the correct Supabase local container or test project. Use `src/scripts/test-reset.js` to restore the test database to a known state.

## Related Resources

- [Development Workflow](./development-workflow.md): Information on branch naming and the PR process.
