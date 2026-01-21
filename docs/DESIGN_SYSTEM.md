# DESIGN SYSTEM - LFNM

Guia oficial do padrão visual do site.

## 1) Cores
Baseadas no `tailwind.config.js`.

| Nome | Valor Hex | Uso |
|------|-----------|-----|
| `Primary-800` | `#9f1239` | **LFNM Red** - Cor principal da marca |
| `Primary-500` | `#f43f5e` | Hover / Destaques |
| `Zinc-950` | `#09090b` | Fundo Dark Mode |
| `Gray-50` | `#f9fafb` | Fundo Light Mode |

## 2) Tipografia
- **Sans-serif:** Inter (`sans-serif`) - Principal para conteúdo e UI.
- **Serif:** Merriweather (`serif`) - Títulos e artigos longos.

## 3) Espaçamentos & Layout
- **Container Máximo:** `max-w-7xl`
- **Padding padrão:** `px-4 sm:px-6 lg:px-8`

## 4) Animações

### Animações Principais
- `fade-in`: 0.5s ease-out
- `fade-in-up`: 0.5s ease-out com translação
- `slide-in`: 0.3s ease-out (X)
- `slideInRight`: Deslizar da direita para notificações
- `coin-spin`: 3s loop (scale + rotação) para cashback/recompensas
- `almost-fall`: Animação de quase queda para hover interativo

### Efeitos Especiais
- **police-sweep**: Efeito de luzes piscando (Red: #dc2626 | Blue: #2563eb)
  - Uso: Banners de urgência, notícias de última hora
  - Duração: 2s loop

## 5) Componentes UI
- **Botões:** Devem seguir o padrão LFNM Red para ações primárias.
- **Modais:** Devem usar o `DialogProvider` e centralizar em `AuthModalsContainer` ou hooks específicos.

## 6) Stack Tecnológica
- **CSS Framework**: Tailwind v3 (CDN)
- **Database/Auth**: Supabase
- **Mídia**: Cloudinary (imagens/vídeos)
- **Vídeos Externos**: YouTube API

## 7) Versionamento e Sincronização

### Database Sync
Mudanças em tabelas exigem atualização imediata de:
- Arquivo .sql (Schema)
- Policies (RLS)
- Documentação técnica de banco

### Incremento de Versão
- Formato: +0.0.1 (Build +1)
- Atualizar em: App.tsx, package.json e VERSION.md
- Pipeline: Local → Staging (https://dev.webgho.com) → Produção

> [!IMPORTANT]
> É PROIBIDO criar UI nova sem seguir esse padrão. Consulte os componentes existentes em `src/components/common` antes de criar novos.

> [!NOTE]
> Sempre que atualizar este arquivo, incremente a versão e atualize o CHANGELOG.md
