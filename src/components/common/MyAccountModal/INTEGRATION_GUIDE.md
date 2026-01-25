# 🔧 Guia Rápido: Integrar UserStorePOS no MyAccountModal

## Passo 1: Adicionar Import

No topo do arquivo `MyAccountModal.tsx`, adicione:

```typescript
import UserStorePOS from './MyAccountModal/UserStorePOS';
```

E remova esta linha (não é mais necessária):
```typescript
import { userPurchaseItem, removeUserItem } from '../../services/users/userService';
```

## Passo 2: Remover Código Duplicado

**DELETE as linhas 21-367** (todo o componente UserStorePOS inline)

Isso inclui:
- Interface `MarketItem`
- Componente `const UserStorePOS = ...`
- Todo o JSX do componente

## Passo 3: Usar o Componente

Na seção de billing (procure por `{activeTab === 'billing'`), substitua todo o conteúdo por:

```typescript
{activeTab === 'billing' && showBilling && (
  <div className="max-w-4xl mx-auto animate-fadeIn">
    <UserStorePOS 
      user={user} 
      adConfig={adConfig} 
      onUpdateUser={onUpdateUser} 
    />
  </div>
)}
```

## Resultado

- **Antes**: 815 linhas
- **Depois**: ~479 linhas (-336 linhas)
- **Componente UserStorePOS**: Arquivo separado, reutilizável

## Testar

```bash
npm run dev
# Abrir modal de conta
# Clicar na aba "Loja"
# Verificar se funciona
```

---

**Arquivo criado**: `UserStorePOS.tsx` ✅  
**Localização**: `src/components/common/MyAccountModal/UserStorePOS.tsx`
