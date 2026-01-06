
# 📝 Registro de Edições e Revisões - LFNM

## Alpha 1.105 (06/01/2026 19:00)
### 🔄 Remodelado
- **Sistema de Temas de Widgets**: Remodelação completa do sistema de aplicação de temas. Criado componente dedicado `SmartBlockRenderer` que usa `useEffect` para detectar mudanças em `editorialVariant` e aplicar estilos diretamente ao DOM do widget, garantindo atualização visual imediata.
- **EditorContent.tsx**: Simplificado o case `smart_block` para usar o novo componente `SmartBlockRenderer`, removendo toda lógica inline complexa e logs de debug.
- **Versionamento**: Incremento de versão global para 1.105.

---

## Alpha 1.104 (06/01/2026 18:40)
### 🐛 Corrigido
- **Editor de Widgets**: Corrigido bug onde temas editoriais não eram aplicados visualmente aos widgets no `EditorContent`. Adicionada `key` única que inclui o `editorialVariant` para forçar re-renderização do React quando o tema é alterado.
- **Versionamento**: Incremento de versão global para 1.104.

---

## Alpha 1.103 (04/01/2026 14:17)
### ♻️ Modificado
- **Configuração do Antigravity**: Tradução completa dos arquivos `metadata.json` e `README.md` para Português, conforme solicitação do usuário.
- **Versionamento**: Incremento de versão global para 1.103.

---

## Alpha 1.089 (06/01/2026 07:20)
### ♻️ Modificado
- **Layout Mobile**: Alterado o grid de notícias da Home para exibir **2 colunas** lado a lado em dispositivos móveis (antes era 1 coluna), otimizando a visualização de múltiplas manchetes.

---

## Alpha 1.088 (06/01/2026 07:10)
### ♻️ Modificado
- **Paginação Responsiva**: A quantidade de notícias na Home agora se adapta ao dispositivo:
  - **PC**: 18 notícias.
  - **Tablet**: 12 notícias.
  - **Celular**: 8 notícias.
- Ajustada lógica de recálculo de páginas para evitar índices inválidos ao redimensionar a tela.
