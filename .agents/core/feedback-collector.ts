/**
 * Feedback Collector - Coletor de Feedback do Usuário
 * 
 * Responsabilidades:
 * - Coletar feedback do usuário após tarefas
 * - Registrar feedback na memória dos agentes
 * - Analisar padrões em feedbacks
 * - Gerar sugestões baseadas em histórico
 */

import { MemorySystem, MemoryEntry } from './memory-system';
import { TaskContext } from './base-agent';

export interface UserFeedback {
    taskId: string;
    agentName: string;
    satisfied: boolean;
    likes: string[];
    dislikes: string[];
    suggestions: string[];
    timestamp: Date;
}

export interface FeedbackPrompt {
    question: string;
    type: 'boolean' | 'text' | 'multipleChoice';
    options?: string[];
}

export class FeedbackCollector {
    private memory: MemorySystem;

    constructor(memoryBasePath: string = '.agents/memory') {
        this.memory = new MemorySystem(memoryBasePath);
    }

    /**
     * Coleta feedback do usuário (simulado - em produção seria interativo)
     */
    async collectFeedback(
        taskId: string,
        agentName: string,
        taskDescription: string
    ): Promise<UserFeedback | null> {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 FEEDBACK DO USUÁRIO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log(`Tarefa: ${taskDescription}`);
        console.log(`Agente: ${agentName}\n`);

        // Em produção, isso seria um prompt interativo
        // Por enquanto, retornamos null para indicar que o feedback será coletado manualmente
        console.log('💡 Para fornecer feedback, use o método provideFeedback()');
        console.log('   Exemplo: feedbackCollector.provideFeedback(taskId, agentName, {...})\n');

        return null;
    }

    /**
     * Fornece feedback manualmente
     */
    async provideFeedback(feedback: UserFeedback): Promise<void> {
        console.log(`\n✅ Feedback recebido para ${feedback.agentName}`);
        console.log(`   Satisfeito: ${feedback.satisfied ? '👍 Sim' : '👎 Não'}`);

        if (feedback.likes.length > 0) {
            console.log(`   Gostou: ${feedback.likes.join(', ')}`);
        }

        if (feedback.dislikes.length > 0) {
            console.log(`   Não gostou: ${feedback.dislikes.join(', ')}`);
        }

        if (feedback.suggestions.length > 0) {
            console.log(`   Sugestões: ${feedback.suggestions.join(', ')}`);
        }

        // Analisar feedback e gerar aprendizados
        await this.analyzeFeedback(feedback);
    }

    /**
     * Analisa feedback e gera aprendizados
     */
    private async analyzeFeedback(feedback: UserFeedback): Promise<void> {
        // Se não está satisfeito, criar aprendizado negativo
        if (!feedback.satisfied && feedback.dislikes.length > 0) {
            for (const dislike of feedback.dislikes) {
                this.memory.addLearning(
                    feedback.agentName,
                    `Evitar: ${dislike}`,
                    `Usuário não gostou de: ${dislike}`,
                    `Evitar fazer: ${dislike}`,
                    [feedback.taskId]
                );
            }
        }

        // Se está satisfeito, criar aprendizado positivo
        if (feedback.satisfied && feedback.likes.length > 0) {
            for (const like of feedback.likes) {
                this.memory.addLearning(
                    feedback.agentName,
                    `Repetir: ${like}`,
                    `Usuário gostou de: ${like}`,
                    `Continuar fazendo: ${like}`,
                    [feedback.taskId]
                );
            }
        }

        // Processar sugestões
        if (feedback.suggestions.length > 0) {
            for (const suggestion of feedback.suggestions) {
                this.memory.addLearning(
                    feedback.agentName,
                    `Sugestão: ${suggestion}`,
                    `Usuário sugeriu: ${suggestion}`,
                    `Considerar implementar: ${suggestion}`,
                    [feedback.taskId]
                );
            }
        }

        console.log(`\n🧠 Aprendizados registrados para ${feedback.agentName}`);
    }

    /**
     * Obtém padrões de feedback
     */
    getFeedbackPatterns(agentName: string): {
        commonLikes: string[];
        commonDislikes: string[];
        commonSuggestions: string[];
    } {
        const agentMemory = this.memory.loadMemory(agentName);

        // Extrair padrões dos aprendizados
        const likes = agentMemory.learnings
            .filter(l => l.pattern.startsWith('Repetir:'))
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 5)
            .map(l => l.pattern.replace('Repetir: ', ''));

        const dislikes = agentMemory.learnings
            .filter(l => l.pattern.startsWith('Evitar:'))
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 5)
            .map(l => l.pattern.replace('Evitar: ', ''));

        const suggestions = agentMemory.learnings
            .filter(l => l.pattern.startsWith('Sugestão:'))
            .sort((a, b) => b.occurrences - a.occurrences)
            .slice(0, 5)
            .map(l => l.pattern.replace('Sugestão: ', ''));

        return {
            commonLikes: likes,
            commonDislikes: dislikes,
            commonSuggestions: suggestions,
        };
    }

    /**
     * Gera relatório de feedback
     */
    generateFeedbackReport(agentName: string): string {
        const patterns = this.getFeedbackPatterns(agentName);
        const stats = this.memory.getStats(agentName);

        let report = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `📊 RELATÓRIO DE FEEDBACK - ${agentName}\n`;
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        report += `📈 Estatísticas:\n`;
        report += `   Total de tarefas: ${stats.totalTasks}\n`;
        report += `   Taxa de sucesso: ${(stats.successRate * 100).toFixed(1)}%\n\n`;

        if (patterns.commonLikes.length > 0) {
            report += `👍 O que os usuários mais gostam:\n`;
            patterns.commonLikes.forEach((like, i) => {
                report += `   ${i + 1}. ${like}\n`;
            });
            report += `\n`;
        }

        if (patterns.commonDislikes.length > 0) {
            report += `👎 O que os usuários não gostam:\n`;
            patterns.commonDislikes.forEach((dislike, i) => {
                report += `   ${i + 1}. ${dislike}\n`;
            });
            report += `\n`;
        }

        if (patterns.commonSuggestions.length > 0) {
            report += `💡 Sugestões recorrentes:\n`;
            patterns.commonSuggestions.forEach((suggestion, i) => {
                report += `   ${i + 1}. ${suggestion}\n`;
            });
            report += `\n`;
        }

        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        return report;
    }
}
