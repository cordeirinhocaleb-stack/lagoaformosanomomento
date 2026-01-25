/**
 * Code Auditor Agent
 * 
 * Responsabilidades:
 * - Escanear código existente em projetos que ainda não têm sistema de agentes
 * - Detectar violações das regras absolutas
 * - Gerar relatório completo com priorização (P0/P1/P2)
 * - Sugerir correções específicas
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateFileLines } from './config.js';

export interface CodeViolation {
    file: string;
    line?: number;
    type: string;
    severity: 'P0' | 'P1' | 'P2';
    message: string;
    suggestion: string;
}

export interface AuditReport {
    totalFiles: number;
    totalViolations: number;
    p0Count: number;
    p1Count: number;
    p2Count: number;
    violations: CodeViolation[];
    summary: string;
}

export class CodeAuditorAgent {
    private projectRoot: string;

    constructor(projectRoot: string = process.cwd()) {
        this.projectRoot = projectRoot;
    }

    /**
     * Encontra todos os arquivos do projeto para auditoria
     */
    private findProjectFiles(): string[] {
        const files: string[] = [];
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git', '.agents'];

        const walkDir = (dir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (!excludeDirs.includes(entry.name)) {
                        walkDir(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        };

        try {
            walkDir(this.projectRoot);
        } catch (error) {
            console.error('Erro ao escanear diretórios:', error);
        }

        return files;
    }

    /**
     * Audita um arquivo individual
     */
    private auditFile(filePath: string): CodeViolation[] {
        const violations: CodeViolation[] = [];

        if (!fs.existsSync(filePath)) {
            return violations;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relPath = path.relative(this.projectRoot, filePath);

        // Violação 1: Arquivo > 500 linhas (P0)
        const lineCheck = validateFileLines(filePath, 500);
        if (!lineCheck.valid) {
            violations.push({
                file: relPath,
                type: 'file-too-long',
                severity: 'P0',
                message: `Arquivo tem ${lineCheck.lineCount} linhas (limite: 500)`,
                suggestion: 'Refatorar: extrair hooks, componentes filhos ou funções para utils/lib',
            });
        }

        // Violação 2: Uso de 'any' não justificado (P1)
        lines.forEach((line, index) => {
            if (line.match(/:\s*any(?!\w)/) && !line.includes('// justified') && !line.includes('TODO')) {
                violations.push({
                    file: relPath,
                    line: index + 1,
                    type: 'typescript-any',
                    severity: 'P1',
                    message: 'Uso de "any" detectado sem justificativa',
                    suggestion: 'Usar tipo específico ou "unknown" + type guard',
                });
            }
        });

        // Violação 3: dangerouslySetInnerHTML sem sanitização (P0)
        if (content.includes('dangerouslySetInnerHTML') && !content.includes('DOMPurify')) {
            violations.push({
                file: relPath,
                type: 'xss-vulnerability',
                severity: 'P0',
                message: 'dangerouslySetInnerHTML sem sanitização detectado',
                suggestion: 'Usar DOMPurify.sanitize() antes de renderizar HTML',
            });
        }

        // Violação 4: service_role no cliente (P0)
        if (content.match(/service_role|SUPABASE_SERVICE_ROLE/i) && !filePath.includes('server')) {
            violations.push({
                file: relPath,
                type: 'security-critical',
                severity: 'P0',
                message: 'service_role key no código cliente (NUNCA expor no browser!)',
                suggestion: 'Mover para variável de ambiente server-side ou usar anon key',
            });
        }

        // Violação 5: console.log com dados sensíveis (P0)
        lines.forEach((line, index) => {
            if (line.match(/console\.(log|debug|info).*?(password|token|secret|key|credential)/i)) {
                violations.push({
                    file: relPath,
                    line: index + 1,
                    type: 'security-leak',
                    severity: 'P0',
                    message: 'console.log com dados sensíveis detectado',
                    suggestion: 'Remover log ou usar técnica de mascaramento',
                });
            }
        });

        // Violação 6: Inputs sem validação (P1)
        if (content.includes('<input') && !content.match(/zod|yup|validator/i)) {
            violations.push({
                file: relPath,
                type: 'missing-validation',
                severity: 'P1',
                message: 'Inputs detectados sem validação (Zod/Yup)',
                suggestion: 'Adicionar schema de validação com Zod ou Yup',
            });
        }

        // Violação 7: fetch() sem tratamento de erro (P1)
        lines.forEach((line, index) => {
            if (line.includes('fetch(') || line.includes('axios.')) {
                const nextLines = lines.slice(index, index + 10).join('\n');
                if (!nextLines.match(/\.catch|try|error/i)) {
                    violations.push({
                        file: relPath,
                        line: index + 1,
                        type: 'missing-error-handling',
                        severity: 'P1',
                        message: 'fetch() ou axios sem tratamento de erro',
                        suggestion: 'Adicionar .catch() ou try-catch',
                    });
                }
            }
        });

        // Violação 8: Componente com lógica de API direta (P2)
        if (relPath.includes('components/') && !relPath.includes('pages/')) {
            if (content.match(/fetch\(|axios\.|supabase\./)) {
                violations.push({
                    file: relPath,
                    type: 'architecture-violation',
                    severity: 'P2',
                    message: 'Componente com chamada de API direta',
                    suggestion: 'Extrair lógica para hook customizado ou service',
                });
            }
        }

        // Violação 9: NEXT_PUBLIC_ com dados sensíveis (P0)
        if (content.match(/NEXT_PUBLIC_.*?(SECRET|KEY|PASSWORD|TOKEN)/i)) {
            violations.push({
                file: relPath,
                type: 'security-critical',
                severity: 'P0',
                message: 'Variável sensível exposta com NEXT_PUBLIC_',
                suggestion: 'Remover NEXT_PUBLIC_ e usar apenas no server-side',
            });
        }

        return violations;
    }

    /**
     * Executa auditoria completa do projeto
     */
    async auditProject(): Promise<AuditReport> {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 AUDITORIA DE CÓDIGO EXISTENTE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('📂 Escaneando arquivos do projeto...');
        const files = this.findProjectFiles();
        console.log(`✅ ${files.length} arquivos encontrados\n`);

        console.log('🔍 Analisando código...');
        const allViolations: CodeViolation[] = [];

        for (const file of files) {
            const violations = this.auditFile(file);
            allViolations.push(...violations);
        }

        console.log(`✅ Análise concluída\n`);

        // Classificar por severidade
        const p0Violations = allViolations.filter(v => v.severity === 'P0');
        const p1Violations = allViolations.filter(v => v.severity === 'P1');
        const p2Violations = allViolations.filter(v => v.severity === 'P2');

        // Gerar relatório
        const report: AuditReport = {
            totalFiles: files.length,
            totalViolations: allViolations.length,
            p0Count: p0Violations.length,
            p1Count: p1Violations.length,
            p2Count: p2Violations.length,
            violations: allViolations,
            summary: this.generateSummary(allViolations, files.length),
        };

        return report;
    }

    /**
     * Gera resumo da auditoria
     */
    private generateSummary(violations: CodeViolation[], totalFiles: number): string {
        let summary = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        summary += '📊 RELATÓRIO DE AUDITORIA\n';
        summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        summary += `📁 Arquivos analisados: ${totalFiles}\n`;
        summary += `⚠️  Total de violações: ${violations.length}\n\n`;

        const p0 = violations.filter(v => v.severity === 'P0');
        const p1 = violations.filter(v => v.severity === 'P1');
        const p2 = violations.filter(v => v.severity === 'P2');

        summary += `💀 P0 (CRÍTICO): ${p0.length}\n`;
        summary += `⚠️  P1 (IMPORTANTE): ${p1.length}\n`;
        summary += `💡 P2 (MELHORIA): ${p2.length}\n\n`;

        // Agrupar por tipo
        const byType: Record<string, number> = {};
        violations.forEach(v => {
            byType[v.type] = (byType[v.type] || 0) + 1;
        });

        summary += '📋 Violações por tipo:\n';
        Object.entries(byType)
            .sort((a, b) => b[1] - a[1])
            .forEach(([type, count]) => {
                summary += `  - ${type}: ${count}\n`;
            });

        summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

        if (p0.length > 0) {
            summary += '\n💀 P0 - BLOQUEADORES CRÍTICOS:\n\n';
            p0.forEach((v, index) => {
                summary += `${index + 1}. ${v.file}${v.line ? `:${v.line}` : ''}\n`;
                summary += `   ❌ ${v.message}\n`;
                summary += `   💡 ${v.suggestion}\n\n`;
            });
        }

        if (p1.length > 0 && p1.length <= 10) {
            summary += '\n⚠️  P1 - IMPORTANTES (primeiros 10):\n\n';
            p1.slice(0, 10).forEach((v, index) => {
                summary += `${index + 1}. ${v.file}${v.line ? `:${v.line}` : ''}\n`;
                summary += `   ⚠️  ${v.message}\n`;
                summary += `   💡 ${v.suggestion}\n\n`;
            });
        }

        summary += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        summary += '✅ PRÓXIMOS PASSOS:\n';
        summary += '1. Corrigir todas as violações P0 (bloqueadores críticos)\n';
        summary += '2. Revisar violações P1 (importantes para qualidade)\n';
        summary += '3. Considerar violações P2 (melhorias opcionais)\n';
        summary += '4. Execute novamente após correções para validar\n';
        summary += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

        return summary;
    }

    /**
     * Salva relatório em arquivo
     */
    saveReport(report: AuditReport): void {
        const reportPath = 'docs/AUDIT_REPORT.md';

        let content = `# Relatório de Auditoria de Código\n\n`;
        content += `**Data**: ${new Date().toISOString().split('T')[0]}\n`;
        content += `**Arquivos analisados**: ${report.totalFiles}\n`;
        content += `**Total de violações**: ${report.totalViolations}\n\n`;

        content += `## Resumo\n\n`;
        content += `- 💀 P0 (Crítico): ${report.p0Count}\n`;
        content += `- ⚠️ P1 (Importante): ${report.p1Count}\n`;
        content += `- 💡 P2 (Melhoria): ${report.p2Count}\n\n`;

        content += report.summary;

        fs.writeFileSync(reportPath, content, 'utf-8');
        console.log(`✅ Relatório salvo em: ${reportPath}\n`);
    }
}
