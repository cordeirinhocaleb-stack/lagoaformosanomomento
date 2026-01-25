/**
 * Testes para PerformanceTracker
 */

import { PerformanceTracker } from './performance-tracker';

describe('PerformanceTracker', () => {
    let tracker: PerformanceTracker;

    beforeEach(() => {
        tracker = new PerformanceTracker();
    });

    describe('startTracking e endTracking', () => {
        test('deve rastrear operação com sucesso', () => {
            const trackingId = tracker.startTracking('test-agent', 'task-1', 'step-1');

            expect(trackingId).toContain('test-agent');
            expect(trackingId).toContain('task-1');
            expect(trackingId).toContain('step-1');

            tracker.endTracking(trackingId, true);

            const metrics = tracker.getAgentMetrics('test-agent');
            expect(metrics).toHaveLength(1);
            expect(metrics[0].success).toBe(true);
            expect(metrics[0].duration).toBeGreaterThanOrEqual(0);
        });

        test('deve rastrear operação com falha', () => {
            const trackingId = tracker.startTracking('test-agent', 'task-1', 'step-1');
            tracker.endTracking(trackingId, false, 'Test error');

            const metrics = tracker.getAgentMetrics('test-agent');
            expect(metrics[0].success).toBe(false);
            expect(metrics[0].error).toBe('Test error');
        });

        test('deve lidar com tracking ID inválido', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            tracker.endTracking('invalid-id', true);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Tracking ID não encontrado')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('getAgentMetrics', () => {
        test('deve retornar métricas de agente específico', () => {
            const id1 = tracker.startTracking('agent-1', 'task-1', 'step-1');
            const id2 = tracker.startTracking('agent-2', 'task-1', 'step-1');

            tracker.endTracking(id1, true);
            tracker.endTracking(id2, true);

            const agent1Metrics = tracker.getAgentMetrics('agent-1');
            expect(agent1Metrics).toHaveLength(1);
            expect(agent1Metrics[0].agentName).toBe('agent-1');
        });

        test('deve retornar array vazio para agente sem métricas', () => {
            const metrics = tracker.getAgentMetrics('non-existent');
            expect(metrics).toHaveLength(0);
        });
    });

    describe('getTaskMetrics', () => {
        test('deve retornar métricas de tarefa específica', () => {
            const id1 = tracker.startTracking('agent-1', 'task-1', 'step-1');
            const id2 = tracker.startTracking('agent-1', 'task-2', 'step-1');

            tracker.endTracking(id1, true);
            tracker.endTracking(id2, true);

            const task1Metrics = tracker.getTaskMetrics('task-1');
            expect(task1Metrics).toHaveLength(1);
            expect(task1Metrics[0].taskId).toBe('task-1');
        });
    });

    describe('getAgentSummary', () => {
        test('deve calcular resumo correto para agente', () => {
            // Simular múltiplas execuções
            for (let i = 0; i < 5; i++) {
                const id = tracker.startTracking('test-agent', 'task-1', `step-${i}`);
                // Finalizar imediatamente para evitar timing issues
                tracker.endTracking(id, i < 4); // 4 sucessos, 1 falha
            }

            const summary = tracker.getAgentSummary('test-agent');

            expect(summary.totalExecutions).toBe(5);
            expect(summary.successfulExecutions).toBe(4);
            expect(summary.failedExecutions).toBe(1);
            expect(summary.averageDuration).toBeGreaterThanOrEqual(0);
            expect(summary.minDuration).toBeLessThanOrEqual(summary.maxDuration);
        });

        test('deve retornar resumo vazio para agente sem métricas', () => {
            const summary = tracker.getAgentSummary('non-existent');

            expect(summary.totalExecutions).toBe(0);
            expect(summary.averageDuration).toBe(0);
        });

        test('deve calcular percentis corretamente', () => {
            // Criar métricas com durações conhecidas
            for (let i = 0; i < 10; i++) {
                const id = tracker.startTracking('test-agent', 'task-1', `step-${i}`);
                tracker.endTracking(id, true);
            }

            const summary = tracker.getAgentSummary('test-agent');

            expect(summary.p50Duration).toBeGreaterThanOrEqual(0);
            expect(summary.p95Duration).toBeGreaterThanOrEqual(summary.p50Duration);
            expect(summary.p99Duration).toBeGreaterThanOrEqual(summary.p95Duration);
        });
    });

    describe('generateReport', () => {
        test('deve gerar relatório completo', () => {
            const id1 = tracker.startTracking('agent-1', 'task-1', 'step-1');
            const id2 = tracker.startTracking('agent-2', 'task-1', 'step-2');

            tracker.endTracking(id1, true);
            tracker.endTracking(id2, true);

            const report = tracker.generateReport('task-1');

            expect(report.taskId).toBe('task-1');
            expect(report.totalDuration).toBeGreaterThanOrEqual(0);
            expect(report.agentMetrics.size).toBe(2);
            expect(report.bottlenecks).toBeDefined();
            expect(report.recommendations).toBeDefined();
        });

        test('deve identificar bottlenecks', () => {
            // Criar agente lento
            const slowId = tracker.startTracking('slow-agent', 'task-1', 'step-1');
            setTimeout(() => {
                tracker.endTracking(slowId, true);
            }, 100);

            // Criar agente rápido
            const fastId = tracker.startTracking('fast-agent', 'task-1', 'step-1');
            tracker.endTracking(fastId, true);

            setTimeout(() => {
                const report = tracker.generateReport('task-1');
                expect(report.bottlenecks.length).toBeGreaterThan(0);
            }, 150);
        });

        test('deve gerar recomendações apropriadas', () => {
            // Simular agente com alta taxa de falha
            for (let i = 0; i < 10; i++) {
                const id = tracker.startTracking('failing-agent', 'task-1', `step-${i}`);
                tracker.endTracking(id, i < 3); // 30% de sucesso
            }

            const report = tracker.generateReport('task-1');
            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(report.recommendations.some(r => r.includes('Taxa de falha alta'))).toBe(true);
        });
    });

    describe('clearOldMetrics', () => {
        test('deve manter apenas últimas N métricas', () => {
            // Criar 100 métricas
            for (let i = 0; i < 100; i++) {
                const id = tracker.startTracking('test-agent', 'task-1', `step-${i}`);
                tracker.endTracking(id, true);
            }

            tracker.clearOldMetrics(50);

            const stats = tracker.getStats();
            expect(stats.totalMetrics).toBe(50);
        });
    });

    describe('exportMetrics', () => {
        test('deve exportar métricas como JSON', () => {
            const id = tracker.startTracking('test-agent', 'task-1', 'step-1');
            tracker.endTracking(id, true);

            const exported = tracker.exportMetrics();
            const parsed = JSON.parse(exported);

            expect(Array.isArray(parsed)).toBe(true);
            expect(parsed.length).toBe(1);
            expect(parsed[0].agentName).toBe('test-agent');
        });
    });

    describe('getStats', () => {
        test('deve retornar estatísticas gerais', () => {
            const id1 = tracker.startTracking('agent-1', 'task-1', 'step-1');
            const id2 = tracker.startTracking('agent-2', 'task-2', 'step-1');

            tracker.endTracking(id1, true);
            tracker.endTracking(id2, true);

            const stats = tracker.getStats();

            expect(stats.totalMetrics).toBe(2);
            expect(stats.totalAgents).toBe(2);
            expect(stats.totalTasks).toBe(2);
            expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
        });

        test('deve retornar zeros quando não há métricas', () => {
            const stats = tracker.getStats();

            expect(stats.totalMetrics).toBe(0);
            expect(stats.totalAgents).toBe(0);
            expect(stats.totalTasks).toBe(0);
            expect(stats.averageDuration).toBe(0);
        });
    });
});
