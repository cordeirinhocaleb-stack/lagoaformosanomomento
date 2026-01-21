# Glossary & Domain Concepts

The **Lagoa Formosa no Momento** platform is a digital media and advertising ecosystem specifically designed for the local context of Lagoa Formosa. The system bridges local journalism (News), community interaction (Engagement Blocks), and a self-service advertising marketplace (Advertisers).

---

## 1. Core Domain Entities

### News (Notícias)
The primary content type of the platform. News items are modular and composed of various blocks.
*   **NewsItem:** The root data structure containing metadata (SEO, author, category) and an array of content.
*   **ContentBlock:** Individual units of content within an article, such as `TextBlock`, `ImageBlock`, `VideoBlock`, or `GalleryBlock`.
*   **Daily Bread (Pão Diário):** A specialized content segment for daily inspirational or religious messages, managed via `DailyBreadData`.

### Advertisers (Anunciantes)
Businesses or individuals who purchase visibility on the platform.
*   **Advertiser:** The profile entity containing brand assets, contact info, and linked products.
*   **Ad Plan:** Tiered subscription models (`BASIC`, `PREMIUM`, etc.) that dictate where and how often ads appear.
*   **Placement:** The specific location on the site where an ad is displayed (e.g., Sidebar, Mid-Article, Homepage Hero).

### Engagement (Engajamento)
Interactive modules designed to increase user dwell time and gather community feedback.
*   **Engagement Block:** UI components like Polls (Enquetes), Quizzes, or Feedback forms embedded directly into NewsItems.
*   **Social Hub:** A centralized view of platform interactions and social distributions.

---

## 2. Technical Type Definitions

Key interfaces used across the codebase for type safety and data consistency.

| Type / Interface | Location | Description |
| :--- | :--- | :--- |
| `NewsItem` | `types/news.ts` | The core article structure including `ContentBlocks`. |
| `Advertiser` | `types/ads.ts` | Profile for business entities and their active products. |
| `User` | `types/users.ts` | Identity object including `UserRole` and `UserStatus`. |
| `AdPlanConfig` | `types/ads.ts` | Configuration for pricing, duration, and feature sets of ad plans. |
| `PromoPopupConfig`| `types/ads.ts` | Settings for high-impact modal advertisements. |
| `AuditLog` | `types/system.ts` | Records of administrative actions for compliance. |
| `ContentBlock` | `types/news.ts` | Union type for all possible article components. |

---

## 3. Enumerations & Constants

### User Access Control
*   **UserRole:**
    *   `ADMIN`: Full system access, billing management, and auditing.
    *   `EDITOR`: Can create, edit, and publish news content.
    *   `ADVERTISER`: Access to the self-service ad dashboard and popup builder.
    *   `USER`: Standard reader with engagement privileges.

### Content Lifecycle
*   **PublishStatus:**
    *   `DRAFT`: Content in progress, not visible to the public.
    *   `REVIEW`: Content awaiting editorial approval.
    *   `PUBLISHED`: Live content accessible to users.
    *   `ARCHIVED`: Content removed from public view but retained in the DB.

### Advertising Logic
*   **BillingCycle:** `MONTHLY`, `QUARTERLY`, `YEARLY`.
*   **BannerLayout:** `HORIZONTAL`, `VERTICAL`, `SQUARE`.

---

## 4. Key Platform Features

### Popup Builder
A specialized WYSIWYG tool within the Advertiser dashboard. It allows non-technical users to create animated modal ads using `PromoPopupConfig`. It supports custom triggers (on load, on scroll) and visual themes.

### Smart Playback
Located in `utils/smartPlaybackGenerator.ts`, this logic optimizes video delivery. It determines the best video segments and quality to load based on the user's current network conditions to prevent buffering.

### Role Wizard
A specialized onboarding flow that greets new users and helps them identify their intent (e.g., "I want to read news" vs "I want to advertise my business"), streamlining the registration process.

### Chroma Key Video
Advanced video components (found in `components/media/ChromaKeyVideo.tsx`) that support background transparency. These are primarily used for the "Digital Human" news presentation style, allowing presenters to appear overlaid on dynamic content.

### Offline Service
Managed via `services/offlineService.ts`, this uses **IndexedDB (IDB)** to store local drafts and cached content. This ensures journalists can continue working on articles even with unstable internet connectivity.

---

## 5. Personas / Actors

*   **Local Reader:** Residents of Lagoa Formosa seeking real-time news. They value fast load times and community interaction.
*   **Local Advertiser:** Small business owners using the self-service tools to reach the local population.
*   **Journalist/Editor:** The primary content creators who utilize the CMS blocks to build rich news stories.
*   **System Admin:** Technical overseers who manage the platform health, user permissions, and global settings.

---

## 6. Domain Rules & Invariants

*   **Validation Integrity:** A `NewsItem` cannot be transitioned to `PUBLISHED` status unless it has a valid title, a thumbnail, and at least one `ContentBlock`.
*   **Ad Exclusivity:** Premium placements are governed by rules preventing market saturation (e.g., only one active "Real Estate" popup per session).
*   **Media Sanitization:** All uploads must pass through `sanitizationService.ts` to strip potentially malicious metadata and ensure standard file formatting.
*   **Localization:** The platform is strictly optimized for `pt-BR`. Currency is handled in BRL (R$), and all timestamps default to Brasília Time (GMT-3).

---

## 7. Acronyms & Abbreviations

*   **CMS:** Content Management System (the `/admin` dashboard).
*   **SEO:** Search Engine Optimization (metadata for Google/Social sharing).
*   **POS:** Point of Sale (related to subscription billing and user panels).
*   **TOC:** Table of Contents (dynamic navigation for long articles).
*   **WYSIWYG:** What You See Is What You Get (the visual editor experience).
