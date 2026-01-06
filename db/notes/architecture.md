
# Arquitetura de Dados - Lagoa Formosa No Momento

## Abordagem Híbrida (Relacional + JSONB)

Optamos por uma modelagem híbrida no PostgreSQL (Supabase) para equilibrar **integridade referencial** com **flexibilidade de UI**.

### 1. Tabelas Principais (Relacional)
As entidades principais do sistema, que exigem buscas rápidas, filtragem e integridade, são mantidas como tabelas relacionais clássicas:
*   `news`: Essencial para queries por data, categoria, autor.
*   `profiles`: Link direto com `auth.users` do Supabase.
*   `advertisers`: Gestão financeira e de vigência.

### 2. Campos JSONB (NoSQL)
Para áreas do sistema que são altamente dinâmicas ou dependem da UI do React (Componentes), utilizamos colunas JSONB. Isso evita a criação de dezenas de tabelas de relacionamento (EAV antipattern) e facilita a evolução do frontend sem migrações de banco constantes.

*   **`news.blocks`**: Armazena a estrutura do editor visual (parágrafos, imagens, enquetes). Como a renderização é feita por um iterador de blocos no React, salvar como JSON é o ideal.
*   **`news.social_distribution`**: Logs de webhook e status de postagem. Não requer queries complexas, apenas leitura/escrita do histórico.
*   **`advertisers.internal_page`**: Contém a vitrine de produtos, cupons e bio. Como a estrutura da vitrine pode mudar (novos campos, layouts), o JSONB permite flexibilidade total.
*   **`settings`**: Tabela Key-Value para configurações globais. O objeto `AdPricingConfig` (Planos e Preços) é complexo e hierárquico. Armazená-lo como JSON permite que o Frontend consuma a configuração inteira em um único fetch, sem múltiplos joins.

### 3. Segurança
RLS (Row Level Security) foi configurado para garantir que:
*   Público (Anon) veja apenas conteúdo publicado/ativo.
*   Staff (baseado em roles no `public.profiles`) tenha acesso de escrita.
