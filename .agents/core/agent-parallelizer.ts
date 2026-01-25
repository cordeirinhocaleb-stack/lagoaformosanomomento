/**
 * Agent Parallelization Utility
 * 
 * Identifica agentes independentes e os executa em paralelo
 * para reduzir tempo total de execução
 */

import { AgentAssignment } from '../task-analyzer-agent.js';

export interface AgentGroup {
    parallel: AgentAssignment[];
    sequential: AgentAssignment[];
}

export class AgentParallelizer {
    /**
     * Mapa de dependências entre agentes
     * Agentes que dependem de outros devem executar depois
     */
    private static readonly DEPENDENCIES: Record<string, string[]> = {
        // Architecture deve rodar antes de outros agentes técnicos
        'frontend-agent': ['architecture-agent'],
        'security-agent': [],  // Independente
        'quality-agent': ['frontend-agent', 'architecture-agent'],
        'documentation-agent': [], // Pode rodar em paralelo

        // Agentes de domínio geralmente independentes
        'cms-agent': [],
        'seo-agent': [],
        'production-control-agent': [],
        'route-agent': [],

        // Inventory deve rodar primeiro (coleta informações)
        'pentesting-agent': ['security-agent']
    };

    /**
     * Agrupa agentes em grupos paralelos e sequenciais
     */
    static groupAgents(agents: AgentAssignment[]): AgentAssignment[][] {
        const groups: AgentAssignment[][] = [];
        const processed = new Set<string>();
        const remaining = [...agents].sort((a, b) => a.priority - b.priority);

        while (remaining.length > 0) {
            const currentGroup: AgentAssignment[] = [];

            // Encontrar agentes que podem executar em paralelo
            for (let i = remaining.length - 1; i >= 0; i--) {
                const agent = remaining[i];
                const dependencies = this.DEPENDENCIES[agent.agentName] || [];

                // Verificar se todas as dependências já foram processadas
                const canRun = dependencies.every(dep => processed.has(dep));

                if (canRun) {
                    currentGroup.push(agent);
                    remaining.splice(i, 1);
                }
            }

            if (currentGroup.length === 0) {
                // Deadlock - alguma dependência circular ou não resolvida
                // Executar o próximo agente sequencialmente
                currentGroup.push(remaining.shift()!);
            }

            // Marcar agentes como processados
            currentGroup.forEach(agent => processed.add(agent.agentName));
            groups.push(currentGroup);
        }

        return groups;
    }

    /**
     * Verifica se dois agentes podem executar em paralelo
     */
    static canRunInParallel(agent1: string, agent2: string): boolean {
        const deps1 = this.DEPENDENCIES[agent1] || [];
        const deps2 = this.DEPENDENCIES[agent2] || [];

        // Não podem rodar em paralelo se um depende do outro
        return !deps1.includes(agent2) && !deps2.includes(agent1);
    }

    /**
     * Estima redução de tempo com paralelização
     */
    static estimateTimeReduction(agents: AgentAssignment[]): {
        sequential: number;
        parallel: number;
        reduction: number;
    } {
        const groups = this.groupAgents(agents);
        const avgTimePerAgent = 10; // segundos (estimativa)

        const sequentialTime = agents.length * avgTimePerAgent;
        const parallelTime = groups.length * avgTimePerAgent;
        const reduction = ((sequentialTime - parallelTime) / sequentialTime) * 100;

        return {
            sequential: sequentialTime,
            parallel: parallelTime,
            reduction: Math.round(reduction)
        };
    }
}
