# Lagoa Formosa no Momento - Documentação Técnica

Bem-vindo ao centro de documentação do projeto **Lagoa Formosa no Momento**. Este documento serve como o ponto de entrada principal para desenvolvedores e mantenedores, descrevendo a arquitetura do sistema, os principais módulos e os padrões de desenvolvimento adotados.

## 🧭 Mapa de Navegação

Para detalhes específicos, consulte os guias especializados:

| Guia | Conteúdo |
| :--- | :--- |
| [Arquitetura](./architecture.md) | Detalhes sobre camadas, dependências e decisões de design (ADRs). |
| [Fluxo de Dados](./data-flow.md) | Integração com Supabase, Cloudinary e sincronização offline. |
| [Glossário e Domínio](./glossary.md) | Definições de termos como *AdPlans*, *Placements* e *Engagement*. |
| [Segurança e Permissões](./security.md) | Implementação de RBAC e segurança de rotas. |
| [Guia de Ferramentas](./tooling.md) | Scripts de automação, CLI e utilitários de deploy. |

---

## 🏗️ Visão Geral da Arquitetura

O sistema é construído sobre uma arquitetura em camadas para garantir separação de interesses e escalabilidade:

### 1. Camada de Serviços (`src/services`)
Centraliza a lógica de negócio e integrações externas.
- **Core**: `PlatformService`, `NetworkService`, e `OfflineService`.
- **Conteúdo**: `newsService`, `youtubeService`, `engagementService`.
- **Infraestrutura**: `storageService` (IndexedDB/LocalStorage), `uploadService` (Cloudinary/Vimeo).

### 2. Controladores e Hooks (`src/hooks`)
Atuam como ponte entre o estado global e a interface de usuário.
- **Global**: `useAppController`, `useAuth`.
- **UI/Modais**: `useModals`, `useDialog`.
- **Fluxos Específicos**: `usePublishingWorkflow` para edição de notícias.

### 3. Componentes (`src/components`)
Organizados por domínio e complexidade:
- **Admin**: Editores complexos (`EditorCanvas`), gestão de anunciantes e configurações de sistema.
- **Blocks**: Sistema modular de conteúdo (Texto, Mídia, Engajamento).
- **Layout**: Cabeçalhos dinâmicos, menus de categoria e rodapés.
- **Common**: Componentes UI reutilizáveis (`Toast`, `ErrorBoundary`, `AuthModals`).

---

## 🛠️ Sistemas Core

### Engine de Notícias (Editor de Blocos)
O conteúdo das notícias é estruturado em `ContentBlock`. Isso permite uma composição dinâmica:
- **Mídia**: Suporte a vídeos (Vimeo/YouTube) com metadados automáticos e uploads locais.
- **Engajamento**: Enquetes, acordions e elementos interativos integrados diretamente no fluxo do texto.
- **Renderização**: Localizada em `src/components/admin/editor/blocks/textblock/render`.

### Ecossistema de Publicidade
Um motor de anúncios robusto que gerencia:
- **AdPlans**: Configurações de preços e ciclos de faturamento para anunciantes.
- **Popup Builder**: Um gerador visual de popups com suporte a efeitos especiais, transições e filtros de página.
- **Showcase**: Exibição de produtos e serviços de anunciantes.

### Gestão de Estado e Offline
A aplicação utiliza o `OfflineService` e um adaptador de armazenamento (`StorageAdapter`) para garantir que rascunhos e arquivos locais não sejam perdidos em falhas de conexão, utilizando IndexedDB para persistência de arquivos pesados.

---

## 🔑 APIs e Tipos Públicos

Abaixo estão as principais interfaces de domínio utilizadas no sistema:

- `NewsItem`: Estrutura principal de uma notícia, incluindo blocos de conteúdo e metadados de distribuição social.
- `Advertiser`: Dados do parceiro comercial, incluindo seus produtos e planos ativos.
- `AdPlanConfig`: Define as regras de visibilidade e recursos disponíveis para cada nível de anúncio.
- `UserRole`: Define o acesso via RBAC (`Admin`, `Editor`, `Advertiser`, `User`).

---

## 🚀 Utilitários e Automação

O diretório `src/scripts` contém ferramentas essenciais para manutenção do código:

- **Auditoria**: `audit_admin.js` para verificar a integridade dos componentes administrativos.
- **Deploy**: `deploy_v2.js` para orquestração de publicação via FTP/Vercel.
- **Database**: `verify_supabase.js` e `seed_test_news.js` para validação e população de dados de desenvolvimento.
- **Refatoração**: Scripts como `fix_perfect_compliance.js` para garantir padrões de importação e tipagem.

---

## 📝 Diretrizes de Contribuição

1.  **Tipagem**: Sempre utilize interfaces exportadas de `src/types`. Evite o uso de `any`.
2.  **Componentes**: Siga o padrão de separação entre lógica (hooks) e visual (componentes puros).
3.  **Documentação**: Ao criar um novo serviço ou módulo complexo, atualize o guia correspondente nesta pasta `docs/`.
4.  **Estilização**: Utilize exclusivamente as classes utilitárias do Tailwind CSS e o utilitário `cn` para concatenação condicional de classes.
