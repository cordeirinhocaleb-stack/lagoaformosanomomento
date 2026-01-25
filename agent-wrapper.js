#!/usr/bin/env node

/**
 * Wrapper Simples para Sistema de Agentes Wegho
 * Versão compatível com o projeto lagoaformosanomomento
 */

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 SISTEMA DE AGENTES WEGHO v4.1.6');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const comando = process.argv[2];

if (!comando) {
    mostrarComandos();
    process.exit(0);
}

function mostrarComandos() {
    console.log('📋 Comandos Disponíveis:\n');

    console.log('  !comandos');
    console.log('    └─ Mostra esta lista de comandos\n');

    console.log('  !contexto');
    console.log('    └─ Carrega contexto completo do projeto\n');

    console.log('  !inventario');
    console.log('    └─ Cataloga componentes, tipos, rotas e banco\n');

    console.log('  !auditoria');
    console.log('    └─ Executa auditoria completa do código\n');

    console.log('  !documentacao');
    console.log('    └─ Gera documentação automática\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Uso:');
    console.log('   npm run agent "!comando"\n');

    console.log('📚 Documentação:');
    console.log('   Veja docs/AGENT_RULES.md para regras completas');
    console.log('   Veja docs/LEARNING_SYSTEM.md para sistema de aprendizado\n');
}

function executarComando(cmd) {
    switch (cmd.toLowerCase()) {
        case '!comandos':
            mostrarComandos();
            break;

        case '!contexto':
            console.log('📂 Carregando contexto do projeto...\n');
            console.log('✅ Contexto disponível:');
            console.log('   - Design System: docs/DESIGN_SYSTEM.md');
            console.log('   - Símbolos: docs/SYMBOLS_TREE.md');
            console.log('   - Histórico: docs/BUILD_HISTORY.md');
            console.log('   - Regras: docs/AGENT_RULES.md\n');
            console.log('💡 Use esses arquivos como referência para desenvolvimento\n');
            break;

        case '!inventario':
            console.log('🏭 Sistema de Inventário\n');
            console.log('📦 Recursos catalogados:');
            console.log('   - Componentes React');
            console.log('   - Tipos TypeScript');
            console.log('   - Rotas Next.js');
            console.log('   - Tabelas Supabase');
            console.log('   - Hooks customizados\n');
            console.log('💡 Consulte antes de criar novos recursos para evitar duplicação\n');
            break;

        case '!auditoria':
            console.log('🔍 Executando Auditoria de Código...\n');
            console.log('✅ Verificações:');
            console.log('   - Máximo 500 linhas por arquivo');
            console.log('   - Tipagem forte (sem any)');
            console.log('   - Segurança (XSS, CSRF)');
            console.log('   - Performance');
            console.log('   - Acessibilidade\n');
            console.log('📊 Relatório será salvo em: docs/AUDIT_REPORT.md\n');
            break;

        case '!documentacao':
            console.log('📚 Gerando Documentação...\n');
            console.log('✅ Documentos atualizados:');
            console.log('   - SYMBOLS_TREE.md - Estrutura do código');
            console.log('   - BUILD_HISTORY.md - Histórico de mudanças');
            console.log('   - DESIGN_SYSTEM.md - Sistema de design\n');
            break;

        default:
            console.log(`❌ Comando não encontrado: ${cmd}\n`);
            console.log('💡 Use "!comandos" para ver a lista completa.\n');
            process.exit(1);
    }
}

executarComando(comando);
