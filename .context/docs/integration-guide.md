# Integration Guide - Sistema .context

> **Versão**: 1.0  
> **Última Atualização**: 2026-01-20  
> **Propósito**: Guia de integração entre task.md e sistema .context

## 📖 Visão Geral

Este guia explica como usar o sistema .context em conjunto com o task.md para gerenciamento eficiente de tarefas e colaboração com agentes de IA.

## 🏗️ Estrutura do Sistema

### Arquivos Principais

```
lagoaformosanomomento/
├── task.md                          # Lista de tarefas (raiz)
├── .context/                        # Sistema de contexto para IA
│   ├── agents/                      # Agentes especializados
│   │   ├── feature-developer.md
│   │   ├── bug-fixer.md
│   │   ├── test-writer.md
│   │   └── ...
│   ├── skills/                      # Skills reutilizáveis
│   │   ├── test-generation/
│   │   ├── security-audit/
│   │   └── ...
│   └── docs/                        # Documentação técnica
│       ├── task-tracking.md         # Mapeamento de tarefas
│       ├── integration-guide.md     # Este arquivo
│       └── ...
├── .agent/                          # Workflows e regras
│   ├── workflows/
│   │   └── context-sync.md          # Workflow de sincronização
│   └── rules/
│       └── regrasfundamentais.md    # Regras do projeto
└── docs/                            # Documentação core
    ├── SYMBOLS_TREE.md              # Mapa de símbolos
    ├── DESIGN_SYSTEM.md             # Sistema de design
    └── RULES_MASTER.md              # Regras mestras
```

## 🔄 Workflow de Integração

### 1. Adicionar Nova Tarefa

Quando uma nova tarefa é identificada:

1. **Adicionar ao task.md**
   ```markdown
   - [ ] Nova tarefa a ser realizada
   ```

2. **Atualizar task-tracking.md**
   - Identificar agente(s) apropriado(s)
   - Listar skills aplicáveis
   - Criar plano de ação detalhado

3. **Consultar agente especializado**
   - Ler `.context/agents/[agente].md`
   - Seguir o playbook do agente

### 2. Executar Tarefa

1. **Ativar skill relevante**
   - Ler `.context/skills/[skill]/SKILL.md`
   - Seguir instruções da skill

2. **Seguir regras fundamentais**
   - Consultar `.agent/rules/regrasfundamentais.md`
   - Validar contra SYMBOLS_TREE.md
   - Seguir DESIGN_SYSTEM.md

3. **Implementar mudanças**
   - Fazer alterações no código
   - Atualizar documentação
   - Executar testes

### 3. Concluir Tarefa

1. **Marcar como concluída no task.md**
   ```markdown
   - [x] Tarefa concluída
   ```

2. **Atualizar task-tracking.md**
   - Mover para "Histórico de Tarefas Concluídas"
   - Atualizar estatísticas

3. **Atualizar versionamento**
   - Incrementar build em VERSION.md
   - Adicionar entrada em CHANGELOG.md
   - Atualizar App.tsx e package.json

## 🤖 Usando Agentes de IA

### Seleção de Agente

| Tipo de Trabalho | Agente Principal | Quando Usar |
|------------------|------------------|-------------|
| Nova feature | feature-developer | Implementar nova funcionalidade |
| Bug fix | bug-fixer | Corrigir problemas existentes |
| Refatoração | refactoring-specialist | Melhorar código existente |
| Testes | test-writer | Criar ou executar testes |
| Segurança | security-auditor | Auditoria de segurança |
| Documentação | documentation-writer | Criar/atualizar docs |
| Performance | performance-optimizer | Otimizar performance |
| Database | database-specialist | Mudanças em schema/queries |
| DevOps | devops-specialist | Deploy, CI/CD |

### Aplicação de Skills

Skills são procedimentos reutilizáveis que podem ser aplicados por qualquer agente:

- **test-generation**: Gerar casos de teste
- **security-audit**: Auditoria de segurança
- **bug-investigation**: Investigar bugs sistematicamente
- **refactoring**: Refatoração segura
- **feature-breakdown**: Quebrar features em tarefas
- **code-review**: Revisar código
- **documentation**: Gerar documentação
- **api-design**: Design de APIs

## 📋 Checklist de Sincronização

Use este checklist ao trabalhar em uma tarefa:

### Antes de Começar
- [ ] Tarefa está no task.md
- [ ] Tarefa mapeada em task-tracking.md
- [ ] Agente apropriado identificado
- [ ] Skills relevantes listadas
- [ ] SYMBOLS_TREE.md consultado (evitar duplicação)
- [ ] DESIGN_SYSTEM.md revisado (se UI)
- [ ] Regras fundamentais lidas

### Durante Execução
- [ ] Seguindo playbook do agente
- [ ] Aplicando skills conforme necessário
- [ ] Atualizando SYMBOLS_TREE.md (se novos símbolos)
- [ ] Seguindo padrões do DESIGN_SYSTEM.md
- [ ] Respeitando regras fundamentais

### Após Conclusão
- [ ] task.md atualizado (marcar [x])
- [ ] task-tracking.md atualizado
- [ ] VERSION.md incrementado
- [ ] CHANGELOG.md atualizado
- [ ] Documentação atualizada
- [ ] Testes executados

## 🔍 Exemplo Prático

### Cenário: Implementar Nova Feature de Comentários

#### 1. Planejamento

**task.md**:
```markdown
- [ ] Implementar sistema de comentários em notícias
```

**task-tracking.md**:
- Agente: feature-developer
- Skills: feature-breakdown, api-design, test-generation
- Plano: Ver task-tracking.md para detalhes

#### 2. Consulta de Documentação

1. Ler `.context/agents/feature-developer.md`
2. Aplicar skill `feature-breakdown`
3. Consultar `SYMBOLS_TREE.md` para evitar duplicação
4. Verificar `DESIGN_SYSTEM.md` para padrões UI

#### 3. Implementação

1. Criar tipos em `src/types/comments.ts`
2. Criar service em `src/services/comments/commentService.ts`
3. Criar componente em `src/components/comments/`
4. Atualizar SYMBOLS_TREE.md com novos símbolos

#### 4. Finalização

1. Marcar tarefa como [x] em task.md
2. Atualizar task-tracking.md
3. Incrementar versão
4. Atualizar CHANGELOG.md

## 🚨 Regras Importantes

> [!IMPORTANT]
> **Sempre consultar antes de criar**:
> - SYMBOLS_TREE.md - Evitar duplicação de símbolos
> - DESIGN_SYSTEM.md - Seguir padrões visuais
> - Regras fundamentais - Respeitar constraints

> [!WARNING]
> **Nunca pular etapas**:
> - Não criar código sem consultar documentação
> - Não marcar tarefa como concluída sem atualizar task-tracking.md
> - Não fazer deploy sem incrementar versão

## 📚 Recursos Adicionais

- [Regras Fundamentais](file:///g:/lagoaformosanomomento/.agent/rules/regrasfundamentais.md)
- [SYMBOLS_TREE.md](file:///g:/lagoaformosanomomento/docs/SYMBOLS_TREE.md)
- [DESIGN_SYSTEM.md](file:///g:/lagoaformosanomomento/docs/DESIGN_SYSTEM.md)
- [Task Tracking](file:///g:/lagoaformosanomomento/.context/docs/task-tracking.md)
- [Project Overview](file:///g:/lagoaformosanomomento/.context/docs/project-overview.md)

## 🔄 Manutenção

Este guia deve ser atualizado quando:
- Novos agentes forem criados
- Novas skills forem adicionadas
- O workflow de desenvolvimento mudar
- Novos arquivos de documentação forem criados
