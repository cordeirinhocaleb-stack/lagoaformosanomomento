#!/usr/bin/env node

/**
 * 🚀 SCRIPT DE INICIALIZAÇÃO DO SISTEMA DE AGENTES
 * 
 * Este script é executado quando alguém instala o sistema pela primeira vez.
 * Ele:
 * 1. Pede permissão para escanear o projeto
 * 2. Inicializa o orquestrador
 * 3. Cria memória inicial para TODOS os agentes
 * 4. Organiza o almoxarifado (Inventory Agent)
 */

import * as readline from 'readline';
import * as path from 'path';
import { InventoryAgent } from './core/inventory-agent.js';
import { FrontEndAgent } from './core/frontend-agent.js';
import { SecurityAgent } from './core/security-agent.js';
import { ArchitectureAgent } from './core/architecture-agent.js';
import { QualityAgent } from './core/quality-agent.js';
import { DocumentationAgent } from './core/documentation-agent.js';
import { CMSAgent } from './domains/news/cms-agent.js';
import { SEOAgent } from './domains/news/seo-agent.js';
import { ProductionControlAgent } from './domains/production/production-control-agent.js';
import { RouteAgent } from './domains/logistics/route-agent.js';
import { install } from './install.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 BEM-VINDO AO SISTEMA DE AGENTES INTELIGENTES');
    console.log('='.repeat(60) + '\n');

    console.log('Este é o processo de inicialização do sistema.');
    console.log('O orquestrador irá preparar TODOS os agentes para trabalhar.\n');

    // 1. Pedir permissão
    const permission = await question(
        '❓ Posso escanear seu projeto e criar a memória inicial para todos os agentes? (s/n): '
    );

    if (permission.toLowerCase() !== 's' && permission.toLowerCase() !== 'sim') {
        console.log('\n❌ Inicialização cancelada pelo usuário.');
        console.log('Execute novamente quando estiver pronto: npm run init\n');
        rl.close();
        return;
    }

    console.log('\n✅ Permissão concedida! Iniciando...\n');

    const projectRoot = process.cwd();

    // 1.5. Instalar arquivos base (.cursorrules, etc)
    await install();

    // 2. Inicializar agentes
    console.log('📦 Inicializando agentes...\n');

    const memoryPath = path.join(projectRoot, '.agents', 'memory');

    const agents = [
        { name: 'Inventory Agent', agent: new InventoryAgent(projectRoot, memoryPath), priority: 1 },
        { name: 'Frontend Agent', agent: new FrontEndAgent(memoryPath), priority: 2 },
        { name: 'Security Agent', agent: new SecurityAgent(memoryPath), priority: 2 },
        { name: 'Architecture Agent', agent: new ArchitectureAgent(memoryPath), priority: 2 },
        { name: 'Quality Agent', agent: new QualityAgent(memoryPath), priority: 2 },
        { name: 'Documentation Agent', agent: new DocumentationAgent(memoryPath), priority: 2 },
        { name: 'CMS Agent', agent: new CMSAgent(memoryPath), priority: 3 },
        { name: 'SEO Agent', agent: new SEOAgent(memoryPath), priority: 3 },
        { name: 'Production Control Agent', agent: new ProductionControlAgent(memoryPath), priority: 3 },
        { name: 'Route Agent', agent: new RouteAgent(memoryPath), priority: 3 },
    ];

    // Ordenar por prioridade (Inventory Agent primeiro)
    agents.sort((a, b) => a.priority - b.priority);

    // 3. Inicializar cada agente
    for (const { name, agent } of agents) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 Inicializando: ${name}`);
        console.log(`${'='.repeat(60)}\n`);

        try {
            // Cada agente executa sua tarefa de inicialização
            const result = await agent.executeWithMemory('Inicializar memória do agente', {
                files: [],
                areas: ['initialization'],
                complexity: 'low',
            });

            if (result.success) {
                console.log(`✅ ${name} inicializado com sucesso!`);
                if (result.details) {
                    console.log(`   ${result.details}`);
                }
            } else {
                console.log(`⚠️  ${name} teve problemas na inicialização:`);
                console.log(`   ${result.details}`);
            }
        } catch (error) {
            console.log(`❌ Erro ao inicializar ${name}:`);
            console.log(`   ${(error as Error).message}`);
        }
    }

    // 4. Scan completo do Inventory Agent
    console.log(`\n${'='.repeat(60)}`);
    console.log('🏭 INVENTORY AGENT - Escaneando Projeto Completo');
    console.log(`${'='.repeat(60)}\n`);

    const inventoryAgent = agents[0].agent as InventoryAgent;

    try {
        const scanResult = await inventoryAgent.executeWithMemory('Escanear projeto completo', {
            files: [],
            areas: ['all'],
            complexity: 'high',
        });

        if (scanResult.success) {
            console.log('\n✅ Scan completo do projeto finalizado!');
            console.log(`   ${scanResult.details}`);

            if (scanResult.recommendations && scanResult.recommendations.length > 0) {
                console.log('\n📊 Resumo do Inventário:');
                scanResult.recommendations.forEach((rec) => {
                    console.log(`   ${rec}`);
                });
            }
        }
    } catch (error) {
        console.log(`❌ Erro no scan do projeto: ${(error as Error).message}`);
    }

    // 5. Resumo final
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎉 INICIALIZAÇÃO COMPLETA!');
    console.log(`${'='.repeat(60)}\n`);

    console.log('✅ Todos os agentes foram inicializados e estão prontos para trabalhar!');
    console.log('✅ Memória inicial criada para cada agente');
    console.log('✅ Inventário completo do projeto catalogado\n');

    console.log('📚 Próximos passos:');
    console.log('   1. Execute tarefas usando: npm run task "sua tarefa"');
    console.log('   2. Consulte a documentação em: .agents/README.md');
    console.log('   3. Veja o inventário em: .agents/memory/inventory-agent/inventory/\n');

    console.log('🤖 Sistema de Agentes Inteligentes pronto para uso!\n');

    rl.close();
}

main().catch((error) => {
    console.error('\n❌ Erro fatal durante inicialização:', error);
    rl.close();
    process.exit(1);
});
