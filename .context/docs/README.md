# Documentation Hub: Lagoa Formosa no Momento

Welcome to the central documentation repository for **Lagoa Formosa no Momento**. This directory serves as the single source of truth for the platform's architecture, development standards, and business logic.

## 🧭 Navigation Map

Use the table below to find specific guides based on your current task.

| Guide | Purpose | Key Topics |
| :--- | :--- | :--- |
| [Project Overview](./project-overview.md) | High-level introduction | Roadmap, stakeholders, core mission. |
| [Architecture Notes](./architecture.md) | Technical blueprint | Service boundaries, dependency graphs, ADRs. |
| [Development Workflow](./development-workflow.md) | Daily operations | Branching, CI/CD, local environment setup. |
| [Testing Strategy](./testing-strategy.md) | Quality assurance | Vitest/Cypress config, CI gates, mocking data. |
| [Glossary & Domain](./glossary.md) | Business logic | Definitions for AdPlans, Placements, and Engagement. |
| [Data Flow](./data-flow.md) | System integration | Supabase schema, Cloudinary uploads, offline sync. |
| [Security & Compliance](./security.md) | Protection | RBAC (Role-Based Access Control), secrets, GDPR. |
| [Tooling Guide](./tooling.md) | Productivity | CLI scripts, IDE setup, automation tasks. |

---

## 🏗️ Architecture at a Glance

The platform follows a structured layered architecture to ensure scalability and maintainability:

1.  **Services (`src/services`)**: The core logic layer handling external integrations (Supabase, Cloudinary, YouTube) and system-wide utilities like `OfflineService` and `PlatformService`.
2.  **Controllers & Hooks (`src/hooks`)**: Manage application state and bridge the gap between UI components and services (e.g., `useAuth`, `usePublishingWorkflow`).
3.  **Components (`src/components`)**: 
    *   **Admin**: Complex editors for news and advertising management.
    *   **Common**: Shared UI elements (Modals, Toasts, Buttons).
    *   **Blocks**: Dynamic content blocks for the news engine (Engagement, Media, Text).
4.  **Repositories/Providers (`src/providers`)**: Context providers managing global state like the `AppControllerProvider` and `DialogProvider`.

### Technical Stack
*   **Framework**: Next.js / React (TypeScript)
*   **Styling**: Tailwind CSS
*   **Storage**: Supabase (PostgreSQL) + IndexedDB (Local cache)
*   **Media**: Cloudinary (Video/Images) + Vimeo/YouTube Integration
*   **Deployment**: Custom FTP/Vercel deployment scripts (`deploy_v2.js`)

---

## 📑 Key Domain Concepts

### 1. News & Content Engine
The system uses a block-based editor (`src/components/admin/editor`). Content is structured into `ContentBlock` items, allowing for dynamic layouts including:
*   **Engagement Blocks**: Polls, accordions, and interactive elements.
*   **Media Blocks**: Support for local uploads, YouTube metadata, and smart playback.

### 2. Advertising System
A robust ad management system supporting:
*   **AdPlans**: Tiered subscription models for advertisers.
*   **Placements**: Defined regions across the site (banners, popups, showcases).
*   **Popup Builder**: A specialized generator for creating high-impact visual ads.

### 3. User Roles & Permissions
Managed via `UserRole` (Admin, Editor, Advertiser, User). Access is controlled through the `useFieldPermissions` hook and the `RoleSelectionModal` workflow.

---

## 🛠️ Internal Tooling

The repository includes several utility scripts for maintenance:
*   `inspect_ftp.js`: Validates remote file integrity.
*   `audit_rules.js`: Checks codebase against architectural standards.
*   `verify_supabase.js`: Tests database connectivity and schema health.
*   `clean_console_logs.cjs`: Pre-deployment cleanup utility.

---

## ✍️ Contribution Guidelines for Docs

Documentation is "living." When implementing new features or changing logic:
1.  Update the corresponding `.md` file in this directory.
2.  Reflect any new domain terms in [Glossary & Domain Concepts](./glossary.md).
3.  Ensure code examples in docs match the latest TypeScript interfaces found in `src/types`.
