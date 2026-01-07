# Histórico de Versões

> Este controle de versão é gerenciado automaticamente pela IA Antigravity.
> Mantenha este arquivo sincronizado com o `package.json` (Versão Pública) e `src/version.ts` (Build Number).

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
