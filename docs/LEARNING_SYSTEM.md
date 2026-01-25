# Sistema de Agentes com Aprendizado Contínuo

## 🎯 Visão Geral

Sistema inteligente onde cada agente possui memória persistente, aprende com sucessos e falhas, e o orquestrador seleciona os melhores agentes baseado em histórico de performance.

## 🚀 Início Rápido

### 1. Instalação

```bash
# Já incluído no sistema de agentes
cd seu-projeto
node .agents/test-init-context.js
```

### 2. Uso Básico

```javascript
const { IntelligentOrchestrator } = require('./.agents/orchestrator');
const { ContextLoader } = require('./.agents/context-loader');

// Carregar contexto
const contextLoader = new ContextLoader();
const context = await contextLoader.loadContext();

// Criar orquestrador
const orchestrator = new IntelligentOrchestrator(context);

// Executar tarefa
const result = await orchestrator.orchestrateTask(
    'Criar componente de login com validação'
);

// Fornecer feedback
await orchestrator.provideFeedback(result.taskId, 'frontend-agent', {
    satisfied: true,
    likes: ['Validação implementada', 'Acessibilidade OK'],
    dislikes: [],
    suggestions: ['Adicionar animações']
});
```

## 📁 Estrutura de Memória

```
.agents/memory/
├── frontend-agent/
│   ├── specialty.md          # Especialidade e responsabilidades
│   ├── successes.json        # Histórico de sucessos
│   ├── failures.json         # Histórico de falhas
│   └── learnings.json        # Padrões aprendidos
├── security-agent/
│   └── ...
└── ...
```

## 🧠 Como Funciona o Aprendizado

### 1. Registro Automático

Cada vez que um agente executa uma tarefa:
- ✅ **Sucesso**: Registrado em `successes.json`
- ❌ **Falha**: Registrado em `failures.json`

### 2. Feedback do Usuário

Após cada tarefa, você pode fornecer feedback:

```javascript
await orchestrator.provideFeedback(taskId, agentName, {
    satisfied: true,
    likes: ['Feature X', 'Implementação Y'],
    dislikes: ['Problema Z'],
    suggestions: ['Melhorar W']
});
```

### 3. Geração de Aprendizados

O sistema analisa feedback e gera aprendizados:
- **Padrões positivos**: "Repetir: Feature X"
- **Padrões negativos**: "Evitar: Problema Z"
- **Sugestões**: "Considerar: Melhorar W"

### 4. Aplicação em Tarefas Futuras

Em tarefas similares, agentes:
- 🔍 Consultam memória para casos parecidos
- 💡 Aplicam recomendações aprendidas
- ⚠️ Alertam sobre padrões problemáticos

## 🎯 Orquestrador Inteligente

### Seleção Baseada em Performance

O orquestrador analisa histórico de cada agente:

```
📊 frontend-agent:
   Taxa de sucesso: 85.5%
   Total de tarefas: 23
   ✅ Selecionado (alta confiança)

📊 security-agent:
   Taxa de sucesso: 92.1%
   Total de tarefas: 38
   ✅ Selecionado (alta confiança)
```

### Escalação Inteligente

1. **Análise da Tarefa**: Identifica áreas envolvidas
2. **Seleção de Agentes**: Escolhe melhores baseado em histórico
3. **Distribuição**: Atribui subtarefas específicas
4. **Execução**: Agentes trabalham com memória
5. **Feedback**: Coleta resultados e aprende

## 📊 Exemplos de Uso

### Exemplo 1: Componente com Validação

```javascript
const result = await orchestrator.orchestrateTask(
    'Criar componente de formulário com validação Zod e estados de loading/error'
);

// Agentes selecionados:
// - frontend-agent: Validar UI/UX e estados
// - security-agent: Verificar validação de inputs
// - architecture-agent: Garantir estrutura < 500 linhas
```

### Exemplo 2: Feedback Positivo

```javascript
await orchestrator.provideFeedback(result.taskId, 'frontend-agent', {
    satisfied: true,
    likes: [
        'Estados de loading/error implementados',
        'Validação com Zod',
        'Acessibilidade com aria-labels'
    ],
    dislikes: [],
    suggestions: ['Adicionar testes unitários']
});

// Aprendizados gerados:
// ✅ "Repetir: Estados de loading/error implementados"
// ✅ "Repetir: Validação com Zod"
// ✅ "Repetir: Acessibilidade com aria-labels"
// 💡 "Sugestão: Adicionar testes unitários"
```

### Exemplo 3: Feedback Negativo

```javascript
await orchestrator.provideFeedback(result.taskId, 'security-agent', {
    satisfied: false,
    likes: [],
    dislikes: [
        'Não detectou falta de sanitização',
        'Permitiu uso de dangerouslySetInnerHTML'
    ],
    suggestions: ['Adicionar verificação de DOMPurify']
});

// Aprendizados gerados:
// ❌ "Evitar: Não detectou falta de sanitização"
// ❌ "Evitar: Permitiu uso de dangerouslySetInnerHTML"
// 💡 "Sugestão: Adicionar verificação de DOMPurify"
```

## 🔧 Configuração

### Habilitar/Desabilitar Memória

```typescript
// .agents/config.ts
export const DEFAULT_CONFIG: AgentConfig = {
    // ...
    memoryEnabled: true,           // Habilitar sistema de memória
    memoryPath: '.agents/memory',  // Caminho da memória
    feedbackEnabled: true,          // Habilitar coleta de feedback
    autoLearn: false,               // Requerer aprovação manual
    maxMemoryEntries: 1000,         // Limite de entradas
};
```

### Aprendizado Automático vs Manual

- **Manual** (`autoLearn: false`): Requer aprovação para cada aprendizado
- **Automático** (`autoLearn: true`): Aprende automaticamente com feedback

## 📈 Relatórios

### Ver Feedback de um Agente

```javascript
const report = orchestrator.getFeedbackReport('frontend-agent');
console.log(report);
```

Saída:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RELATÓRIO DE FEEDBACK - frontend-agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Estatísticas:
   Total de tarefas: 23
   Taxa de sucesso: 85.5%

👍 O que os usuários mais gostam:
   1. Estados de loading/error implementados
   2. Validação com Zod
   3. Acessibilidade com aria-labels

👎 O que os usuários não gostam:
   1. Falta de testes unitários
   2. Componentes muito grandes

💡 Sugestões recorrentes:
   1. Adicionar testes unitários
   2. Dividir componentes grandes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎓 Melhores Práticas

### 1. Forneça Feedback Específico

❌ **Ruim**:
```javascript
likes: ['Bom trabalho']
```

✅ **Bom**:
```javascript
likes: [
    'Validação de email com regex correto',
    'Estados de loading implementados',
    'Acessibilidade com ARIA'
]
```

### 2. Seja Consistente

- Forneça feedback para todas as tarefas importantes
- Use terminologia consistente
- Seja específico sobre o que gostou/não gostou

### 3. Monitore Aprendizados

```javascript
// Ver aprendizados periodicamente
const report = orchestrator.getFeedbackReport('frontend-agent');
console.log(report);
```

### 4. Limpe Memória Antiga

```javascript
// Memória é limitada a maxMemoryEntries (padrão: 1000)
// Entradas mais antigas são removidas automaticamente
```

## 🚨 Troubleshooting

### Memória não está sendo salva

1. Verificar permissões da pasta `.agents/memory/`
2. Verificar se `memoryEnabled: true` em config
3. Verificar logs de erro

### Agentes não estão aprendendo

1. Verificar se está fornecendo feedback
2. Verificar se `feedbackEnabled: true`
3. Ver arquivos `learnings.json` para confirmar

### Performance lenta

1. Reduzir `maxMemoryEntries` em config
2. Limpar memória antiga manualmente
3. Desabilitar memória para tarefas simples

## 📚 Arquivos de Especialidade

Cada agente tem um arquivo `specialty.md` que define:
- Responsabilidades
- Expertise
- Regras
- Tarefas típicas

Exemplo: `.agents/memory/frontend-agent/specialty.md`

## 🔄 Fluxo Completo

```
1. Usuário solicita tarefa
   ↓
2. Orquestrador analisa tarefa
   ↓
3. Seleciona melhores agentes (baseado em histórico)
   ↓
4. Agentes consultam memória
   ↓
5. Agentes executam com recomendações
   ↓
6. Resultados são registrados
   ↓
7. Usuário fornece feedback
   ↓
8. Sistema gera aprendizados
   ↓
9. Próxima tarefa usa aprendizados
```

## 🎉 Benefícios

- ✅ **Aprendizado Contínuo**: Agentes melhoram com o tempo
- ✅ **Seleção Inteligente**: Melhores agentes para cada tarefa
- ✅ **Evita Erros**: Aprende com falhas passadas
- ✅ **Personalização**: Adapta-se ao seu estilo
- ✅ **Transparência**: Histórico completo de decisões
