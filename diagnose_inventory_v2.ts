/**
 * DIAGNOSE INVENTORY V2 (TypeScript Version)
 * 
 * Este script utiliza o sistema de agentes 'wegho-agentes' para realizar
 * um diagnóstico completo do inventário do projeto.
 */

import { initializeContext } from './node_modules/wegho-agentes/.agents/context-loader';
import { IntelligentOrchestrator } from './node_modules/wegho-agentes/.agents/orchestrator';

async function main() {
    console.log('\n🔍 INICIANDO DIAGNÓSTICO DE INVENTÁRIO (V2)...\n');

    try {
        // 1. Inicializar contexto do projeto
        console.log('📦 Carregando contexto do projeto...');
        const context = await initializeContext(true);

        // 2. Instanciar o Orquestrador Inteligente
        console.log('🤖 Inicializando Orquestrador de Agentes...');
        const orchestrator = new IntelligentOrchestrator(context);

        // 3. Executar tarefa de diagnóstico de inventário
        console.log('🏭 Solicitando scan ao Almoxarifado (Inventory Agent)...\n');

        const taskDescription = "Realizar um scan completo do inventário do projeto e fornecer um resumo dos itens catalogados por tipo.";

        const result = await orchestrator.orchestrateTask(taskDescription);

        if (result.success) {
            console.log('\n✅ DIAGNÓSTICO CONCLUÍDO COM SUCESSO!');

            // Mostrar resumo dos relatórios
            if (result.reports) {
                result.reports.forEach((report: any) => {
                    if (report.agentName === 'inventory-agent') {
                        console.log('\n📊 RESULTADOS DO ALMOXARIFADO:');
                        console.log(report.details);
                    }
                });
            }

        } else {
            console.log('\n❌ O DIAGNÓSTICO FALHOU OU FOI BLOQUEADO');
            if (result.blockers && result.blockers.length > 0) {
                console.log('\n🚫 BLOQUEIOS DETECTADOS:');
                result.blockers.forEach((b: string) => console.log(`   - ${b}`));
            }
        }

    } catch (error: any) {
        console.error('\n💥 ERRO FATAL DURANTE O DIAGNÓSTICO:');
        console.error(error.message);
        process.exit(1);
    }
}

main();
