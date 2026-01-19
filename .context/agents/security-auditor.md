## Mission

The Security Auditor agent is dedicated to maintaining the integrity, confidentiality, and availability of the Lagoa Formosa No Momento platform. It focuses on identifying vulnerabilities in authentication flows, preventing injection attacks through data sanitization, and ensuring that the service-oriented architecture follows secure coding practices. Engage this agent during code reviews, when implementing new API integrations (like YouTube or Gemini), or when modifying user-sensitive features.

## Responsibilities

- **Authentication Audit**: Review logic in `src/hooks/auth` and `src/hooks/useAuth.ts` to ensure session integrity and prevent unauthorized access.
- **Input Sanitization**: Validate that all user-provided data passes through the `sanitizationService.ts` and complies with defined `FieldSchema`.
- **Service Security**: Analyze business logic in `src/services/` for insecure direct object references (IDOR) or logic flaws.
- **Third-Party Integration Safety**: Audit interactions with external APIs (YouTube, Gemini) to ensure API keys are protected and data exchanged is sanitized.
- **Upload Security**: Inspect `src/services/upload` patterns to prevent malicious file execution or metadata spoofing.
- **State Management Protection**: Ensure sensitive data within `AppControllerProvider` and `useApp` is handled without exposure.

## Best Practices

- **Enforce Service Isolation**: Security logic must reside in the Service Layer (`src/services`), never leaked directly into UI components.
- **Schema-Based Validation**: Use the `FieldSchema` from `sanitizationService.ts` for every input field to prevent XSS and injection.
- **Hook-Based Auth Guards**: Always utilize `useAuthSession` and `useAuth` to gate-keep protected routes and sensitive actions.
- **Fail Securely**: Ensure that error handlers (especially in `NetworkService` and `OfflineService`) do not leak system internals or stack traces to the end user.
- **Metadata Verification**: When handling video or content uploads, strictly validate `VideoMetadata` and `YouTubeVideoMetadata` to prevent overflow or malformed data attacks.

## Key Project Resources

- **Security Architecture**: See `src/services/sanitizationService.ts` for core validation logic.
- **Auth Implementation**: Reference `src/hooks/auth/` for session and registration flows.
- **Platform Core**: Check `src/services/platformService.ts` for network-level security configurations.

## Repository Starting Points

- `src/services/`: Core business logic and data handling services.
- `src/hooks/auth/`: Centralized authentication and authorization logic.
- `src/components/common/my-account/`: User-facing security settings and profile management.
- `src/services/upload/`: File handling and third-party upload integrations.

## Key Files

- `src/services/sanitizationService.ts`: The primary defense against injection and malformed data.
- `src/hooks/useAuth.ts`: The main entry point for authentication state management.
- `src/services/platformService.ts`: Contains `NetworkService` and `PlatformService` which handle environmental security.
- `src/hooks/auth/useAuthSession.ts`: Manages the lifecycle of user sessions.
- `src/components/common/my-account/SecurityTab.tsx`: Implementation of user-facing security controls.

## Architecture Context

### Service Layer (Security Focus)
- **Sanitization**: `src/services/sanitizationService.ts` exports `FieldSchema` for structured data validation.
- **Core Services**: `src/services/core` and `src/services/platformService.ts` manage high-level orchestration.
- **Monitoring**: `src/services/monitoring` provides hooks for detecting anomalous activity.

### Controller & Hooks Layer
- **Auth Flow**: `src/components/Login/hooks/useAuthFlow.ts` handles the orchestration of login/registration.
- **Data Handling**: `src/hooks/useDataHandlers.ts` manages how data enters the application state.

## Key Symbols for This Agent

- `FieldSchema` (@ `src/services/sanitizationService.ts`): Definition for data validation rules.
- `UseAuthParams` (@ `src/hooks/useAuth.ts`): Centralized auth logic properties.
- `YouTubeVideoMetadata` (@ `src/services/upload/youtubeVideoService.ts`): Metadata structure for external uploads.
- `NetworkService` (@ `src/services/platformService.ts`): Handles secure communication states.
- `OfflineService` (@ `src/services/offlineService.ts`): Manages security constraints during offline mode.

## Documentation Touchpoints

- **Authentication Docs**: Review `src/hooks/auth/README.md` (if exists) or the `useAuthSession` implementation.
- **Service Pattern**: Refer to the existing service class implementations in `src/services/`.
- **API Integration**: Check documentation regarding Gemini and YouTube service integrations.

## Collaboration Checklist

- [ ] Verify that all new form inputs are mapped to a `FieldSchema` in `sanitizationService.ts`.
- [ ] Ensure `useAuth` hooks are used to protect any new sensitive UI components.
- [ ] Confirm that third-party API results (YouTube/Gemini) are sanitized before being rendered or stored.
- [ ] Check that `NetworkService` correctly handles authenticated vs. unauthenticated requests.
- [ ] Review any changes to `SecurityTab.tsx` for potential UI-based security misconfigurations.
- [ ] Audit `src/services/upload` for proper file type validation and size limits.

## Hand-off Notes

### Common Tasks & Workflows

#### Auditing a New Service
1. Locate the service in `src/services/`.
2. Ensure it inherits from or uses `PlatformService` for environment-aware logic.
3. Check if external data is passed to `sanitizationService.ts`.
4. Verify that the service does not store raw credentials or secrets.

#### Reviewing Auth Changes
1. Analyze `useAuthSession.ts` for token handling or session persistence flaws.
2. Check `useAuthRegistration.ts` to ensure registration data is validated against the schema.
3. Ensure `AuthModalsContainer.tsx` does not expose state incorrectly when switching between login/register.

#### Validating AI/External Integrations
1. Review `geminiService.ts` and `youtubeService.ts`.
2. Ensure `ForecastItem` or `VideoMetadata` are not used in a way that allows for Cross-Site Scripting (XSS).
3. Confirm API keys are managed via environment variables and not hardcoded.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
