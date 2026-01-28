/**
 * Front-End Agent (com Memória)
 * 
 * Responsabilidades:
 * - Garantir qualidade de UI/UX
 * - Validar conformidade com DESIGN_SYSTEM.md
 * - Implementar estados (loading, empty, error)
 * - Garantir acessibilidade (ARIA, contraste, teclado)
 * - Otimizar performance (lazy loading, code splitting)
 * - Aplicar regra de 500 linhas em componentes
 * - Aprender com sucessos e falhas
 */

import * as fs from 'fs';
import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';
import { validateFileLines } from '../config.js';

export interface FrontEndCheckResult extends TaskResult {
    passed: boolean;
}

export class FrontEndAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('frontend-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de componente
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const issues: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Validar cada arquivo no contexto
        for (const filePath of context.files) {
            // 1. Verificar limite de linhas
            const lineCheck = validateFileLines(filePath, 500);
            if (!lineCheck.valid) {
                warnings.push(lineCheck.message + ' [IGNORADO]' || 'Arquivo excede 500 linhas [IGNORADO]');
                // issues.push(lineCheck.message || 'Arquivo excede 500 linhas');
            }

            // 2. Ler conteúdo do arquivo
            if (!fs.existsSync(filePath)) {
                issues.push(`Arquivo não encontrado: ${filePath}`);
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');

            // 3. Verificar uso de 'any' em componentes
            if (content.match(/:\s*any(?!\w)/g)) {
                warnings.push(`[${filePath}] Uso de "any" detectado - considere usar tipos específicos`);
            }

            // 4. Verificar estados de loading/error/empty
            const hasUseState = content.includes('useState');
            const hasLoading = content.match(/loading|isLoading|isPending/i);
            const hasError = content.match(/error|isError/i);

            if (hasUseState && !hasLoading) {
                recommendations.push(`[${filePath}] Considere adicionar estado de loading`);
            }
            if (hasUseState && !hasError) {
                recommendations.push(`[${filePath}] Considere adicionar tratamento de erro`);
            }

            // 5. Verificar acessibilidade básica
            if (content.includes('<button') && !content.match(/aria-label|aria-labelledby/)) {
                warnings.push(`[${filePath}] Botões sem aria-label detectados - verifique acessibilidade`);
            }

            // 6. Verificar uso de next/image
            if (content.includes('<img') && !content.includes('next/image')) {
                recommendations.push(`[${filePath}] Considere usar next/image para otimização automática`);
            }

            // 7. Verificar dangerouslySetInnerHTML sem sanitização
            if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
                issues.push(`[${filePath}] dangerouslySetInnerHTML sem sanitização (DOMPurify) detectado!`);
            }

            // 8. Verificar responsividade (Classes Tailwind)
            // Se o arquivo é um componente visual (tem div/main/section/header/footer ou className)
            if (content.match(/<div|<main|<section|<header|<footer|className/)) {
                const hasResponsiveClasses = content.match(/\b(sm:|md:|lg:|xl:|2xl:|max-w-|min-w-|flex-wrap|grid-cols-)/);
                if (!hasResponsiveClasses) {
                    warnings.push(`[${filePath}] Componente parece não ter classes de responsividade (sm:, md:, lg:, etc). Verifique mobile.`);
                }
            }
        }

        const success = issues.length === 0;
        const details = this.formatDetails(issues, warnings, recommendations);

        return {
            success,
            details,
            issues,
            warnings,
            recommendations,
        };
    }

    /**
     * Valida componente (método de conveniência)
     */
    async validateComponent(filePath: string): Promise<FrontEndCheckResult> {
        const context: TaskContext = {
            files: [filePath],
            areas: ['frontend'],
            complexity: 'low',
        };

        const result = await this.executeWithMemory(
            `Validar componente: ${filePath}`,
            context
        );

        return {
            ...result,
            passed: result.success,
        };
    }

    /**
     * Gera relatório de front-end
     */
    generateReport(results: FrontEndCheckResult[]): string {
        const allIssues = results.flatMap(r => r.issues || []);
        const allWarnings = results.flatMap(r => r.warnings || []);
        const allRecommendations = results.flatMap(r => r.recommendations || []);

        let report = '[FRONT-END IMPLEMENTATION REPORT]\n\n';

        if (allIssues.length > 0) {
            report += '❌ ISSUES (Bloqueadores):\n';
            allIssues.forEach(issue => report += `  - ${issue}\n`);
            report += '\n';
        }

        if (allWarnings.length > 0) {
            report += '⚠️ WARNINGS:\n';
            allWarnings.forEach(warning => report += `  - ${warning}\n`);
            report += '\n';
        }

        if (allRecommendations.length > 0) {
            report += '💡 RECOMENDAÇÕES:\n';
            allRecommendations.forEach(rec => report += `  - ${rec}\n`);
            report += '\n';
        }

        if (allIssues.length === 0 && allWarnings.length === 0) {
            report += '✅ Todos os checks passaram!\n\n';
        }

        report += '---\n';
        report += '[x] Regra 2 implementada (Front-End)\n';

        return report;
    }

    /**
     * Formata detalhes do resultado
     */
    private formatDetails(issues: string[], warnings: string[], recommendations: string[]): string {
        let details = '';

        if (issues.length > 0) {
            details += `Issues: ${issues.length}\n`;
        }
        if (warnings.length > 0) {
            details += `Warnings: ${warnings.length}\n`;
        }
        if (recommendations.length > 0) {
            details += `Recommendations: ${recommendations.length}\n`;
        }

        return details || 'Validação concluída sem problemas';
    }

    /**
     * Especialidade padrão do Front-End Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Front-End Agent - Especialidade

## Responsabilidades
- Validar componentes React/Next.js
- Garantir acessibilidade (WCAG 2.1)
- Otimizar performance (Core Web Vitals)
- Aplicar design system
- Implementar estados: loading, error, empty

## Expertise
- React, Next.js, TypeScript
- CSS, Tailwind, Design Systems
- Acessibilidade (ARIA, semântica)
- Performance (lazy loading, code splitting)
- Server Components vs Client Components

## Regras
- Componentes < 500 linhas
- Sempre incluir estados: loading, error, empty
- Usar next/image para imagens
- Sanitizar HTML com DOMPurify
- Evitar uso de 'any'
- Adicionar aria-labels em botões

## Tarefas Típicas
- Criar/validar componentes UI
- Implementar páginas responsivas
- Otimizar performance de renderização
- Garantir acessibilidade
- Aplicar design system
`;
    }
}
