---
description: Sincronizar task.md com sistema .context
---

# Workflow: Sincronização task.md ↔ .context

Este workflow garante que o task.md (raiz) e o sistema .context permaneçam sincronizados.

## Quando Usar

- Ao adicionar nova tarefa ao task.md
- Ao concluir uma tarefa
- Ao mudar status de uma tarefa
- Periodicamente (a cada 5-10 tarefas concluídas)

## Passos

### 1. Revisar task.md

Abra e revise o arquivo `task.md` na raiz do projeto:

```bash
# Visualizar tarefas pendentes
grep "\[ \]" task.md

# Visualizar tarefas concluídas
grep "\[x\]" task.md
```

### 2. Atualizar task-tracking.md

Para cada nova tarefa em task.md:

1. Abrir `.context/docs/task-tracking.md`
2. Adicionar entrada na seção apropriada:
   - Identificar agente(s) recomendado(s)
   - Listar skills aplicáveis
   - Criar plano de ação
   - Estimar complexidade

Exemplo:
```markdown
### [Nome da Tarefa]

**Status**: Pendente  
**Agente Recomendado**: feature-developer  
**Skills Aplicáveis**: feature-breakdown, test-generation

#### Plano de Ação
- [ ] Passo 1
- [ ] Passo 2
```

### 3. Verificar Documentação Core

Garantir que documentação está atualizada:

- [ ] `docs/SYMBOLS_TREE.md` - Mapa de símbolos atualizado
- [ ] `docs/DESIGN_SYSTEM.md` - Padrões visuais documentados
- [ ] `.context/docs/project-overview.md` - Overview reflete estado atual

### 4. Atualizar Estatísticas

Em `task-tracking.md`, atualizar tabela de status:

```markdown
| Categoria | Total | Concluídas | Pendentes | % Completo |
|-----------|-------|------------|-----------|------------|
| [Categoria] | X | Y | Z | W% |
```

### 5. Sincronizar Versionamento

Se tarefas foram concluídas:

1. Atualizar `VERSION.md`:
   ```markdown
   ## v0.0.0 (Build X+1)
   - [Descrição das mudanças]
   ```

2. Atualizar `CHANGELOG.md`:
   ```markdown
   ### [Build X+1] - 2026-01-20
   #### Added
   - Nova funcionalidade

   #### Fixed
   - Bug corrigido
   ```

3. Atualizar `package.json`:
   ```json
   {
     "version": "0.0.X"
   }
   ```

4. Atualizar `src/App.tsx`:
   ```typescript
   const CURRENT_VERSION = "0.0.0";
   const CURRENT_BUILD = X+1;
   ```

### 6. Validar Integridade

Executar checklist de validação:

- [ ] Todas as tarefas em task.md têm entrada em task-tracking.md
- [ ] Tarefas concluídas estão marcadas em ambos os arquivos
- [ ] Estatísticas em task-tracking.md estão corretas
- [ ] Versionamento está sincronizado
- [ ] SYMBOLS_TREE.md reflete código atual
- [ ] Nenhuma duplicação de símbolos

### 7. Commit das Mudanças

// turbo
```bash
git add task.md .context/docs/task-tracking.md docs/ VERSION.md CHANGELOG.md package.json src/App.tsx
git commit -m "chore: sync task.md with .context system (Build X+1)"
```

## Checklist Rápido

Use este checklist para sincronização rápida:

```markdown
- [ ] task.md revisado
- [ ] task-tracking.md atualizado
- [ ] Estatísticas atualizadas
- [ ] Documentação core verificada
- [ ] Versionamento sincronizado
- [ ] Integridade validada
- [ ] Mudanças commitadas
```

## Frequência Recomendada

- **Diária**: Se trabalhando ativamente no projeto
- **Por tarefa**: Ao concluir cada tarefa
- **Semanal**: Mínimo para projetos ativos
- **Antes de deploy**: Sempre antes de fazer deploy

## Automação (Futuro)

Este workflow pode ser automatizado com:

```bash
# Script futuro
npm run sync-context
```

## Notas

> [!IMPORTANT]
> Manter task.md e .context sincronizados é essencial para:
> - Rastreamento preciso de progresso
> - Colaboração eficiente com IA
> - Documentação sempre atualizada
> - Evitar duplicação de trabalho

> [!TIP]
> Use este workflow como template para criar seus próprios workflows de sincronização personalizados.
