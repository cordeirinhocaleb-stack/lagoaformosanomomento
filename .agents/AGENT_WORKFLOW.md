# Fluxo de Trabalho dos Agentes - Guia Completo

## 🎯 Objetivo

Este documento define o **fluxo obrigatório** que todos os agentes devem seguir para:
- Documentar modificações
- Salvar na memória
- Ler histórico
- Consultar repositórios de referência
- Aprender com experiências passadas

---

## 📋 Fluxo Completo de Execução

### 1️⃣ INICIALIZAÇÃO

Quando um agente é criado:

```typescript
// Exemplo: Frontend Agent
const agent = new FrontEndAgent('.agents/memory');
```

**O que acontece automaticamente:**

1. ✅ Cria pasta `.agents/memory/frontend-agent/`
2. ✅ Cria `specialty.md` com especialidade padrão
3. ✅ Cria `successes.json` vazio `[]`
4. ✅ Cria `failures.json` vazio `[]`
5. ✅ Cria `learnings.json` vazio `[]`

---

### 2️⃣ ANTES DE EXECUTAR TAREFA

**Passo 1: Consultar Memória**

```typescript
// Buscar casos similares
const similarCases = this.memory.getSimilarCases(
    this.agentName, 
    taskDescription, 
    5 // limite
);

// Exibir para o usuário
if (similarCases.length > 0) {
    console.log(`💭 Encontrei ${similarCases.length} caso(s) similar(es):`);
    similarCases.forEach((case_, index) => {
        const emoji = case_.result === 'success' ? '✅' : '❌';
        console.log(`  ${index + 1}. ${emoji} ${case_.taskDescription}`);
    });
}
```

**Passo 2: Obter Recomendações**

```typescript
// Buscar aprendizados relevantes
const recommendations = this.memory.getRecommendations(
    this.agentName,
    taskDescription
);

// Exibir para o usuário
if (recommendations.length > 0) {
    console.log(`💡 Recomendações baseadas em aprendizados:`);
    recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
    });
}
```

**Passo 3: Consultar Repositórios de Referência**

```typescript
// Carregar repositórios públicos
const referenceRepos = JSON.parse(
    fs.readFileSync('.agents/memory/reference-repositories.json', 'utf-8')
);

// Exemplo: Frontend Agent consulta React
const reactDocs = referenceRepos.repositories.react.docs;
console.log(`📚 Consultando: ${reactDocs}`);

// Exemplo: Security Agent consulta OWASP
const owaspTop10 = referenceRepos.security_resources.owasp_top_10.url;
console.log(`🔒 Consultando: ${owaspTop10}`);
```

---

### 3️⃣ DURANTE A EXECUÇÃO

**Aplicar Recomendações**

```typescript
async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
    // 1. Aplicar aprendizados anteriores
    const learnings = this.memory.loadMemory(this.agentName).learnings;
    
    // 2. Executar validações
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // 3. Validar baseado em aprendizados
    for (const learning of learnings) {
        if (learning.confidence > 0.7) {
            // Aplicar recomendação com alta confiança
            recommendations.push(learning.recommendation);
        }
    }
    
    // 4. Retornar resultado
    return {
        success: issues.length === 0,
        details: '...',
        issues,
        warnings,
        recommendations
    };
}
```

---

### 4️⃣ APÓS EXECUTAR TAREFA

**Passo 1: Registrar Resultado**

```typescript
// Sucesso
if (result.success) {
    this.memory.recordSuccess(
        this.agentName,
        taskDescription,
        context,
        result.details,
        userFeedback // opcional
    );
}

// Falha
else {
    this.memory.recordFailure(
        this.agentName,
        taskDescription,
        context,
        result.details,
        userFeedback // opcional
    );
}
```

**O que é salvo automaticamente:**

```json
{
  "id": "1737594123456-abc123",
  "timestamp": "2026-01-22T23:00:00.000Z",
  "taskDescription": "Validar componente de login",
  "context": {
    "files": ["components/Login.tsx"],
    "areas": ["frontend", "security"],
    "complexity": "medium"
  },
  "result": "success",
  "details": "Validação concluída sem problemas",
  "userFeedback": null
}
```

---

### 5️⃣ COLETAR FEEDBACK DO USUÁRIO

**Quando o usuário fornece feedback:**

```typescript
await orchestrator.provideFeedback(taskId, 'frontend-agent', {
    satisfied: true,
    likes: [
        'Validação com Zod implementada',
        'Estados de loading/error incluídos'
    ],
    dislikes: [],
    suggestions: ['Adicionar animações']
});
```

**O que acontece:**

1. ✅ Atualiza entrada em `successes.json` ou `failures.json`
2. ✅ Gera aprendizados em `learnings.json`

**Aprendizados gerados:**

```json
{
  "id": "learning-1",
  "pattern": "Repetir: Validação com Zod",
  "description": "Usuário gostou de: Validação com Zod",
  "recommendation": "Continuar fazendo: Validação com Zod",
  "confidence": 0.5,
  "occurrences": 1,
  "lastSeen": "2026-01-22T23:00:00.000Z",
  "examples": ["1737594123456-abc123"]
}
```

---

### 6️⃣ APRENDIZADO CONTÍNUO

**Quando o mesmo padrão aparece novamente:**

```typescript
// Aprendizado existente
const existing = memory.learnings.find(l => l.pattern === pattern);

if (existing) {
    existing.occurrences++;  // Incrementa
    existing.lastSeen = new Date();
    existing.confidence = Math.min(1, existing.confidence + 0.1); // Aumenta confiança
    existing.examples.push(newExampleId);
}
```

**Evolução da confiança:**

- 1ª ocorrência: `confidence = 0.5`
- 2ª ocorrência: `confidence = 0.6`
- 3ª ocorrência: `confidence = 0.7`
- ...
- 5ª ocorrência: `confidence = 0.9`
- Máximo: `confidence = 1.0`

---

## 📂 Estrutura de Arquivos

### `specialty.md`

Define a especialidade do agente:

```markdown
# Frontend Agent - Especialidade

## Responsabilidades
- Validar componentes React/Next.js
- Garantir acessibilidade (WCAG 2.1)
...

## Expertise
- React, Next.js, TypeScript
...

## Regras
- Componentes < 500 linhas
- Sempre incluir estados: loading, error, empty
...

## Tarefas Típicas
- Criar/validar componentes UI
...
```

### `successes.json`

Array de sucessos:

```json
[
  {
    "id": "unique-id",
    "timestamp": "ISO-8601",
    "taskDescription": "string",
    "context": { "files": [], "areas": [], "complexity": "low|medium|high" },
    "result": "success",
    "details": "string",
    "userFeedback": { "satisfied": true, "likes": [], "dislikes": [], "suggestions": [] }
  }
]
```

### `failures.json`

Array de falhas (mesma estrutura, `result: "failure"`):

```json
[
  {
    "id": "unique-id",
    "timestamp": "ISO-8601",
    "taskDescription": "string",
    "context": { ... },
    "result": "failure",
    "details": "string com motivo da falha",
    "userFeedback": { "satisfied": false, "dislikes": [...], ... }
  }
]
```

### `learnings.json`

Array de aprendizados:

```json
[
  {
    "id": "learning-id",
    "pattern": "Repetir: Feature X" ou "Evitar: Problema Y",
    "description": "Usuário gostou/não gostou de: ...",
    "recommendation": "Continuar fazendo / Evitar fazer: ...",
    "confidence": 0.0-1.0,
    "occurrences": number,
    "lastSeen": "ISO-8601",
    "examples": ["task-id-1", "task-id-2"]
  }
]
```

---

## 🔄 Fluxo de Leitura

### Carregar Memória Completa

```typescript
const memory = this.memory.loadMemory(this.agentName);

console.log(`Sucessos: ${memory.successes.length}`);
console.log(`Falhas: ${memory.failures.length}`);
console.log(`Aprendizados: ${memory.learnings.length}`);
console.log(`Taxa de sucesso: ${(memory.stats.successRate * 100).toFixed(1)}%`);
```

### Buscar Casos Específicos

```typescript
// Por similaridade
const similar = this.memory.getSimilarCases(agentName, 'criar componente', 5);

// Por resultado
const allSuccesses = memory.successes;
const allFailures = memory.failures;

// Por data
const recent = memory.successes.filter(s => {
    const date = new Date(s.timestamp);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return date > dayAgo;
});
```

### Filtrar Aprendizados

```typescript
// Alta confiança
const highConfidence = memory.learnings.filter(l => l.confidence > 0.7);

// Mais recentes
const recent = memory.learnings.sort((a, b) => 
    new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
).slice(0, 10);

// Por padrão
const positivePatterns = memory.learnings.filter(l => l.pattern.startsWith('Repetir:'));
const negativePatterns = memory.learnings.filter(l => l.pattern.startsWith('Evitar:'));
```

---

## 🌐 Uso de Repositórios de Referência

### Carregar Repositórios

```typescript
const repos = JSON.parse(
    fs.readFileSync('.agents/memory/reference-repositories.json', 'utf-8')
);
```

### Por Agente

**Frontend Agent:**
```typescript
const react = repos.repositories.react;
const nextjs = repos.repositories.nextjs;
const tailwind = repos.repositories.tailwindcss;
```

**Security Agent:**
```typescript
const owasp = repos.security_resources.owasp_top_10;
const owaspCheatSheets = repos.security_resources.owasp_cheat_sheets;
const dompurify = repos.repositories.dompurify;
```

**Quality Agent:**
```typescript
const eslint = repos.repositories.eslint;
const prettier = repos.repositories.prettier;
const jest = repos.repositories.jest;
```

**Architecture Agent:**
```typescript
const cleanCode = repos.best_practices.clean_code;
const nodeBestPractices = repos.best_practices.node_best_practices;
```

**Documentation Agent:**
```typescript
const mdn = repos.documentation_sources.mdn;
const webDev = repos.documentation_sources.web_dev;
```

---

## ✅ Checklist Obrigatório

Antes de cada execução, o agente DEVE:

- [ ] Consultar memória para casos similares
- [ ] Obter recomendações de aprendizados
- [ ] Consultar repositórios de referência relevantes
- [ ] Aplicar aprendizados com alta confiança (>0.7)

Após cada execução, o agente DEVE:

- [ ] Registrar resultado (sucesso ou falha)
- [ ] Incluir contexto completo (files, areas, complexity)
- [ ] Aguardar feedback do usuário (opcional)
- [ ] Gerar aprendizados baseado em feedback

Periodicamente, o agente DEVE:

- [ ] Limpar entradas antigas (manter últimas 1000)
- [ ] Consolidar aprendizados similares
- [ ] Atualizar confiança baseado em novas ocorrências

---

## 🎯 Exemplo Completo

```typescript
// 1. INICIALIZAÇÃO
const agent = new FrontEndAgent('.agents/memory');

// 2. EXECUTAR COM MEMÓRIA
const result = await agent.executeWithMemory(
    'Validar componente de login',
    {
        files: ['components/Login.tsx'],
        areas: ['frontend', 'security'],
        complexity: 'medium'
    }
);

// 3. FORNECER FEEDBACK
await orchestrator.provideFeedback(taskId, 'frontend-agent', {
    satisfied: true,
    likes: ['Validação com Zod', 'Estados de loading/error'],
    dislikes: [],
    suggestions: ['Adicionar animações']
});

// 4. PRÓXIMA EXECUÇÃO USA APRENDIZADOS
const result2 = await agent.executeWithMemory(
    'Validar componente de registro',
    { ... }
);
// Agente automaticamente aplica: "Usar Zod", "Incluir estados"
```

---

## 📊 Métricas de Sucesso

Cada agente deve manter:

- **Taxa de Sucesso**: `successes / (successes + failures)`
- **Total de Tarefas**: `successes.length + failures.length`
- **Aprendizados Ativos**: `learnings.filter(l => l.confidence > 0.7).length`
- **Última Atualização**: `stats.lastUpdated`

---

## 🚨 Regras Importantes

1. **NUNCA** modificar arquivos de memória manualmente
2. **SEMPRE** usar `MemorySystem` para leitura/escrita
3. **SEMPRE** incluir contexto completo ao registrar
4. **SEMPRE** consultar memória antes de executar
5. **SEMPRE** aplicar aprendizados com alta confiança
6. **SEMPRE** consultar repositórios de referência relevantes

---

## 📝 Resumo

**Fluxo Simplificado:**

```
1. Inicializar → Criar estrutura de memória
2. Consultar → Casos similares + Recomendações + Repositórios
3. Executar → Aplicar aprendizados
4. Registrar → Salvar resultado
5. Feedback → Gerar aprendizados
6. Repetir → Melhorar continuamente
```

**Arquivos por Agente:**
- `specialty.md` - Especialidade (criado automaticamente)
- `successes.json` - Sucessos (atualizado automaticamente)
- `failures.json` - Falhas (atualizado automaticamente)
- `learnings.json` - Aprendizados (atualizado com feedback)

**Repositórios Compartilhados:**
- `reference-repositories.json` - 27 recursos públicos (todos os agentes)

---

**Versão**: 1.0  
**Última Atualização**: 2026-01-22
