# SYMBOLS TREE

Mapa de símbolos (classes, variáveis, hooks, services, schemas, tipos) para evitar duplicidade e garantir organização.

## 1) Containers & Pages
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `App` | Container | Main application entry point and view router | `src/App.tsx` | [CLIENT-ONLY] |
| `Home` | Page | Landing page | `src/components-pages/Home.tsx` | |
| `Admin` | Page | Dashboard for admins | `src/components-pages/Admin.tsx` | [SECURITY-CRITICAL] |
| `NewsDetailPage` | Page | Internal article view | `src/components-pages/news-detail/NewsDetailPage.tsx` | |
| `Jobs` | Page | Job listings | `src/components-pages/Jobs.tsx` | |

## 2) Layout Components
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `Header` | Component | Site header with navigation | `src/components/layout/Header.tsx` | |
| `Footer` | Component | Site footer | `src/components/layout/Footer.tsx` | |
| `GlobalModals` | Component | Encapsulates all global modals | `src/components/common/GlobalModals.tsx` | [REFAC] |
| `NewsPagination` | Component | Pagination UI for news grid | `src/components/news/Pagination/NewsPagination.tsx` | [NEW] |
| `UserLinker` | Component | User search/link for Ads editor | `src/components/admin/advertisers/editor/components/UserLinker.tsx` | [NEW] |
| `PopupEffectsEditor` | Component | FX editor for popups | `src/components/admin/advertisers/popupBuilder/components/PopupEffectsEditor.tsx` | [NEW] |
| `MediaBlockOverlays` | Component | Overlays for MediaBlock UI | `src/components/admin/editor/blocks/components/MediaBlockOverlays.tsx` | [NEW] |
| `MediaSourceSection` | Component | Source selection for PopupMediaPanel | `src/components/admin/advertisers/popupBuilder/components/MediaSourceSection.tsx` | [NEW] |
| `MediaVisualSection` | Component | Visual settings for PopupMediaPanel | `src/components/admin/advertisers/popupBuilder/components/MediaVisualSection.tsx` | [NEW] |

## 3) Hooks & Contexts
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `useApp` | Hook | Main state controller | `src/providers/AppControllerProvider.tsx` | [CLIENT-ONLY] |
| `DialogProvider` | Provider | Global modal/dialog state | `src/providers/DialogProvider.tsx` | |
| `useAppConfirmation` | Hook | Confirmation logic extraction | `src/hooks/useAppConfirmation.ts` | [REFAC] |
| `useAppErrorHandler` | Hook | centralized error handling | `src/hooks/useAppErrorHandler.ts` | [REFAC] |
| `useAppCrudHandlers` | Hook | news/user/ad CRUD logic | `src/hooks/useAppCrudHandlers.ts` | [REFAC] |
| `useAppDerivedData` | Hook | Memoized UI data | `src/hooks/useAppDerivedData.ts` | [REFAC] |
| `useHomeNews` | Hook | News normalization/filtering logic | `src/hooks/home/useHomeNews.ts` | [NEW] |
| `useMediaBlock` | Hook | Logic for MediaBlock component | `src/components/admin/editor/blocks/hooks/useMediaBlock.ts` | [NEW] |
| `usePopupMedia` | Hook | Logic for PopupMediaPanel component | `src/components/admin/advertisers/popupBuilder/hooks/usePopupMedia.ts` | [NEW] |

## 4) Services
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `supabaseService` | Service | Client for Supabase DB | `src/services/supabaseService.ts` | [SECURITY-CRITICAL] |
| `geminiService` | Service | AI integration | `src/services/geminiService.ts` | |
| `adService` | Service | Ads management | `src/services/adService.ts` | |
| `cloudinaryService`| Service | Image uploads | `src/services/cloudinaryService.ts` | |

## 5) Types & Constants
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `AuditLog` | Type | Schema for audit logs | `src/types/index.ts` | |
| `CURRENT_VERSION` | Constant | App versioning | `src/providers/AppControllerProvider.tsx` | |

> [!NOTE]
> Este arquivo deve ser atualizado sempre que um novo símbolo relevante for criado.
