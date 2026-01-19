# Glossary & Domain Concepts

The **Lagoa Formosa no Momento** platform is a digital media and advertising ecosystem specifically designed for the local context of Lagoa Formosa. The domain model bridges the gap between local journalism (News), community engagement (Engagement Blocks), and a self-service advertising marketplace (Advertisers).

Key entities include:
*   **News (Notícias):** The core content type, consisting of articles, galleries, and videos.
*   **Advertisers (Anunciantes):** Business entities that purchase "Plans" to display "Banners" or "Popups" across the site.
*   **Engagement (Engajamento):** Interactive modules embedded within news articles, such as polls, quizzes, or feedback forms.
*   **Role Wizard:** A specialized onboarding flow that helps users identify their relationship with the platform (Reader, Advertiser, or Contributor).

## Type Definitions

Key interfaces and types used across the system:

*   **User Management**
    *   [`User`](../src/types/users.ts): Core user profile containing identity, role, and status.
    *   [`UserSession`](../src/types/users.ts): Structure for active authentication sessions and JWT data.
    *   [`Invoice`](../src/types/users.ts): Billing records for advertisers and subscribers.
*   **Content & Media**
    *   [`NewsItem`](../src/types/news.ts): The primary data structure for news articles, including SEO metadata and content blocks.
    *   [`ContentBlock`](../src/types/news.ts): A union type representing different components within an article (Text, Image, Video, Gallery).
    *   [`DailyBreadData`](../src/types/news.ts): Specific data structure for daily inspirational or religious content segments.
*   **Advertising & Marketing**
    *   [`Advertiser`](../src/types/ads.ts): Profile for businesses, including branding and active products.
    *   [`AdPlanConfig`](../src/types/ads.ts): Configuration for subscription-based or one-time advertising tiers.
    *   [`PromoPopupConfig`](../src/types/ads.ts): Detailed settings for the "Pop-up" advertising system, including display triggers and visual themes.
*   **System & Operations**
    *   [`AuditLog`](../src/types/system.ts): Records of administrative actions for compliance and debugging.
    *   [`ErrorReport`](../src/types/system.ts): Standardized structure for tracking runtime exceptions and UI crashes.

## Enumerations

Values that define the state and behavior of domain entities:

*   **User & Access**
    *   `UserRole`: `ADMIN`, `ADVERTISER`, `EDITOR`, `USER` (Defines permission levels).
    *   `UserStatus`: `ACTIVE`, `PENDING`, `SUSPENDED`.
*   **Content Lifecycle**
    *   `PublishStatus`: `DRAFT`, `REVIEW`, `PUBLISHED`, `ARCHIVED` (Used in `usePublishingWorkflow.ts`).
    *   `EngagementType`: `POLL`, `QUIZ`, `FEEDBACK`, `ACTION` (Types of interactive blocks).
*   **Advertising Logic**
    *   `AdPlan`: `FREE`, `BASIC`, `PREMIUM`, `ENTERPRISE`.
    *   `BillingCycle`: `MONTHLY`, `QUARTERLY`, `YEARLY`.
    *   `BannerLayout`: `HORIZONTAL`, `VERTICAL`, `SQUARE`.
    *   `PlacementStatus`: `ACTIVE`, `EXPIRED`, `SCHEDULED`.

## Core Terms

*   **Engagement Block:** A reusable UI component that can be injected into any article to drive user interaction (e.g., a "Rate this news" widget).
*   **Editorial Style:** A set of visual presets (fonts, spacing, colors) defined in the `EditorialTextSettings` used by the CMS to ensure brand consistency.
*   **Popup Builder:** A specialized tool for advertisers to create high-impact modal advertisements with custom triggers and animations.
*   **Smart Playback:** A video delivery optimization logic that determines the best quality and segment loading based on network conditions (found in `smartPlaybackGenerator.ts`).
*   **Role Wizard:** The entry-point experience for new users that steers them toward becoming a reader, an advertiser, or a professional collaborator.
*   **Chroma Key Video:** Specialized video components supporting transparency or background replacement, primarily used in the "Digital Human" news presentation.

## Acronyms & Abbreviations

*   **CMS:** Content Management System (Refers to the `/admin` area of the application).
*   **POS:** Point of Sale (Used in the context of user subscription panels and billing).
*   **TOC:** Table of Contents (Automatically generated for long-form news articles).
*   **IDB:** IndexedDB (Used by the `OfflineService` to store local drafts).
*   **SEO:** Search Engine Optimization (Metadata handled within `NewsItem` and `SiteData`).

## Personas / Actors

*   **Local Reader:** Residents of Lagoa Formosa seeking real-time news. They value fast load times, offline access for areas with poor connectivity, and community interaction.
*   **Local Advertiser:** Small to medium business owners. They need a simple, self-service way to create ads (Popups/Banners) without technical expertise.
*   **Editor/Journalist:** Staff members responsible for content creation. They require a robust "What You See Is What You Get" (WYSIWYG) editor and media management tools.
*   **Administrator:** System overseers who manage user permissions, review billing, and audit system logs.

## Domain Rules & Invariants

*   **Publishing Workflow:** A `NewsItem` cannot be `PUBLISHED` unless it contains at least one `ContentBlock` and a valid `BannerEffect`.
*   **Ad Exclusivity:** Certain "Premium" ad placements are limited to one active advertiser per category to avoid market saturation.
*   **Offline Integrity:** Content saved in the `OfflineService` (IndexedDB) must be synchronized with the remote database using a "Last-Write-Wins" strategy unless a version conflict is detected.
*   **Localization:** All currency displays must follow the `pt-BR` locale (BRL - R$), and timezones are strictly anchored to Brasília Time (GMT-3).
*   **Media Sanitization:** All user-uploaded media must pass through the `sanitizationService` to strip malicious metadata and ensure format compatibility.

## Related Resources

*   [Project Overview](./project-overview.md) - For a high-level view of the application architecture.
