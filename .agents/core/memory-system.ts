/**
 * Memory System - Sistema de Memória para Agentes
 * 
 * Responsabilidades:
 * - Gerenciar memória persistente de cada agente
 * - Registrar sucessos e falhas
 * - Armazenar aprendizados
 * - Buscar casos similares
 * - Fornecer recomendações baseadas em histórico
 */

import * as fs from 'fs';
import * as path from 'path';
import { CacheManager } from './cache-manager.js';

/**
 * Entrada individual de memória
 */
export interface MemoryEntry {
    id: string;
    timestamp: Date;
    taskDescription: string;
    context: {
        files: string[];
        areas: string[];
        complexity: 'low' | 'medium' | 'high';
    };
    result: 'success' | 'failure';
    details: string;
    userFeedback?: {
        satisfied: boolean;
        likes: string[];
        dislikes: string[];
        suggestions: string[];
    };
    metadata?: Record<string, any>;
}

/**
 * Padrão aprendido
 */
export interface Learning {
    id: string;
    pattern: string;
    description: string;
    recommendation: string;
    confidence: number; // 0-1
    occurrences: number;
    lastSeen: Date;
    examples: string[]; // IDs de MemoryEntry
}

/**
 * Estrutura de memória de um agente
 */
export interface AgentMemory {
    agentName: string;
    successes: MemoryEntry[];
    failures: MemoryEntry[];
    learnings: Learning[];
    stats: {
        totalTasks: number;
        successRate: number;
        lastUpdated: Date;
    };
}

/**
 * Sistema de Memória
 */
export class MemorySystem {
    private memoryBasePath: string;
    private maxEntries: number;
    private cache: CacheManager;

    constructor(memoryBasePath: string = '.agents/memory', maxEntries: number = 1000) {
        this.memoryBasePath = memoryBasePath;
        this.maxEntries = maxEntries;
        this.cache = new CacheManager(300000, 500); // 5 min TTL, max 500 entries
        this.ensureMemoryStructure();
    }

    /**
     * Garante que a estrutura de pastas existe
     */
    private ensureMemoryStructure(): void {
        if (!fs.existsSync(this.memoryBasePath)) {
            fs.mkdirSync(this.memoryBasePath, { recursive: true });
        }
    }

    /**
     * Garante que a pasta do agente existe
     */
    private ensureAgentFolder(agentName: string): string {
        const agentPath = path.join(this.memoryBasePath, agentName);
        if (!fs.existsSync(agentPath)) {
            fs.mkdirSync(agentPath, { recursive: true });
        }
        return agentPath;
    }

    /**
     * Carrega memória de um agente
     */
    loadMemory(agentName: string): AgentMemory {
        const agentPath = this.ensureAgentFolder(agentName);

        const successesPath = path.join(agentPath, 'successes.json');
        const failuresPath = path.join(agentPath, 'failures.json');
        const learningsPath = path.join(agentPath, 'learnings.json');

        const successes = this.loadJsonFile<MemoryEntry[]>(successesPath, []);
        const failures = this.loadJsonFile<MemoryEntry[]>(failuresPath, []);
        const learnings = this.loadJsonFile<Learning[]>(learningsPath, []);

        const totalTasks = successes.length + failures.length;
        const successRate = totalTasks > 0 ? successes.length / totalTasks : 0;

        return {
            agentName,
            successes,
            failures,
            learnings,
            stats: {
                totalTasks,
                successRate,
                lastUpdated: new Date(),
            },
        };
    }

    /**
     * Salva memória de um agente
     */
    saveMemory(memory: AgentMemory): void {
        const agentPath = this.ensureAgentFolder(memory.agentName);

        // Limitar número de entradas
        const successes = this.limitEntries(memory.successes);
        const failures = this.limitEntries(memory.failures);

        this.saveJsonFile(path.join(agentPath, 'successes.json'), successes);
        this.saveJsonFile(path.join(agentPath, 'failures.json'), failures);
        this.saveJsonFile(path.join(agentPath, 'learnings.json'), memory.learnings);
    }

    /**
     * Registra um sucesso
     */
    recordSuccess(
        agentName: string,
        taskDescription: string,
        context: MemoryEntry['context'],
        details: string,
        userFeedback?: MemoryEntry['userFeedback']
    ): void {
        const memory = this.loadMemory(agentName);

        const entry: MemoryEntry = {
            id: this.generateId(),
            timestamp: new Date(),
            taskDescription,
            context,
            result: 'success',
            details,
            userFeedback,
        };

        memory.successes.push(entry);
        this.saveMemory(memory);

        console.log(`✅ [${agentName}] Sucesso registrado: ${taskDescription}`);
    }

    /**
     * Registra uma falha
     */
    recordFailure(
        agentName: string,
        taskDescription: string,
        context: MemoryEntry['context'],
        details: string,
        userFeedback?: MemoryEntry['userFeedback']
    ): void {
        const memory = this.loadMemory(agentName);

        const entry: MemoryEntry = {
            id: this.generateId(),
            timestamp: new Date(),
            taskDescription,
            context,
            result: 'failure',
            details,
            userFeedback,
        };

        memory.failures.push(entry);
        this.saveMemory(memory);

        console.log(`❌ [${agentName}] Falha registrada: ${taskDescription}`);
    }

    /**
     * Adiciona um aprendizado
     */
    addLearning(
        agentName: string,
        pattern: string,
        description: string,
        recommendation: string,
        exampleIds: string[] = []
    ): void {
        const memory = this.loadMemory(agentName);

        // Verificar se já existe
        const existing = memory.learnings.find(l => l.pattern === pattern);

        if (existing) {
            existing.occurrences++;
            existing.lastSeen = new Date();
            existing.confidence = Math.min(1, existing.confidence + 0.1);
            existing.examples.push(...exampleIds);
        } else {
            const learning: Learning = {
                id: this.generateId(),
                pattern,
                description,
                recommendation,
                confidence: 0.5,
                occurrences: 1,
                lastSeen: new Date(),
                examples: exampleIds,
            };
            memory.learnings.push(learning);
        }

        this.saveMemory(memory);
        console.log(`🧠 [${agentName}] Aprendizado adicionado: ${pattern}`);
    }

    /**
     * Busca casos similares
     */
    getSimilarCases(
        agentName: string,
        taskDescription: string,
        limit: number = 5
    ): MemoryEntry[] {
        // Verificar cache primeiro
        const cacheKey = `similar:${agentName}:${taskDescription}:${limit}`;
        const cached = this.cache.get<MemoryEntry[]>(cacheKey);

        if (cached) {
            return cached;
        }

        // Cache miss - buscar do disco
        const memory = this.loadMemory(agentName);
        const allEntries = [...memory.successes, ...memory.failures];

        // Busca simples por palavras-chave
        const keywords = this.extractKeywords(taskDescription);

        const scored = allEntries.map(entry => {
            const entryKeywords = this.extractKeywords(entry.taskDescription);
            const score = this.calculateSimilarity(keywords, entryKeywords);
            return { entry, score };
        });

        const results = scored
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .filter(s => s.score > 0.3)
            .map(s => s.entry);

        // Cachear resultado
        this.cache.set(cacheKey, results, 60000); // 1 minuto TTL

        return results;
    }

    /**
     * Obtém recomendações baseadas em aprendizados
     */
    getRecommendations(agentName: string, taskDescription: string): string[] {
        // Verificar cache primeiro
        const cacheKey = `recommendations:${agentName}:${taskDescription}`;
        const cached = this.cache.get<string[]>(cacheKey);

        if (cached) {
            return cached;
        }

        // Cache miss - buscar do disco
        const memory = this.loadMemory(agentName);
        const keywords = this.extractKeywords(taskDescription);

        const results = memory.learnings
            .filter(learning => {
                const patternKeywords = this.extractKeywords(learning.pattern);
                const similarity = this.calculateSimilarity(keywords, patternKeywords);
                return similarity > 0.3 && learning.confidence > 0.5;
            })
            .sort((a, b) => b.confidence - a.confidence)
            .map(l => l.recommendation);

        // Cachear resultado
        this.cache.set(cacheKey, results, 120000); // 2 minutos TTL

        return results;
    }

    /**
     * Obtém estatísticas do cache
     */
    getCacheStats() {
        return this.cache.getStats();
    }

    /**
     * Limpa o cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Obtém estatísticas de um agente
     */
    getStats(agentName: string): AgentMemory['stats'] {
        const memory = this.loadMemory(agentName);
        return memory.stats;
    }

    // ==================== Métodos Auxiliares ====================

    private loadJsonFile<T>(filePath: string, defaultValue: T): T {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(content);

                // Robustez: se o arquivo JSON estiver envolto em um objeto (ex: { "successes": [] })
                // extraímos o array diretamente
                const fileName = path.basename(filePath, '.json');
                if (data && typeof data === 'object' && !Array.isArray(data) && data[fileName]) {
                    return data[fileName] as T;
                }

                return data;
            }
        } catch (error) {
            console.warn(`Erro ao carregar ${filePath}:`, error);
        }
        return defaultValue;
    }

    private saveJsonFile(filePath: string, data: any): void {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Erro ao salvar ${filePath}:`, error);
        }
    }

    private limitEntries<T extends MemoryEntry>(entries: T[]): T[] {
        if (entries.length <= this.maxEntries) {
            return entries;
        }
        // Manter as mais recentes
        return entries
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, this.maxEntries);
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private extractKeywords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3);
    }

    private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
        const set1 = new Set(keywords1);
        const set2 = new Set(keywords2);
        const intersection = new Set([...set1].filter(k => set2.has(k)));
        const union = new Set([...set1, ...set2]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }
}
