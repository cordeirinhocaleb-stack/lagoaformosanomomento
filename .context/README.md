# Sistema .context - Lagoa Formosa no Momento

> **Versão**: 1.0  
> **Última Atualização**: 2026-01-20

## 📖 Visão Geral

O sistema `.context` é um framework de organização e documentação projetado para facilitar a colaboração entre desenvolvedores humanos e agentes de IA. Ele fornece estrutura, padrões e workflows para gerenciamento eficiente de tarefas e manutenção de código.

## 🏗️ Estrutura

```
.context/
├── agents/          # Agentes especializados (14 tipos)
│   ├── feature-developer.md
│   ├── bug-fixer.md
│   ├── test-writer.md
│   ├── security-auditor.md
│   └── ...
├── skills/          # Skills reutilizáveis (10 skills)
│   ├── test-generation/
│   ├── security-audit/
│   ├── bug-investigation/
│   └── ...
└── docs/            # Documentação técnica
    ├── task-tracking.md
    ├── integration-guide.md
    ├── pending-tasks-analysis.md
    ├── project-overview.md
    └── ...
```

## 🤖 Agentes Disponíveis

| Agente | Especialidade | Quando Usar |
|--------|---------------|-------------|
| **feature-developer** | Desenvolvimento de features | Implementar nova funcionalidade |
| **bug-fixer** | Correção de bugs | Resolver problemas existentes |
| **test-writer** | Criação de testes | Escrever testes automatizados |
| **security-auditor** | Auditoria de segurança | Revisar segurança do código |
| **documentation-writer** | Documentação | Criar/atualizar documentação |
| **refactoring-specialist** | Refatoração | Melhorar código existente |
| **performance-optimizer** | Performance | Otimizar velocidade/recursos |
| **database-specialist** | Database | Mudanças em schema/queries |
| **devops-specialist** | DevOps | Deploy, CI/CD, infraestrutura |
| **frontend-specialist** | Frontend | UI/UX, componentes React |
| **backend-specialist** | Backend | APIs, serviços, lógica de negócio |
| **mobile-specialist** | Mobile | Desenvolvimento mobile |
| **code-reviewer** | Code Review | Revisar pull requests |
| **architect-specialist** | Arquitetura | Design de sistemas |

## 🎯 Skills Disponíveis

| Skill | Descrição | Fases |
|-------|-----------|-------|
| **test-generation** | Gerar casos de teste | E, V |
| **security-audit** | Auditoria de segurança | R, V |
| **bug-investigation** | Investigação de bugs | E, V |
| **refactoring** | Refatoração segura | E |
| **feature-breakdown** | Quebrar features em tarefas | P |
| **code-review** | Revisar código | R, V |
| **documentation** | Gerar documentação | P, C |
| **api-design** | Design de APIs | P, R |
| **commit-message** | Mensagens de commit | E, C |
| **pr-review** | Revisar pull requests | R, V |

**Fases**: P=Planning, R=Review, E=Execution, V=Validation, C=Confirmation

## 📋 Integração com task.md

O sistema `.context` trabalha em conjunto com `task.md` (raiz do projeto):

1. **task.md** - Lista de tarefas principal
2. **task-tracking.md** - Mapeamento detalhado de tarefas para agentes
3. **integration-guide.md** - Guia de uso do sistema

### Workflow Básico

```bash
# 1. Verificar tarefas
cat task.md

# 2. Consultar plano detalhado
cat .context/docs/task-tracking.md

# 3. Sincronizar sistema
npm run sync-context

# 4. Seguir workflow
cat .agent/workflows/context-sync.md
```

## 🚀 Início Rápido

### Para Desenvolvedores

1. **Consultar tarefa**: Verificar `task.md` e `task-tracking.md`
2. **Escolher agente**: Selecionar agente apropriado em `.context/agents/`
3. **Aplicar skills**: Usar skills relevantes de `.context/skills/`
4. **Seguir padrões**: Consultar `docs/SYMBOLS_TREE.md` e `docs/DESIGN_SYSTEM.md`
5. **Atualizar**: Marcar tarefa como concluída e atualizar documentação

### Para Agentes de IA

1. **Ler documentação**: Começar com `integration-guide.md`
2. **Identificar tarefa**: Verificar `task-tracking.md` para tarefas atribuídas
3. **Consultar playbook**: Ler `.context/agents/[agente].md`
4. **Aplicar skills**: Seguir instruções em `.context/skills/[skill]/SKILL.md`
5. **Atualizar sistema**: Marcar progresso e atualizar documentação

## 📚 Documentação Principal

| Documento | Localização | Propósito |
|-----------|-------------|-----------|
| **Task Tracking** | `.context/docs/task-tracking.md` | Rastreamento de tarefas |
| **Integration Guide** | `.context/docs/integration-guide.md` | Guia de integração |
| **Pending Tasks** | `.context/docs/pending-tasks-analysis.md` | Análise de tarefas pendentes |
| **Project Overview** | `.context/docs/project-overview.md` | Visão geral do projeto |
| **SYMBOLS_TREE** | `../docs/SYMBOLS_TREE.md` | Mapa de símbolos do código |
| **DESIGN_SYSTEM** | `../docs/DESIGN_SYSTEM.md` | Sistema de design |
| **RULES_MASTER** | `../docs/RULES_MASTER.md` | Regras do projeto |

## 🔄 Sincronização Automática

Execute o script de sincronização para verificar o estado do projeto:

```bash
npm run sync-context
```

O script irá:
- ✅ Verificar arquivos essenciais
- 📊 Analisar progresso de tarefas
- 🎯 Listar tarefas pendentes
- 🔍 Verificar integridade da documentação
- 💡 Fornecer recomendações

## 🛠️ Manutenção

### Atualizar Documentação

Sempre que criar novos símbolos ou padrões:

1. **SYMBOLS_TREE.md**: Adicionar novos símbolos (classes, interfaces, funções)
2. **DESIGN_SYSTEM.md**: Documentar novos padrões visuais
3. **task-tracking.md**: Atualizar estatísticas e mapeamentos

### Workflow de Sincronização

Siga o workflow em `.agent/workflows/context-sync.md`:

1. Revisar task.md
2. Atualizar task-tracking.md
3. Verificar documentação core
4. Atualizar estatísticas
5. Sincronizar versionamento
6. Validar integridade
7. Commit das mudanças

## 📊 Status Atual

- **Tarefas Totais**: 22
- **Concluídas**: 21 (95.5%)
- **Pendentes**: 1 (4.5%)
- **Agentes Configurados**: 14
- **Skills Disponíveis**: 10
- **Documentação**: 100% sincronizada

## 🔗 Links Úteis

- [Task Principal](../task.md)
- [Regras Fundamentais](../.agent/rules/regrasfundamentais.md)
- [Workflows](../.agent/workflows/)
- [Scripts de Automação](../scripts/)

## 💡 Dicas

> [!TIP]
> Use `npm run sync-context` regularmente para manter o sistema atualizado

> [!IMPORTANT]
> Sempre consulte SYMBOLS_TREE.md antes de criar novos símbolos para evitar duplicação

> [!NOTE]
> Este sistema é projetado para evoluir. Adicione novos agentes e skills conforme necessário.

## 📝 Contribuindo

Para adicionar novos agentes ou skills:

1. Criar arquivo em `.context/agents/` ou `.context/skills/`
2. Seguir formato YAML frontmatter + markdown
3. Atualizar este README
4. Atualizar `task-tracking.md` com novo mapeamento

## 📄 Licença

Este sistema faz parte do projeto Lagoa Formosa no Momento.
