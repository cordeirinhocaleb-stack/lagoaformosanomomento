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

### Tipos de Domínio - News
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `NewsItem` | Interface | Estrutura principal de notícia | `src/types/news.ts:L45` | [CORE] |
| `ContentBlock` | Interface | Bloco de conteúdo modular | `src/types/news.ts:L3` | [CORE] |
| `BannerEffect` | Interface | Efeitos visuais de banner | `src/types/news.ts:L23` | |
| `BannerVideoConfig` | Interface | Configuração de vídeo de banner | `src/types/news.ts:L32` | |
| `DailyBreadData` | Interface | Dados do "Pão Diário" | `src/types/news.ts:L136` | |
| `GalleryItem` | Interface | Item de galeria | `src/types/news.ts:L147` | |

### Tipos de Domínio - Ads
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `AdPlanConfig` | Interface | Configuração de planos de anúncio | `src/types/ads.ts:L5` | [CORE] |
| `AdPricingConfig` | Interface | Configuração de preços | `src/types/ads.ts:L276` | |
| `Advertiser` | Interface | Dados do anunciante | `src/types/ads.ts:L227` | [CORE] |
| `AdvertiserProduct` | Interface | Produto do anunciante | `src/types/ads.ts:L61` | |
| `Coupon` | Interface | Cupom de desconto | `src/types/ads.ts:L70` | |
| `MarketItem` | Interface | Item do marketplace | `src/types/ads.ts:L264` | |

### Tipos de Domínio - Users
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `UserRole` | Type | Roles de usuário do sistema | `src/types/users.ts:L2-11` | [CORE] |
| `User` | Interface | Dados do usuário | `src/types/users.ts:L15` | [CORE] |
| `UserSession` | Interface | Sessão de usuário | `src/types/users.ts:L90` | |
| `Invoice` | Interface | Fatura de usuário | `src/types/users.ts:L98` | |
| `USER_ROLES` | Constant | Lista oficial de roles | `src/components/admin/users/constants.ts:L4` | [CORE] |

#### Roles Disponíveis (9 total)
1. **Leitor** - Usuário comum, apenas leitura
2. **Desenvolvedor** - Equipe técnica
3. **Editor-Chefe** - Admin editorial
4. **Repórter** - Equipe editorial
5. **Jornalista** - Equipe editorial
6. **Estagiário** - Equipe editorial
7. **Anunciante** - Empresas/Anunciantes
8. **Empresa** - Alias de Anunciante (wizard público)
9. **Prestador de Serviço** - Freelancers/Bicos

### Tipos de Sistema
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `AuditLog` | Interface | Log de auditoria | `src/types/system.ts:L54` | [SECURITY-CRITICAL] |
| `ErrorReport` | Interface | Relatório de erro | `src/types/system.ts:L72` | |
| `Job` | Interface | Trabalho agendado | `src/types/system.ts:L6` | |

### Editor e Schemas
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `EditorialTextSettings` | Interface | Configurações de texto editorial | `src/components/admin/editor/schema/editorialTextSettings.ts:L101` | [SCHEMA] |
| `GlobalTextSettings` | Interface | Configurações globais de texto | `src/components/admin/editor/schema/editorialTextSettings.ts:L16` | [SCHEMA] |
| `HeadingSettings` | Interface | Configurações de cabeçalhos | `src/components/admin/editor/schema/editorialTextSettings.ts:L63` | [SCHEMA] |
| `FieldSchema` | Interface | Schema de validação de campo | `src/services/sanitizationService.ts:L210` | [SECURITY-CRITICAL] |
| `FieldPermission` | Interface | Permissão de campo | `src/hooks/useFieldPermissions.ts:L7` | [SECURITY-CRITICAL] |

### Upload e Mídia
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `CloudinaryUploadProgress` | Interface | Progresso de upload Cloudinary | `src/services/upload/cloudinaryVideoService.ts:L21` | |
| `CloudinaryUploadResult` | Interface | Resultado de upload Cloudinary | `src/services/upload/cloudinaryVideoService.ts:L11` | |

### Constantes
| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `CURRENT_VERSION` | Constant | App versioning | `src/providers/AppControllerProvider.tsx` | [CORE] |

## 6) Classes Core

| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `ErrorBoundary` | Class | Captura de erros React | `src/components/common/ErrorBoundary.tsx:L13` | [CLIENT-ONLY] |
| `PlatformService` | Class | Abstração de plataforma | `src/services/platformService.ts:L6` | [CORE-SERVICE] |
| `NetworkService` | Class | Gerenciamento de rede | `src/services/platformService.ts:L36` | [CORE-SERVICE] |
| `OfflineService` | Class | Sincronização offline | `src/services/offlineService.ts:L62` | [CORE-SERVICE] |
| `DebugLogger` | Class | Logging estruturado | `src/services/core/debugLogger.ts:L3` | [INTERNAL] |
| `StorageAdapter` | Class | Adaptador de armazenamento | `src/services/offlineService.ts:L25` | [INTERNAL] |

## 7) Utilitários

| SymbolName | Kind | Purpose | FilePath | Notes |
|------------|------|---------|----------|-------|
| `cn` | Function | Concatenação de classes Tailwind | `src/utils/cn.ts:L4` | [UTILITY] |
| `clearAllFiles` | Function | Limpar storage | `src/services/storage/localStorageService.ts:L149` | [STORAGE] |

> [!NOTE]
> Este arquivo deve ser atualizado sempre que um novo símbolo relevante for criado.

> [!IMPORTANT]
> Símbolos marcados com `[SECURITY-CRITICAL]` requerem atenção especial em code reviews.
