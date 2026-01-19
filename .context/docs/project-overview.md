# Project Overview

Lagoa Formosa no Momento is a comprehensive digital news and advertising platform designed to deliver local content while providing robust tools for advertisers and content managers. It solves the challenge of local engagement by integrating real-time news delivery with a sophisticated advertising engine that supports tiered subscription plans and interactive content blocks.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- **Root**: `G:\lagoaformosanomomento`
- **Languages**: TypeScript (Primary), JavaScript (Tooling/Scripts), CSS
- **Primary Entry**: [`src/App.tsx`](../src/App.tsx)
- **Routing Entry**: [`src/app/page.tsx`](../src/app/page.tsx)
- **Full analysis**: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- **Web Application**: [`src/App.tsx`](../src/App.tsx#L24) — The main React application container and provider wrapper.
- **Root Layout**: [`src/app/layout.tsx`](../src/app/layout.tsx#L23) — Defines the base structure for the application using a modern app-router style pattern.
- **Main Content Page**: [`src/app/page.tsx`](../src/app/page.tsx#L6) — The primary landing page and news feed entry point.
- **Admin Dashboard**: Managed via components in [`src/components-pages/Admin`](../src/components-pages/Admin) for content and advertiser management.

## Key Exports

Refer to [`codebase-map.json`](./codebase-map.json) for the complete list of over 130+ exports. Notable exports include:
- `App`: The main application component.
- `PlatformService`: Core service for environment and platform-specific logic.
- `EngagementType`: Enumeration of interactive content types (Daily Bread, Polls, etc.).
- `AdPlanConfig`: Type definitions for the advertising subscription system.
- `OfflineService`: Handles local draft persistence and synchronization.

## File Structure & Code Organization

- `src/app/` — Main application routes and layout definitions.
- `src/components/` — Reusable UI components organized by domain (Admin, Ads, News, User).
- `src/components-pages/` — Complex page-level component compositions (e.g., News Detail, Admin dashboards).
- `src/services/` — Business logic, API integration (Supabase/Cloudinary), and infrastructure services (Storage, Monitoring).
- `src/hooks/` — Shared React hooks for authentication, data handling, and modal management.
- `src/types/` — Centralized TypeScript definitions for domain models (Ads, News, System, Users).
- `src/utils/` — Helper functions for formatting, validation, and styling (e.g., `cn` for Tailwind).
- `src/scripts/` — Maintenance and deployment utilities for database verification and content auditing.

## Technology Stack Summary

The project is built on a modern **React 18** and **TypeScript** foundation, utilizing **Vite** as the build tool for fast development cycles. It employs a component-driven architecture with **Tailwind CSS** for styling. The backend integration relies on **Supabase** for data and authentication, with **Cloudinary** and **Vimeo/YouTube** handles for specialized media storage and delivery.

## Core Framework Stack

- **Frontend**: React with TypeScript, leveraging Context Providers (`AppControllerProvider`, `DialogProvider`) for global state.
- **Data Layer**: Supabase client integration for real-time data and relational storage.
- **Offline Capabilities**: A custom `OfflineService` utilizing IndexedDB (via `localStorageService.ts`) for managing local drafts and media.
- **Architecture**: Follows a layered approach:
    - **UI Layer**: React components and hooks.
    - **Service Layer**: Pure logic classes (e.g., `PlatformService`, `NetworkService`).
    - **Repository Layer**: Specialized hooks for data fetching and mutation.

## UI & Interaction Libraries

- **Styling**: Tailwind CSS with `clsx` and `tailwind-merge` (via the `cn` utility).
- **Icons & UI**: Radix-based primitives (implied by structure) for accessible components like Dialogs and Accordions.
- **Media**: Custom wrappers for YouTube/Vimeo and a dedicated `ChromaKeyVideo` component for specialized video rendering.
- **Engagement**: Custom-built "Daily Bread" and gallery systems for user interaction.

## Development Tools Overview

- **Database Tools**: Scripts in `src/scripts/` for inspecting the database (`inspect-db.mjs`) and verifying Supabase connections.
- **Maintenance**: Utilities for cleaning console logs, fixing types, and auditing file rules.
- **Deployment**: Custom FTP-based deployment scripts (`deploy_v2.js`, `cleanup_ftp.js`) for environment synchronization.

## Getting Started Checklist

1. **Install Dependencies**: Run `npm install` to install all required packages.
2. **Environment Setup**: Configure `.env` with your Supabase and Cloudinary credentials (see `src/vite-env.d.ts` for required variables).
3. **Launch Development Server**: Run `npm run dev` to start the Vite preview.
4. **Verify Backend**: Run `node src/scripts/verify_supabase.js` to ensure connectivity.
5. **Explore Admin Tools**: Navigate to the `/admin` route to explore the News Editor and Advertiser Configuration.

## Next Steps

For deeper technical insights, please refer to the following documentation:
- [Architecture Guide](./architecture.md) — Detailed breakdown of system layers and data flow.
- [Development Workflow](./development-workflow.md) — Standards for coding, testing, and deployment.
- [Tooling Manual](./tooling.md) — Detailed guide on using the included maintenance scripts.
