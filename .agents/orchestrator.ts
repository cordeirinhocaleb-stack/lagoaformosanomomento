/**
 * Intelligent Orchestrator - Agente de Auditoria Orquestrador
 * 
 * Responsabilidades:
 * - Analisar tarefa e selecionar melhores agentes baseado em memória
 * - Distribuir subtarefas para agentes especializados
 * - Executar 6 passos obrigatórios com aprendizado
 * - Coletar feedback e registrar resultados
 * - Dar decisão final GO/NO-GO
 */

import { FrontEndAgent } from './core/frontend-agent.js';
import { SecurityAgent } from './core/security-agent.js';
import { ArchitectureAgent } from './core/architecture-agent.js';
import { QualityAgent } from './core/quality-agent.js';
import { DocumentationAgent } from './core/documentation-agent.js';
import { InventoryAgent } from './core/inventory-agent.js';
import * as fs from 'fs';
import * as path from 'path';

// Domain Agents
import { CMSAgent } from './domains/news/cms-agent.js';
import { SEOAgent } from './domains/news/seo-agent.js';
import { ProductionControlAgent } from './domains/production/production-control-agent.js';
import { RouteAgent } from './domains/logistics/route-agent.js';

import { TaskAnalyzerAgent, TaskAnalysis, AgentAssignment } from './task-analyzer-agent.js';
import { MemorySystem } from './core/memory-system.js';
import { FeedbackCollector, UserFeedback } from './core/feedback-collector.js';
import { PythonBridge } from './security/python-bridge.js';
import { AgentConfig, DEFAULT_CONFIG } from './config.js';
import { ProjectContext } from './context-loader.js';
import { TaskContext, TaskResult } from './core/base-agent.js';
import { RetryUtility } from './core/retry-utility.js';
import { AgentParallelizer } from './core/agent-parallelizer.js';
import { PerformanceTracker } from './core/performance-tracker.js';

export interface ImplementationPlan {
    title: string;
    description: string;
    hasUIChanges: boolean;
    hasDatabaseChanges: boolean;
    affectedFiles: string[];
    estimatedComplexity: 'low' | 'medium' | 'high';
}

export interface AgentReport {
    agentName: string;
    stepNumber: number;
    status: 'success' | 'warning' | 'error';
    summary: string;
    details: string;
    blockers?: string[];
}

export interface ExecutionResult {
    success: boolean;
    status: 'GO' | 'NO-GO';
    reports: AgentReport[];
    blockers: string[];
    taskId: string;
}

export class IntelligentOrchestrator {
    private config: AgentConfig;
    private taskAnalyzer: TaskAnalyzerAgent;
    private memory: MemorySystem;
    private feedbackCollector: FeedbackCollector;
    private context: ProjectContext;
    private performanceTracker: PerformanceTracker;

    // Core Agents
    private frontendAgent: FrontEndAgent;
    private securityAgent: SecurityAgent;
    private architectureAgent: ArchitectureAgent;
    private qualityAgent: QualityAgent;
    private documentationAgent: DocumentationAgent;
    private inventoryAgent: InventoryAgent;
    private pythonBridge: PythonBridge;

    // Domain Agents
    private cmsAgent: CMSAgent;
    private seoAgent: SEOAgent;
    private productionControlAgent: ProductionControlAgent;
    private routeAgent: RouteAgent;

    constructor(context: ProjectContext, config: AgentConfig = DEFAULT_CONFIG) {
        this.context = context;
        this.config = config;
        this.taskAnalyzer = new TaskAnalyzerAgent();
        this.memory = new MemorySystem(config.memoryPath, config.maxMemoryEntries);
        this.feedbackCollector = new FeedbackCollector(config.memoryPath);
        this.pythonBridge = new PythonBridge();
        this.performanceTracker = new PerformanceTracker();

        // Inicializar todos os agentes com memória
        this.frontendAgent = new FrontEndAgent(config.memoryPath);
        this.securityAgent = new SecurityAgent(config.memoryPath);
        this.architectureAgent = new ArchitectureAgent(config.memoryPath);
        this.qualityAgent = new QualityAgent(config.memoryPath);
        this.documentationAgent = new DocumentationAgent(config.memoryPath);
        this.inventoryAgent = new InventoryAgent(process.cwd());

        // Inicializar agentes de domínio
        this.cmsAgent = new CMSAgent(config.memoryPath);
        this.seoAgent = new SEOAgent(config.memoryPath);
        this.productionControlAgent = new ProductionControlAgent(config.memoryPath);
        this.routeAgent = new RouteAgent(config.memoryPath);
    }

    /**
     * Orquestra uma tarefa completa com aprendizado
     */
    async orchestrateTask(taskDescription: string): Promise<ExecutionResult> {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎯 ORQUESTRADOR INTELIGENTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const taskId = this.generateTaskId();

        // 1. Analisar tarefa
        console.log('📊 Fase 1: Análise da Tarefa\n');
        const analysis = await this.taskAnalyzer.analyzeTask(taskDescription, this.config);

        // 2. Selecionar melhores agentes baseado em memória
        console.log('\n🤖 Fase 2: Seleção Inteligente de Agentes\n');
        const selectedAgents = await this.selectBestAgents(analysis);

        // 3. Executar com agentes selecionados (EM PARALELO)
        console.log('\n⚙️  Fase 3: Execução com Agentes\n');

        // Agrupar agentes para execução paralela
        const agentGroups = AgentParallelizer.groupAgents(selectedAgents);
        const timeEstimate = AgentParallelizer.estimateTimeReduction(selectedAgents);

        console.log(`📊 Agentes agrupados em ${agentGroups.length} grupo(s) paralelo(s)`);
        console.log(`⏱️  Redução estimada de tempo: ${timeEstimate.reduction}% (${timeEstimate.sequential}s → ${timeEstimate.parallel}s)\n`);

        const reports: AgentReport[] = [];
        const blockers: string[] = [];
        let success = true;

        // VERIFICAÇÃO ANTI-DUPLICAÇÃO PROATIVA
        await this.checkDuplicationBeforeExecution(taskDescription);

        // Executar cada grupo em paralelo
        for (let i = 0; i < agentGroups.length; i++) {
            const group = agentGroups[i];

            if (group.length === 1) {
                console.log(`\n🔹 Grupo ${i + 1}: Executando ${group[0].agentName}`);
            } else {
                console.log(`\n🔸 Grupo ${i + 1}: Executando ${group.length} agentes em paralelo:`);
                group.forEach(a => console.log(`   - ${a.agentName}`));
            }

            // Executar agentes do grupo em paralelo
            const groupReports = await Promise.all(
                group.map(assignment => this.executeWithAgent(assignment, analysis))
            );

            reports.push(...groupReports);

            // Verificar se houve erro crítico
            const hasError = groupReports.some(r => r.status === 'error');
            if (hasError) {
                success = false;
                groupReports.forEach(r => {
                    if (r.blockers) blockers.push(...r.blockers);
                });
                console.log('\n❌ Erro crítico detectado, parando execução');
                break; // Para na primeira falha crítica
            }
        }

        // 4. Gerar relatório de performance
        console.log('\n📊 Relatório de Performance\n');
        const perfReport = this.performanceTracker.generateReport(taskId);

        console.log(`⏱️  Duração total: ${(perfReport.totalDuration / 1000).toFixed(2)}s`);
        console.log(`🤖 Agentes executados: ${perfReport.agentMetrics.size}`);

        if (perfReport.bottlenecks.length > 0) {
            console.log(`\n⚠️  Bottlenecks identificados:`);
            perfReport.bottlenecks.forEach(name => {
                const summary = perfReport.agentMetrics.get(name);
                if (summary) {
                    console.log(`   - ${name}: ${(summary.averageDuration / 1000).toFixed(2)}s (média)`);
                }
            });
        }

        if (perfReport.recommendations.length > 0) {
            console.log(`\n💡 Recomendações:`);
            perfReport.recommendations.forEach(rec => console.log(`   ${rec}`));
        }

        // 5. Decisão final
        const status = success ? 'GO' : 'NO-GO';

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`${success ? '✅ GO' : '❌ NO-GO'} - Execução ${success ? 'concluída' : 'bloqueada'}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // 6. Coletar feedback (se habilitado)
        if (this.config.feedbackEnabled) {
            await this.collectFeedbackForTask(taskId, selectedAgents, taskDescription);
        }

        return {
            success,
            status,
            reports,
            blockers,
            taskId,
        };
    }

    /**
     * Seleciona melhores agentes baseado em histórico
     */
    private async selectBestAgents(analysis: TaskAnalysis): Promise<AgentAssignment[]> {
        const selectedAgents: AgentAssignment[] = [];

        console.log('🔍 Analisando histórico de performance dos agentes...\n');

        for (const assignment of analysis.agentAssignments) {
            const stats = this.memory.getStats(assignment.agentName);

            console.log(`📊 ${assignment.agentName}:`);
            console.log(`   Taxa de sucesso: ${(stats.successRate * 100).toFixed(1)}%`);
            console.log(`   Total de tarefas: ${stats.totalTasks}`);

            // Sempre incluir, mas mostrar confiança
            if (stats.successRate >= 0.7 || stats.totalTasks === 0) {
                console.log(`   ✅ Selecionado (alta confiança)\n`);
                selectedAgents.push(assignment);
            } else if (stats.successRate >= 0.5) {
                console.log(`   ⚠️  Selecionado (confiança média)\n`);
                selectedAgents.push(assignment);
            } else {
                console.log(`   ⚠️  Selecionado (baixa confiança - monitorar)\n`);
                selectedAgents.push(assignment);
            }
        }

        return selectedAgents;
    }

    /**
     * Executa tarefa com um agente específico
     */
    private async executeWithAgent(
        assignment: AgentAssignment,
        analysis: TaskAnalysis
    ): Promise<AgentReport> {
        console.log(`━━━ ${assignment.agentName} ━━━`);
        console.log(`Subtarefa: ${assignment.subtask}\n`);

        try {
            const context: TaskContext = {
                files: await this.extractFilesForAgent(assignment.agentName, analysis),
                areas: analysis.detectedAreas,
                complexity: analysis.complexity,
            };

            let result: TaskResult;

            // Iniciar tracking de performance
            const taskId = this.generateTaskId();
            const trackingId = this.performanceTracker.startTracking(
                assignment.agentName,
                taskId,
                'full-execution'
            );

            // Executar com timeout e retry
            result = await RetryUtility.executeWithTimeoutAndRetry(
                async () => {
                    // Executar com o agente apropriado
                    switch (assignment.agentName) {
                        case 'frontend-agent':
                            return await this.frontendAgent.executeWithMemory(assignment.subtask, context);

                        case 'security-agent':
                            return await this.securityAgent.executeWithMemory(assignment.subtask, context);

                        case 'architecture-agent':
                            return await this.architectureAgent.executeWithMemory(assignment.subtask, context);

                        case 'quality-agent':
                            return await this.qualityAgent.executeWithMemory(assignment.subtask, context);

                        case 'documentation-agent':
                            return await this.documentationAgent.executeWithMemory(assignment.subtask, context);

                        case 'inventory-agent':
                            return await this.inventoryAgent.executeTask(assignment.subtask, context);

                        case 'cms-agent':
                            return await this.cmsAgent.executeWithMemory(assignment.subtask, context);

                        case 'seo-agent':
                            return await this.seoAgent.executeWithMemory(assignment.subtask, context);

                        case 'production-control-agent':
                            return await this.productionControlAgent.executeWithMemory(assignment.subtask, context);

                        case 'route-agent':
                            return await this.routeAgent.executeWithMemory(assignment.subtask, context);

                        case 'pentesting-agent':
                            // Executar agente Python de pentesting
                            const pentestResult = await this.pythonBridge.executePentesting({
                                target: 'http://localhost:3000', // Em produção, usar URL do projeto
                                testSqlInjection: true,
                                testXss: true,
                                testPasswords: true,
                                testHeaders: true
                            });
                            return this.pythonBridge.convertToAgentResult(pentestResult);

                        default:
                            // Agente não implementado ainda
                            return {
                                success: true,
                                details: `Agente ${assignment.agentName} ainda não implementado`,
                                warnings: ['Agente em desenvolvimento'],
                            };
                    }
                },
                30000, // 30 segundos de timeout
                {
                    maxRetries: 2,
                    initialDelay: 2000,
                    backoffMultiplier: 2
                },
                assignment.agentName
            );

            const status = result.success ? 'success' : 'error';

            // Finalizar tracking de performance
            this.performanceTracker.endTracking(trackingId, result.success);

            console.log(`${result.success ? '✅' : '❌'} ${assignment.agentName} concluído\n`);

            return {
                agentName: assignment.agentName,
                stepNumber: assignment.priority,
                status,
                summary: result.success ? 'Tarefa concluída com sucesso' : 'Tarefa falhou',
                details: result.details,
                blockers: result.issues,
            };

        } catch (error) {
            console.error(`❌ Erro ao executar ${assignment.agentName}:`, error);

            // Finalizar tracking de performance com erro
            // Note: trackingId pode não existir se erro ocorreu antes do tracking iniciar
            try {
                const taskId = this.generateTaskId();
                const trackingId = this.performanceTracker.startTracking(
                    assignment.agentName,
                    taskId,
                    'full-execution'
                );
                this.performanceTracker.endTracking(
                    trackingId,
                    false,
                    error instanceof Error ? error.message : 'Erro desconhecido'
                );
            } catch (trackingError) {
                // Ignorar erros de tracking
            }

            return {
                agentName: assignment.agentName,
                stepNumber: assignment.priority,
                status: 'error',
                summary: 'Erro na execução',
                details: error instanceof Error ? error.message : 'Erro desconhecido',
                blockers: ['Erro crítico na execução'],
            };
        }
    }

    /**
     * Verifica duplicação de recursos antes da execução
     */
    private async checkDuplicationBeforeExecution(taskDescription: string): Promise<void> {
        console.log('🛡️  Consulando Almoxarifado (Inventory Agent) para evitar duplicações...');

        // Simular contexto para o Inventory Agent
        const context: TaskContext = {
            files: [],
            areas: ['inventory'],
            complexity: 'low'
        };

        const result = await this.inventoryAgent.executeTask(`check duplication for "${taskDescription}"`, context);

        if (result.warnings && result.warnings.length > 0) {
            console.log('\n⚠️  ALERTA DE DUPLICAÇÃO DETECTADO:');
            result.warnings.forEach(w => console.log(`   - ${w}`));
            if (result.recommendations) {
                console.log('\n💡 Sugestões do Almoxarifado:');
                result.recommendations.forEach(r => console.log(`   - ${r}`));
            }
            console.log('\n');
        } else {
            console.log('✅ Nenhuma duplicação óbvia detectada. Prosseguindo...\n');
        }
    }

    /**
     * Extrai arquivos relevantes para um agente
     */
    async extractFilesForAgent(agentName: string, analysis: TaskAnalysis): Promise<string[]> {
        const taskDesc = analysis.taskDescription.toLowerCase();
        const rootDir = process.cwd();
        const srcDir = path.join(rootDir, 'src');

        const files: string[] = [];

        try {
            this.recursiveFind(srcDir, files);
        } catch (e) {
            console.error('Error scanning files:', e);
        }

        if (taskDesc.includes('admin')) {
            return files.filter(f => f.includes('admin'));
        }

        return files;
    }

    private recursiveFind(dir: string, fileList: string[]) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                if (file !== 'node_modules') {
                    this.recursiveFind(filePath, fileList);
                }
            } else {
                if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                    fileList.push(filePath);
                }
            }
        }
    }

    /**
     * Coleta feedback para a tarefa
     */
    private async collectFeedbackForTask(
        taskId: string,
        agents: AgentAssignment[],
        taskDescription: string
    ): Promise<void> {
        console.log('\n📝 Feedback habilitado - aguardando feedback do usuário');
        console.log('   Use feedbackCollector.provideFeedback() para fornecer feedback\n');

        // Em produção, isso seria um prompt interativo
        // Por enquanto, apenas informamos que o feedback está disponível
        for (const agent of agents) {
            await this.feedbackCollector.collectFeedback(
                taskId,
                agent.agentName,
                taskDescription
            );
        }
    }

    /**
     * Fornece feedback manualmente
     */
    async provideFeedback(taskId: string, agentName: string, feedback: Omit<UserFeedback, 'taskId' | 'agentName' | 'timestamp'>): Promise<void> {
        const fullFeedback: UserFeedback = {
            taskId,
            agentName,
            ...feedback,
            timestamp: new Date(),
        };

        await this.feedbackCollector.provideFeedback(fullFeedback);
    }

    /**
     * Gera relatório de feedback de um agente
     */
    getFeedbackReport(agentName: string): string {
        return this.feedbackCollector.generateFeedbackReport(agentName);
    }

    /**
     * Gera ID único para tarefa
     */
    private generateTaskId(): string {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Método legado para compatibilidade
     */
    async analyzeBeforeExecution(taskDescription: string): Promise<TaskAnalysis> {
        return await this.taskAnalyzer.analyzeTask(taskDescription, this.config);
    }

    /**
     * Método legado para compatibilidade
     */
    async executePlan(plan: ImplementationPlan): Promise<ExecutionResult> {
        // Converter plano para descrição de tarefa
        const taskDescription = `${plan.title}: ${plan.description}`;
        return await this.orchestrateTask(taskDescription);
    }
}

// Manter compatibilidade com código existente
export { IntelligentOrchestrator as AgentsOrchestrator };
