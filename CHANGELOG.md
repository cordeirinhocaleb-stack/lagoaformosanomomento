
# 📝 Registro de Edições e Revisões - LFNM


## 0.2.1 (Build 229) - 21/01/2026 02:00
### 🎨 UI/UX & Admin Dark Mode
- **Standardized Dark Mode**: Implementada padronização visual em todo o painel administrativo.
- **Dashboard & Core**: Refatoração de cores e backgrounds no `DashboardTab` e `UsersTab`.
- **Modals overhauled**: `YouTubeConfigModal` e modais de edição de anunciantes totalmente adaptados para o tema escuro.
- **Settings module**: Atualizados `FeatureSettings` e `FooterSettings` com toggles e inputs corrigidos.

---

## 0.0.7 (Build 01) - 15/01/2026 22:50
### 🎨 Branding & Refatoração (Law #1)
- **Marca d'água Premium**: Implementação de selo físico com moldura vermelha editorial e tag "2026".
- **Refactor Core**: Desmembramento de componentes gigantes (Uploader e Galeria) para cumprir a lei de 500 linhas.
- **Image Intelligence**: Novo processador de imagem via Canvas isolado em service.

---

## 0.0.6 (Build 03) - 12/01/2026 22:50
### 🛡️ Segurança & Persistência
- **Navigation Guard**: Implementada barreira de proteção no Editor. Impede que o redator perca o trabalho ao clicar acidentalmente em "Voltar" ou fechar o navegador.
- **Gallery Persistence Fix**: Resolvido problema onde galerias de imagem apareciam vazias após salvar. O sistema de sync agora processa corretamente filas de upload mistas (Capa + Conteúdo + Galeria).

---

## 0.0.3 (Build 02) - 10/01/2026 23:58
### 🚀 Refatoração & Segurança (Core)
- **Remoção Mobile Permanente**: Exclusão da pasta `android` e remoção de todas as dependências do Capacitor. Refatoração de `PlatformService` e `OfflineService` para arquitetura 100% Web.
- **Segurança (Hardening XSS)**: Implementação de sanitização de HTML via `DOMPurify` em `ArticleContent.tsx`, `NewsCard.tsx` e `SmartBlockRenderer.tsx`, bloqueando vulnerabilidades de injeção.
- **Modularização Admin**: Desmembramento de grandes componentes (`EngagementEditorBlock`, `GalleryEditorBlock` e `InspectorSidebar`) em sub-componentes especializados, garantindo que nenhum arquivo exceda o limite de 400-500 linhas.
- **Tipagem Estrita (Folder Audit)**: Auditoria completa na pasta `components/admin` com a remoção de mais de 80 ocorrências de `: any`, substituindo-os por `unknown` ou interfaces específicas.
- **Acessibilidade**: Implementação de `aria-labels` e atributos `title` em elementos interativos dos novos editores modulares (Gallery, Polls, Sidebar).
- **Versionamento**: Incremento de Build para `0.0.3 (Build 02)`.

---

## Alpha 1.105 (06/01/2026 19:00)
### 🔄 Remodelado
- **Sistema de Temas de Widgets**: Remodelação completa do sistema de aplicação de temas. Criado componente dedicado `SmartBlockRenderer` que usa `useEffect` para detectar mudanças em `editorialVariant` e aplicar estilos diretamente ao DOM do widget, garantindo atualização visual imediata.
- **EditorContent.tsx**: Simplificado o case `smart_block` para usar o novo componente `SmartBlockRenderer`, removendo toda lógica inline complexa e logs de debug.
- **Versionamento**: Incremento de versão global para 1.105.

---

## Alpha 1.104 (06/01/2026 18:40)
### 🐛 Corrigido
- **Editor de Widgets**: Corrigido bug onde temas editoriais não eram aplicados visualmente aos widgets no `EditorContent`. Adicionada `key` única que inclui o `editorialVariant` para forçar re-renderização do React quando o tema é alterado.
- **Versionamento**: Incremento de versão global para 1.104.

---

## Alpha 1.103 (04/01/2026 14:17)
### ♻️ Modificado
- **Configuração do Antigravity**: Tradução completa dos arquivos `metadata.json` e `README.md` para Português, conforme solicitação do usuário.
- **Versionamento**: Incremento de versão global para 1.103.

---

## Alpha 1.089 (06/01/2026 07:20)
### ♻️ Modificado
- **Layout Mobile**: Alterado o grid de notícias da Home para exibir **2 colunas** lado a lado em dispositivos móveis (antes era 1 coluna), otimizando a visualização de múltiplas manchetes.

---

## Alpha 1.088 (06/01/2026 07:10)
### ♻️ Modificado
- **Paginação Responsiva**: A quantidade de notícias na Home agora se adapta ao dispositivo:
  - **PC**: 18 notícias.
  - **Tablet**: 12 notícias.
  - **Celular**: 8 notícias.
- Ajustada lógica de recálculo de páginas para evitar índices inválidos ao redimensionar a tela.
