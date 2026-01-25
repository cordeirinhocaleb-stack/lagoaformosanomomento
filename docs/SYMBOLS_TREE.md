# Árvore de Símbolos do Projeto

**Última atualização**: 2026-01-20 10:10  
**Versão**: 1.0.0

Esta árvore mapeia a estrutura hierárquica de componentes, hooks, tipos e serviços do projeto.

---

## 📁 Estrutura de Diretórios

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx → LoginPage
│   └── layout.tsx → AuthLayout
├── (dashboard)/
│   ├── page.tsx → DashboardPage
│   ├── production/
│   │   └── page.tsx → ProductionPage
│   ├── orders/
│   │   └── page.tsx → OrdersPage
│   ├── weighing/
│   │   └── page.tsx → WeighingPage
│   ├── financial/
│   │   └── page.tsx → FinancialPage
│   └── layout.tsx → DashboardLayout
└── layout.tsx → RootLayout
```

---

## 🧩 Componentes

### UI Primitives (`components/ui/`)
Componentes base do shadcn/ui:
- `Button` - Botão com variantes (default, outline, ghost, destructive, link)
- `Input` - Campo de entrada de texto
- `Card`, `CardHeader`, `CardContent`, `CardFooter` - Container de conteúdo
- `Dialog`, `DialogTrigger`, `DialogContent` - Modal/Dialog
- `Label` - Label para inputs
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` - Tabela
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` - Dropdown
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Abas

### Common Components (`components/common/`)
Componentes reutilizáveis globais:
- `Header` - Cabeçalho do dashboard
- `Footer` - Rodapé (se existir)
- `Sidebar` - Menu lateral de navegação
- `LoadingSpinner` - Indicador de loading
- `ErrorBoundary` - Tratamento de erros React

### Page Components (`components/pages/`)
Componentes específicos de páginas:
- `DashboardView` - Visão geral do dashboard
- `ProductionView` - Gestão de produção
- `OrdersView` - Gestão de pedidos
- `WeighingView` - Sistema de pesagem
- `FinancialView` - Gestão financeira

### Feature Components
Componentes específicos por funcionalidade:
- **Production** (`components/production/`)
  - `ProductionEventForm` - Formulário de eventos de produção
  - `ProductionEventTable` - Tabela de eventos
  - `PlantProductionCard` - Card de produção da planta
  
- **Orders** (`components/orders/`)
  - `OrderForm` - Formulário de pedidos
  - `OrderTable` - Tabela de pedidos
  - `OrderDetailsModal` - Modal de detalhes
  
- **Weighing** (`components/weighing/`)
  - `WeighingForm` - Formulário de pesagem
  - `WeighingHistory` - Histórico de pesagens

---

## 🪝 Hooks Customizados

### Global Hooks (`hooks/`)
- `useAppCrud` - CRUD genérico para qualquer tabela Supabase
  - **Funções**: `handleAdd`, `handleUpdate`, `handleDelete`
  - **Estados**: `loading`, `error`
  
- `useAuth` - Gerenciamento de autenticação
  - **Funções**: `signIn`, `signOut`, `signUp`
  - **Estados**: `user`, `session`, `loading`
  
- `useAppLogic` - Lógica de negócio principal
  - **Dados**: `orders`, `productionEvents`, `miningCycles`, `plantLogs`
  - **Refreshers**: `refreshOrders`, `refreshProductionEvents`, etc.

### Feature Hooks
- `usePlantProduction` (`hooks/usePlantProduction.ts`) - Lógica de produção da planta
- `useOrderManagement` - Lógica de gestão de pedidos
- `useWeighing` - Lógica de pesagem

---

## 🛠 Services & APIs

### Supabase (`utils/supabase/`)
- `client.ts` - Cliente Supabase (browser)
- `server.ts` - Cliente Supabase (server-side)

### API Clients (`services/`)
- `orders.ts` - Funções de API para pedidos
- `production.ts` - Funções de API para produção
- `weighing.ts` - Funções de API para pesagem
- `financial.ts` - Funções de API para financeiro

---

## 📊 Types & Interfaces

### Database Types (`types/database.ts`)
Tipos gerados do Supabase:
- Todas as tabelas do banco de dados

### Domain Types (`types/`)
- `Order` - Pedido
- `ProductionEvent` - Evento de produção
- `MiningCycle` - Ciclo de mineração
- `PlantLog` - Log da planta
- `WeighingRecord` - Registro de pesagem

---

## 🔧 Utilitários

### Helpers (`lib/`)
- `utils.ts` - Funções utilitárias gerais (ex: `cn()` para classes)
- `format.ts` - Formatação de datas, números, moeda
- `validation.ts` - Schemas de validação Zod

### Constants (`constants/`)
- `TABLE_NAMES` - Nomes das tabelas do Supabase
  ```ts
  {
    orders: 'orders',
    production_events: 'production_events',
    mining_cycles: 'mining_cycles',
    plant_logs: 'plant_logs'
  }
  ```
- `ROLES` - Papéis de usuários
- `STATUS` - Status de pedidos, produção, etc.

---

## 🗃 Schemas Supabase

### Tabelas Principais
- `orders` - Pedidos expedidos
- `production_events` - Eventos de produção
- `mining_cycles` - Ciclos de mineração
- `plant_logs` - Logs da planta
- `weighing_records` - Registros de pesagem
- `users` - Usuários do sistema
- `profiles` - Perfis de usuários

### Views
- (Se houver views, listar aqui)

### Functions
- (Se houver functions, listar aqui)

---

## 📝 Notas

- Esta árvore é atualizada automaticamente pelo **Agente de Documentação**
- Ao adicionar novos componentes/hooks/services, eles devem ser registrados aqui
- Manter sincronizado com a estrutura real do código

---

**Gerado por**: Documentation Agent  
**Próxima atualização**: Após próximo build
