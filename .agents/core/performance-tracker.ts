/**
 * Sistema de Métricas de Performance
 * 
 * Rastreia e analisa a performance de execução dos agentes,
 * incluindo duração de cada passo do workflow e identificação de bottlenecks.
 */

export interface PerformanceMetric {
    agentName: string;
    taskId: string;
    stepName: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    error?: string;
}

export interface AgentPerformanceSummary {
    agentName: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
}

export interface PerformanceReport {
    taskId: string;
    totalDuration: number;
    agentMetrics: Map<string, AgentPerformanceSummary>;
    bottlenecks: string[];
    recommendations: string[];
}

export class PerformanceTracker {
    private metrics: PerformanceMetric[] = [];
    private activeTimers: Map<string, number> = new Map();

    /**
     * Inicia o rastreamento de uma operação
     */
    startTracking(agentName: string, taskId: string, stepName: string): string {
        const trackingId = `${agentName}-${taskId}-${stepName}-${Date.now()}`;
        this.activeTimers.set(trackingId, Date.now());
        return trackingId;
    }

    /**
     * Finaliza o rastreamento de uma operação
     */
    endTracking(trackingId: string, success: boolean, error?: string): void {
        const startTime = this.activeTimers.get(trackingId);
        if (!startTime) {
            console.warn(`[PerformanceTracker] Tracking ID não encontrado: ${trackingId}`);
            return;
        }

        const endTime = Date.now();
        const [agentName, taskId, stepName] = trackingId.split('-');

        const metric: PerformanceMetric = {
            agentName,
            taskId,
            stepName,
            startTime,
            endTime,
            duration: endTime - startTime,
            success,
            error
        };

        this.metrics.push(metric);
        this.activeTimers.delete(trackingId);
    }

    /**
     * Obtém métricas de um agente específico
     */
    getAgentMetrics(agentName: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.agentName === agentName);
    }

    /**
     * Obtém métricas de uma tarefa específica
     */
    getTaskMetrics(taskId: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.taskId === taskId);
    }

    /**
     * Calcula resumo de performance de um agente
     */
    getAgentSummary(agentName: string): AgentPerformanceSummary {
        const agentMetrics = this.getAgentMetrics(agentName);

        if (agentMetrics.length === 0) {
            return {
                agentName,
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                averageDuration: 0,
                minDuration: 0,
                maxDuration: 0,
                p50Duration: 0,
                p95Duration: 0,
                p99Duration: 0
            };
        }

        const durations = agentMetrics.map(m => m.duration).sort((a, b) => a - b);
        const successfulExecutions = agentMetrics.filter(m => m.success).length;

        return {
            agentName,
            totalExecutions: agentMetrics.length,
            successfulExecutions,
            failedExecutions: agentMetrics.length - successfulExecutions,
            averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
            minDuration: durations[0],
            maxDuration: durations[durations.length - 1],
            p50Duration: this.calculatePercentile(durations, 50),
            p95Duration: this.calculatePercentile(durations, 95),
            p99Duration: this.calculatePercentile(durations, 99)
        };
    }

    /**
     * Gera relatório de performance completo para uma tarefa
     */
    generateReport(taskId: string): PerformanceReport {
        const taskMetrics = this.getTaskMetrics(taskId);
        const agentNames = [...new Set(taskMetrics.map(m => m.agentName))];

        const agentMetrics = new Map<string, AgentPerformanceSummary>();
        agentNames.forEach(name => {
            agentMetrics.set(name, this.getAgentSummary(name));
        });

        const totalDuration = taskMetrics.reduce((sum, m) => sum + m.duration, 0);
        const bottlenecks = this.identifyBottlenecks(agentMetrics);
        const recommendations = this.generateRecommendations(agentMetrics, bottlenecks);

        return {
            taskId,
            totalDuration,
            agentMetrics,
            bottlenecks,
            recommendations
        };
    }

    /**
     * Identifica bottlenecks (agentes mais lentos)
     */
    private identifyBottlenecks(agentMetrics: Map<string, AgentPerformanceSummary>): string[] {
        const bottlenecks: string[] = [];
        const avgDurations: Array<{ name: string; duration: number }> = [];

        agentMetrics.forEach((summary, name) => {
            avgDurations.push({ name, duration: summary.averageDuration });
        });

        // Ordenar por duração (maior primeiro)
        avgDurations.sort((a, b) => b.duration - a.duration);

        // Considerar os 30% mais lentos como bottlenecks
        const threshold = Math.ceil(avgDurations.length * 0.3);
        for (let i = 0; i < threshold && i < avgDurations.length; i++) {
            bottlenecks.push(avgDurations[i].name);
        }

        return bottlenecks;
    }

    /**
     * Gera recomendações baseadas nas métricas
     */
    private generateRecommendations(
        agentMetrics: Map<string, AgentPerformanceSummary>,
        bottlenecks: string[]
    ): string[] {
        const recommendations: string[] = [];

        // Recomendações para bottlenecks
        bottlenecks.forEach(agentName => {
            const summary = agentMetrics.get(agentName);
            if (summary && summary.averageDuration > 10000) {
                recommendations.push(
                    `⚠️ ${agentName}: Duração média muito alta (${(summary.averageDuration / 1000).toFixed(2)}s). Considere otimização ou cache.`
                );
            }
        });

        // Recomendações para taxa de falha
        agentMetrics.forEach((summary, name) => {
            const failureRate = summary.failedExecutions / summary.totalExecutions;
            if (failureRate > 0.1) {
                recommendations.push(
                    `🔴 ${name}: Taxa de falha alta (${(failureRate * 100).toFixed(1)}%). Investigar causas.`
                );
            }
        });

        // Recomendações para variabilidade
        agentMetrics.forEach((summary, name) => {
            const variability = summary.maxDuration / summary.minDuration;
            if (variability > 5 && summary.totalExecutions > 5) {
                recommendations.push(
                    `📊 ${name}: Alta variabilidade na duração (${variability.toFixed(1)}x). Pode indicar dependências externas instáveis.`
                );
            }
        });

        if (recommendations.length === 0) {
            recommendations.push('✅ Performance está dentro dos padrões esperados.');
        }

        return recommendations;
    }

    /**
     * Calcula percentil de uma lista de valores
     */
    private calculatePercentile(sortedValues: number[], percentile: number): number {
        if (sortedValues.length === 0) return 0;

        const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
        return sortedValues[Math.max(0, index)];
    }

    /**
     * Limpa métricas antigas (mantém apenas últimas N)
     */
    clearOldMetrics(keepLast: number = 1000): void {
        if (this.metrics.length > keepLast) {
            this.metrics = this.metrics.slice(-keepLast);
        }
    }

    /**
     * Exporta métricas para JSON
     */
    exportMetrics(): string {
        return JSON.stringify(this.metrics, null, 2);
    }

    /**
     * Obtém estatísticas gerais
     */
    getStats(): {
        totalMetrics: number;
        totalAgents: number;
        totalTasks: number;
        averageDuration: number;
    } {
        const uniqueAgents = new Set(this.metrics.map(m => m.agentName));
        const uniqueTasks = new Set(this.metrics.map(m => m.taskId));
        const avgDuration = this.metrics.length > 0
            ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length
            : 0;

        return {
            totalMetrics: this.metrics.length,
            totalAgents: uniqueAgents.size,
            totalTasks: uniqueTasks.size,
            averageDuration: avgDuration
        };
    }
}
