# Regras Integradas para Agentes

Este documento consolida todas as regras que os agentes devem seguir durante o desenvolvimento.

---

## 🚨 REGRAS ABSOLUTAS (Aplicam-se a TODOS)

### 1. Limite de 500 Linhas
- ❌ **NUNCA** criar arquivo com mais de 500 linhas
- ✅ Se exceder: refatorar imediatamente
  - Extrair hooks (lógica de estado)
  - Extrair componentes filhos (UI)
  - Extrair funções para `lib/` ou `utils/` (lógica pura)
- 🔒 **Bloqueio**: Build não prossegue se houver arquivo > 500 linhas

### 2. Não Alucinar
- ❌ **NUNCA** inventar:
  - APIs que não existem
  - Tabelas do Supabase não criadas
  - Colunas de tabelas inexistentes
  - Variáveis de ambiente não configuradas
  - Rotas não definidas
  - Policies RLS não implementadas
  - Endpoints não existentes
  - Bibliotecas não instaladas

### 3. Priorizar Bibliotecas Existentes
- ✅ **SEMPRE** verificar `package.json` antes de sugerir nova lib
- ✅ Se sugerir nova biblioteca:
  - Justificar necessidade
  - Listar alternativas
  - Avaliar impacto (bundle size, breaking changes)
  - Plano de validação antes de instalar
- ❌ **NUNCA** instalar sem aprovação explícita

### 4. Fonte de Verdade (Ordem de Prioridade)
1. **Código + Tipos + Schema + Migrations** do projeto
2. **Arquitetura de Salvamento**: `@[skills/persistence-architecture]`
3. **Docs Oficiais**: React, TypeScript, Next.js, Supabase, Postgres, MDN, OWASP
4. **Padrões Web**: WHATWG, W3C

### 5. Mudanças Mínimas
- ✅ Fazer **apenas** o necessário para resolver o problema
- ❌ **NUNCA** refatorar por estética sem pedido explícito
- ❌ **NUNCA** alterar arquivos não relacionados à tarefa

### 6. Proibido Gambiarra
- ❌ **NUNCA**:
  - Bypass de tipos (`as any`, `@ts-ignore` sem justificativa)
  - Hack de segurança (desabilitar RLS, CORS geral, CSP)
  - Duplicação de código (sempre extrair para módulo compartilhado)
  - Workarounds que criam dívida técnica

### 7. Entregas Obrigatórias
Ao finalizar qualquer tarefa, **SEMPRE** fornecer:
- ✅ **Arquivos afetados** (criar/editar/deletar)
- ✅ **Por quê** (justificativa curta e clara)
- ✅ **Como validar**:
  - Comandos: `npm run lint`, `npm run build`, `npm test`
  - Fluxo manual: passo a passo no navegador

### 8. Tipagem Forte
- ✅ **Evitar `any`** sempre que possível
- ✅ Se entrada desconhecida: usar `unknown` + validação (type guard ou Zod)
- ✅ `any` **APENAS** em boundaries (entrada de API, JSON externo)
- ❌ **NUNCA** espalhar `any` pelo código

---

## 🔄 PROCESSO DE 6 PASSOS OBRIGATÓRIOS

Toda implementação **DEVE** seguir estas 6 etapas:

### Passo 1: Staff Engineer (Arquitetura)
**Responsável**: Agente de Arquitetura

**Ações**:
- Planejar estrutura técnica
- Definir quais arquivos criar/modificar
- Garantir separação de camadas (UI → Hooks → Services → API)
- Assegurar que estrutura está < 500 linhas por arquivo
- Documentar decisões arquiteturais (ADR style)

**Checklist**:
- [ ] Estrutura de pastas definida
- [ ] Separação de responsabilidades clara
- [ ] Nenhum arquivo > 500 linhas
- [ ] Decisões documentadas

### Passo 2: Front-End Engineer (UI/UX)
**Responsável**: Agente de Front-End

**Ações**:
- Implementar UI com qualidade
- Garantir conformidade com `DESIGN_SYSTEM.md`
- Implementar estados: loading, empty, error
- Garantir acessibilidade (ARIA, teclado)
- Otimizar performance (lazy loading, code splitting)

**Checklist**:
- [ ] Componentes < 500 linhas
- [ ] UI primitives reutilizáveis
- [ ] Estados de loading/empty/error
- [ ] Acessibilidade (ARIA labels, contraste)
- [ ] Performance (next/image, dynamic imports)

### Passo 3: Security Engineer (Segurança FE)
**Responsável**: Agente de Segurança

**Ações Front-End**:
- Validar inputs (Zod/Yup)
- Sanitizar HTML (`dangerouslySetInnerHTML` apenas com DOMPurify)
- Verificar proteção de rotas (middleware ou AuthProvider)
- Garantir nenhuma `service_role` no cliente
- Verificar variáveis sensíveis nunca em `NEXT_PUBLIC_*`

**Checklist**:
- [ ] Inputs validados (Zod/Yup)
- [ ] HTML sanitizado (DOMPurify)
- [ ] Rotas protegidas
- [ ] Nenhuma key sensível no cliente
- [ ] XSS/CSRF mitigados

### Passo 4: Tech Lead (Integração e Limpeza)
**Responsável**: Agente de Arquitetura (Tech Lead role)

**Ações**:
- Integrar mudanças com consistência
- Eliminar código duplicado
- Modularizar lógica repetida (extrair hooks/utils)
- Limpar código morto (mover para `/_trash/` com evidências)
- Atualizar imports/paths

**Checklist**:
- [ ] Código integrado sem duplicação
- [ ] Lógica extraída para módulos compartilhados
- [ ] Código morto movido para `/_trash/` com README
- [ ] Imports atualizados
- [ ] Build funciona

### Passo 5: Database Security Engineer (SQL/RLS)
**Responsável**: Agente de Segurança (DB role)

**Ações**:
- Verificar RLS ativado em **todas** as tabelas
- Validar policies (anon/authenticated/owner/admin)
- Garantir nenhuma policy genérica `USING (true)` em dados sensíveis
- Criar índices para colunas usadas em policies/filtros
- Validar SECURITY DEFINER functions (search_path travado)

**Checklist**:
- [ ] RLS ativado em todas as tabelas
- [ ] Policies definidas e testadas
- [ ] Índices criados
- [ ] SECURITY DEFINER seguro
- [ ] Matriz de acesso documentada

### Passo 6: Auditor Final (GO/NO-GO)
**Responsável**: Agente de Qualidade

**Ações**:
- Executar lint: `npm run lint`
- Executar type check: `npx tsc --noEmit`
- Executar build: `npm run build`
- Executar testes: `npm test`
- Validar conformidade com regras (500 linhas, sem `any`, etc.)
- Testar fluxo crítico manualmente

**Checklist**:
- [ ] Lint sem erros
- [ ] Type check sem erros
- [ ] Build sem erros
- [ ] Testes passando
- [ ] Regras absolutas respeitadas
- [ ] Fluxo manual validado

**Resultado**: ✅ **GO** (prosseguir) ou ❌ **NO-GO** (bloquear até correção)

---

## 📋 RELATÓRIOS OBRIGATÓRIOS

### [FRONT-END IMPLEMENTATION REPORT]
```markdown
- Objetivo: [descrição]
- Arquivos alterados/criados: [lista]
- Decisões: [justificativas curtas]
- Componentização: [o que foi dividido e por quê]
- Tipos adicionados/ajustados: [interfaces/types]
- Estados: loading / empty / error: [implementados onde]
- Acessibilidade: [teclado/aria/labels]
- Performance: [riscos + mitigação]
- Como validar:
  - Comandos: [npm run dev, etc.]
  - Passos manuais: [1, 2, 3...]
- Riscos e rollback: [plano B]
```

### [FRONT-END SECURITY REPORT]
```markdown
- Superfícies revisadas: [rotas/componentes/inputs]
- Ameaças principais (P0/P1/P2): [lista]
- Evidências: [trechos de código]
- Mitigações aplicadas: [mudanças]
- Recomendações de hardening: [agora vs depois]
- Casos de abuso para testar:
  - XSS payloads: [exemplos]
  - Uploads maliciosos: [cenários]
  - Vazamento por logs: [exemplos]
- Como validar: [comandos + passos]
- Riscos restantes: [lista]
```

### [INTEGRATION & CLEANUP REPORT]
```markdown
- Objetivo: [descrição]
- Mudanças integradas: [resumo]
- Dívidas removidas: [duplicação/refactors]
- Lixo encontrado:
  - P0 (confirmado) movido para /_trash: [lista]
  - P1 (suspeito) e plano: [lista]
  - P2 (mantido) por quê: [justificativa]
- Evidências: [imports/rotas/refs]
- Arquivos reorganizados < 500 linhas: [lista]
- Como validar: [comandos + passos]
- Riscos e rollback: [plano]
```

### [SUPABASE SQL SECURITY REPORT]
```markdown
- Tabelas revisadas: [lista]
- RLS status (on/off): [mapa]
- Policies existentes + riscos: [resumo]
- Mudanças aplicadas (SQL): [código]
- Matriz de acesso: [quem pode ler/escrever]
- Performance:
  - Índices criados: [lista]
  - EXPLAIN ANALYZE: [se aplicável]
- Verificação:
  - Queries de teste: [anon/auth/owner/admin]
  - Resultados esperados: [descrição]
- Rollback: [plano SQL]
```

### [AUDIT REPORT — GO/NO-GO]
```markdown
- Status: GO / NO-GO
- P0 (bloqueadores): [lista]
- P1 (importantes): [lista]
- P2 (melhorias): [lista]
- Conformidade:
  - Regra 500 linhas: ✅ / ❌
  - Sem alucinação: ✅ (verificado: APIs, tabelas, libs)
  - Sem any espalhado: ✅ (apenas boundaries)
  - Segurança FE: ✅ (XSS, CSRF, validação)
  - Segurança SQL/RLS: ✅ (policies, índices)
  - Limpeza: ✅ (/_trash + evidências)
- Validação:
  - Comandos: [npm run lint && npx tsc && npm run build]
  - Passos manuais: [fluxo crítico]
- Plano de rollback: [git revert + SQL rollback]
```

---

## ✅ MARCAÇÃO DE REGRAS IMPLEMENTADAS

Ao finalizar uma tarefa, **SEMPRE** incluir no relatório:

```markdown
[x] Regra 1 implementada (Arquitetura)
[x] Regra 2 implementada (Front-End)
[x] Regra 3 implementada (Segurança FE)
[x] Regra 4 implementada (Tech Lead)
[x] Regra 5 implementada (Database Security)
[x] Regra 6 implementada (Auditor Final)
```

---

## 🌐 CONTEXTO DE IDIOMA

- **Comunicação**: Sempre em **Português** (Brasil)
- **Código**: Inglês (variáveis, funções, comentários técnicos)
- **Comentários de Código**: Português quando explicativos, inglês quando técnicos
- **Relatórios**: Sempre em Português

---

**Última atualização**: 2026-01-20  
**Versão**: 1.0.0  
**Gerado por**: Documentation Agent
