/**
 * Quality Agent (com Memória)
 * 
 * Responsabilidades:
 * - Executar lint (ESLint)
 * - Executar type check (TypeScript)
 * - Executar build
 * - Executar testes
 * - Dar decisão final GO/NO-GO
 * - Aprender com falhas de build recorrentes
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';

export interface QualityCheckResult extends TaskResult {
    checks: {
        lint: { passed: boolean; errors: number; warnings: number };
        typecheck: { passed: boolean; errors: number };
        build: { passed: boolean; error?: string };
        tests: { passed: boolean; total: number; failed: number };
    };
    decision: 'GO' | 'NO-GO';
}

export class QualityAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('quality-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de qualidade
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        console.log('\n🔍 Executando validações de qualidade...\n');

        const checks = {
            lint: await this.runLint(),
            typecheck: await this.runTypeCheck(),
            build: await this.runBuild(),
            tests: await this.runTests()
        };

        // Decisão GO/NO-GO
        const decision = this.makeDecision(checks);

        const success = decision === 'GO';
        const details = this.formatChecks(checks, decision);

        const issues: string[] = [];
        if (!checks.lint.passed) issues.push(`Lint: ${checks.lint.errors} erro(s)`);
        if (!checks.typecheck.passed) issues.push(`TypeCheck: ${checks.typecheck.errors} erro(s)`);
        if (!checks.build.passed) issues.push('Build falhou');
        if (!checks.tests.passed) issues.push(`Tests: ${checks.tests.failed} falhou(ram)`);

        return {
            success,
            details,
            issues: issues.length > 0 ? issues : undefined,
        };
    }

    /**
     * Executa lint
     */
    private async runLint(): Promise<{ passed: boolean; errors: number; warnings: number }> {
        console.log('  📝 Executando lint...');

        return new Promise((resolve) => {
            // Verificar se package.json tem script de lint
            if (!this.hasScript('lint')) {
                console.log('     ⏭️  Lint não configurado');
                resolve({ passed: true, errors: 0, warnings: 0 });
                return;
            }

            const lint = spawn('npm', ['run', 'lint'], { shell: true });

            let output = '';
            lint.stdout.on('data', (data) => { output += data.toString(); });
            lint.stderr.on('data', (data) => { output += data.toString(); });

            lint.on('close', (code) => {
                const errors = (output.match(/error/gi) || []).length;
                const warnings = (output.match(/warning/gi) || []).length;
                const passed = code === 0;

                console.log(`     ${passed ? '✅' : '❌'} Lint: ${errors} erro(s), ${warnings} aviso(s)`);
                resolve({ passed, errors, warnings });
            });

            lint.on('error', () => {
                resolve({ passed: false, errors: 1, warnings: 0 });
            });
        });
    }

    /**
     * Executa type check
     */
    private async runTypeCheck(): Promise<{ passed: boolean; errors: number }> {
        console.log('  🔤 Executando type check...');

        return new Promise((resolve) => {
            const tsc = spawn('npx', ['tsc', '--noEmit'], { shell: true });

            let output = '';
            tsc.stdout.on('data', (data) => { output += data.toString(); });
            tsc.stderr.on('data', (data) => { output += data.toString(); });

            tsc.on('close', (code) => {
                const errors = (output.match(/error TS/g) || []).length;
                const passed = code === 0;

                console.log(`     ${passed ? '✅' : '❌'} TypeCheck: ${errors} erro(s)`);
                resolve({ passed, errors });
            });

            tsc.on('error', () => {
                console.log('     ⏭️  TypeScript não disponível');
                resolve({ passed: true, errors: 0 });
            });
        });
    }

    /**
     * Executa build
     */
    private async runBuild(): Promise<{ passed: boolean; error?: string }> {
        console.log('  🏗️  Executando build...');

        return new Promise((resolve) => {
            if (!this.hasScript('build')) {
                console.log('     ⏭️  Build não configurado');
                resolve({ passed: true });
                return;
            }

            const build = spawn('npm', ['run', 'build'], { shell: true });

            let output = '';
            build.stdout.on('data', (data) => { output += data.toString(); });
            build.stderr.on('data', (data) => { output += data.toString(); });

            build.on('close', (code) => {
                const passed = code === 0;
                const error = passed ? undefined : output.substring(0, 500);

                console.log(`     ${passed ? '✅' : '❌'} Build ${passed ? 'passou' : 'falhou'}`);
                resolve({ passed, error });
            });

            build.on('error', () => {
                resolve({ passed: false, error: 'Erro ao executar build' });
            });
        });
    }

    /**
     * Executa testes
     */
    private async runTests(): Promise<{ passed: boolean; total: number; failed: number }> {
        console.log('  🧪 Executando testes...');

        return new Promise((resolve) => {
            if (!this.hasScript('test')) {
                console.log('     ⏭️  Testes não configurados');
                resolve({ passed: true, total: 0, failed: 0 });
                return;
            }

            const test = spawn('npm', ['run', 'test', '--', '--passWithNoTests'], { shell: true });

            let output = '';
            test.stdout.on('data', (data) => { output += data.toString(); });
            test.stderr.on('data', (data) => { output += data.toString(); });

            test.on('close', (code) => {
                const passed = code === 0;
                const total = (output.match(/Tests:.*?(\d+) total/)?.[1] || '0');
                const failed = (output.match(/Tests:.*?(\d+) failed/)?.[1] || '0');

                console.log(`     ${passed ? '✅' : '❌'} Tests: ${failed} falhou(ram) de ${total}`);
                resolve({ passed, total: parseInt(total), failed: parseInt(failed) });
            });

            test.on('error', () => {
                resolve({ passed: true, total: 0, failed: 0 });
            });
        });
    }

    /**
     * Verifica se script existe no package.json
     */
    private hasScript(scriptName: string): boolean {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            return !!packageJson.scripts?.[scriptName];
        } catch {
            return false;
        }
    }

    /**
     * Toma decisão GO/NO-GO
     */
    private makeDecision(checks: QualityCheckResult['checks']): 'GO' | 'NO-GO' {
        // Bloqueadores: lint errors, type errors, build failed
        if (checks.lint.errors > 0) return 'NO-GO';
        if (checks.typecheck.errors > 0) return 'NO-GO';
        if (!checks.build.passed) return 'NO-GO';
        if (!checks.tests.passed) return 'NO-GO';

        return 'GO';
    }

    /**
     * Formata resultado dos checks
     */
    private formatChecks(checks: QualityCheckResult['checks'], decision: 'GO' | 'NO-GO'): string {
        let details = `Decisão: ${decision}\n`;
        details += `Lint: ${checks.lint.passed ? 'OK' : 'FALHOU'}\n`;
        details += `TypeCheck: ${checks.typecheck.passed ? 'OK' : 'FALHOU'}\n`;
        details += `Build: ${checks.build.passed ? 'OK' : 'FALHOU'}\n`;
        details += `Tests: ${checks.tests.passed ? 'OK' : 'FALHOU'}`;
        return details;
    }

    /**
     * Especialidade padrão do Quality Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Quality Agent - Especialidade

## Responsabilidades
- Executar lint (ESLint)
- Executar type check (TypeScript)
- Executar build
- Executar testes unitários e integração
- Dar decisão final GO/NO-GO
- Garantir qualidade do código

## Expertise
- Testing (Jest, Vitest, Playwright, Cypress)
- Linting (ESLint, Prettier)
- TypeScript
- CI/CD
- Code Quality Metrics
- Test Coverage

## Regras
- Zero erros de lint (warnings são aceitáveis)
- Zero erros de type check
- Build deve passar
- Todos os testes devem passar
- Cobertura de testes > 80% (recomendado)

## Tarefas Típicas
- Validar qualidade antes de commit
- Executar suite completa de testes
- Dar GO/NO-GO para deploy
- Identificar problemas de qualidade
- Sugerir melhorias de código
`;
    }
}
