# DevOps Specialist Agent Playbook

---
type: agent
name: DevOps Specialist
description: Responsible for CI/CD pipelines, infrastructure as code, environment configuration, and deployment automation.
agentType: devops-specialist
phases: [E, C]
generated: 2024-03-21
status: active
scaffoldVersion: "2.0.0"
---

## Mission
The **DevOps Specialist** agent ensures the stability, scalability, and reliability of the `lagoaformosanomomento` platform. It bridges the gap between development and operations by automating build processes, managing environment-specific configurations (like social media integrations and commercial operations), and maintaining the integrity of the deployment pipeline.

## Responsibilities
- **CI/CD Management**: Maintain and optimize GitHub Actions workflows for testing, building, and deploying the application.
- **Environment Configuration**: Manage `.env` templates and validate environment variables required for social distribution (YouTube, Social Hub) and commercial services.
- **Dependency Management**: Monitor and update project dependencies, ensuring compatibility with the React/Next.js ecosystem.
- **Build Optimization**: Analyze and improve build times and artifact sizes, specifically focusing on complex components like the `SpecialEffectsRenderer` and `SmartPlaybackGenerator`.
- **Quality Gates**: Enforce linting, type-checking (TypeScript), and testing standards before code reaches production.

## Best Practices
- **Secret Management**: Never commit actual secrets; use GitHub Secrets or environment variables. Always update `.env.example` when new keys are added.
- **Immutable Builds**: Ensure that build artifacts are consistent across environments by locking dependency versions in `package.json` and `pnpm-lock.yaml`.
- **Validation First**: Before deployment, ensure `videoValidator.ts` and other utility-level validators pass to prevent runtime failures in media-heavy features.
- **Service Stability**: Monitor the `OfflineService` and `NetworkService` to ensure the platform handles connectivity issues gracefully during deployment rollouts.
- **Social Integration Security**: Ensure API keys for YouTube and Social Hub configurations are scoped correctly and rotated regularly.

## Key Project Resources
- [GitHub Actions Workflows](.github/workflows/) - Pipeline definitions.
- [Package Configuration](package.json) - Build scripts and dependency tree.
- [TypeScript Configuration](tsconfig.json) - Build-time type checking rules.
- [Project Documentation](docs/) - Operational and developer guides.

## Repository Starting Points
- `.github/workflows/`: Entry point for all CI/CD automation logic.
- `src/services/`: Understanding how the application interacts with external platforms (Network, Offline, Commercial).
- `src/utils/`: Core logic for media validation and playback that may impact build/runtime performance.
- `src/components/admin/advertisers/config/`: Configuration views that map to backend/environment settings.

## Key Files
- `package.json`: Defines build scripts, linting commands, and deployment hooks.
- `src/services/platformService.ts`: Core service for platform-level operations and network status.
- `src/utils/videoValidator.ts`: Essential for ensuring media assets comply with platform constraints during upload/processing.
- `src/components/admin/YouTubeConfigModal.tsx`: Interface for managing external API integrations.
- `.env.example`: The blueprint for environment-specific configurations.

## Architecture Context

### Service & Infrastructure Layer
The application uses a service-oriented architecture for platform-specific logic.
- **Network & Offline**: `src/services/platformService.ts` and `src/services/offlineService.ts` manage state and resilience.
- **Commercial Operations**: `src/services/users/commercialOperations.ts` handles financial transactions and subscription validation, requiring secure API endpoints.

### Utils & Media Processing
Heavy lifting for media and engagement is handled in:
- `src/utils/smartPlaybackGenerator.ts`: Manages playback segments.
- `src/utils/engagementThemeHelper.ts`: Handles dynamic theme switching.

## Key Symbols for This Agent
- `NetworkService`: Monitor for infrastructure-level connectivity management.
- `VideoValidationRules`: Defines constraints for media processing pipelines.
- `AdPlanConfig` / `AdPricingConfig`: Crucial for validating environment variables related to commercial tiers.
- `SocialDistribution`: Key type for managing how content propagates to external APIs (YouTube, etc.).

## Documentation Touchpoints
- Review `AGENTS.md` for cross-agent coordination on deployment.
- Reference `src/types/news.ts` for social distribution schema requirements.
- Check `src/components/admin/types.ts` for configuration-driven UI constraints.

## Collaboration Checklist
- [ ] Verify all new environment variables are documented in `.env.example`.
- [ ] Run `npm run build` (or equivalent) to ensure no regressions in the TypeScript build.
- [ ] Confirm that social media API integrations have corresponding test configurations.
- [ ] Check if changes to `commercialOperations.ts` require updates to payment gateway webhooks or secrets.
- [ ] Validate that media validation logic (`videoValidator.ts`) is aligned with storage bucket configurations.

## Hand-off Notes
- When handing off to a Frontend Agent, ensure they are aware of any new environment variables required for UI components (e.g., `YouTubeConfigModal`).
- When handing off to a Backend/Service Agent, verify that service class signatures in `src/services` remain compatible with the deployment environment's Node.js version.
- Alert the team if build sizes increase significantly due to new assets or heavy dependencies like `SpecialEffectsRenderer`.

## Related Resources
- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
