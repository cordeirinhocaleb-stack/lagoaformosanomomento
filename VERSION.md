# Histórico de Versões

> [!IMPORTANT]
> **PROTOCOLO DE DESENVOLVIMENTO (Obrigatório Ler antes de atualizar):**
> 1. **Incremento**: Toda modificação exige +0.0.1 (Build +1) ou reset de build conforme instrução.
> 2. **Sincronização**: Atualizar sempre `App.tsx`, `package.json`, `VERSION.md` e `src/version.ts`.
> 3. **Limite de Arquivo**: Máximo de **400 linhas** (Hard Limit). >500 = Reestruturar imediatamente.
> 4. **Segurança**: RLS Ativo (Deny by Default). Proibido `service_role` no front. Sanitização obrigatória.
> 5. **Tipagem**: Strict Mode. `any` proibido em áreas de domínio. Usar `unknown` + validação.
> 6. **Relatório**: Notas detalhadas (Data, Categoria, Descrição) para o Modal de Atualizações.
> 7. **SOT**: Qualquer mudança no banco exige atualização do `.sql` principal e `architecture.md`.


## 0.2.1 (Build 229) - 21/01/2026 02:00
- **Admin**: Padronização completa do Modo Escuro (Dashboard, Usuários, Anunciantes, Configurações).
- **UI/UX**: Refinamento de cores, botões, modais e backgrounds administrativos para 100% Dark Mode.
- **Sync**: Sincronização completa do sistema .context e task.md.

---

## 0.2.0 (Build 228) - 20/01/2026 18:26
- **Milestone**: Integração Completa do Sistema .context
- **Documentation**: Sistema .context totalmente integrado com task.md
- **Automation**: Script `sync-context.js` para sincronização automatizada
- **Testing**: Plano de testes de autenticação criado (23 casos de teste)
- **Agents**: 14 agentes especializados configurados
- **Skills**: 10 skills reutilizáveis documentadas
- **Files**: 7 arquivos criados, 5 atualizados (~2.500 linhas de documentação)
- **Status**: Projeto 96.8% completo (31/32 tarefas concluídas)

---

## 0.1.0 (Build 01) - 18/01/2026 06:45
- **Milestone**: Lançamento da Versão 0.1.0.
- **Admin**: Integração completa do Histórico de Compras (`PurchaseHistoryModal`) no Painel de Assinaturas.
- **Feature**: Novo componente `ContactInfo` para padronização de contatos.
- **Refactor**: Auditoria e correções em componentes administrativos e tipagem.
- **System**: Sincronização de base de código.

---

## 0.0.7 (Build 01) - 15/01/2026 22:50
- **Feature (Branding)**: Novo sistema de marca d'água física "Premium Journalistic" com moldura vermelha, tag temporal (2026) e barra de URL.
- **Refactor (Law #1)**: Reestruturação completa do `UniversalMediaUploader` e `GalleryRenderer` em sub-componentes (abaixo de 500 linhas).
- **Architecture**: Extração da lógica de processamento de imagem para `watermarkProcessor.ts`.
- **Deploy**: Lançamento da Versão 0.0.7.

## 0.0.6 (Build 03) - 12/01/2026 22:50
- **Feature (Gallery Slots)**: Refatoração completa do sistema de galeria para o modelo de "Slots" unificado (estilo Banner).
- **UX**: Botão de Galeria movido para a categoria "Redação" para facilitar o fluxo editorial.
- **UI**: Upload múltiplo simultâneo e reordenação visual em tempo real dentro do bloco.
- **Cleanup**: Removido componente de galeria legado do menu lateral cloud.

## 0.0.6 (Build 02) - 13/01/2026 00:30
- **Feature (Media Cloud)**: Modernização completa do `UniversalMediaUploader` com design jornalístico premium, glassmorphism e micro-animações.
- **Feature (Efeitos)**: Implementados efeitos jornalísticos e opção de Marca d'água ("Lagoa Formosa no Momento") opcional em uploads de imagens.
- **Refactor (Gallery)**: `GalleryEditorBlock` agora utiliza o `UniversalMediaUploader` unificado, suportando Cloud/YouTube nativamente.
- **Type Safety**: Estabilização total do projeto com resolução de todos os erros de build (0 errors).
- **Maintenance**: Remoção de arquivos legados e redundantes (`temp_sync_old.ts`, `editor/EditorTab.tsx`).

## 0.0.6 (Build 01) - 12/01/2026 22:15
- **Reset**: Reiniciando contagem de builds para novo ciclo de correções.
- **Audit**: Preparação do ambiente para correções no módulo Admin News.
- **Refactor**: Modularização do `NewsManager` em `NewsFilterHeader` e `NewsList` (<400 linhas).
- **Service**: Separação do `contentService.ts` em serviços de domínio (News, Advertiser, Social).

## 0.0.5 (Build 10) - 11/01/2026 23:30
- **Feature (Navigation Guard)**: Proteção contra perda de dados. O editor agora alerta o usuário ao tentar sair ou fechar a aba com alterações não salvas (`isDirty` tracking).
- **Fix (Gallery Persistence)**: Corrigido bug crítico onde imagens da galeria não eram salvas no banco. Implementada resolução correta de IDs locais (`local_`) para URLs do Cloudinary.
- **UX (Editor)**: Preview em tempo real para uploads na galeria.
- **Admin**: Correção de erros de sintaxe no `EditorTab.tsx` (tags duplicadas).

## 0.0.4 (Build 09) - 11/01/2026 22:20
- **Admin Editor**: Refatoração do bloco de texto com foco em UX.
- **Admin Editor**: Removida aba SEO do inspetor de blocos para simplificação.
- **Admin Editor**: Renomeado 'Estilo Camaleão' para 'Temas' com 3 opções focadas.
- **Admin Editor**: Implementado grid de layout customizável (25%, 50%, 75%, 100%) com ícones de seleção.

## 0.0.4 (Build 08) - 11/01/2026 22:15
- **Admin**: Adicionada opção de minimizar o menu lateral dedicado para Desktop (PC).
- **Core**: Sincronização de versão e Build Number para controle de cache.

## 0.0.4 (Build 03) - 11/01/2026 00:10
- **Type Safety**: Corrigidos erros críticos de tipagem em `GalleryPreview`, `InspectorSidebar`, `TicketsModal` e `UserListTable`.
- **Sync**: Padronização da propriedade `avatar_url` no tipo `User` para sincronia com o schema do banco.
- **Maintenance**: Remoção de diretórios residuais do ambiente mobile (`lixeira/android`) para limpeza do IDE.
- **Workflow**: Aplicação rigorosa das regras de versionamento e design system `/lagoa`.

## 0.0.3 (Build 02) - 10/01/2026 23:55
- **Compliance Audit**: Auditoria completa de conformidade com os workflows `/lagoa` e `/performacer`.
- **Refactor**: Modularização massiva dos componentes Admin (Engagement, Gallery, Inspector).
- **Type Safety**: Eliminação de `any` e implementação de tipagem estrita na pasta `components/admin`.
- **Security**: Implementação de sanitização XSS via DOMPurify em todos os blocos de renderização.
- **Maintenance**: Remoção definitiva de resíduos do Capacitor e Capacitor Android.

## 0.0.3 (Build 01) - 10/01/2026 18:35
- **Reset Milestone:** Versão do sistema reiniciada para 0.0.3 (Build 01).
- **Tools:** Implementação de análise estática profunda (SonarQube-like) via ESLint e SonarJS.
- **Fix:** Corrigido bug de lógica no `NewsCard` (Teleprompter) e remoção de metadados órfãos do Capacitor.

## 1.102 (Build 1102) - 10/01/2026 15:05
- **Maintenance:** Bloqueio definitivo de deseleção dos Termos de Uso após o aceite.
- **Bug Fix:** Correção de persistência do aceite dos termos (normalização snake_case/camelCase).
- **Core:** Padronização de autenticação e otimização de índices do banco de dados.

## 1.101 (Build 1101) - 10/01/2026 08:45
- **Feature:** Adicionados 3 novos estilos de citação editoriais ("G1", "Lux" e "Breaking").
- **UX:** Novos presets de estilo acessíveis diretamente no painel de propriedades do bloco de citação.
- **Visual:** Renderização personalizada com ícones, fontes específicas (Inter/Merriweather) e layouts dinâmicos.

## 1.100 (Build 1100) - 10/01/2026 08:40
- **Melhoria:** Adicionada borda sutil (dashed) em todos os blocos do editor para melhorar a visibilidade dos limites dos elementos.
- **Visual:** Alterado efeito de hover para destacar levemente os blocos não selecionados.
- **Sistema:** Sincronização de versão para v1.100.

## 0.0.1 (Build 01) - 07/01/2026 23:16
- **Release Milestone:** Lançamento consolidado da Versão 0.0.1.
- **YouTube Engine 2.0:** Padronização completa e modo cinema.
- **Mobile UI:** Refatoração de modais para scroll vertical e Inspector lateral.
- **Visual Suite:** Filtros de vídeo brilho/contraste e seletor de trim.

## 0.0.0 (Build 237) - 07/01/2026 17:15
- **Fix:** Resolvido "Erro Crítico" ao publicar vídeos para o YouTube (TypeError na assinatura do serviço).
- **Fix:** Otimizado o fluxo de upload para evitar tentativas duplicadas de envio durante a publicação final.
- **Improvement:** O editor agora reconhece e usa a URL final do YouTube imediatamente após o upload.

## 0.0.0 (Build 236) - 07/01/2026 17:00
- **Feature:** Implementada deleção real de imagens no Cloudinary ao remover do editor.
- **Backend:** Criada Edge Function `cloudinary-delete` para processamento seguro de deleções.
- **Service:** Atualizado `cloudinaryService.ts` para integrar com a Edge Function via Supabase.

## 0.0.0 (Build 235) - 07/01/2026 16:35
- **UX:** Implementado o `PublishSuccessModal` interativo ao finalizar publicações/rascunhos.
- **UX:** Adicionadas opções de "Ver no Site" e "Criar Nova Notícia" no modal de sucesso.
- **Bug Fix:** Removido reset automático do status de publicação para permitir interação com o modal.

## 0.0.0 (Build 234) - 07/01/2026 16:10
- **Bug Fix:** Resolvido erro de UUID vazio ao salvar novos rascunhos.
- **Bug Fix:** Corrigido mapeamento do botão "Publicar" e função "Republicar" no Editor.
- **UX:** Adicionado feedback de sucesso/erro com ícones animados no overlay de publicação.
- **UX:** Implementado auto-fechamento do overlay após sucesso (2.5s).
- **Core:** Corrigido bug de duplicidade ao salvar novos posts sem fechar o editor.

## 0.0.0 (Build 233) - 07/01/2026 15:55
- **Bug Fix:** Resolvido erro 400 ao salvar Logs de Auditoria.
- **Database:** Atualizado esquema de `audit_log` para suportar nomes de usuários e IDs flexíveis (Migration 012).
- **Refactor:** Corrigida ordem de argumentos na chamada de serviço de log no Editor.

## 0.0.0 (Build 232) - 07/01/2026 15:45
- **Bug Fix (Critico):** Corrigido falha silenciosa ao publicar (feedback visual inexistente).
- **UX:** Adicionado Overlay de Publicação indicando progresso (Upload/Distribuição).
- **Dev:** Exposto status de publicação no `useEditorController` e logs de erro adicionados.

## 0.0.0 (Build 231) - 07/01/2026 15:30
- **Feature:** Implementado sistema de Tags Inteligentes (#) com Autocomplete e Persistência.
- **Database:** Criada tabela `tags` com contador de uso (Migration 010).
- **UX:** Input de Tags agora sugere filtros baseados na popularidade (Menos usados -> Mais usados, conforme solicitado).

## 0.0.0 (Build 230) - 07/01/2026 15:10
- **Bug Fix (Critico):** Corrigido crash no Editor (YouTube Upload) adicionando `GoogleOAuthProvider` faltante.
- **Refactor:** Modularização do `EditorTab.tsx` para `useEditorController` e `GoogleOAuthProvider` (Compliance >400 linhas).

## 0.0.0 (Build 229) - 07/01/2026 14:40
- **Auto:** Incremento automático prévio. (Assumed)

## 0.0.0 (Build 228) - 07/01/2026 13:41
- **Feature:** Implementação completa de Dark Mode no Admin Panel (Popups, Banners, Placements, Plans).
- **UI:** Refatoração do `PopupEditor` para melhor suporte a temas e tipagem.
- **Maintenance:** Incremento de build e preparação para deploy.

## 0.0.0 (Build 227) - 07/01/2026 12:25
- **Deployment:** Deploy para ambiente de testes (Staging/Dev).
- **Maintenance:** Rotina de atualização de versão e sincronização.

## 0.0.0 (Build 226) - 07/01/2026 11:42
- **Hotfix (Critical):** Implementada rotina de auto-correção de credenciais do Supabase. Força a renovação das chaves de acesso se detectar cache antigo no navegador, resolvendo problemas de conexão "Access Denied/Timeout".
- **Security:** Hardening de RLS para `audit_log`, `error_reports` e `engagement_interactions` (Migration 009).

## 0.0.0 (Build 225) - 07/01/2026 10:37
- **Bug Fix:** Correção de erro 500 no Cadastro Manual (Conflito Trigger vs Client).
- **Backend:** Preparação para Trigger SQL Enhanced (captura completa de metadados).
- **Security:** Remoção de `createUser` exposto no fluxo manual.

## 0.0.0 (Build 224) - 07/01/2026 10:25
- **UX Improvement:** Melhoria no formulário de endereço (Feedback visual 'Buscando CEP...').
- **UX:** Fallback automático para preenchimento manual de endereço caso o CEP falhe.

## 0.0.0 (Build 223) - 07/01/2026 10:07
- **Bug Fix (Critical):** Correção definitiva do fluxo de Login Google (OAuth).
- **Backend:** Implementação de triggers SQL para criação automática de perfil e confirmação de email OAuth.
- **Security:** Remoção de tentativas de INSERT duplicado no código client-side (uso de UPDATE).
- **UX:** Ajuste na validação de "Perfil Completo" para evitar loop de cadastro.

## 0.0.0 (Build 221) - 06/01/2026 22:40
- **Refactor (Global Law):** Modularização massiva de `App.tsx`, `Login.tsx`, e componentes do Editor (>400 linhas).
- **Bug Fix:** Adicionada persistência de Efeitos do Banner (DB Schema Migration 004).

## 0.0.0 (Build 220) - 06/01/2026 22:20
- **Baseline Reset:** Versão pública definida como `0.0.0` para ciclo de desenvolvimento alpha.
- **UX:** Adicionada opção "Lembrar minha senha" (Persistência) diretamente no formulário de login manual.
- **System:** Suporte a restauração de sessão simplificada (`SessionStorage`) para evitar logouts ao recarregar a aba.

## 0.1.3 (Build 219) - 06/01/2026 22:05
- **UX/UI:** Substituído alerta nativo do navegador por `SuccessModal` no fluxo de cadastro manual.
- **Feature:** Mensagem explícita instruindo o usuário a verificar o e-mail para ativação da conta.

## 0.1.2 (Build 218) - 06/01/2026 21:55
- **Bug Fix (Crítico):** Corrigido erro de "ID/Email não identificado" no cadastro manual com verificação de email ativada.
- **Resilience:** Reforçado fallback de cadastro para ignorar falha de perfil se a conta Auth for criada (ativação via email + Self-Healing).

## 0.1.1 (Build 217) - 06/01/2026 21:50
- **UI Fix:** Corrigido problema de sobreposição (Z-Index) no Wizard de Cadastro (`RoleSelectionModal` e `SuccessModal` agora abrem acima da tela de construção).

## 0.1.0 (Build 216) - 06/01/2026 19:05
- **Estratégia de Versionamento:** Adotado modelo `Versão Pública` (0.1.0) + `Build Number` (216).
- **Correção Visual:** Ajuste na formatação da versão no rodapé ("V." ao invés de "v").
- **UI Fix:** Aumentado z-index do Modal de Login para `z-[10000]` (Fix v1.215).

## 1.214 - 06/01/2026 18:50
- **Bug Fix (Critico):** Corrigido bug onde o botão "Área Restrita" não abria o modal de login.
- **Refactor App:** Removida duplicação de estado de modais (`showLoginModal`) no `App.tsx`, centralizando a fonte da verdade no hook `useModals`.

## 1.213 - 06/01/2026 18:00
- **Security:** Self-Healing para usuários sem perfil no banco.
- **Security:** Sanitização de inputs no `userService.ts`.
- **Refactor:** Transacionalidade no Cadastro Social (Google).

## 1.212 - 06/01/2026 17:30
- **Backup:** Sincronização e Backup do Código.

## 1.211 - 06/01/2026 14:26
- **Feature:** Implementado bloqueio progressivo no login (Delay + Exponencial Backoff).
- **Feature:** Adicionado "Welcome Toast" ao logar.
- **Refactor:** Login agora usa `checkAuthLockout` do Supabase.
