/**
 * Architecture Agent (com Memória)
 * 
 * Responsabilidades:
 * - Validar estrutura de arquivos
 * - Garantir limite de 500 linhas por arquivo
 * - Detectar duplicação de código
 * - Validar separação de camadas
 * - Aprender padrões arquiteturais que funcionam
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';
import { validateFileLines } from '../config.js';

export interface ArchitectureCheckResult extends TaskResult {
    violations: Array<{
        type: string;
        file: string;
        severity: 'error' | 'warning';
        message: string;
        suggestion: string;
    }>;
}

export class ArchitectureAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('architecture-agent', memoryBasePath);
    }

    /**
     * Implementação da validação arquitetural
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const violations: ArchitectureCheckResult['violations'] = [];

        for (const filePath of context.files) {
            if (!fs.existsSync(filePath)) {
                continue;
            }

            // 1. Verificar limite de 500 linhas
            const lineCheck = validateFileLines(filePath, 500);
            if (!lineCheck.valid) {
                violations.push({
                    type: 'file-too-long',
                    file: filePath,
                    severity: 'error',
                    message: `Arquivo tem ${lineCheck.lineCount} linhas (limite: 500)`,
                    suggestion: 'Refatorar: extrair funções, componentes ou classes para arquivos separados'
                });
            }

            const content = fs.readFileSync(filePath, 'utf-8');

            // 2. Detectar duplicação de código
            const duplicates = this.detectCodeDuplication(content);
            if (duplicates.length > 0) {
                violations.push({
                    type: 'code-duplication',
                    file: filePath,
                    severity: 'warning',
                    message: `${duplicates.length} bloco(s) de código duplicado detectado(s)`,
                    suggestion: 'Extrair código duplicado para funções/componentes reutilizáveis'
                });
            }

            // 3. Validar separação de camadas
            const layerViolations = this.validateLayerSeparation(filePath, content);
            violations.push(...layerViolations);

            // 4. Verificar nomenclatura
            const namingIssues = this.validateNaming(filePath);
            violations.push(...namingIssues);
        }

        const errors = violations.filter(v => v.severity === 'error');
        const success = errors.length === 0;

        const details = this.formatViolations(violations);

        return {
            success,
            details,
            issues: errors.map(v => v.message),
            warnings: violations.filter(v => v.severity === 'warning').map(v => v.message),
        };
    }

    /**
     * Detecta duplicação de código
     */
    private detectCodeDuplication(content: string): string[] {
        const duplicates: string[] = [];
        const lines = content.split('\n');
        const blockSize = 5; // Mínimo de 5 linhas para considerar duplicação

        // Algoritmo simplificado - em produção usaria algo como jscpd
        const blocks = new Map<string, number>();

        for (let i = 0; i <= lines.length - blockSize; i++) {
            const block = lines.slice(i, i + blockSize).join('\n').trim();
            if (block.length > 50) { // Ignorar blocos muito pequenos
                const count = blocks.get(block) || 0;
                blocks.set(block, count + 1);
            }
        }

        blocks.forEach((count, block) => {
            if (count > 1) {
                duplicates.push(block.substring(0, 100) + '...');
            }
        });

        return duplicates;
    }

    /**
     * Valida separação de camadas
     */
    private validateLayerSeparation(filePath: string, content: string): ArchitectureCheckResult['violations'] {
        const violations: ArchitectureCheckResult['violations'] = [];

        // Componentes não devem ter lógica de API direta
        if (filePath.includes('components/') && !filePath.includes('pages/')) {
            if (content.match(/fetch\(|axios\.|supabase\./)) {
                violations.push({
                    type: 'layer-violation',
                    file: filePath,
                    severity: 'warning',
                    message: 'Componente com chamada de API direta',
                    suggestion: 'Extrair lógica de API para hook customizado ou service'
                });
            }
        }

        // Utils não devem importar componentes
        if (filePath.includes('utils/') || filePath.includes('lib/')) {
            if (content.match(/import.*from.*components/)) {
                violations.push({
                    type: 'layer-violation',
                    file: filePath,
                    severity: 'error',
                    message: 'Arquivo de utilidade importando componente',
                    suggestion: 'Utils devem ser independentes de componentes UI'
                });
            }
        }

        return violations;
    }

    /**
     * Valida nomenclatura de arquivos
     */
    private validateNaming(filePath: string): ArchitectureCheckResult['violations'] {
        const violations: ArchitectureCheckResult['violations'] = [];
        const fileName = path.basename(filePath);

        // Componentes React devem usar PascalCase
        if (filePath.includes('components/') && fileName.match(/^[a-z]/)) {
            violations.push({
                type: 'naming-convention',
                file: filePath,
                severity: 'warning',
                message: 'Componente deve usar PascalCase',
                suggestion: `Renomear para ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`
            });
        }

        // Hooks devem começar com 'use'
        if (filePath.includes('hooks/') && !fileName.startsWith('use')) {
            violations.push({
                type: 'naming-convention',
                file: filePath,
                severity: 'warning',
                message: 'Hook customizado deve começar com "use"',
                suggestion: `Renomear para use${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`
            });
        }

        return violations;
    }

    /**
     * Formata violações
     */
    private formatViolations(violations: ArchitectureCheckResult['violations']): string {
        if (violations.length === 0) {
            return 'Arquitetura validada com sucesso';
        }

        const errors = violations.filter(v => v.severity === 'error').length;
        const warnings = violations.filter(v => v.severity === 'warning').length;

        return `Violações: ${errors} erro(s), ${warnings} aviso(s)`;
    }

    /**
     * Especialidade padrão do Architecture Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Architecture Agent - Especialidade

## Responsabilidades
- Validar estrutura de arquivos
- Garantir limite de 500 linhas por arquivo
- Detectar duplicação de código
- Validar separação de camadas (MVC, Clean Architecture)
- Verificar nomenclatura consistente

## Expertise
- Design Patterns (Factory, Strategy, Observer, etc.)
- SOLID Principles
- Clean Architecture
- Microservices Architecture
- Modularização e Componentização
- DRY (Don't Repeat Yourself)

## Regras
- Máximo 500 linhas por arquivo
- Sem duplicação de código (DRY)
- Separação clara de responsabilidades
- Nomenclatura consistente (PascalCase para componentes, camelCase para funções)
- Componentes UI não devem ter lógica de API
- Utils devem ser independentes de UI

## Tarefas Típicas
- Validar estrutura de novos componentes
- Detectar código duplicado
- Sugerir refatorações
- Validar separação de camadas
- Revisar nomenclatura de arquivos
`;
    }
}
