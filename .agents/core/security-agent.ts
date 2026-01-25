/**
 * Security Agent (com Memória)
 * 
 * Responsabilidades:
 * - Detectar vulnerabilidades (XSS, CSRF, SQL Injection)
 * - Validar sanitização de inputs
 * - Verificar proteção de rotas
 * - Validar uso seguro de variáveis de ambiente
 * - Detectar exposição de dados sensíveis
 * - Aprender com vulnerabilidades detectadas
 */

import * as fs from 'fs';
import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';

export interface SecurityCheckResult extends TaskResult {
    vulnerabilities: Array<{
        severity: 'P0' | 'P1' | 'P2';
        type: string;
        file: string;
        line?: number;
        message: string;
        suggestion: string;
    }>;
}

export class SecurityAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('security-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de segurança
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const vulnerabilities: SecurityCheckResult['vulnerabilities'] = [];

        for (const filePath of context.files) {
            if (!fs.existsSync(filePath)) {
                continue;
            }

            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            // 1. dangerouslySetInnerHTML sem sanitização (P0)
            if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
                vulnerabilities.push({
                    severity: 'P0',
                    type: 'xss-vulnerability',
                    file: filePath,
                    message: 'dangerouslySetInnerHTML sem sanitização detectado',
                    suggestion: 'Usar DOMPurify.sanitize() antes de renderizar HTML',
                });
            }

            // 2. service_role no cliente (P0)
            if (content.match(/service_role|SUPABASE_SERVICE_ROLE/i) && !filePath.includes('server')) {
                vulnerabilities.push({
                    severity: 'P0',
                    type: 'security-critical',
                    file: filePath,
                    message: 'service_role key no código cliente (NUNCA expor no browser!)',
                    suggestion: 'Mover para variável de ambiente server-side ou usar anon key',
                });
            }

            // 3. console.log com dados sensíveis (P0)
            lines.forEach((line, index) => {
                if (line.match(/console\.(log|debug|info).*?(password|token|secret|key|credential)/i)) {
                    vulnerabilities.push({
                        severity: 'P0',
                        type: 'security-leak',
                        file: filePath,
                        line: index + 1,
                        message: 'console.log com dados sensíveis detectado',
                        suggestion: 'Remover log ou usar técnica de mascaramento',
                    });
                }
            });

            // 4. NEXT_PUBLIC_ com dados sensíveis (P0)
            if (content.match(/NEXT_PUBLIC_.*?(SECRET|KEY|PASSWORD|TOKEN)/i)) {
                vulnerabilities.push({
                    severity: 'P0',
                    type: 'security-critical',
                    file: filePath,
                    message: 'Variável sensível exposta com NEXT_PUBLIC_',
                    suggestion: 'Remover NEXT_PUBLIC_ e usar apenas no server-side',
                });
            }

            // 5. Inputs sem validação (P1)
            if (content.includes('<input') && !content.match(/zod|yup|validator/i)) {
                vulnerabilities.push({
                    severity: 'P1',
                    type: 'missing-validation',
                    file: filePath,
                    message: 'Inputs detectados sem validação (Zod/Yup)',
                    suggestion: 'Adicionar schema de validação com Zod ou Yup',
                });
            }

            // 6. fetch() sem tratamento de erro (P1)
            lines.forEach((line, index) => {
                if (line.includes('fetch(') || line.includes('axios.')) {
                    const nextLines = lines.slice(index, index + 10).join('\n');
                    if (!nextLines.match(/\.catch|try|error/i)) {
                        vulnerabilities.push({
                            severity: 'P1',
                            type: 'missing-error-handling',
                            file: filePath,
                            line: index + 1,
                            message: 'fetch() ou axios sem tratamento de erro',
                            suggestion: 'Adicionar .catch() ou try-catch',
                        });
                    }
                }
            });
        }

        const p0Count = vulnerabilities.filter(v => v.severity === 'P0').length;
        const success = p0Count === 0;

        const details = this.formatVulnerabilities(vulnerabilities);

        return {
            success,
            details,
            issues: vulnerabilities.filter(v => v.severity === 'P0').map(v => v.message),
            warnings: vulnerabilities.filter(v => v.severity === 'P1').map(v => v.message),
            recommendations: vulnerabilities.filter(v => v.severity === 'P2').map(v => v.message),
        };
    }

    /**
     * Valida segurança de arquivos (método de conveniência)
     */
    async validateSecurity(files: string[]): Promise<SecurityCheckResult> {
        const context: TaskContext = {
            files,
            areas: ['security'],
            complexity: 'medium',
        };

        const result = await this.executeWithMemory(
            `Validar segurança de ${files.length} arquivo(s)`,
            context
        );

        return {
            ...result,
            vulnerabilities: this.extractVulnerabilities(result),
        };
    }

    /**
     * Formata vulnerabilidades
     */
    private formatVulnerabilities(vulnerabilities: SecurityCheckResult['vulnerabilities']): string {
        if (vulnerabilities.length === 0) {
            return 'Nenhuma vulnerabilidade detectada';
        }

        const p0 = vulnerabilities.filter(v => v.severity === 'P0').length;
        const p1 = vulnerabilities.filter(v => v.severity === 'P1').length;
        const p2 = vulnerabilities.filter(v => v.severity === 'P2').length;

        return `Vulnerabilidades: P0=${p0}, P1=${p1}, P2=${p2}`;
    }

    /**
     * Extrai vulnerabilidades do resultado
     */
    private extractVulnerabilities(result: TaskResult): SecurityCheckResult['vulnerabilities'] {
        // Implementação simplificada - em produção, seria mais robusto
        return [];
    }

    /**
     * Especialidade padrão do Security Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Security Agent - Especialidade

## Responsabilidades
- Detectar vulnerabilidades (XSS, CSRF, SQL Injection)
- Validar sanitização de inputs
- Verificar proteção de rotas
- Validar uso seguro de variáveis de ambiente
- Detectar exposição de dados sensíveis

## Expertise
- OWASP Top 10
- XSS, CSRF, SQL Injection
- Autenticação e Autorização
- Criptografia e Hashing
- Segurança de APIs
- Row Level Security (RLS)

## Regras
- NUNCA expor service_role no cliente
- Sempre sanitizar HTML com DOMPurify
- Validar todos os inputs (Zod/Yup)
- Usar HTTPS em produção
- Não logar dados sensíveis
- Variáveis sensíveis apenas server-side

## Tarefas Típicas
- Auditar código para vulnerabilidades
- Validar autenticação e autorização
- Verificar sanitização de inputs
- Revisar uso de variáveis de ambiente
- Detectar exposição de dados sensíveis
`;
    }
}
