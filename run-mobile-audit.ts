#!/usr/bin/env node

/**
 * Script para executar auditoria de responsividade mobile
 * usando o IntelligentOrchestrator v6.1.0
 */

import { initializeContext } from './node_modules/wegho-agentes/.agents/context-loader.js';
import { IntelligentOrchestrator } from './node_modules/wegho-agentes/.agents/orchestrator.js';

async function main() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 AUDITORIA DE RESPONSIVIDADE MOBILE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // 1. Inicializar contexto do projeto
        console.log('📂 Carregando contexto do projeto...\n');
        const context = await initializeContext(false);

        // 2. Criar orquestrador
        const orchestrator = new IntelligentOrchestrator(context);

        // 3. Executar tarefa de auditoria mobile
        const taskDescription = 'Verificar responsividade mobile em todas as páginas do website';

        console.log(`🤖 Tarefa: "${taskDescription}"\n`);

        const result = await orchestrator.orchestrateTask(taskDescription);

        // 4. Exibir resultado final
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`${result.success ? '✅ SUCESSO' : '❌ FALHA'} - Status: ${result.status}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (result.blockers.length > 0) {
            console.log('🚫 Bloqueadores encontrados:');
            result.blockers.forEach(blocker => console.log(`   - ${blocker}`));
            console.log('');
        }

        console.log('📊 Relatórios dos Agentes:\n');
        result.reports.forEach(report => {
            const icon = report.status === 'success' ? '✅' : report.status === 'warning' ? '⚠️' : '❌';
            console.log(`${icon} ${report.agentName}`);
            console.log(`   ${report.summary}`);
            if (report.details) {
                console.log(`   Detalhes: ${report.details}`);
            }
            console.log('');
        });

        process.exit(result.success ? 0 : 1);

    } catch (error) {
        console.error('\n❌ Erro ao executar auditoria:', error);
        console.error((error as Error).stack);
        process.exit(1);
    }
}

main();
