/**
 * Task Analyzer Agent
 * 
 * Responsabilidades:
 * - Analisar tarefa ANTES de executar
 * - Decidir quais agentes usar
 * - Criar plano de execução com subtarefas
 * - Sugerir pesquisas em repositórios/docs quando necessário
 */

import { AgentConfig } from './config.js';

export interface TaskAnalysis {
    taskDescription: string;
    detectedAreas: string[]; // ['frontend', 'security', 'database', 'api']
    requiredAgents: string[]; // ['frontend-agent', 'security-agent', 'db-security-agent']
    agentAssignments: AgentAssignment[];
    suggestedResearch: ResearchSuggestion[];
    complexity: 'low' | 'medium' | 'high';
}

export interface AgentAssignment {
    agentName: string;
    subtask: string;
    priority: number; // 1 = executar primeiro
    dependencies: string[]; // outros agentes que devem executar antes
    confidence?: number; // nível de confiança na designação
}

export interface ResearchSuggestion {
    topic: string;
    sources: string[]; // ['supabase-docs', 'react-docs', 'github:example/repo']
    reason: string;
}

export class TaskAnalyzerAgent {
    /**
     * Analisa a tarefa e retorna plano de execução
     */
    async analyzeTask(taskDescription: string, config: AgentConfig): Promise<TaskAnalysis> {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🧠 ANÁLISE INTELIGENTE DA TAREFA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log(`📋 Tarefa: ${taskDescription}\n`);

        // Detectar áreas envolvidas
        const detectedAreas = this.detectAreas(taskDescription);
        console.log('🎯 Áreas detectadas:');
        detectedAreas.forEach(area => console.log(`  - ${area}`));
        console.log('');

        // Determinar agentes necessários
        const requiredAgents = this.determineRequiredAgents(detectedAreas, taskDescription);
        console.log('🤖 Agentes necessários:');
        requiredAgents.forEach(agent => console.log(`  - ${agent}`));
        console.log('');

        // Criar assignments (subtarefas)
        const agentAssignments = this.createAgentAssignments(requiredAgents, taskDescription, detectedAreas);
        console.log('📌 Designação de tarefas:');
        agentAssignments.forEach(assignment => {
            console.log(`  ${assignment.priority}. ${assignment.agentName}:`);
            console.log(`     → ${assignment.subtask}`);
            if (assignment.dependencies.length > 0) {
                console.log(`     ⚠️  Depende de: ${assignment.dependencies.join(', ')}`);
            }
        });
        console.log('');

        // Sugerir pesquisas
        const suggestedResearch = this.suggestResearch(detectedAreas, taskDescription);
        if (suggestedResearch.length > 0) {
            console.log('🔍 Pesquisas sugeridas:');
            suggestedResearch.forEach(suggestion => {
                console.log(`  📚 ${suggestion.topic}`);
                console.log(`     Fontes: ${suggestion.sources.join(', ')}`);
                console.log(`     Por quê: ${suggestion.reason}\n`);
            });
        }

        // Determinar complexidade
        const complexity = this.estimateComplexity(detectedAreas, requiredAgents);
        console.log(`⚖️  Complexidade: ${complexity.toUpperCase()}\n`);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return {
            taskDescription,
            detectedAreas,
            requiredAgents,
            agentAssignments,
            suggestedResearch,
            complexity,
        };
    }

    /**
     * Detecta áreas envolvidas na tarefa por palavras-chave
     */
    private detectAreas(taskDescription: string): string[] {
        const areas: string[] = [];
        const desc = taskDescription.toLowerCase();

        // Frontend
        if (desc.match(/component|ui|interface|página|layout|css|estilo|responsiv/i)) {
            areas.push('frontend');
        }

        // Backend/API
        if (desc.match(/api|endpoint|rota|servidor|backend|função/i)) {
            areas.push('backend');
        }

        // Database
        if (desc.match(/database|banco|tabela|query|sql|migration|rls|policy|supabase/i)) {
            areas.push('database');
        }

        // Auth
        if (desc.match(/auth|login|logout|session|usuário|permiss|role/i)) {
            areas.push('auth');
        }

        // Security
        if (desc.match(/segur|vulnerab|xss|csrf|sanitiz|validação/i)) {
            areas.push('security');
        }

        // Performance
        if (desc.match(/performance|otimiz|cache|lazy|bundle|speed/i)) {
            areas.push('performance');
        }

        // Testing
        if (desc.match(/test|qa|validar|verificar/i)) {
            areas.push('testing');
        }

        // Documentation
        if (desc.match(/doc|readme|comentário|explain/i)) {
            areas.push('documentation');
        }

        // Inventory/Scan
        if (desc.match(/escanear|inventário|scan|almoxarifado/i)) {
            areas.push('inventory');
        }

        return areas.length > 0 ? areas : ['generic'];
    }

    /**
     * Determina quais agentes usar baseado nas áreas
     */
    private determineRequiredAgents(areas: string[], taskDescription: string): string[] {
        const agents = new Set<string>();

        // Agentes core (sempre incluir alguns)
        agents.add('architecture-agent'); // Sempre valida estrutura
        agents.add('quality-agent'); // Sempre valida ao final

        // Agentes específicos por área
        if (areas.includes('frontend')) {
            agents.add('frontend-agent');
        }

        if (areas.includes('security') || areas.includes('auth')) {
            agents.add('security-agent');
        }

        if (areas.includes('database')) {
            agents.add('database-security-agent');
        }

        if (areas.includes('documentation')) {
            agents.add('documentation-agent');
        }

        if (areas.includes('inventory')) {
            agents.add('inventory-agent');
        }

        // Agentes de domínio (baseado em palavras-chave)
        if (taskDescription.match(/artigo|post|cms|seo/i)) {
            agents.add('cms-agent');
            agents.add('seo-agent');
        }

        if (taskDescription.match(/produção|plant|evento/i)) {
            agents.add('production-control-agent');
        }

        if (taskDescription.match(/rota|entrega|logística/i)) {
            agents.add('route-agent');
        }

        return Array.from(agents);
    }

    /**
     * Cria designações específicas para cada agente
     */
    private createAgentAssignments(
        agents: string[],
        taskDescription: string,
        areas: string[]
    ): AgentAssignment[] {
        const assignments: AgentAssignment[] = [];

        // Exemplo de subtarefas específicas
        if (agents.includes('architecture-agent')) {
            assignments.push({
                agentName: 'architecture-agent',
                subtask: 'Validar estrutura de arquivos e garantir limite 500 linhas',
                priority: 1,
                dependencies: [],
            });
        }

        if (agents.includes('frontend-agent')) {
            assignments.push({
                agentName: 'frontend-agent',
                subtask: 'Validar componentes React, acessibilidade e UI/UX',
                priority: 2,
                dependencies: ['architecture-agent'],
            });
        }

        if (agents.includes('security-agent')) {
            assignments.push({
                agentName: 'security-agent',
                subtask: 'Detectar vulnerabilidades (XSS, CSRF, dados sensíveis)',
                priority: 2,
                dependencies: ['architecture-agent'],
            });
        }

        if (agents.includes('database-security-agent')) {
            assignments.push({
                agentName: 'database-security-agent',
                subtask: 'Validar RLS policies e estrutura de tabelas Supabase',
                priority: 3,
                dependencies: ['architecture-agent'],
            });
        }

        if (agents.includes('documentation-agent')) {
            assignments.push({
                agentName: 'documentation-agent',
                subtask: 'Gerar/atualizar documentação automática',
                priority: 4,
                dependencies: ['frontend-agent', 'security-agent'],
            });
        }

        if (agents.includes('inventory-agent')) {
            assignments.push({
                agentName: 'inventory-agent',
                subtask: 'Executar scan completo do projeto e atualizar almoxarifado',
                priority: 1,
                dependencies: [],
            });
        }

        if (agents.includes('quality-agent')) {
            assignments.push({
                agentName: 'quality-agent',
                subtask: 'Executar lint, typecheck, build e dar GO/NO-GO final',
                priority: 5,
                dependencies: Array.from(
                    new Set(agents.filter(a => a !== 'quality-agent'))
                ),
            });
        }

        // Agentes de domínio
        if (agents.includes('cms-agent')) {
            assignments.push({
                agentName: 'cms-agent',
                subtask: 'Validar estrutura de artigos/posts e campos obrigatórios',
                priority: 2,
                dependencies: ['architecture-agent'],
            });
        }

        if (agents.includes('seo-agent')) {
            assignments.push({
                agentName: 'seo-agent',
                subtask: 'Validar meta tags, structured data e sitemap',
                priority: 3,
                dependencies: ['frontend-agent'],
            });
        }

        return assignments.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Sugere pesquisas em repositórios/docs
     */
    private suggestResearch(areas: string[], taskDescription: string): ResearchSuggestion[] {
        const suggestions: ResearchSuggestion[] = [];

        if (areas.includes('database')) {
            suggestions.push({
                topic: 'Supabase Row Level Security (RLS)',
                sources: ['supabase-docs', 'https://supabase.com/docs/guides/auth/row-level-security'],
                reason: 'Tarefa envolve banco de dados, verificar best practices de RLS',
            });
        }

        if (areas.includes('frontend')) {
            suggestions.push({
                topic: 'Next.js App Router Best Practices',
                sources: ['nextjs-docs', 'https://nextjs.org/docs/app'],
                reason: 'Garantir uso correto de Server/Client Components',
            });
        }

        if (areas.includes('security')) {
            suggestions.push({
                topic: 'OWASP Top 10',
                sources: ['owasp-docs', 'https://owasp.org/www-project-top-ten/'],
                reason: 'Tarefa envolve segurança, revisar vulnerabilidades comuns',
            });
        }

        if (areas.includes('performance')) {
            suggestions.push({
                topic: 'React Performance Optimization',
                sources: ['react-docs', 'https://react.dev/learn/render-and-commit'],
                reason: 'Otimizar renders e performance do React',
            });
        }

        if (taskDescription.match(/typescript|type|interface/i)) {
            suggestions.push({
                topic: 'TypeScript Advanced Types',
                sources: ['typescript-docs', 'https://www.typescriptlang.org/docs/handbook/2/types-from-types.html'],
                reason: 'Garantir tipagem forte sem uso de "any"',
            });
        }

        return suggestions;
    }

    /**
     * Estima complexidade da tarefa
     */
    private estimateComplexity(areas: string[], agents: string[]): 'low' | 'medium' | 'high' {
        const areaCount = areas.length;
        const agentCount = agents.length;

        if (areaCount <= 2 && agentCount <= 3) {
            return 'low';
        }

        if (areaCount <= 4 && agentCount <= 5) {
            return 'medium';
        }

        return 'high';
    }
}
