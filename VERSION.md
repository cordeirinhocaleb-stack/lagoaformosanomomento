# Histórico de Versões

> **Política de Versionamento:**
> - **Versão Pública (SemVer):** Atualizada apenas em lançamentos (agrupamento de correções/features).
> - **Build Number:** Incrementado a cada edição interna (controle de desenvolvimento).
>
> Mantenha este arquivo sincronizado com `src/version.ts`.


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
