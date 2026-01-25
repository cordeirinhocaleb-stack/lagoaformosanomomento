/**
 * Base Agent - Classe base para todos os agentes
 * 
 * Responsabilidades:
 * - Fornecer interface comum para todos os agentes
 * - Integrar sistema de memória
 * - Gerenciar consulta e registro de resultados
 * - Implementar aprendizado contínuo
 */

import { MemorySystem, MemoryEntry } from './memory-system.js';
import { WorkflowStep } from './workflow-validator.js';
import { SkillManager, Skill } from './skill-manager.js';
import * as fs from 'fs';
import * as path from 'path';

export interface TaskContext {
    files: string[];
    areas: string[];
    complexity: 'low' | 'medium' | 'high';
}

export interface TaskResult {
    success: boolean;
    details: string;
    issues?: string[];
    warnings?: string[];
    recommendations?: string[];
}

export interface UserFeedback {
    satisfied: boolean;
    likes: string[];
    dislikes: string[];
    suggestions: string[];
}

/**
 * Classe base abstrata para agentes
 */
export abstract class BaseAgent {
    protected agentName: string;
    protected memory: MemorySystem;
    protected skillManager: SkillManager;
    protected specialtyPath: string;
    protected workflowSteps: WorkflowStep[] = [];
    protected referenceReposPath: string;

    constructor(agentName: string, memoryBasePath: string = '.agents/memory') {
        this.agentName = agentName;
        this.memory = new MemorySystem(memoryBasePath);
        this.skillManager = new SkillManager();
        this.specialtyPath = path.join(memoryBasePath, agentName, 'specialty.md');
        this.referenceReposPath = path.join(memoryBasePath, 'reference-repositories.json');
        this.ensureSpecialtyFile();
        this.initializeWorkflowSteps();
    }

    /**
     * Método abstrato: cada agente implementa sua lógica
     */
    abstract executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult>;

    /**
     * Executa tarefa consultando memória
     */
    async executeWithMemory(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🤖 AGENTE ATIVO: ${this.agentName.toUpperCase()}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📋 Tarefa: ${taskDescription}`);
        console.log(`⏰ Início: ${new Date().toLocaleTimeString('pt-BR')}\n`);

        // PASSO 1: Consultar casos similares
        this.markStepCompleted('Consultar Memória', { count: 0 });
        const similarCases = this.memory.getSimilarCases(this.agentName, taskDescription, 5);

        if (similarCases.length > 0) {
            console.log(`💭 [${this.agentName}] Encontrei ${similarCases.length} caso(s) similar(es):`);
            similarCases.forEach((case_, index) => {
                const emoji = case_.result === 'success' ? '✅' : '❌';
                console.log(`  ${index + 1}. ${emoji} ${case_.taskDescription}`);
                if (case_.userFeedback) {
                    console.log(`     Feedback: ${case_.userFeedback.satisfied ? '👍' : '👎'}`);
                }
            });
            this.updateStepDetails('Consultar Memória', { count: similarCases.length });
        }

        // PASSO 2: Obter recomendações baseadas em aprendizados
        this.markStepCompleted('Obter Recomendações', { count: 0 });
        const recommendations = this.memory.getRecommendations(this.agentName, taskDescription);

        if (recommendations.length > 0) {
            console.log(`\n💡 [${this.agentName}] Recomendações baseadas em aprendizados:`);
            recommendations.forEach((rec, index) => {
                console.log(`  ${index + 1}. ${rec}`);
            });
            this.updateStepDetails('Obter Recomendações', { count: recommendations.length });
        }

        // PASSO 3: Consultar repositórios de referência
        this.markStepCompleted('Consultar Repositórios');
        await this.consultReferenceRepositories();

        // PASSO 4: Aplicar aprendizados com alta confiança
        this.markStepCompleted('Aplicar Aprendizados');
        this.applyHighConfidenceLearnings(recommendations);

        // PASSO 5: Carregar Skills relevantes
        this.markStepCompleted('Carregar Skills');
        const skills = await this.skillManager.getRelevantSkills(taskDescription);

        if (skills.length === 1) {
            console.log(`\n💬 [${this.agentName}] Sou o agente ${this.agentName}, vou usar a skill ${skills[0].metadata.name}.`);
        } else if (skills.length > 1) {
            console.log(`\n💬 [${this.agentName}] Sou o agente ${this.agentName}, vou usar as seguintes skills para esta tarefa:`);
            skills.forEach(skill => {
                console.log(`   - ${skill.metadata.name}: ${skill.metadata.description}`);
            });
        } else {
            console.log(`\nℹ️  [${this.agentName}] Nenhuma skill específica encontrada para esta tarefa.`);
        }

        // Executar tarefa
        console.log(`\n⚙️  [${this.agentName}] Executando tarefa...\n`);
        const result = await this.executeTask(taskDescription, context);

        // PASSO 5: Registrar resultado
        this.markStepCompleted('Registrar Resultado');
        await this.recordOutcome(taskDescription, context, result);

        const status = result.success ? '✅ SUCESSO' : '❌ FALHA';
        console.log(`\n${status} [${this.agentName}] Tarefa concluída`);
        console.log(`⏰ Término: ${new Date().toLocaleTimeString('pt-BR')}`);
        console.log(`${'='.repeat(60)}\n`);

        return result;
    }

    /**
     * Registra resultado na memória
     */
    async recordOutcome(
        taskDescription: string,
        context: TaskContext,
        result: TaskResult,
        userFeedback?: UserFeedback
    ): Promise<void> {
        if (result.success) {
            this.memory.recordSuccess(
                this.agentName,
                taskDescription,
                context,
                result.details,
                userFeedback
            );
        } else {
            this.memory.recordFailure(
                this.agentName,
                taskDescription,
                context,
                result.details,
                userFeedback
            );
        }
    }

    /**
     * Adiciona aprendizado baseado em feedback
     */
    async learn(
        pattern: string,
        description: string,
        recommendation: string,
        exampleIds: string[] = []
    ): Promise<void> {
        this.memory.addLearning(
            this.agentName,
            pattern,
            description,
            recommendation,
            exampleIds
        );
    }

    /**
     * Obtém estatísticas do agente
     */
    getStats() {
        return this.memory.getStats(this.agentName);
    }

    /**
     * Lê arquivo de especialidade
     */
    getSpecialty(): string {
        if (fs.existsSync(this.specialtyPath)) {
            return fs.readFileSync(this.specialtyPath, 'utf-8');
        }
        return 'Especialidade não definida';
    }

    /**
     * Garante que arquivo de especialidade existe
     */
    private ensureSpecialtyFile(): void {
        const agentDir = path.dirname(this.specialtyPath);

        if (!fs.existsSync(agentDir)) {
            fs.mkdirSync(agentDir, { recursive: true });
        }

        if (!fs.existsSync(this.specialtyPath)) {
            const defaultSpecialty = this.getDefaultSpecialty();
            fs.writeFileSync(this.specialtyPath, defaultSpecialty, 'utf-8');
        }
    }

    /**
     * Retorna especialidade padrão (pode ser sobrescrito)
     */
    protected getDefaultSpecialty(): string {
        return `# ${this.agentName} - Especialidade

## Responsabilidades
- Definir responsabilidades específicas

## Expertise
- Definir áreas de expertise

## Regras
- Definir regras específicas

## Tarefas Típicas
- Listar tarefas típicas
`;
    }

    /**
     * Inicializa os passos do workflow
     */
    private initializeWorkflowSteps(): void {
        this.workflowSteps = [
            { name: 'Consultar Memória', required: true, completed: false },
            { name: 'Obter Recomendações', required: true, completed: false },
            { name: 'Consultar Repositórios', required: true, completed: false },
            { name: 'Aplicar Aprendizados', required: true, completed: false },
            { name: 'Carregar Skills', required: true, completed: false },
            { name: 'Registrar Resultado', required: true, completed: false },
            { name: 'Gerar Aprendizados', required: false, completed: false }
        ];
    }

    /**
     * Marca um passo como completado
     */
    protected markStepCompleted(stepName: string, details?: any): void {
        const step = this.workflowSteps.find(s => s.name === stepName);
        if (step) {
            step.completed = true;
            step.timestamp = new Date();
            step.details = details;
        }
    }

    /**
     * Atualiza detalhes de um passo
     */
    protected updateStepDetails(stepName: string, details: any): void {
        const step = this.workflowSteps.find(s => s.name === stepName);
        if (step) {
            step.details = { ...step.details, ...details };
        }
    }

    /**
     * Retorna os passos do workflow para validação
     */
    getWorkflowSteps(): WorkflowStep[] {
        return [...this.workflowSteps];
    }

    /**
     * Consulta repositórios de referência relevantes
     */
    protected async consultReferenceRepositories(): Promise<void> {
        try {
            if (!fs.existsSync(this.referenceReposPath)) {
                console.log(`⚠️  [${this.agentName}] Arquivo de repositórios não encontrado`);
                return;
            }

            const repos = JSON.parse(fs.readFileSync(this.referenceReposPath, 'utf-8'));
            const relevantRepos = this.getRelevantRepositories(repos);

            if (relevantRepos.length > 0) {
                console.log(`\n📚 [${this.agentName}] Consultando repositórios de referência:`);
                relevantRepos.forEach(repo => {
                    console.log(`   - ${repo.name}: ${repo.url}`);
                });
            }
        } catch (error: any) {
            console.log(`⚠️  [${this.agentName}] Erro ao consultar repositórios:`, error.message);
        }
    }

    /**
     * Retorna repositórios relevantes para este agente (pode ser sobrescrito)
     */
    protected getRelevantRepositories(repos: any): Array<{ name: string; url: string }> {
        // Implementação padrão - pode ser sobrescrita por agentes específicos
        return [];
    }

    /**
     * Aplica aprendizados com alta confiança
     */
    protected applyHighConfidenceLearnings(recommendations: string[]): void {
        const memory = this.memory.loadMemory(this.agentName);
        const highConfidenceLearnings = memory.learnings.filter(l => l.confidence > 0.7);

        if (highConfidenceLearnings.length > 0) {
            console.log(`\n🎯 [${this.agentName}] Aplicando ${highConfidenceLearnings.length} aprendizado(s) de alta confiança:`);
            highConfidenceLearnings.forEach((learning, index) => {
                console.log(`   ${index + 1}. ${learning.recommendation} (confiança: ${(learning.confidence * 100).toFixed(0)}%)`);
            });
        }
    }
}
