# 📜 MASTER PROTOCOL - LAGOA FORMOSA NO MOMENTO

> [!IMPORTANT]
> **ESTE ARQUIVO É O PROTOCOLO SUPREMO DE DESENVOLVIMENTO.**
> Em caso de troca de IA ou início de nova sessão, este arquivo deve ser lido INTEGRALMENTE antes de qualquer alteração no código.

---

## 🏗️ 1. ESTRUTURA E MODULARIZAÇÃO (MANDATÓRIO)
O projeto segue uma rigorosa política de modularização para evitar arquivos "monstruosos".

- **Limite de Linhas**: Máxima de **400 linhas** por arquivo (Hard Limit). 
    - *Exceção*: Componentes visuais extremamente complexos podem chegar a 500 lines, mas a preferência é 400.
    - **AÇÃO**: Se um arquivo passar do limite, refatore imediatamente separando em novos arquivos/pastas.
- **Conceito de Bloco**: "Bloco" = "Pasta/Container". Toda lógica deve ser encapsulada em containers funcionais e significativos.
- **Hierarquia**: `Page` → `Layout` → `Container/Hook` → `Service` → `Types` → `UI`.

---

## 🔐 2. SEGURANÇA E BACKEND (SUPABASE)
O Front-end é considerado um território hostil. A segurança real deve estar no banco.

- **Row Level Security (RLS)**:
    - **RLS Ativo**: Toda tabela DEVE ter RLS ativado.
    - **Deny by Default**: O banco deve negar tudo por padrão e liberar o mínimo necessário.
    - **Policies Reais**: Validar propriedade do dado via `auth.uid() = user_id`.
- **Edge Functions**: Operações administrativas, integração externa ou controle de alto privilégio DEVEM usar Edge Functions.
- **Security Definer**: Funções RPC com `SECURITY DEFINER` devem ser usadas com cautela extrema e validação de autorização manual.
- **Storage**: Buckets privados por padrão. Acesso via policies em `storage.objects`.
- **Keys**: 
    - `anon_key`: Pública (Client).
    - `service_role`: **PROIBIDO** no front. Apenas servidor/Edge Functions.

---

## 🔄 3. VERSIONAMENTO E SINCRONIZAÇÃO
- **Regra de Incremento**: A cada modificação (build), incrementar exatamente **+0.0.1** (build +1) ou conforme script `bump`.
- **Sincronização**: O incremento deve ser feito em:
    1. `App.tsx`
    2. `package.json`
    3. `VERSION.md` (Adicionar nota detalhada com Data/Hora/Categoria).
    4. `src/version.ts` (Sincronizar `BUILD_NUMBER` e `BUILD_REF`).
- **Data Change**: Mudanças no Banco exigem atualização imediata do arquivo `.sql` principal e documentação.

---

## 🗺️ 4. FONTE DA VERDADE (SOT)
O arquivo `architecture.md` (localizado em `db/notes/` ou raiz) é a verdade absoluta.

- **Atualização Obrigatória**: Qualquer nova rota, hook global, serviço ou tabela no DB exige atualização imediata do `architecture.md`.
- **Mermaid Diagrams**: O diagrama de arquitetura deve refletir exatamente o estado atual do sistema.
- **Validação**: Código sem documentação atualizada é considerado INVÁLIDO.

---

## 🎨 5. DESIGN SYSTEM & UI/UX
- **Stack**: Tailwind CSS (CDN), Vanilla CSS, Framer Motion (opcional).
- **Cores**: 
    - Dark: `bg-zinc-950`.
    - Light: `#f4f4f7`.
    - Destaque: Blue (#2563eb) | Red (#dc2626).
- **Tipografia**: 
    - UI: `Inter`.
    - Títulos: `Merriweather`.
    - Detalhes: `Caveat`.
- **Efeitos**: "Police Sweep" (Red/Blue sweep).
- **UX**: Estados de Loading, Error e Empty devem ser consistentes em todas as telas.

---

## 🛠️ 6. CÓDIGO E BOAS PRÁTICAS (CLEAN CODE)
- **TypeScript**: Modo Strict obrigatório. Proibido uso de `any` em áreas de domínio.
- **Sanitização**: Todo input externo (forms, queries) deve ser sanitizado com Zod ou Yup.
- **Performance**: 
    - Usar Virtual Scrolling para listas volumosas.
    - Implementar Debouncing (300ms) em buscas.
    - Nunca usar `SELECT *`. Solicitar apenas colunas necessárias.
- **Refactoring**: Antes de alterar, entenda o sintoma observável (logs, network). Registre "o porquê" nos comentários se a lógica for complexa.

---

## 📜 7. CHECKLIST DE PRÉ-RESPOSTA (PARA A IA)
Antes de finalizar qualquer tarefa, verifique:
1. [ ] Analisei o impacto no `architecture.md`?
2. [ ] O arquivo excede 400 linhas?
3. [ ] Inputs estão sanitizados e a tipagem está forte (sem `any`)?
4. [ ] Segui as cores e animações do Design System?
5. [ ] Incrementei a versão e atualizei o `.sql` (se houve mudança no DB)?
6. [ ] Apliquei RLS se criei uma nova tabela?
7. [ ] Usei Edge Functions para tarefas administrativas?

---

*Lembre-se: Resolver o bug é apenas metade do trabalho. Garantir que o sistema permaneça modular, seguro e documentado é a outra metade.*
