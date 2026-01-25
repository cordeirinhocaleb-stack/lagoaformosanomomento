/**
 * Project Discovery Agent
 * 
 * Responsabilidades:
 * - Detectar se é projeto novo ou existente
 * - Fazer perguntas sobre o projeto
 * - Analisar respostas e gerar relatório
 * - Sugerir/criar agentes customizados
 * - Adicionar estruturas ao código
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { DomainType } from './config.js';
import { CodeAuditorAgent } from './code-auditor-agent.js';

export interface ProjectProfile {
    isNewProject: boolean;
    projectName: string;
    domain: DomainType | 'custom';
    customDomain?: string;
    stack: string[];
    objectives: string[];
    features: string[];
    teamSize: number;
    hasDatabase: boolean;
    hasCMS: boolean;
    hasAuth: boolean;
    hasPayments: boolean;
    customNeeds: string[];
}

export interface AgentRecommendation {
    name: string;
    file: string;
    purpose: string;
    priority: 'high' | 'medium' | 'low';
    autoCreate: boolean;
}

export class ProjectDiscoveryAgent {
    private readline: any;

    constructor() {
        this.readline = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    /**
     * Detecta se é projeto novo
     */
    detectNewProject(): boolean {
        // Verifica se já existe documentação de agentes
        const hasAgentRules = fs.existsSync('docs/AGENT_RULES.md');
        const hasBuildHistory = fs.existsSync('docs/BUILD_HISTORY.md');
        const hasSymbolsTree = fs.existsSync('docs/SYMBOLS_TREE.md');

        // Se não existe nenhum, é novo
        if (!hasAgentRules && !hasBuildHistory && !hasSymbolsTree) {
            return true;
        }

        // Se tem BUILD_HISTORY vazio ou só com template, é novo
        if (hasBuildHistory) {
            const content = fs.readFileSync('docs/BUILD_HISTORY.md', 'utf-8');
            if (content.includes('[Próximas Entradas]') && !content.includes('Build 001')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Faz pergunta ao usuário
     */
    private async ask(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.readline.question(question, (answer: string) => {
                resolve(answer.trim());
            });
        });
    }

    /**
     * Pergunta de múltipla escolha
     */
    private async askChoice(question: string, choices: string[]): Promise<string> {
        console.log(`\n${question}`);
        choices.forEach((choice, index) => {
            console.log(`  ${index + 1}. ${choice}`);
        });

        const answer = await this.ask('Escolha (número): ');
        const index = parseInt(answer) - 1;

        if (index >= 0 && index < choices.length) {
            return choices[index];
        }

        return choices[0]; // Default primeira opção
    }

    /**
   * Executa descoberta interativa do projeto
   */
    async discoverProject(): Promise<ProjectProfile> {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 DESCOBERTA DO PROJETO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const isNewProject = this.detectNewProject();

        if (isNewProject) {
            console.log('✨ Detectado: PROJETO NOVO\n');
        } else {
            console.log('📦 Detectado: PROJETO EXISTENTE\n');
            console.log('🔍 Vou primeiro analisar o código existente para gerar relatório...\n');

            // NOVO: Executar auditoria de código para projetos existentes
            const auditor = new CodeAuditorAgent();
            const auditReport = await auditor.auditProject();

            // Mostrar resumo da auditoria
            console.log(auditReport.summary);

            // Salvar relatório
            auditor.saveReport(auditReport);

            console.log('📋 Execute as correções recomendadas antes de prosseguir.\n');
            console.log('Agora vamos configurar os agentes...\n');
        }

        // Perguntas básicas
        const projectName = await this.ask('📝 Nome do projeto: ');

        const domain = await this.askChoice(
            '🎯 Qual o domínio principal?',
            ['Site de Notícias', 'Produção/Expedição', 'Logística', 'E-commerce', 'SaaS', 'Outro']
        );

        let customDomain: string | undefined;
        if (domain === 'Outro') {
            customDomain = await this.ask('   Descreva o domínio: ');
        }

        // Stack
        console.log('\n💻 Stack Tecnológica (separado por vírgula):');
        const stackInput = await this.ask('   Ex: Next.js, Supabase, React, TypeScript: ');
        const stack = stackInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Objetivos
        console.log('\n🎯 Principais objetivos (separado por vírgula):');
        const objectivesInput = await this.ask('   Ex: Gestão de conteúdo, Dashboard analytics: ');
        const objectives = objectivesInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Features
        console.log('\n📋 Features principais (separado por vírgula):');
        const featuresInput = await this.ask('   Ex: Login, Pagamentos, Notificações: ');
        const features = featuresInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        // Tamanho do time
        const teamSizeInput = await this.ask('\n👥 Tamanho do time (número): ');
        const teamSize = parseInt(teamSizeInput) || 1;

        // Questões específicas
        const hasDatabase = (await this.ask('\n🗄️  Usa banco de dados? (s/n): ')).toLowerCase() === 's';
        const hasCMS = (await this.ask('📰 Precisa de CMS? (s/n): ')).toLowerCase() === 's';
        const hasAuth = (await this.ask('🔐 Tem autenticação? (s/n): ')).toLowerCase() === 's';
        const hasPayments = (await this.ask('💳 Processa pagamentos? (s/n): ')).toLowerCase() === 's';

        // Necessidades customizadas
        console.log('\n🔧 Necessidades específicas do projeto (separado por vírgula):');
        const customNeedsInput = await this.ask('   Ex: Integração com API externa, Relatórios PDF: ');
        const customNeeds = customNeedsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);

        this.readline.close();

        // Mapear domínio
        const domainMapping: Record<string, DomainType | 'custom'> = {
            'Site de Notícias': 'news',
            'Produção/Expedição': 'production',
            'Logística': 'logistics',
            'E-commerce': 'custom',
            'SaaS': 'custom',
            'Outro': 'custom',
        };

        return {
            isNewProject,
            projectName,
            domain: domainMapping[domain] || 'custom',
            customDomain: domain === 'Outro' ? customDomain : undefined,
            stack,
            objectives,
            features,
            teamSize,
            hasDatabase,
            hasCMS,
            hasAuth,
            hasPayments,
            customNeeds,
        };
    }

    /**
     * Gera recomendações de agentes baseado no perfil
     */
    generateRecommendations(profile: ProjectProfile): AgentRecommendation[] {
        const recommendations: AgentRecommendation[] = [];

        // Agentes core (sempre recomendados)
        recommendations.push(
            { name: 'Frontend', file: 'core/frontend-agent.ts', purpose: 'Validar UI/UX', priority: 'high', autoCreate: true },
            { name: 'Security', file: 'core/security-agent.ts', purpose: 'Detectar vulnerabilidades', priority: 'high', autoCreate: true },
            { name: 'Architecture', file: 'core/architecture-agent.ts', purpose: 'Manter organização', priority: 'high', autoCreate: true },
            { name: 'Quality', file: 'core/quality-agent.ts', purpose: 'Lint, build, tests', priority: 'high', autoCreate: true },
            { name: 'Documentation', file: 'core/documentation-agent.ts', purpose: 'Docs automáticas', priority: 'medium', autoCreate: true }
        );

        // Agentes de domínio específicos
        if (profile.domain === 'news' || profile.hasCMS) {
            recommendations.push(
                { name: 'CMS', file: 'domains/news/cms-agent.ts', purpose: 'Gestão de conteúdo', priority: 'high', autoCreate: true },
                { name: 'SEO', file: 'domains/news/seo-agent.ts', purpose: 'Otimização SEO', priority: 'high', autoCreate: true }
            );
        }

        if (profile.domain === 'production') {
            recommendations.push(
                { name: 'Production Control', file: 'domains/production/production-control-agent.ts', purpose: 'Eventos de produção', priority: 'high', autoCreate: true },
                { name: 'Quality Control', file: 'domains/production/quality-control-agent.ts', purpose: 'Controle de qualidade', priority: 'medium', autoCreate: false }
            );
        }

        if (profile.domain === 'logistics') {
            recommendations.push(
                { name: 'Route', file: 'domains/logistics/route-agent.ts', purpose: 'Otimização de rotas', priority: 'high', autoCreate: true },
                { name: 'Fleet', file: 'domains/logistics/fleet-agent.ts', purpose: 'Gestão de frota', priority: 'medium', autoCreate: false }
            );
        }

        // Agentes baseados em features
        if (profile.hasAuth) {
            recommendations.push(
                { name: 'Auth', file: 'domains/custom/auth-agent.ts', purpose: 'Validar fluxos de autenticação', priority: 'high', autoCreate: true }
            );
        }

        if (profile.hasPayments) {
            recommendations.push(
                { name: 'Payments', file: 'domains/custom/payments-agent.ts', purpose: 'Validar transações', priority: 'high', autoCreate: true }
            );
        }

        if (profile.hasDatabase) {
            recommendations.push(
                { name: 'Database Security', file: 'core/database-security-agent.ts', purpose: 'RLS e policies', priority: 'high', autoCreate: true }
            );
        }

        return recommendations;
    }

    /**
     * Gera relatório do projeto
     */
    generateReport(profile: ProjectProfile, recommendations: AgentRecommendation[]): string {
        let report = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        report += '📊 RELATÓRIO DO PROJETO\n';
        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        report += `📝 **Nome**: ${profile.projectName}\n`;
        report += `🎯 **Domínio**: ${profile.domain}${profile.customDomain ? ` (${profile.customDomain})` : ''}\n`;
        report += `✨ **Status**: ${profile.isNewProject ? 'Projeto Novo' : 'Projeto Existente'}\n`;
        report += `👥 **Time**: ${profile.teamSize} pessoa(s)\n\n`;

        report += `💻 **Stack**:\n`;
        profile.stack.forEach(s => report += `  - ${s}\n`);

        report += `\n🎯 **Objetivos**:\n`;
        profile.objectives.forEach(o => report += `  - ${o}\n`);

        report += `\n📋 **Features**:\n`;
        profile.features.forEach(f => report += `  - ${f}\n`);

        report += `\n🔧 **Características**:\n`;
        report += `  - Database: ${profile.hasDatabase ? '✅' : '❌'}\n`;
        report += `  - CMS: ${profile.hasCMS ? '✅' : '❌'}\n`;
        report += `  - Auth: ${profile.hasAuth ? '✅' : '❌'}\n`;
        report += `  - Payments: ${profile.hasPayments ? '✅' : '❌'}\n`;

        if (profile.customNeeds.length > 0) {
            report += `\n🔧 **Necessidades Específicas**:\n`;
            profile.customNeeds.forEach(n => report += `  - ${n}\n`);
        }

        report += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += '🤖 AGENTES RECOMENDADOS\n';
        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        const highPriority = recommendations.filter(r => r.priority === 'high');
        const mediumPriority = recommendations.filter(r => r.priority === 'medium');
        const lowPriority = recommendations.filter(r => r.priority === 'low');

        if (highPriority.length > 0) {
            report += '🔴 **Alta Prioridade** (serão criados automaticamente):\n';
            highPriority.forEach(r => {
                report += `  ✅ ${r.name} - ${r.purpose}\n`;
                report += `     📄 ${r.file}\n`;
            });
            report += '\n';
        }

        if (mediumPriority.length > 0) {
            report += '🟡 **Média Prioridade** (opcionais):\n';
            mediumPriority.forEach(r => {
                report += `  ⚪ ${r.name} - ${r.purpose}\n`;
                report += `     📄 ${r.file}\n`;
            });
            report += '\n';
        }

        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        report += `✅ **Total**: ${recommendations.length} agentes recomendados\n`;
        report += `🔴 **Auto-criação**: ${recommendations.filter(r => r.autoCreate).length} agentes\n`;
        report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        return report;
    }

    /**
     * Salva perfil do projeto
     */
    saveProfile(profile: ProjectProfile): void {
        const profilePath = 'docs/PROJECT_PROFILE.json';
        fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf-8');
        console.log(`✅ Perfil salvo em: ${profilePath}\n`);
    }
}
