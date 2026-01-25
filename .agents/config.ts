/**
 * Configurações Globais do Sistema de Agentes
 */

import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export type DomainType = 'news' | 'production' | 'logistics' | 'generic';

export interface AgentConfig {
    domain: DomainType;
    enabledAgents: string[];
    autoDocumentation: boolean;
    buildTracking: boolean;
    maxFileLines: number;

    // Memory System Configuration
    memoryEnabled: boolean;
    memoryPath: string;
    feedbackEnabled: boolean;
    autoLearn: boolean; // Aprender automaticamente ou requerer aprovação
    maxMemoryEntries: number; // Limite de entradas na memória
}

export interface DomainConfig {
    name: DomainType;
    agents: string[];
    description?: string;
}

export interface BuildInfo {
    number: number;
    version: string;
    timestamp: string;
    description: string;
}

// Configuração padrão
export const DEFAULT_CONFIG: AgentConfig = {
    domain: 'generic',
    enabledAgents: ['frontend', 'security', 'documentation', 'architecture', 'quality'],
    autoDocumentation: true,
    buildTracking: true,
    maxFileLines: 500,

    // Memory System defaults
    memoryEnabled: true,
    memoryPath: '.agents/memory',
    feedbackEnabled: true,
    autoLearn: false, // Padrão: requerer aprovação
    maxMemoryEntries: 1000,
};

// Caminhos importantes
export const PATHS = {
    docs: 'docs',
    builds: 'docs/builds',
    agents: '.agents',
    agentsCore: '.agents/core',
    agentsDomains: '.agents/domains',
    designSystem: 'docs/DESIGN_SYSTEM.md',
    symbolsTree: 'docs/SYMBOLS_TREE.md',
    buildHistory: 'docs/BUILD_HISTORY.md',
    agentRules: 'docs/AGENT_RULES.md',
} as const;

// Número da build atual (será incrementado automaticamente)
let currentBuildNumber = 1;

export function getCurrentBuildNumber(): number {
    return currentBuildNumber;
}

export function incrementBuildNumber(): number {
    currentBuildNumber++;
    return currentBuildNumber;
}

/**
 * Detecta o domínio do projeto baseado em package.json ou estrutura
 */
export function detectDomain(): DomainConfig {
    // Tentativa 1: Ler package.json
    try {
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const projectName = packageJson.name?.toLowerCase() || '';

        if (projectName.includes('news') || projectName.includes('noticia')) {
            return {
                name: 'news',
                agents: ['cms', 'seo', 'content', 'analytics'],
                description: 'Site de Notícias',
            };
        }

        if (projectName.includes('production') || projectName.includes('producao') || projectName.includes('minera')) {
            return {
                name: 'production',
                agents: ['production-control', 'quality-control', 'shipping', 'inventory'],
                description: 'Sistema de Produção e Expedição',
            };
        }

        if (projectName.includes('logistics') || projectName.includes('logistica')) {
            return {
                name: 'logistics',
                agents: ['route', 'fleet', 'warehouse', 'tracking'],
                description: 'Sistema de Logística',
            };
        }
    } catch (error) {
        console.warn('Não foi possível ler package.json para detecção de domínio');
    }

    // Default: apenas agentes core
    return {
        name: 'generic',
        agents: [],
        description: 'Projeto Genérico',
    };
}

/**
 * Valida se um arquivo excede o limite de linhas
 */
export function validateFileLines(filePath: string, maxLines: number = 500): {
    valid: boolean;
    lineCount: number;
    message?: string;
} {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lineCount = content.split('\n').length;

        if (lineCount > maxLines) {
            return {
                valid: false,
                lineCount,
                message: `⚠️ BLOQUEADO: ${filePath} tem ${lineCount} linhas (limite: ${maxLines})`,
            };
        }

        return { valid: true, lineCount };
    } catch (error) {
        return { valid: false, lineCount: 0, message: `Erro ao ler arquivo: ${filePath}` };
    }
}
