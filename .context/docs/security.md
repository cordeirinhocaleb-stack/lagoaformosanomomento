# Security & Compliance Notes

This document outlines the security architecture, authentication protocols, and data protection policies implemented in the Lagoa Formosa No Momento platform. The project prioritizes data integrity and user privacy through a combination of frontend guards, secure service integrations, and role-based access controls.

Security is maintained through:
- **Environment Isolation**: Distinct configurations for development, staging, and production environments.
- **Data Sanitization**: Systematic cleaning of user-generated content via the `sanitizationService` to prevent XSS (Cross-Site Scripting) attacks.
- **Client-Side Validation**: Robust validation logic in `src\utils\validators.ts` to ensure data integrity before transmission.
- **Error Boundaries**: Implementation of `ErrorBoundary` components to prevent sensitive stack traces from being exposed to end-users during application failures.

## Authentication & Authorization

The platform utilizes a multi-tiered authentication and authorization system to manage user access and administrative privileges.

### Identity Providers
- **Google OAuth**: Integrated via `GoogleUser` interfaces for streamlined user onboarding and verified identity management.
- **Supabase/Firebase (Service Layer)**: Leverages industry-standard backend-as-a-service providers for secure credential storage and session management.

### Token & Session Strategy
- **Session Management**: Handled through the `useAuth` hook and `UserSession` interface. Sessions are persisted securely and validated on application mount.
- **Bearer Tokens**: API requests are authenticated using JWT (JSON Web Tokens) transmitted via Authorization headers.

### Role-Based Access Control (RBAC)
The application implements a strict permission model defined in `src\types\users.ts`:
- **User Roles**: Defined by the `UserRole` type (e.g., Guest, User, Moderator, Admin).
- **Field-Level Permissions**: Managed by `useFieldPermissions.ts`, which controls the visibility and editability of specific UI components based on the authenticated user's role.
- **Role Wizard**: A dedicated `role-wizard` component facilitates the assignment and management of permissions during the user lifecycle.

## Secrets & Sensitive Data

Secrets and configuration parameters are managed with a "Zero-Trust" approach toward the client-side environment.

### Storage & Management
- **Environment Variables**: Sensitive keys (Cloudinary API keys, Supabase URLs, etc.) are managed via `.env` files and accessed through `import.meta.env`. These are never hardcoded in the source.
- **Local Storage Encryption**: While `localStorageService.ts` provides persistence for offline drafts, sensitive user data is handled via `IndexedDB` with restricted access patterns.
- **Vaults**: Production secrets are stored in encrypted parameter stores (e.g., Vercel Environment Variables or GitHub Secrets) and injected during the CI/CD pipeline.

### Encryption Practices
- **In-Transit**: All data transmission is enforced over HTTPS/TLS 1.3.
- **At-Rest**: Sensitive data stored in the primary database is encrypted at the storage layer.
- **Media Security**: Video assets are validated using `src\utils\videoValidator.ts` to ensure content safety and compliance with platform standards.

## Compliance & Policies

The project adheres to several internal and international standards to ensure user safety and legal compliance:

- **LGPD/GDPR Compliance**: Implementation of "Terms of Service" modals and cookie consent frameworks to respect user privacy and data portability.
- **Content Moderation**: Automated and manual triggers for reporting content via `SupportTicket` and `AuditLog` systems.
- **Audit Trails**: The `AuditLog` interface in `src\types\system.ts` tracks sensitive administrative actions, including settings changes and user role modifications.
- **Media Safety**: Integration of `src\utils\popupSafety.ts` to ensure promotional content meets visual and safety guidelines.

## Incident Response

In the event of a security anomaly or system failure, the following protocol is observed:

- **Monitoring**: `src\services\monitoring` tracks application health and anomalous behavior patterns.
- **Logging**: The `DebugLogger` and `ErrorReport` systems capture detailed context of failures, which are routed to administrative dashboards for triage.
- **Escalation**: Technical leads are notified via automated alerts when critical `ActivityStatus` failures are detected in the system logs.
- **Post-Incident Analysis**: Every critical failure triggers a review of the `AuditLog` to identify root causes and implement preventative measures in subsequent releases.

## Related Resources

- [architecture.md](./architecture.md)
