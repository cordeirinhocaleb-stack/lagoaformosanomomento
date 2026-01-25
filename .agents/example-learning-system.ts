import { IntelligentOrchestrator } from './orchestrator';
import { initializeContext } from './context-loader';

async function main() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 SISTEMA DE AGENTES COM APRENDIZADO CONTÍNUO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Carregar contexto do projeto
    console.log('📂 Carregando contexto do projeto...\n');
    const context = await initializeContext();

    // 2. Criar orquestrador inteligente
    const orchestrator = new IntelligentOrchestrator(context);

    // 3. Exemplo 1: Criar componente de login
    console.log('\n━━━ EXEMPLO 1: Criar Componente de Login ━━━\n');

    const result1 = await orchestrator.orchestrateTask(
        'Criar componente de login com validação de email e senha, estados de loading e error, e acessibilidade'
    );

    console.log(`\nResultado: ${result1.status}`);
    console.log(`Task ID: ${result1.taskId}\n`);

    // 4. Fornecer feedback positivo
    if (result1.success) {
        console.log('━━━ Fornecendo Feedback Positivo ━━━\n');

        await orchestrator.provideFeedback(result1.taskId, 'frontend-agent', {
            satisfied: true,
            likes: [
                'Validação de inputs implementada corretamente',
                'Estados de loading e error incluídos',
                'Acessibilidade com aria-labels'
            ],
            dislikes: [],
            suggestions: [
                'Adicionar animação de transição'
            ]
        });

        await orchestrator.provideFeedback(result1.taskId, 'security-agent', {
            satisfied: true,
            likes: [
                'Validação de senha forte',
                'Proteção contra XSS'
            ],
            dislikes: [],
            suggestions: []
        });
    }

    // 5. Exemplo 2: Criar componente similar (agentes devem aprender)
    console.log('\n━━━ EXEMPLO 2: Criar Componente de Registro (Similar) ━━━\n');

    const result2 = await orchestrator.orchestrateTask(
        'Criar componente de registro com validação de email, senha e confirmação de senha'
    );

    console.log(`\nResultado: ${result2.status}`);
    console.log(`Task ID: ${result2.taskId}\n`);

    // 6. Ver relatórios de feedback
    console.log('\n━━━ RELATÓRIOS DE FEEDBACK ━━━\n');

    console.log(orchestrator.getFeedbackReport('frontend-agent'));
    console.log(orchestrator.getFeedbackReport('security-agent'));

    // 7. Exemplo 3: Tarefa com problema (para testar aprendizado de falhas)
    console.log('\n━━━ EXEMPLO 3: Componente com Problema ━━━\n');

    const result3 = await orchestrator.orchestrateTask(
        'Criar componente que usa dangerouslySetInnerHTML sem sanitização'
    );

    console.log(`\nResultado: ${result3.status}`);

    if (!result3.success) {
        console.log('Bloqueadores detectados:');
        result3.blockers?.forEach((blocker: string) => console.log(`  - ${blocker}`));

        // Fornecer feedback negativo
        await orchestrator.provideFeedback(result3.taskId, 'security-agent', {
            satisfied: false,
            likes: [],
            dislikes: [
                'Detectou vulnerabilidade XSS corretamente'
            ],
            suggestions: [
                'Sugerir DOMPurify automaticamente'
            ]
        });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DEMONSTRAÇÃO CONCLUÍDA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Dicas:');
    console.log('  - Memória dos agentes está em .agents/memory/');
    console.log('  - Cada agente tem: successes.json, failures.json, learnings.json');
    console.log('  - Agentes aprendem com feedback e evitam repetir erros');
    console.log('  - Orquestrador seleciona agentes com melhor histórico\n');
}

// Executar
main().catch(error => {
    console.error('❌ Erro:', error);
    process.exit(1);
});
