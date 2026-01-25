/**
 * Testes para AgentParallelizer
 */

import { AgentParallelizer } from './agent-parallelizer';
import { AgentAssignment } from '../task-analyzer-agent';

describe('AgentParallelizer', () => {
    describe('groupAgents', () => {
        test('deve agrupar agentes independentes no mesmo grupo', () => {
            const agents: AgentAssignment[] = [
                { agentName: 'security-agent', subtask: 'test', priority: 1, confidence: 0.9, dependencies: [] },
                { agentName: 'documentation-agent', subtask: 'test', priority: 2, confidence: 0.9, dependencies: [] },
                { agentName: 'cms-agent', subtask: 'test', priority: 3, confidence: 0.9, dependencies: [] }
            ];

            const groups = AgentParallelizer.groupAgents(agents);

            // Todos são independentes, devem estar no mesmo grupo
            expect(groups.length).toBe(1);
            expect(groups[0].length).toBe(3);
        });

        test('deve separar agentes com dependências em grupos diferentes', () => {
            const agents: AgentAssignment[] = [
                { agentName: 'architecture-agent', subtask: 'test', priority: 1, confidence: 0.9, dependencies: [] },
                { agentName: 'frontend-agent', subtask: 'test', priority: 2, confidence: 0.9, dependencies: ['architecture-agent'] }
            ];

            const groups = AgentParallelizer.groupAgents(agents);

            // frontend-agent depende de architecture-agent
            expect(groups.length).toBe(2);
            expect(groups[0][0].agentName).toBe('architecture-agent');
            expect(groups[1][0].agentName).toBe('frontend-agent');
        });

        test('deve respeitar dependências complexas', () => {
            const agents: AgentAssignment[] = [
                { agentName: 'architecture-agent', subtask: 'test', priority: 1, confidence: 0.9, dependencies: [] },
                { agentName: 'frontend-agent', subtask: 'test', priority: 2, confidence: 0.9, dependencies: ['architecture-agent'] },
                { agentName: 'quality-agent', subtask: 'test', priority: 3, confidence: 0.9, dependencies: ['frontend-agent', 'architecture-agent'] },
                { agentName: 'security-agent', subtask: 'test', priority: 4, confidence: 0.9, dependencies: [] }
            ];

            const groups = AgentParallelizer.groupAgents(agents);

            // architecture primeiro
            // frontend e security em paralelo
            // quality por último (depende de frontend e architecture)
            // architecture primeiro ou security (ambos independentes)
            expect(groups.length).toBeGreaterThanOrEqual(2);
            const firstGroupNames = groups[0].map(a => a.agentName);
            expect(firstGroupNames).toContain('architecture-agent');
            expect(firstGroupNames).toContain('security-agent');
        });
    });

    describe('canRunInParallel', () => {
        test('deve retornar true para agentes independentes', () => {
            const result = AgentParallelizer.canRunInParallel('security-agent', 'documentation-agent');
            expect(result).toBe(true);
        });

        test('deve retornar false se um depende do outro', () => {
            const result = AgentParallelizer.canRunInParallel('frontend-agent', 'architecture-agent');
            expect(result).toBe(false);
        });
    });

    describe('estimateTimeReduction', () => {
        test('deve calcular redução de tempo corretamente', () => {
            const agents: AgentAssignment[] = [
                { agentName: 'security-agent', subtask: 'test', priority: 1, confidence: 0.9, dependencies: [] },
                { agentName: 'documentation-agent', subtask: 'test', priority: 2, confidence: 0.9, dependencies: [] },
                { agentName: 'cms-agent', subtask: 'test', priority: 3, confidence: 0.9, dependencies: [] }
            ];

            const estimate = AgentParallelizer.estimateTimeReduction(agents);

            expect(estimate.sequential).toBeGreaterThan(estimate.parallel);
            expect(estimate.reduction).toBeGreaterThan(0);
            expect(estimate.reduction).toBeLessThanOrEqual(100);
        });

        test('deve retornar 0% de redução para agente único', () => {
            const agents: AgentAssignment[] = [
                { agentName: 'security-agent', subtask: 'test', priority: 1, confidence: 0.9, dependencies: [] }
            ];

            const estimate = AgentParallelizer.estimateTimeReduction(agents);

            expect(estimate.sequential).toBe(estimate.parallel);
            expect(estimate.reduction).toBe(0);
        });
    });
});
