# RULES MASTER - LFNM

Regras gerais de segurança, qualidade e padrões para o projeto Lagoa Formosa No Momento.

## 1) Segurança (Supabase)
- **RLS:** Sempre ativo. Nunca desativar em produção.
- **Service Role:** PROIBIDO no frontend. Use somente em Edge Functions ou scripts de manutenção.
- **Auth:** Use `auth.uid()` para isolamento de dados.

## 2) Qualidade de Código
- **Tamanho de Arquivo:** Máximo de 500 linhas para arquivos `.ts`, `.tsx`, `.js`.
- **Any:** Proibido em áreas críticas. Use `unknown` + validação ou tipos explícitos.
- **Nomenclatura:** Use nomes semânticos (ex: `ArticlesGrid` em vez de `Grid`).
- **Idioma:** SEMPRE crie planos, documentações e explicações em Português do Brasil.

## 3) Processo de Desenvolvimento
- A cada 10 builds, realize um **Security Audit**.
- Atualize o `SYMBOLS_TREE.md` ao criar novos módulos.
- Siga rigorosamente a Ordem de Operação definida no Global Rules.

> [!CAUTION]
> Mudanças especulativas (tentativa e erro) são proibidas. Planeje cada alteração detalhadamente.
