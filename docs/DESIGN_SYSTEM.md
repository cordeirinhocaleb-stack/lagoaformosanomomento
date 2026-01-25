# Sistema de Design - Triunfo Mineração

## 🎨 Paleta de Cores

### Cores Primárias
- **Primary**: `#1E40AF` (blue-800) - Ações principais, links, botões primários
- **Secondary**: `#10B981` (green-500) - Sucesso, confirmações, status positivo
- **Accent**: `#F59E0B` (amber-500) - Destaques, alertas importantes
- **Neutral**: `#6B7280` (gray-500) - Textos secundários, bordas
- **Error**: `#EF4444` (red-500) - Erros, validações, alertas críticos

### Cores de Status
- **Success**: `#10B981` (green-500)
- **Warning**: `#F59E0B` (amber-500)
- **Error**: `#EF4444` (red-500)
- **Info**: `#3B82F6` (blue-500)

### Cores de Background
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF` (white)
- **Surface Secondary**: `#F3F4F6` (gray-100)

---

## 📝 Tipografia

### Fonte Principal
- **Família**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif

### Hierarquia de Texto
- **H1**: `font-bold text-3xl md:text-4xl` (30px → 36px)
- **H2**: `font-bold text-2xl md:text-3xl` (24px → 30px)
- **H3**: `font-semibold text-xl md:text-2xl` (20px → 24px)
- **H4**: `font-semibold text-lg` (18px)
- **Body**: `font-normal text-base` (16px)
- **Body Small**: `font-normal text-sm` (14px)
- **Caption**: `font-light text-xs` (12px)

---

## 🧩 Componentes Base

### Buttons
Baseado em **shadcn/ui Button**

**Variantes**:
- `default`: Background primary, texto branco
- `outline`: Borda primary, texto primary, background transparente
- `ghost`: Sem borda, texto primary, hover com background leve
- `destructive`: Background red-500, texto branco
- `link`: Sem background, underline no hover

**Tamanhos**:
- `sm`: `h-8 px-3 text-sm`
- `default`: `h-10 px-4`
- `lg`: `h-12 px-6 text-lg`
- `icon`: `h-10 w-10` (quadrado)

**Exemplo**:
```tsx
<Button variant="default" size="default">Salvar</Button>
<Button variant="outline" size="sm">Cancelar</Button>
```

---

### Inputs
Baseado em **shadcn/ui Input**

**Padrão**:
- Borda: `border border-gray-300`
- Focus: `ring-2 ring-primary`
- Disabled: `opacity-50 cursor-not-allowed`
- Error: `border-red-500 ring-red-500`

**Com Label**:
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="seu@email.com" />
</div>
```

---

### Cards
Baseado em **shadcn/ui Card**

**Estrutura**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo principal */}
  </CardContent>
  <CardFooter>
    {/* Ações opcionais */}
  </CardFooter>
</Card>
```

**Estilos**:
- Background: `bg-white`
- Borda: `border border-gray-200`
- Sombra: `shadow-sm`
- Border radius: `rounded-lg` (0.5rem)

---

### Modals/Dialogs
Baseado em **shadcn/ui Dialog**

**Estrutura**:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição</DialogDescription>
    </DialogHeader>
    {/* Conteúdo */}
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Tables
Baseado em **TanStack Table v8**

**Padrão**:
- Header: `bg-gray-50 font-semibold text-left`
- Rows: `border-b hover:bg-gray-50`
- Células: `px-4 py-3`

**Exemplo com shadcn/ui Table**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna 1</TableHead>
      <TableHead>Coluna 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dado 1</TableCell>
      <TableCell>Dado 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎯 Tokens de Design

### Espaçamento
- **Base unit**: `1rem` (16px)
- **Scale**: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem

### Border Radius
- **sm**: `0.25rem` (4px)
- **default**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **full**: `9999px` (círculo)

### Sombras
- **sm**: `shadow-sm` - Elevação leve
- **default**: `shadow-md` - Elevação padrão
- **lg**: `shadow-lg` - Elevação forte
- **xl**: `shadow-xl` - Elevação máxima

### Transições
- **Padrão**: `transition-all duration-200 ease-in-out`
- **Hover**: Aplicar em botões, links, cards clicáveis

---

## ♿ Acessibilidade

### Contraste
- Texto em background branco: mínimo AA (4.5:1)
- Texto grande (18px+): mínimo AA (3:1)

### Navegação por Teclado
- Todos os botões/links acessíveis via Tab
- Focus visível: `ring-2 ring-primary`
- Escape fecha modals

### ARIA Labels
- Botões de ícone: `aria-label` obrigatório
- Inputs: associar com `<Label>` via `htmlFor`
- Estados: `aria-disabled`, `aria-expanded`, etc.

---

## 📱 Responsividade

### Breakpoints (Tailwind)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First
Sempre começar com mobile e escalar para desktop:
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Texto responsivo
</div>
```

---

## 🚀 Performance

### Imagens
- Usar `next/image` sempre
- Definir `width` e `height`
- `priority` apenas above-the-fold
- Lazy loading por padrão

### Code Splitting
- Componentes pesados: `dynamic(() => import())`
- Bibliotecas grandes: carregar sob demanda

---

## 📦 Bibliotecas Aprovadas

- **UI**: shadcn/ui (Radix UI + Tailwind)
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Tabelas**: TanStack Table
- **Datas**: date-fns
- **Utils**: clsx / classnames
- **Ícones**: lucide-react

---

**Última atualização**: 2026-01-20
**Versão**: 1.0.0
