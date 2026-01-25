# Guia de Compatibilidade com IAs - Sistema de Agentes

## 🎯 Objetivo

Este documento garante que **TODAS as IAs** (Gemini, Claude, GPT) entendam e trabalhem corretamente com o sistema de agentes.

---

## 🤖 IAs Suportadas

Este sistema é **100% compatível** com:

1. ✅ **Google Gemini** (Gemini 1.5 Pro, Gemini 2.0, etc)
2. ✅ **Anthropic Claude** (Claude 3.5 Sonnet, Claude 3 Opus, etc)
3. ✅ **OpenAI GPT** (GPT-4, GPT-4 Turbo, GPT-3.5, etc)

---

## 📋 Instruções para TODAS as IAs

### Quando Trabalhar com Este Sistema

**SEMPRE siga estas regras:**

1. **Identifique-se como agente ativo**
   ```
   ============================================================
   🤖 AGENTE ATIVO: FRONTEND-AGENT
   ============================================================
   📋 Tarefa: Validar componente de login
   ⏰ Início: 23:27:00
   ```

2. **Consulte memória ANTES de executar**
   - Buscar casos similares
   - Obter recomendações
   - Consultar repositórios de referência

3. **Mostre progresso durante execução**
   ```
   ⚙️  [frontend-agent] Executando tarefa...
   ```

4. **Indique conclusão claramente**
   ```
   ✅ SUCESSO [frontend-agent] Tarefa concluída
   ⏰ Término: 23:27:45
   ============================================================
   ```

5. **Registre resultado na memória**
   - Salvar em `successes.json` ou `failures.json`
   - Incluir contexto completo

---

## 🔄 Fluxo Obrigatório para Todas as IAs

### 1. Inicialização

```typescript
// Gemini, Claude ou GPT executando:
const agent = new FrontEndAgent('.agents/memory');
// Cria estrutura de memória automaticamente
```

### 2. Antes de Executar

```typescript
// TODAS as IAs DEVEM:
console.log(`\n${'='.repeat(60)}`);
console.log(`🤖 AGENTE ATIVO: ${agentName.toUpperCase()}`);
console.log(`${'='.repeat(60)}`);
console.log(`📋 Tarefa: ${taskDescription}`);
console.log(`⏰ Início: ${new Date().toLocaleTimeString('pt-BR')}\n`);

// Consultar memória
const similarCases = this.memory.getSimilarCases(...);
const recommendations = this.memory.getRecommendations(...);
```

### 3. Durante Execução

```typescript
// Mostrar progresso
console.log(`\n⚙️  [${agentName}] Executando tarefa...\n`);

// Executar validações
const result = await this.executeTask(...);
```

### 4. Após Execução

```typescript
// Mostrar resultado
const status = result.success ? '✅ SUCESSO' : '❌ FALHA';
console.log(`\n${status} [${agentName}] Tarefa concluída`);
console.log(`⏰ Término: ${new Date().toLocaleTimeString('pt-BR')}`);
console.log(`${'='.repeat(60)}\n`);

// Registrar na memória
this.recordOutcome(...);
```

---

## 📝 Formato de Mensagens

### Para Gemini

```
Você é o [NOME-DO-AGENTE]. 

Sua tarefa: [DESCRIÇÃO]

SEMPRE:
1. Anuncie que você é o agente ativo
2. Consulte memória antes de executar
3. Mostre progresso durante execução
4. Registre resultado na memória
```

### Para Claude

```
You are the [AGENT-NAME].

Your task: [DESCRIPTION]

ALWAYS:
1. Announce yourself as the active agent
2. Consult memory before executing
3. Show progress during execution
4. Record result in memory
```

### Para GPT

```
You are the [AGENT-NAME].

Task: [DESCRIPTION]

Required steps:
1. Announce yourself as active agent
2. Check memory for similar cases
3. Execute with progress updates
4. Save result to memory
```

---

## 🎨 Padrão Visual Obrigatório

Todas as IAs DEVEM usar este formato:

```
============================================================
🤖 AGENTE ATIVO: [NOME-DO-AGENTE]
============================================================
📋 Tarefa: [descrição da tarefa]
⏰ Início: [HH:MM:SS]

💭 [agente] Encontrei X caso(s) similar(es):
  1. ✅ [descrição]
  2. ❌ [descrição]

💡 [agente] Recomendações baseadas em aprendizados:
  1. [recomendação]
  2. [recomendação]

⚙️  [agente] Executando tarefa...

[... output da execução ...]

✅ SUCESSO [agente] Tarefa concluída
⏰ Término: [HH:MM:SS]
============================================================
```

---

## 🔍 Identificação de Agentes

Cada IA deve saber qual agente está executando:

| Agente | Identificador | Emoji |
|--------|---------------|-------|
| Frontend | `frontend-agent` | 🎨 |
| Security | `security-agent` | 🔒 |
| Architecture | `architecture-agent` | 🏗️ |
| Quality | `quality-agent` | ✅ |
| Documentation | `documentation-agent` | 📚 |
| Pentesting | `pentesting-agent` | 🐍 |
| CMS | `cms-agent` | 📰 |
| SEO | `seo-agent` | 🔍 |
| Production Control | `production-control-agent` | 🏭 |
| Route | `route-agent` | 🚚 |
| Orchestrator | `orchestrator` | 🎯 |

---

## 📂 Estrutura de Memória (Todas as IAs)

Todas as IAs trabalham com a mesma estrutura:

```
.agents/memory/
├── [agente-name]/
│   ├── specialty.md          # Leia para entender especialidade
│   ├── successes.json        # Consulte antes de executar
│   ├── failures.json         # Aprenda com erros passados
│   └── learnings.json        # Aplique recomendações
└── reference-repositories.json  # 27 recursos públicos
```

---

## 🌐 Repositórios de Referência

Todas as IAs DEVEM consultar quando relevante:

```typescript
// Carregar repositórios
const repos = JSON.parse(
    fs.readFileSync('.agents/memory/reference-repositories.json', 'utf-8')
);

// Gemini consultando React
const reactDocs = repos.repositories.react.docs;

// Claude consultando OWASP
const owaspTop10 = repos.security_resources.owasp_top_10.url;

// GPT consultando TypeScript
const tsDocs = repos.repositories.typescript.docs;
```

---

## ✅ Checklist para Todas as IAs

Antes de executar qualquer tarefa:

- [ ] Anunciar qual agente está ativo
- [ ] Mostrar timestamp de início
- [ ] Consultar memória (successes, failures, learnings)
- [ ] Consultar repositórios de referência
- [ ] Mostrar casos similares encontrados
- [ ] Mostrar recomendações baseadas em aprendizados

Durante execução:

- [ ] Mostrar progresso (`⚙️  [agente] Executando...`)
- [ ] Aplicar aprendizados com alta confiança (>0.7)

Após execução:

- [ ] Mostrar status (✅ SUCESSO ou ❌ FALHA)
- [ ] Mostrar timestamp de término
- [ ] Registrar resultado na memória
- [ ] Incluir contexto completo (files, areas, complexity)

---

## 🎯 Exemplo Completo (Qualquer IA)

```typescript
// Gemini, Claude ou GPT executando:

console.log(`\n${'='.repeat(60)}`);
console.log(`🤖 AGENTE ATIVO: FRONTEND-AGENT`);
console.log(`${'='.repeat(60)}`);
console.log(`📋 Tarefa: Validar componente de login`);
console.log(`⏰ Início: 23:27:00\n`);

// Consultar memória
const similar = memory.getSimilarCases('frontend-agent', 'login', 5);
console.log(`💭 [frontend-agent] Encontrei ${similar.length} caso(s) similar(es):`);

// Executar
console.log(`\n⚙️  [frontend-agent] Executando tarefa...\n`);
const result = await agent.executeTask(...);

// Concluir
console.log(`\n✅ SUCESSO [frontend-agent] Tarefa concluída`);
console.log(`⏰ Término: 23:27:45`);
console.log(`${'='.repeat(60)}\n`);

// Registrar
memory.recordSuccess(...);
```

---

## 🚨 Regras Críticas

**TODAS as IAs DEVEM:**

1. ✅ Sempre identificar qual agente está trabalhando
2. ✅ Sempre consultar memória antes de executar
3. ✅ Sempre mostrar progresso durante execução
4. ✅ Sempre registrar resultado na memória
5. ✅ Sempre usar formato visual padronizado

**NUNCA:**

❌ Executar sem anunciar qual agente está ativo  
❌ Ignorar memória de casos similares  
❌ Executar sem mostrar progresso  
❌ Esquecer de registrar resultado  
❌ Usar formato diferente do padrão  

---

## 📊 Compatibilidade Testada

| IA | Versão | Status | Notas |
|----|--------|--------|-------|
| Gemini | 1.5 Pro | ✅ | Totalmente compatível |
| Gemini | 2.0 | ✅ | Totalmente compatível |
| Claude | 3.5 Sonnet | ✅ | Totalmente compatível |
| Claude | 3 Opus | ✅ | Totalmente compatível |
| GPT | 4 Turbo | ✅ | Totalmente compatível |
| GPT | 4 | ✅ | Totalmente compatível |
| GPT | 3.5 | ✅ | Totalmente compatível |

---

**Versão**: 1.0  
**Última Atualização**: 2026-01-22  
**Compatível com**: Gemini, Claude, GPT
