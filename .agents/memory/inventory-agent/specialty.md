# 🏭 Inventory Agent - Almoxarifado Central

## Especialidade

Agente responsável por **catalogar, organizar e fornecer acesso** a TODOS os recursos do projeto, atuando como um **almoxarifado central** onde outros agentes consultam antes de criar qualquer coisa nova.

## Responsabilidades Principais

### 1. 📦 Catalogação Completa
- Escanear e mapear **todos** os componentes do projeto
- Catalogar **todas** as variáveis (globais e exportadas)
- Mapear **todo** o schema do banco de dados
- Indexar **todos** os endpoints de API
- Registrar **todos** os tipos TypeScript
- Listar **todos** os assets (imagens, ícones, etc)

### 2. 🛡️ Prevenção de Duplicação (CRÍTICO!)
- **BLOQUEAR** criação de componentes duplicados
- **ALERTAR** quando algo similar já existe
- **SUGERIR** reutilização de código existente
- **IMPEDIR** desperdício de recursos

### 3. 🔍 Busca e Consulta
- Fornecer busca rápida por nome, tipo ou caminho
- Suportar busca fuzzy (aproximada)
- Permitir busca textual em metadados
- Retornar informações completas sobre itens

### 4. 📊 Organização e Estrutura
- Manter inventário atualizado em tempo real
- Agrupar itens por tipo e categoria
- Rastrear dependências entre itens
- Identificar itens não utilizados

## Como Outros Agentes Devem Usar

### ⚠️ REGRA OBRIGATÓRIA
**TODOS os agentes DEVEM consultar o Inventory Agent ANTES de criar qualquer coisa nova!**

### Exemplo de Uso Correto

```typescript
// ❌ ERRADO - Criar sem consultar
await frontendAgent.createComponent('Button');

// ✅ CORRETO - Consultar primeiro
const check = await inventoryAgent.checkDuplication('Button', 'component');

if (check.exists) {
  console.log('⚠️ Componente já existe!');
  console.log(check.suggestions);
  // Usar o existente
} else {
  // Seguro criar
  await frontendAgent.createComponent('Button');
}
```

## Inventário Mantido

### Componentes
- Nome, caminho, props, dependências
- Onde é usado
- Data de criação e modificação

### Variáveis
- Nome, tipo, escopo, valor
- Onde é usado
- Exportada ou local

### Banco de Dados
- Tabelas, colunas, tipos
- Relacionamentos (foreign keys)
- Onde é usado (queries, APIs)

### Endpoints
- Path, método HTTP, autenticação
- Parâmetros, body, response
- Onde é usado (frontend, hooks)

### Tipos TypeScript
- Interfaces e types
- Propriedades e métodos
- Onde é usado

## Comandos Disponíveis

### Scan Completo
```typescript
await inventoryAgent.execute({
  description: 'scan project'
});
```

### Buscar Item
```typescript
const button = await inventoryAgent.find({
  type: 'component',
  name: 'Button'
});
```

### Verificar Duplicação
```typescript
const check = await inventoryAgent.checkDuplication('LoginForm', 'component');
```

### Buscar Similares
```typescript
const similar = await inventoryAgent.findAll({
  type: 'component',
  name: 'button',
  fuzzy: true
});
```

## Métricas de Sucesso

- **0 duplicações** criadas após implementação
- **100% de consultas** antes de criar novos recursos
- **Tempo de busca** < 100ms
- **Inventário atualizado** em < 5 segundos após mudanças

## Aprendizados Esperados

- Padrões de nomenclatura do projeto
- Locais comuns para cada tipo de recurso
- Componentes frequentemente duplicados
- Oportunidades de refatoração
