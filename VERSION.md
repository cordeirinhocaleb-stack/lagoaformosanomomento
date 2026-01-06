# CHANGELOG - Lagoa Formosa No Momento
# CHANGELOG - Lagoa Formosa No Momento

> [!NOTE]
> Este controle de versão é gerenciado automaticamente pela IA Antigravity.
> Mantenha este arquivo sincronizado com o `package.json` e `App.tsx`.

## 1.216 - 06/01/2026 19:00 (Ref: 060120261900)
- **Architecture:** Centralizada a definição de versão em `src/version.ts`. `App.tsx` e `ConstructionPage.tsx` agora consomem deste arquivo.
- **Fix Deploy:** Re-deploy com correção de Login Z-Index (v1.215 incluída).

## 1.215 - 06/01/2026 18:55 (Ref: 060120261855)
- **UI Fix:** Aumentado z-index do Modal de Login para `z-[10000]`, corrigindo bloqueio visual pela Camada de Construção (`z-9999`).
- **Stacking:** Movimentado `AuthModalsContainer` para camada superior no DOM tree.

## 1.214 - 06/01/2026 18:50 (Ref: 060120261850)
- **Bug Fix (Critico):** Corrigido bug onde o botão "Área Restrita" não abria o modal de login.
- **Refactor App:** Removida duplicação de estado de modais (`showLoginModal`) no `App.tsx`, centralizando a fonte da verdade no hook `useModals`.

## 1.213 - 06/01/2026 18:48 (Ref: 060120261848)
- **Auth (Critico):** Refatorado `AuthModalsContainer` para login transacional (evita login fantasma em Google OAuth).
- **Self-Healing:** Login agora detecta usuários sem perfil (com auth válida) e recria o registro no banco automaticamente.
- **Security:** Adicionada sanitização de inputs (XSS) no `userService.ts` para todos os campos de texto.
- **UX:** Limpeza automática de cache de formulário de cadastro após sucesso.

## 1.212 - 06/01/2026 18:35 (Ref: 060120261835)
- **Backup:** Sincronização e backup do estado atual do projeto para o GitHub.

## 1.211 - 06/01/2026 15:38 (Ref: 060120261538)
- **Bugfix:** Fix: Removida prop onCheckEmail problemática

## 1.210 - 06/01/2026 15:30 (Ref: 060120261530)
- **Debug:** Debug: Verificações de tipo explícitas e minificação desativada

## 1.209 - 06/01/2026 15:26 (Ref: 060120261526)
- **Sistema:** Teste do sistema de versionamento automatizado


## Histórico de Versões

## 1.208 - 06/01/2026 15:55 (Ref: 060120261555)
- **Manutenção:** Atualização de versão solicitada para limpeza de cache e validação de deploy.

## 1.207 - 06/01/2026 15:50 (Ref: 060120261550)
- **Melhoria (Debug):** Exibição detalhada de erros na tela de login/cadastro para facilitar diagnóstico. Adição de logs de console para rastreamento de fluxo.

## 1.206 - 06/01/2026 15:35 (Ref: 060120261535)
- **Melhoria (Resiliência):** Adicionado timeout e logs de erro detalhados na verificação de email durante o cadastro. Isso previne que a interface "congele" caso a validação demore demais.

## 1.205 - 06/01/2026 15:20 (Ref: 060120261520)
- **Bugfix (UI):** Correção de classes de animação CSS no `RoleSelectionModal` que impediam a exibição do formulário de cadastro após clicar em "Criar Conta".

## 1.204 - 06/01/2026 14:15 (Ref: 060120261415)
- **Bugfix (Audit Log):** Correção crítica na ordem dos argumentos do log de auditoria que causava erro 400 (Bad Request) ao salvar notícias, impedindo o fluxo de salvamento completo.

## 1.203 - 06/01/2026 12:30 (Ref: 060120261230)
- **Bugfix (DB Persistence):** Mapeamento do campo `banner_effects` corrigido no serviço de conteúdo para garantir que os efeitos sejam salvos no banco de dados.
- **Migration:** Arquivo `009_add_banner_effects` criado para adicionar a coluna necessária.

- **Bugfix (Editor):** Correção crítica na Galeria de Imagens que exibia thumbnails com efeitos duplicados. Agora o preview é independente para cada slot.

## 1.201 - 06/01/2026 11:30 (Ref: 060120261130)
- **Feature (Banner):** Implementação de efeitos individuais por imagem no banner (brilho, contraste, etc.). Interface refatorada com seleção de imagem e painel dedicado.
- **Persistence (Editor):** Migração inteligente de dados de efeitos para compatibilidade com versões anteriores.
- **Refactor:** Modularização completa do `EditorBannerNew.tsx` em subcomponentes independentes.

## 1.200 - 06/01/2026 11:18 (Ref: 060120261118)
- **Feature (Editor):** Preview em tempo real dos efeitos visuais (brilho, contraste, etc.) aplicados às imagens do banner.
- **UX (YouTube):** Adicionado aviso de desenvolvimento informando que upload para YouTube ainda não está integrado.
- **Bugfix (Editor):** Corrigido erro de sintaxe na tag `<img>` do preview de imagens.

## 1.199 - 06/01/2026 11:15 (Ref: 060120261115)
- **UI/UX (Editor):** Fusão das abas "Galeria" e "Efeitos". Controles de efeitos agora ficam dentro do painel de imagens para ajuste em tempo real.
- **Visual Fix (YouTube):** Correção de cor do texto (branco no branco) nos inputs de metadados do YouTube.
- **UX (Editor):** Reforço na exclusividade visual entre modos "Galeria" e "Cinema" (Vídeo).

## 1.198 - 06/01/2026 11:00 (Ref: 060120261100)
- **Feature (NewsManager):** Adicionados filtros "Postagens do Site", "Brasil" e "Mundo" com lógica de fallback para fontes.
- **Visual Refactor (ArticleHero):** Refinamento dos gradientes (mais suaves) e layouts Grid/Mosaic (bordas e espaçamento).
- **Feature (Editor):** Nova aba "Efeitos" no editor de banner com controles de Brilho, Contraste, Saturação, Blur, Sépia e Opacidade.
- **Bugfix (Carousel):** Correção da lógica de slideshow para respeitar `bannerImageLayout`, resolvendo bug que travava o carrossel.

## 1.197 - 06/01/2026 09:39 (Ref: 060120260939)
- **Versioning:** Sincronização global da versão com timestamp no rodapé.
- **UI Consistency:** Atualização do rodapé da Home e da página de construção.

## 1.196 - 06/01/2026
- **Bugfix (Auth):** Correção da função de logout no Painel Admin. Implementado `await sb.auth.signOut()` antes do reload para garantir limpeza da sessão no servidor.
- **Consistency:** Sincronização da versão v1.196 em todos os locais (App.tsx, package.json, ConstructionPage, VERSION.md).

## 1.195 - 06/01/2026
- **Bugfix (DB Mapping):** Correção do mapeamento camelCase -> snake_case para evitar erros de coluna inexistente (`bannerYoutubeMetadata`) no PostgREST.
- **Consistency:** Padronização do mapeamento de dados para `news`, `users`, `advertisers` e `social_posts`.

## 1.194 - 06/01/2026 09:21 (Ref: 060120260921)
- **Versioning:** Sincronização global da versão v1.194 com timestamp específico.
- **RLS Maintenance:** Validação final das políticas de segurança em todos os blocos.

## 1.193 - 06/01/2026
- **RLS Full Coverage:** Adicionadas políticas para tabelas de anúncios (`ad_plans`, `ad_prices`, etc.) e interações (`engagement_interactions`).
- **Performance:** Otimização de chamadas `check_user_role` em blocos dinâmicos.
- **Bugfix:** Correção de caracteres inválidos e sintaxe de escape SQL.

## 1.192 - 06/01/2026
- **Bugfix (DB):** Correção definitiva de todos os erros de sintaxe RLS (`error_reports` e outras tabelas).
- **Database:** Script `008_rls_redundancy_fix.sql` agora segue estritamente o padrão individual por ação exigido pelo Postgres.

## 1.191 - 06/01/2026
- **Bugfix (DB):** Correção do erro de sintaxe `42601` no script de RLS. O Postgres não permite múltiplas ações em um único `CREATE POLICY`.
- **Database:** Script `008_rls_redundancy_fix.sql` refatorado para compatibilidade total.

## 1.190 - 06/01/2026
- **RLS Optimization:** Resolução definitiva dos avisos de performance do Supabase (Avisos 0003 e 0006).
- **Consolidation:** Redução de sobreposição de políticas RLS em todas as tabelas (News, Ads, Jobs, Support).
- **Security:** Otimização dos planos de execução do Postgres para verificação de papéis (Subconsultas SELECT).
- **Database:** Novo script de migração `008_rls_redundancy_fix.sql`.

## 1.189 - 06/01/2026
- **Performance:** Otimização massiva de políticas RLS. Implementado o padrão `(SELECT auth.uid())` para evitar reavaliação por linha (Supabase Advisor 0003).
- **Consolidation:** Eliminação de políticas duplicadas e unificação das tabelas de auditoria (`audit_logs` -> `audit_log`).
- **Database:** Novo script de migração `007_rls_performance_optimized.sql`.

## 1.188 - 06/01/2026
- **Security Audit:** Recomendação de ativação do recurso "Leaked Password Protection" no Supabase Auth.
- **Documentation:** Adicionados passos manuais para configuração de segurança no painel do Supabase.

## 1.187 - 06/01/2026
- **Security:** Endurecimento de segurança nas funções do banco de dados. Aplicado `SET search_path = public` em todas as funções reportadas pelo Supabase Advisor para mitigar vulnerabilidades de injeção.
- **Database:** Criação do script de migração `006_fix_search_path_security.sql`.

## 1.186 - 06/01/2026
- **Dashboard:** Substituídos placeholders estáticos da "Atividade Recente" por dados reais sincronizados do banco de dados (Audit Log).
- **Core:** Implementada integração ponta-a-ponta de auditoria de sistema (Service -> App -> Dashboard).

## 1.185 - 06/01/2026
- **Fix (Migration):** Implementação de SQL Dinâmico (`EXECUTE`) no script de performance. Resolve o erro de compilação em bancos onde colunas específicas não existem, garantindo execução silenciosa e sem erros.
- **Cleanup:** Exclusão de arquivos residuais de migração.

## 1.184 - 06/01/2026
- **Fix (Migration):** Refatorado script `005_performance_indexes.sql` com blocos de validação de coluna. Resolve o erro `column "created_at" does not exist` em bancos que utilizam o padrão camelCase (`"createdAt"`).
- **Core:** Padronização de segurança em scripts SQL para evitar quebras em ambientes heterogêneos.

## 1.183 - 06/01/2026
- **Performance:** Implementação de índices avançados nas tabelas `news`, `jobs` e `audit_log`. Resolvidos gargalos de ordenação por data (`createdAt`/`created_at`) identificados em relatórios de consulta lenta, reduzindo drasticamente o tempo de resposta da Home e do Admin.
- **Database:** Criação do script de migração `005_performance_indexes.sql`.

## 1.182 - 06/01/2026
- **Security & Performance:** Consolidação de políticas RLS na tabela `users`. Removidas 4 políticas redundantes (`own_profile_update`, `admin_users_manage`, etc.) para resolver avisos de performance do Supabase Advisor redundantes para o papel `dashboard_user`.
- **Database:** Criação do script de migração `004_consolidate_users_rls.sql` para padronização de acessos administrativos.

## 1.181 - 06/01/2026
- **Fix (Admin):** Restaurado trigger de sincronização de dados após login (`SIGNED_IN`), resolvendo "notícias não aparecem no admin".
- **Fix (Admin):** Adicionada proteção contra nulos e falhas de data no `NewsManager` (evita crash com notícias RSS).
- **Fix (Admin):** Integração correta do módulo de Vagas (Jobs) no Dashboard administrativo.
- **Feature (Header):** Refinado filtro regional no Plantão (faixa vermelha) para exibir exclusivamente "Lagoa Formosa e região".
- **Core:** Ajuste no mapeamento de `source` para identificar corretamente notícias externas vs internas.

## 1.180 - 06/01/2026
- **Fix:** Resolução de erro UUID (`22P02`) na importação de notícias RSS via `crypto.randomUUID()`.
- **Fix:** Fallback robusto para credenciais do Supabase no `useAppInitialization` (evita 401 por cache corrompido).
- **Core:** Implementação de fallback automático para nomes de colunas (`created_at` vs `createdAt`) na busca de notícias.
- **Protocolo:** Sincronização de versão 1.180 em `App.tsx`, `package.json` e `VERSION.md`.

## 1.179 - 05/01/2026
- **Fix:** Correção crítica no fluxo de carregamento de dados (separação de dados públicos vs privados).
- **Core:** Ajuste no handler global de erros para não forçar logout em falhas de sessão (invalid_grant).
- **Security:** Usuários sem permissão recebem array vazio em vez de crashar o app.

## 1.178 - 05/01/2026
- **Fix:** Remoção de logout agressivo em caso de erro de conexão API.
- **Fix:** Remoção de fallback para dados mock (evita confusão em staging).
- **Core:** Melhoria no tratamento de erro na inicialização (Empty State).

## 1.177 - 05/01/2026
- **Segurança:** Relaxamento de validações estritas de CPF/CNPJ (User Request).
- **Core:** Implementação de persistência de sessão ao recarregar a página (F5) para Supabase.
- **Core:** Melhoria no gerenciamento de logout para limpar corretamente o storage local e de sessão.











## 1.176
- **Data:** 05/01/2026
- **Categoria:** Hotfix & Staging (Session Persistence & Mapping)
- **Descrição:** Corrigido problema de perda de conexão Supabase ao dar refresh (F5) através da remoção de watchdog timer mal posicionado e remoção de logouts agressivos no carregamento. Implementado mapeamento rigoroso `authorId` ↔ `author_id` e colunas snake_case para o sistema de notícias, resolvendo erro de "column author_id not found". Deploy configurado para o ambiente de staging (.dev).

## 1.175
- **Data:** 05/01/2026
- **Categoria:** Segurança (Sistema de Validação Completo)
- **Descrição:** Implementação completa de sistema de segurança com validação de entrada, sanitização anti-XSS/SQLi, máscaras de input, field-level permissions e audit log. Criados: `validators.ts` (validação de CPF/CNPJ com algoritmo verificador, email, telefone, CEP, data), `sanitizationService.ts` (sanitização e máscaras parciais), `masks.ts` (formatação automática), componente `MaskedInput` (validação em tempo real com feedback visual), hook `useFieldPermissions` (controle granular por role), migrations SQL para `field_permissions` e `audit_log` com triggers automáticos. Textos descritivos limitados a 250 caracteres. Previne SQL Injection, XSS e garante integridade de dados.

## 1.174
- **Data:** 05/01/2026
- **Categoria:** Feature (Editor - Banner Media)
- **Descrição:** Implementado sistema de upload transacional completo para o banner. Imagens e vídeos agora são armazenados localmente via IndexedDB com previews instantâneos (Blob URLs) que persistem após refresh. O upload real para Cloudinary ou YouTube ocorre apenas no momento de salvar/publicar. Sincronização automática de metadados do YouTube integrada ao fluxo de persistência.

## 1.173
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Auth & Deploy)
- **Descrição:** Corrigido problema de login travado no loading e adicionado timeout de 10s para conexões lentas com Supabase. Deploy realizado com sucesso para o servidor de staging (dev.webgho.com).

## 1.172
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Core - Authentication & Data Loading)
- **Descrição:** Corrigido bug crítico de autenticação que causava loop infinito ao detectar sessão expirada. Removido `window.location.reload()` do `contentService.ts` para permitir fallback gracioso para dados mock quando offline/não autenticado.

## 1.171
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Core - Data Loading)
- **Descrição:** Corrigido bug crítico que impedia o carregamento de notícias após refresh (F5). Removido loop infinito de reload causado pela verificação de versão no `useAppInitialization`.

## 1.170
- **Data:** 05/01/2026
- **Categoria:** Fix (Editor - Video Block)
- **Descrição:** Correção do bloco de vídeo: removido texto "IMG / VÍDEO" desnecessário (agora mostra apenas o label customizado) e corrigido botão "Trocar Origem" que não estava funcionando.

## 1.169
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Editor)
- **Descrição:** Correção crítica do preview de imagens do banner. Removida atualização prematura de estado em `onUploadStart` e garantido que `localPreviews` seja atualizado antes do array de imagens em `onUploadComplete`.

## 1.168
- **Data:** 05/01/2026
- **Categoria:** Feature (Editor)
- **Descrição:** Reestruturação do sistema de Upload. Arquivos agora são enviados apenas ao salvar/publicar. Correção do modal do YouTube (tela cheia). Implementada limpeza automática de arquivos ao excluir notícias. Adicionado botão "Salvar Rascunho".

## 1.167
- **Data:** 05/01/2026
- **Categoria:** Fix (Editor)
- **Descrição:** Correção na visualização do banner do editor durante upload de imagens locais. A imagem de fundo agora carrega corretamente imediatamente após a seleção.

## 1.166
- **Data:** 05/01/2026
- **Categoria:** UI/UX (Editor)
- **Descrição:** Redesign da barra de ferramentas do editor: novos ícones coloridos por categoria e aumento no contraste dos textos para melhor legibilidade.

## 1.165
- **Data:** 05/01/2026
- **Categoria:** Feature (Gallery)
- **Descrição:** Adicionados controles avançados para cada estilo de galeria (Colunas, Velocidade, Setas) e opções globais de redimensionamento de imagem (Proporção/Ajuste).

## 1.164
- **Data:** 05/01/2026
- **Categoria:** Feature (UI)
- **Descrição:** Atualização do Modal de Configuração do YouTube para usar portal (fixado no topo da tela), resolvendo problema de corte visual.

## 1.163
- **Data:** 05/01/2026
- **Categoria:** Feature (Gallery)
- **Descrição:** Implementação completa do preview real na Galeria (imagens locais) e correção da troca de layouts com conteúdo carregado.

## 1.162
- **Data:** 05/01/2026
- **Categoria:** Fix (TypeScript)
- **Descrição:** Correção de tipagem no bloco de Galeria (GalleryEditorBlock).

## 1.161
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Critical)
- **Descrição:** Correção crítica no `EditorCanvas` que impedia o funcionamento do bloco de Vídeo (botões de origem e upload não respondiam).

## 1.160
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Gallery)
- **Descrição:** Implementação da lógica de upload no bloco de Galeria (botão "Upload Fotos" agora funcional e local-first).

## 1.159
- **Data:** 05/01/2026
- **Categoria:** Feature (Editor)
- **Descrição:** Adicionada funcionalidade de Duplicar Bloco (ícone de cópia), botões de edição rápida no bloco e controle de espessura/altura para Divisores.

## 1.158
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Visual)
- **Descrição:** Correção de bug onde o texto ficava invisível (branco no branco) ao digitar no editor.

## 1.157
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Layout)
- **Descrição:** Correção do "menu duplicado" no editor (Barra de Propriedades renderizando fora do container).

## 1.156
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Funcionalidade)
- **Descrição:** Correção no upload de Galerias (permissão de token) e ajuste no layout do Editor para permitir Divisores Verticais flexíveis entre blocos.

## 1.155
- **Data:** 05/01/2026
- **Categoria:** Hotfix (UX/UI)
- **Descrição:** Correção dos botões de acesso rápido na Dashboard e ajuste no toggle da barra de propriedades do editor de notícias.

## 1.154
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Layout)
- **Descrição:** Ajuste de quebra de linha (wrap) na barra de ferramentas de Anunciantes para evitar cortes em telas intermediárias com Sidebar aberta.

## 1.153
- **Data:** 05/01/2026
- **Categoria:** Hotfix (Layout)
- **Descrição:** Correção de vazamento horizontal (overflow) no layout principal, que cortava o conteúdo à direita quando a sidebar estava aberta em algumas resoluções.

## 1.152
- **Data:** 05/01/2026
- **Categoria:** Feature (Local-First)
- **Descrição:** Implementação de fluxo de upload "Local-First".
    - **Offline-First:** Imagens de Anunciantes e Configurações agora são salvas localmente antes do upload.
    - **Sincronização:** Upload para nuvem ocorre apenas ao salvar o formulário.
    - **UX:** Indicadores visuais de "Sincronizando..." durante o salvamento.

## 1.151
- **Data:** 05/01/2026
- **Categoria:** Hotfix (UI)
- **Descrição:** Correção no comportamento da Sidebar e Editor.
    - **AdminLayout:** Corrigido bug onde a Sidebar poderia travar aberta ou fechada ao redimensionar a tela (ou abrir teclado virtual).
    - **Editor de Texto:** Ajustada lógica de redimensionamento para evitar que as barras laterais do editor reabram sozinhas em tablets/celulares ao focar no texto.

## 1.150
- **Data:** 05/01/2026
- **Categoria:** Melhoria (UI/UX)
- **Descrição:** Implementação de Responsividade Total no Painel Admin.
    - **Sidebar Mobile:** Novo menu lateral "Overlay" (sobreposto) para telas pequenas.
    - **Dashboard:** Grids adaptáveis para Mobile (1 coluna) e Desktop (4 colunas).
    - **Notícias:** Nova visualização em "Cards" para mobile, substituindo a tabela.
    - **Geral:** Ajustes finos em todos os formulários e listagens para evitar quebra de layout em celulares.

## 1.149 - 05/01/2026
**Categoria:** Hotfix
- **Descrição:** Correção de crash (loop infinito de renderização) na aba de Configurações, causado por reinicialização de objeto de configuração a cada ciclo de render.

### v1.148 - 05/01/2026
**Categoria:** Hotfix (Crítico)
- **FIX:** Corrigido "Crash Loop" causado por query inválida no serviço de configurações (`TypeError: select is not a function`). Histórico de alterações temporariamente desativado.

### v1.147 - 05/01/2026
**Categoria:** Hotfix
- **FIX:** Removida interceptação de console que causava loop de renderização infinita.
- **FIX:** Desativado log de auditoria de configurações (tabela `settings_audit` inexistente).

### v1.146 - 05/01/2026
**Categoria:** Correção de Bug
- **FIX:** Corrigido erro "Minified React error #310" (Violation of Rules of Hooks) no painel de erros.

### v1.145 - 05/01/2026
**Categoria:** Melhoria (Suporte)
- **FEAT:** Relatório de Erros agora aparece automaticamente para usuários comuns em caso de erro crítico.
- **FEAT:** Botão "Enviar para Debug" integrado ao painel de erros.

### v1.144 - 05/01/2026
**Categoria:** Segurança
- **RESTRIÇÃO:** Relatório de Erros agora visível apenas para cargo 'Desenvolvedor' (quando sem erros).
- **FIX:** Melhoria no controle de acesso ao painel de debug.

### v1.143 - 05/01/2026
**Categoria:** Melhoria (Auth)
- **FEAT:** Implementada opçao 'Lembrar-me' no Login.
- **FIX:** Refatoração de persistência de sessão (LocalStorage vs SessionStorage).
- **FIX:** Correção de conflito 'Multiple GoTrueClient instances' no Supabase.

### v1.142 - 05/01/2026
**Categoria:** Melhoria (Admin)
- **FIX:** Adicionado indicador visual de "Copiado!" no gerenciador de mídias.
- **CHORE:** Refatoração de componentes de UI administrativa.

### v1.141 - 05/01/2026
**Categoria:** Segurança
- **FIX:** Correção crítica nas permissões de acesso ao storage do Supabase para uploads.
- **FEAT:** Botão "Copiar Link" adicionado ao gerenciador de mídias.

### v1.140 - 05/01/2026
**Categoria:** Infraestrutura
- **FEAT:** Sistema unificado de upload de vídeos (YouTube/Vimeo/Nativo).
- **FEAT:** Integração com YouTube Data API para metadados de vídeos.

### v1.139 - 05/01/2026
**Categoria:** UI/UX
- **FIX:** Ajuste de cores e contraste no tema escuro.
- **FIX:** Alinhamento de cards na grade de notícias mobile.

### v1.138 - 05/01/2026
**Categoria:** Performance
- **PERF:** Lazy loading implementado na galeria de imagens.
- **FIX:** Redução do bundle size inicial.

---

## Versão Atual
**1.211**

## Próximos Passos
- [ ] Implementar sistema de notificações push
- [ ] Melhorar SEO das páginas de detalhe
- [ ] Adicionar suporte a comentários com moderação
