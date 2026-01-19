# Resumos de Modificações

Registro cronológico de todas as modificações significativas realizadas no projeto.

## [2026-01-19] - Build 11
- **PopupMediaPanel.tsx**: Refatorado para usar `usePopupMedia` hook e componentes secionais (`MediaSourceSection`, `MediaVisualSection`).
- **MediaBlock.tsx**: Refatorado para usar `useMediaBlock` hook e `MediaBlockOverlays`.
- **PopupThemePanel.tsx**: Extraído `PopupEffectsEditor.tsx`.
- **GeneralSection.tsx**: Extraído `UserLinker.tsx`.
- **Home.tsx**: Lógica de notícias movida para `useHomeNews.ts`.
- **GlobalModals.tsx**: Centralização de modais globais.

## [2026-01-19] - Build 12
- **EditorBannerNew.tsx**: Refatorado (368 -> 341 linhas) com extração de lógica para `useEditorBanner.ts`.
- **UserDetailModal.tsx**: Refatorado (331 -> 201 linhas) com extração de lógica para `useUserDetails.ts`.
- **SocialHubTab.tsx**: Refatorado (314 -> 227 linhas) com extração de lógica para `useSocialHub.ts`.
- **UsersTab.tsx**: Refatorado (306 -> 207 linhas) com extração de lógica para `useUsersTab.ts`.
- **Hooks Admin**: Criação e integração de hooks especializados para melhor separação de interesses e tipagem.
- **Linha de Base**: Todos os componentes admin agora respeitam o limite de 400 linhas sugerido pelo processo "Bom Código".
