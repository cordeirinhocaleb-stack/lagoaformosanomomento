# Plano 1 [remodelação]

Status: EM PLANEJAMENTO

## Objetivo
Realizar uma auditoria completa em todos os arquivos do projeto para identificar violações das regras de "Bom Código" (arquivos > 400 linhas, uso de `any`, falta de modularidade) e propor uma reestruturação profunda.

## Auditoria Concluída
A auditoria identificou os seguintes pontos críticos que violam as regras de "Bom Código":

### 1. Arquivos no Limite ou Excedendo (Target: 400 linhas)
Embora a maioria esteja abaixo de 400, os seguintes estão "no limite" e com alta complexidade:
- **NewsDetailPage.tsx** (377 linhas) - Precisa de extração de sub-componentes.
- **EditorBannerNew.tsx** (368 linhas) - Lógica de edição muito densa.
- **GalleryLayouts.tsx** (360 linhas) - Muitos layouts em um só arquivo.
- **popupThemeCatalog.ts** (364 linhas) - Lista de temas muito grande, deve ser dividida por categorias.
- **commercialOperations.ts** (350 linhas) - Lógica de negócio pesada, deve ser dividida em handlers menores.

### 2. Uso Extensivo de `any`
Identificado em áreas críticas de segurança e dados:
- **Services**: `cloudinaryService.ts`, `contentService.ts`, `commercialOperations.ts`.
- **Hooks**: `useAuthRegistration.ts`, `useDataHandlers.ts`.
- **Mappers**: `contentMappers.ts`, `mappers.ts`.
- **Renderers**: Todos os renderers de bloco (`RenderHeading`, `RenderParagraph`, etc) usam `block.settings as any`.

### 3. Falta de Modularidade em Serviços
- `syncService.ts` e `commercialOperations.ts` misturam persistência, validação e lógica de negócio.

## Proposta de Reestruturação

### Fase 1: Limpeza de Tipos (Segurança)
- Substituir `any` por tipos específicos em `src/services/content` e `src/services/users`.
- Implementar interfaces rigorosas para `block.settings`.

### Fase 2: Decomposição de Componentes
- **EditorBannerNew.tsx**: Extrair `BannerSettingsPanel` e `BannerPreview`.
- **NewsDetailPage.tsx**: Extrair `ArticleBody`, `ArticleMetadata` e `ArticleSidebar`.

### Fase 3: Modularização de Logica de Negócio
- Dividir `commercialOperations.ts` em `creditsOperations.ts`, `subscriptionOperations.ts` e `resourceUsage.ts`.
- Dividir `popupThemeCatalog.ts` em arquivos menores por categoria.
