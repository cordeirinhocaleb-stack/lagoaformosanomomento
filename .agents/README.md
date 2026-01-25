# Sistema de Agentes - README

## 🎯 Visão Geral

Sistema de agentes especializados para garantir qualidade, segurança e organização em projetos Next.js + Supabase.

## 📁 Estrutura

```
.agents/
├── core/                        # 5 Agentes Core
│   ├── frontend-agent.ts        # UI/UX, acessibilidade, performance
│   ├── security-agent.ts        # Vulnerabilidades, RLS, validações
│   ├── documentation-agent.ts   # Docs automáticas
│   ├── architecture-agent.ts    # Organização, separação de camadas
│   └── quality-agent.ts         # Lint, build, tests, audit (GO/NO-GO)
├── domains/                     # Agentes Especializados
│   ├── news/                    # Site de Notícias
│   ├── production/              # Produção/Expedição
│   └── logistics/               # Logística
├── config.ts                    # Configurações globais
├── context-loader.ts            # Sistema "iniciar contexto"
├── orchestrator.ts              # Coordenador dos 6 passos
└── test-init-context.js         # Script de teste
```

## 🚀 Como Usar

### 1. Iniciar Contexto

Antes de qualquer implementação, execute:

```bash
node .agents/test-init-context.js
```

Ou adicione ao `package.json`:

```json
{
  "scripts": {
    "agents:init": "node .agents/test-init-context.js"
  }
}
```

Isso carregará:
- ✅ DESIGN_SYSTEM.md  
- ✅ SYMBOLS_TREE.md  
- ✅ BUILD_HISTORY.md  
- ✅ AGENT_RULES.md  
- ✅ Build atual  
- ✅ Regras do usuário (MEMORY)  
- ✅ Domínio do projeto

### 2. Processo de 6 Passos

Todo código passa por:

1. **Arquitetura** - Estrutura e organização
2. **Front-End** - UI/UX, acessibilidade, performance
3. **Segurança FE** - XSS, CSRF, validações
4. **Tech Lead** - Integração e limpeza
5. **Database Security** - RLS, policies, índices
6. **Auditor Final** - GO/NO-GO (lint, build, tests)

### 3. Salvamento Automático

Ao finalizar build, o **Documentation Agent** atualiza:
- `docs/builds/build-XXX.md` (detalhes)
- `docs/BUILD_HISTORY.md` (resumo)
- `docs/SYMBOLS_TREE.md` (símbolos)

## 📋 Regras Absolutas

1. ❌ **Máximo 500 linhas** por arquivo
2. ❌ **Não alucinar** (APIs, tabelas, libs)
3. ✅ **Priorizar libs existentes**
4. ✅ **Fonte de verdade**: Código → Docs → Padrões
5. ✅ **Mudanças mínimas**
6. ❌ **Sem gambiarra**
7. ✅ **Entregas obrigatórias** (arquivos + por quê + como validar)
8. ✅ **Tipagem forte** (evitar `any`)

## 📊 Domínios Suportados

- **Generic** - Projeto padrão (apenas agentes core)
- **News** - Site de Notícias (CMS, SEO, Content, Analytics)
- **Production** - Produção/Expedição (Control, Quality, Shipping, Inventory)
- **Logistics** - Logística (Route, Fleet, Warehouse, Tracking)

## 🔧 Configuração

Edite `.agents/config.ts` para personalizar:

```typescript
export const DEFAULT_CONFIG: AgentConfig = {
  domain: 'production', // ou 'news', 'logistics', 'generic'
  enabledAgents: ['frontend', 'security', 'documentation', 'architecture', 'quality'],
  autoDocumentation: true,
  buildTracking: true,
  maxFileLines: 500,
};
```

## 📚 Documentação Completa

- [DESIGN_SYSTEM.md](../docs/DESIGN_SYSTEM.md) - Sistema de design
- [SYMBOLS_TREE.md](../docs/SYMBOLS_TREE.md) - Árvore de símbolos
- [BUILD_HISTORY.md](../docs/BUILD_HISTORY.md) - Histórico de builds
- [AGENT_RULES.md](../docs/AGENT_RULES.md) - Regras completas

## 🧪 Testar Sistema

```bash
# Teste 1: Iniciar contexto
npm run agents:init

# Teste 2: Validar arquivo
node .agents/test-validate-file.js path/to/file.tsx

# Teste 3: Full audit
npm run lint && npm run build && npm test
```

---

**Versão**: 1.0.0  
**Última atualização**: 2026-01-20  
**Gerado por**: Documentation Agent
