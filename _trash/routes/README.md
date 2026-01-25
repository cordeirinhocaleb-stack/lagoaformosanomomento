# 🗑️ Código Removido - Evidências

Este diretório contém código que foi removido do projeto principal mas preservado temporariamente para referência.

---

## 📋 Rotas Desabilitadas

### 1. advertiser_id_disabled

**Data de Remoção**: 2026-01-24  
**Motivo**: Rota desabilitada, substituída por nova implementação  
**Localização Original**: `src/app/advertiser/_id_disabled/`  
**Status**: Código morto - não utilizado  
**Pode ser deletado após**: 2026-02-24 (30 dias)

**Verificação**:
```bash
# Para verificar última modificação
git log --all -- "src/app/advertiser/_id_disabled/"
```

---

### 2. news_slug_disabled

**Data de Remoção**: 2026-01-24  
**Motivo**: Rota desabilitada, substituída por nova implementação  
**Localização Original**: `src/app/news/_slug_disabled/`  
**Status**: Código morto - não utilizado  
**Pode ser deletado após**: 2026-02-24 (30 dias)

**Verificação**:
```bash
# Para verificar última modificação
git log --all -- "src/app/news/_slug_disabled/"
```

---

## ⚠️ Instruções

### Para Restaurar (se necessário)

```bash
# Restaurar advertiser
mv _trash/routes/advertiser_id_disabled src/app/advertiser/_id_disabled

# Restaurar news
mv _trash/routes/news_slug_disabled src/app/news/_slug_disabled
```

### Para Deletar Permanentemente

```bash
# Após 30 dias, se não houver necessidade
rm -rf _trash/routes/advertiser_id_disabled
rm -rf _trash/routes/news_slug_disabled
```

---

## 📊 Estatísticas

| Item | Tamanho | Arquivos |
|------|---------|----------|
| advertiser_id_disabled | - | - |
| news_slug_disabled | - | - |

---

**Criado por**: Sistema Wegho-Agentes v4.1.6  
**Data**: 2026-01-24  
**Auditoria**: Build 002
