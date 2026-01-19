# Plano 2 [conformidade-admin] - Correção de Violações das 10 Regras

**Data de Criação:** 19/01/2026  
**Status:** Em Planejamento  
**Build Atual:** 13  
**Build Alvo:** 14

---

## 📋 Objetivo

Corrigir as **117 violações** detectadas na auditoria de `src/components/admin`, garantindo conformidade total com as 10 regras fundamentais do projeto.

## 🎯 Escopo

### Incluído
- Eliminação de 78 usos de `any` em áreas críticas
- Renomeação de 39 componentes para padrão semântico
- Criação de tipos explícitos e DTOs
- Atualização do `SYMBOLS_TREE.md`

### Excluído
- Refatoração de lógica de negócio (será feito em plano separado)
- Mudanças em componentes fora de `src/components/admin`
- Alterações em APIs ou serviços

---

## ⚠️ Riscos e Invariantes

### Riscos Principais
1. **Quebra de tipos:** Substituir `any` pode expor erros de tipo existentes
2. **Regressão funcional:** Renomear componentes pode quebrar imports
3. **Conflitos de merge:** 94 arquivos afetados simultaneamente

### Invariantes (Não Quebrar)
- ✅ Funcionalidade existente deve permanecer idêntica
- ✅ Nenhum componente público pode ter API alterada
- ✅ Testes existentes devem continuar passando
- ✅ RLS e segurança não podem ser comprometidos

### Mitigação
- Fazer mudanças em batches pequenos (10-15 arquivos por vez)
- Testar cada batch antes de prosseguir
- Manter commits atômicos e reversíveis

---

## 🏗️ Fases de Implementação

### Fase 1: Preparação (Tipos Base)
Criar estrutura de tipos em `src/types/admin/`

### Fase 2: Correção de Tipos (4 Batches)
Substituir `any` por tipos explícitos

### Fase 3: Renomeação Semântica
Renomear 39 componentes

### Fase 4: Validação e Build Bump
Verificar conformidade e incrementar build

---

*Veja detalhes completos no arquivo de implementação.*
