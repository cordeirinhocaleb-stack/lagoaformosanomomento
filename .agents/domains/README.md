# Agentes de Domínio

Agentes especializados para diferentes domínios de negócio.

---

## 📰 News Domain (Site de Notícias)

### ✅ Implementados:
- **cms-agent.ts** - Validação de artigos/posts
- **seo-agent.ts** - Meta tags, structured data, sitemap

### 🚧 Pendentes:
- **content-agent.ts** - Qualidade de conteúdo, links quebrados
- **analytics-agent.ts** - Métricas, dashboards, A/B tests

---

## 🏭 Production Domain (Produção/Expedição)

### ✅ Implementados:
- **production-control-agent.ts** - Eventos, gargalos, fluxo

### 🚧 Pendentes:
- **quality-control-agent.ts** - Inspeções, não-conformidade
- **shipping-agent.ts** - Pedidos expedidos, fretes
- **inventory-agent.ts** - Estoque, níveis críticos

---

## 🚚 Logistics Domain (Logística)

### ✅ Implementados:
- **route-agent.ts** - Rotas, distâncias, otimização

### 🚧 Pendentes:
- **fleet-agent.ts** - Frota, manutenção, documentos
- **warehouse-agent.ts** - Armazéns, picking, packing
- **tracking-agent.ts** - Rastreamento GPS em tempo real

---

## 🔧 Como Adicionar Novo Agente

1. Crie arquivo em `.agents/domains/{dominio}/{nome}-agent.ts`
2. Implemente interface padrão com métodos `validate*`
3. Adicione testes em `.agents/domains/{dominio}/tests/`
4. Documente no README.md do domínio

---

**Status**: 5/12 implementados (42%)  
**Última atualização**: 2026-01-20
