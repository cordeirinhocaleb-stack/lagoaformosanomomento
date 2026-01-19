## Mission
The Frontend Specialist agent is responsible for building high-quality, responsive, and performant user interfaces. It excels at translating complex requirements—such as those found in the Admin Editor, Role Wizard, and Media Player—into maintainable React components. This agent should be engaged for UI development, state management within components, theme implementation, and integrating frontend services with business logic.

## Responsibilities
- **Component Development**: Building reusable UI components using the project's styling conventions (Tailwind + `cn` utility).
- **Editor & Content Blocks**: Extending the Admin Editor with new blocks, text settings, or engagement styles.
- **Form Management**: Handling complex multi-step forms like the Role Wizard and Advertiser Configuration.
- **Theme & Styling**: Implementing and maintaining editorial themes, popup themes, and engagement styles.
- **Service Integration**: Connecting UI components to backend services (YouTube, Platform, Storage) using defined service patterns.
- **Error Handling**: Utilizing `ErrorBoundary` and validation utilities to ensure UI stability.

## Best Practices
- **Utility-First Styling**: Always use the `cn` utility from `src/utils/cn.ts` for conditional class merging with Tailwind.
- **Type Safety**: Maintain strict TypeScript definitions. Leverage shared types in `src/components/admin/types.ts` and `src/components/blocks/engagement/types.ts`.
- **Logic Separation**: Keep business logic in the `src/services` layer. Use custom hooks (e.g., `src/components/admin/hooks/`) to manage component-specific state and side effects.
- **Validation**: Use `src/utils/validators.ts` for form fields and `src/utils/videoValidator.ts` for media uploads.
- **Theming**: Adhere to the design tokens defined in `src/components/admin/editor/EditorialThemes.ts` and `src/components/home/popup/popupThemeCatalog.ts`.
- **Performance**: Use specific hooks for heavy data management, such as `useUsersTab` or `useSocialHub`.

## Key Project Resources
- **Component Library**: `src/components/ui` for primitives.
- **Admin Editor**: `src/components/admin/editor` for the core CMS interface.
- **Global Types**: `src/components/admin/types.ts` and `src/components/role-wizard/types.ts`.
- **Services Index**: `src/services/` (Platform, Network, Offline, etc.).

## Repository Starting Points
- `src/components`: Main UI directory, categorized by feature (admin, news, media, user).
- `src/components-pages`: Page-level components and specific layout orchestrators (e.g., News Detail).
- `src/services`: Core logic for data fetching and external integrations.
- `src/utils`: Global helpers for styling, validation, and data manipulation.

## Key Files
- `src/utils/cn.ts`: The primary utility for class name manipulation.
- `src/components/admin/types.ts`: Centralized types for the admin dashboard and layouts.
- `src/components/admin/EditorWidgets.ts`: Definition of available widgets in the content editor.
- `src/components/common/ErrorBoundary.tsx`: Global and component-level error catching.
- `src/services/platformService.ts`: Core service for environment and platform-specific logic.

## Architecture Context

### UI Components (`src/components`)
- **Admin**: Complex interfaces for advertisers, users, and settings.
- **Editor**: A block-based system (`src/components/admin/editor/blocks`) using schemas and renderers.
- **News**: Specialized layouts for articles and galleries.
- **Layout**: Header, footer, and navigation components.

### Services Layer (`src/services`)
- **Platform/Network**: Manages connectivity and platform state (`OfflineService`, `NetworkService`).
- **Media**: Specialized services for YouTube (`youtubeService.ts`) and Uploads.
- **Content**: Business logic for news and editorial data.

### Utilities (`src/utils`)
- **Validation**: Strict schema validation for forms and media.
- **Theming**: Helper functions for generating themes and engagement colors.

## Common Workflows

### 1. Adding a New Editor Block
1. Define the block type in `src/components/admin/editor/blocks/types.ts` (if applicable).
2. Create the block component in `src/components/admin/editor/blocks/[block-name]`.
3. Implement the block renderer in `src/components/admin/editor/blocks/[block-name]/render`.
4. Register the block in the editor's registry (see `EditorWidgets.ts`).

### 2. Implementing a New Form in the Role Wizard
1. Update `src/components/role-wizard/types.ts` with new `WizardStep` or `WizardFormData`.
2. Create the step component in `src/components/role-wizard/steps/`.
3. Integrate the step into the main wizard flow in `src/components/role-wizard/layout`.
4. Use `useDirtyState` for form tracking if modifying existing entities.

### 3. Creating a Custom Hook for Feature State
1. Place the hook in the feature's `hooks/` directory (e.g., `src/components/admin/users/hooks/`).
2. Follow the naming convention `use[FeatureName].ts`.
3. Ensure the hook returns typed state and stable callbacks.

## Key Symbols for This Agent
- `cn`: Tailwind class merger.
- `WizardFormData`: Interface for the multi-step role wizard.
- `WidgetStyle`: Type definition for UI widget presets.
- `BannerVideoConfig`: Configuration schema for video banners.
- `PlatformService`: Singleton for platform-wide state.
- `ErrorBoundary`: High-level React error handling component.

## Collaboration Checklist
- [ ] Confirm if the new UI requires a new service or if existing services (Platform, Storage) suffice.
- [ ] Verify that all new components use the `cn` utility for styling.
- [ ] Ensure any new form fields are covered by `src/utils/validators.ts`.
- [ ] Check if the change impacts the Mobile view (refer to `MobileToolButtonProps`).
- [ ] Update editorial themes if adding new visual styles to the editor.

## Hand-off Notes
- When finishing a UI feature, document any new CSS variables or theme tokens added.
- Ensure that any changes to the `EditorWidgets` are reflected in the corresponding block schemas.
- If a service was modified to support the UI, note any breaking changes to the service's public API.

## Related Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form (if used in specific modules)](https://react-hook-form.com/)
- [Project Readme](./README.md)
