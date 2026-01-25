# Architecture: Triunfo Mineração - KP Fértil

> [!IMPORTANT]
> This document is the **Source of Truth (SOT)** for the application's architecture. Any major changes to hooks, services, pages, or database tables must be reflected here.

## Navigation & Routes

| View | Component | Description |
| :--- | :--- | :--- |
| `HOME` | `HomeView` | Welcome screen with quick access modules. |
| `DASHBOARD` | `Dashboard` | Admin control panel, metrics, and data management. |
| `CLIENTS` | `ClientsView` | Customer list and location management. |
| `ORDERS` | `OrdersView` | **(Current Focus)** Order management and tracking. |
| `WEIGHING` | `WeighingView` | Balance records and dispatch control. |
| `SCHEDULING` | `SchedulingView` | Loading schedules and logistics. |
| `GATE` | `GateView` | Security/Gate control for truck entry. |
| `FINANCIAL` | `FinancialView` | Billing and accounting integration. |
| `MY_ACCOUNT` | `MyAccountView` | User profile and preferences. |

---

## Current Architecture (Monolith)

The application currently operates as a feature-rich monolith where `App.tsx` manages the majority of the global state and logic, distributing it via props to lazy-loaded views.

```mermaid
graph TD
    App[App.tsx (God Component)]
    App -->|Props: products, users...| Dashboard
    App -->|Props: clients, orders...| ClientsView
    App -->|Props: orders...| OrdersView
    App -->|Props: records...| WeighingView

    App --Owns--> State[Global State (All Data)]
    App --Owns--> Logic[Business Logic & Handlers]
    App --Owns--> Fetch[useSupabaseTable (Internal Hook)]

    subgraph Services
        Supabase[Supabase Client]
    end

    App --> Supabase
```

## Target Architecture (Modular)

Transitioning towards a context-based and hook-driven architecture to improve maintainability and performance.

```mermaid
graph TD
    Root[App.tsx (Router/Layout)]

    subgraph Contexts
        AuthCtx[AuthContext]
        DataCtx[DataContext]
    end

    subgraph Hooks
        useAuth
        useSupabaseTable
        useOrders
        useClients
    end

    Root --> AuthCtx
    Root --> DataCtx

    DataCtx --> useSupabaseTable

    Dashboard --> useOrders
    ClientsView --> useClients

    subgraph Dashboard_Module
        Dashboard[Dashboard (Main)]
        
        subgraph Dashboard_Hooks
            useRegistration
            useReports
            useInvoices
            useMaintenance
            useLinkMapping
            useHistory
        end
        
        Dashboard --> useRegistration
        Dashboard --> useReports
        Dashboard --> useInvoices
        Dashboard --> useMaintenance
        Dashboard --> useLinkMapping
        Dashboard --> useHistory

        Dashboard --> AnalyticsTab[AnalyticsTab]
        Dashboard --> ReportsTab[ReportsTab]
        Dashboard --> SettingsTab[SettingsTab]
        
        Dashboard --> RegistrationTabs[Registration Tabs (Products, Users, etc.)]
        RegistrationTabs --> GenericRegistrationTab
        
        AnalyticsTab --> AnalyticsCards[cards/AnalyticsCards]
        AnalyticsTab --> AnalyticsCharts[charts/AnalyticsCharts]
        AnalyticsTab --> SalespersonTable[analytics/SalespersonTable]
    end
```

---

## Database & Sync

- **Service**: Supabase (PostgreSQL).
- **Sync**: `useSyncQueue` handles offline operations and synchronization.
- **Policies**: Row Level Security (RLS) is applied to all sensitive tables.
