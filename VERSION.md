# Histórico de Versões

> Este controle de versão é gerenciado automaticamente pela IA Antigravity.
> Mantenha este arquivo sincronizado com o `package.json` (Versão Pública) e `src/version.ts` (Build Number).

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
