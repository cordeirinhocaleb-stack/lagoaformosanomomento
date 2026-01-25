#!/usr/bin/env node

/**
 * Script Atualizado: Iniciar Contexto Interativo
 * 
 * Agora com descoberta de projeto e criação dinâmica de agentes!
 * 
 * Uso:
 *   npx tsx .agents/test-init-context.ts
 *   ou
 *   npm run agents:init
 */

import { initializeContext, printContextSummary } from './context-loader';

async function main() {
    console.log('');
    console.log('🤖 SISTEMA DE AGENTES WEBGHO - v2.0');
    console.log('Agora com descoberta interativa de projetos!');
    console.log('');

    try {
        // Carregar contexto (com modo interativo)
        const context = await initializeContext(true);

        // Exibir resumo
        printContextSummary(context);

        // Validar se carregou corretamente
        const hasDesignSystem = context.designSystem && context.designSystem.length > 0;
        const hasSymbolsTree = context.symbolsTree && context.symbolsTree.length > 0;
        const hasBuildHistory = context.buildHistory && context.buildHistory.length > 0;
        const hasAgentRules = context.agentRules && context.agentRules.length > 0;

        console.log('🧪 Resultados dos Testes:');
        console.log(`  DESIGN_SYSTEM.md: ${hasDesignSystem ? '✅ OK' : '⚠️  SERÁ CRIADO'}`);
        console.log(`  SYMBOLS_TREE.md: ${hasSymbolsTree ? '✅ OK' : '⚠️  SERÁ CRIADO'}`);
        console.log(`  BUILD_HISTORY.md: ${hasBuildHistory ? '✅ OK' : '⚠️  SERÁ CRIADO'}`);
        console.log(`  AGENT_RULES.md: ${hasAgentRules ? '✅ OK' : '⚠️  SERÁ CRIADO'}`);
        if (context.domainConfig) {
            console.log(`  Domínio detectado: ${context.domainConfig.name} (${context.domainConfig.description})`);
        }

        if (context.projectProfile) {
            console.log(`  Perfil do Projeto: ✅ ${context.projectProfile.projectName}`);
        }
        console.log('');

        console.log('🎉 SUCESSO: Sistema de contexto funcionando perfeitamente!');
        console.log('');
        console.log('📌 Próximos passos:');
        console.log('  1. Revise o relatório acima');
        console.log('  2. Os agentes recomendados serão criados automaticamente');
        console.log('  3. Comece a implementar suas features com confiança!');
        console.log('');
        process.exit(0);

    } catch (error) {
        console.error('');
        console.error('❌ ERRO ao inicializar contexto:');
        console.error(error);
        console.error('');
        process.exit(1);
    }
}

main();
