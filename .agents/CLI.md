# 🤖 CLI - Comandos do Sistema de Agentes

Interface de linha de comando para facilitar o uso dos agentes.

---

## 📋 Comandos Disponíveis

### 1. !comandos
**Mostra lista de todos os comandos**

```bash
node .agents/cli.js "!comandos"
```

---

### 2. !iniciar contexto
**Carrega contexto completo do projeto**

- Detecta se projeto é novo ou existente
- Se existente: executa auditoria automática de código
- Faz perguntas sobre domínio, stack, features
- Salva perfil em `docs/PROJECT_PROFILE.json`

```bash
node .agents/cli.js "!iniciar contexto"
```

**Equivalente a**:
```bash
node .agents/test-init-context.js
```

---

### 3. !rever codigo
**Executa auditoria completa do código**

- Escaneia todos arquivos `.ts`, `.tsx`, `.js`, `.jsx`
- Detecta 9 tipos de violações (P0/P1/P2)
- Gera relatório em `docs/AUDIT_REPORT.md`

```bash
node .agents/cli.js "!rever codigo"
```

**Saída**:
```
📊 RELATÓRIO DE AUDITORIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Arquivos analisados: 47
⚠️  Total de violações: 23

💀 P0 (CRÍTICO): 3
⚠️  P1 (IMPORTANTE): 12
💡 P2 (MELHORIA): 8

✅ Relatório salvo em: docs/AUDIT_REPORT.md
```

---

### 4. !rever plano
**Revisa plano de implementação**

- Mostra `docs/IMPLEMENTATION_PLAN.md`
- Exibe perfil do projeto (`PROJECT_PROFILE.json`)
- Lista próximos passos

```bash
node .agents/cli.js "!rever plano"
```

---

### 5. !voltar versao
**Reverte para versão anterior (Git)**

- Lista últimos 10 commits
- Mostra comandos para reverter
- Opções: `git revert` (seguro) ou `git reset` (perigoso)

```bash
node .agents/cli.js "!voltar versao"
```

**Saída**:
```
📜 Últimos commits:

abc1234 feat: adicionar login
def5678 fix: corrigir validação
...

⚠️  Para reverter, execute manualmente:

   git revert <commit-hash>   # Criar commit de reversão
   ou
   git reset --hard <commit-hash>   # Voltar diretamente (CUIDADO!)
```

---

### 6. !criar backup
**Cria backup completo do estado atual**

- Salva em `.backups/backup-YYYYMMDD-HHmmss/`
- Inclui: código, docs, configs
- Exclui: node_modules, .next, dist
- Cria `backup-info.json` com metadados

```bash
node .agents/cli.js "!criar backup"
```

**Saída**:
```
💾 Criando backup em: .backups/backup-2026-01-20T10-40-00

  ✅ app/
  ✅ components/
  ✅ hooks/
  ✅ docs/
  ✅ .agents/
  ✅ package.json

✅ Backup criado com sucesso!
📂 Localização: .backups/backup-2026-01-20T10-40-00
📊 6 itens salvos

💡 Para restaurar:
   cp -r .backups/backup-2026-01-20T10-40-00/* .
```

---

## 🚀 Uso Rápido via NPM

Adicione ao `package.json`:

```json
{
  "scripts": {
    "agent": "node .agents/cli.js"
  }
}
```

Depois use:

```bash
npm run agent "!comandos"
npm run agent "!iniciar contexto"
npm run agent "!rever codigo"
npm run agent "!rever plano"
npm run agent "!voltar versao"
npm run agent "!criar backup"
```

---

## 💡 Exemplos de Uso

### Workflow Completo

```bash
# 1. Iniciar contexto (primeira vez)
npm run agent "!iniciar contexto"

# 2. Antes de começar implementação
npm run agent "!criar backup"

# 3. Após implementar código
npm run agent "!rever codigo"

# 4. Se houver problemas, voltar
npm run agent "!voltar versao"

# 5. Revisar plano antes de deploy
npm run agent "!rever plano"
```

### Auditoria Rápida

```bash
# Auditar código atual
npm run agent "!rever codigo"

# Se P0 > 0: corrigir e auditar novamente
# ... (fazer correções)
npm run agent "!rever codigo"
```

### Backup Antes de Deploy

```bash
# Criar backup
npm run agent "!criar backup"

# Deploy
npm run build
# ... (deploy)

# Se algo der errado, restaurar:
cp -r .backups/backup-2026-01-20T10-40-00/* .
```

---

## 📌 Notas

- **Todos os comandos** podem ser executados diretamente: `node .agents/cli.js "!comando"`
- **Scripts NPM** são apenas atalhos convenientes
- **Backups** não incluem `node_modules`, `.next`, `dist` (reduz tamanho)
- **Git necessário** para `!voltar versao`

---

**Versão**: 1.0.0  
**Última atualização**: 2026-01-20
