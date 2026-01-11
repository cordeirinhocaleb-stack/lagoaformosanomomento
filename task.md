# Tarefas

- [x] Implementar Análise Estática Profunda (SonarJS + Security) - Build 01
- [x] Fix: Bug de lógica no `NewsCard.tsx` (Teleprompter)
- [x] Maintenance: Limpeza de metadados órfãos do Capacitor (`.project`)
- [x] Project Reset: Versão reiniciada para 0.0.3 (Build 01)

- [x] Sincronizar com GitHub
- [x] Refatorar `AuthModalsContainer.tsx` (Transacionalidade Google Signup)
- [x] Implementar Self-Healing no `Login.tsx` (Recriar perfil ausente)
- [x] Adicionar Sanitização no `userService.ts` (Security)
- [x] Limpeza de cache no `RoleSelectionModal.tsx`
- [ ] Teste de Fluxo: Cadastro e Login (Manual) - **Pendente Validação em Staging**
- [x] Deploy para Ambiente de Teste (v0.0.0 Build 221) -> https://dev.webgho.com
- [x] Deploy para Ambiente de Teste (v0.0.0 Build 227) -> https://dev.webgho.com
- [x] Integrate Supabase MCP & Verify Connection (Project: xlqyccbnlqahyxhfswzh)
- [x] Synchronize Database Schema (Soft Migration v1.177) - Added missing snake_case columns
- [x] Fix: Supabase Connection Timeout (Implemented Credential Auto-Healing v1.103/Build 226)
- [x] Security: Hardening RLS Policies (Migration 009)
- [x] Fix: Empty Home Feed (Adjusted Region Filter to show National News v1.104)
- [x] Feature: Auto-News Rotation (Limit 100 items for external source)

## Refactoring - Global Law Adherence (Code Quality & Modularity)
- [x] Refactor `App.tsx` (Reduced from 462 to 171 lines - Container/Presenter Pattern)
- [x] Refactor `Login.tsx` (Reduced from 616 to 149 lines - Hook-based Logic)
- [x] Refactor `EditorTab.tsx` (Reduced from 580 to ~465 lines - Logic Extraction)
- [x] Refactor `EditorBannerNew.tsx` (Reduced from 555 to ~460 lines - Image Queue Hook)
- [x] Verify File Sizes (>400 lines audit)

## Editor & Writer Panel (News Creation)
- [x] Assess Current Editor Component State
- [x] Implement Editor UI Enhancements (Banner, Modal, Previews)
- [x] QA & Verification of Editor Refactor (Dev Environment)
- [x] Fix: Banner Effects not saving/persisting (Migration 004 + EditorTab.tsx runtime error)
- [x] Feature: Banner Effects on Home Page Previews (NewsCard.tsx)
- [x] Fix: Editor closing too fast preventing Success Modal (NewsManager.tsx)
- [x] Fix: "View on Site" link closing editor instead of opening URL
- [x] UI: Redesign Success Modal to match Home Banner (Dark/Red Theme)

