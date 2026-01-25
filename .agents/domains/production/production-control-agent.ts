/**
 * Production Control Agent (com Memória)
 * Domínio: Produção e Expedição
 * 
 * Responsabilidades:
 * - Monitorar eventos de produção
 * - Validar fluxo (inicio → processamento → conclusão)
 * - Alertar sobre gargalos ou atrasos
 * - Validar schema Supabase
 * - Aprender padrões de produção eficientes
 */

import { BaseAgent, TaskContext, TaskResult } from '../../core/base-agent.js';

export interface ProductionEvent {
    id: string;
    event_type: 'start' | 'processing' | 'complete' | 'pause';
    timestamp: string;
    shift: string;
    quantity: number;
    operator_id: string;
}

export class ProductionControlAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('production-control-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de produção
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const issues: string[] = [];
        const warnings: string[] = [];

        // Aqui seria feita a validação real de eventos de produção
        const success = issues.length === 0;
        const details = success
            ? 'Controle de produção validado com sucesso'
            : `Problemas encontrados: ${issues.join(', ')}`;

        return {
            success,
            details,
            issues: issues.length > 0 ? issues : undefined,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Valida evento de produção
     */
    validateEvent(event: Partial<ProductionEvent>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!event.event_type) {
            errors.push('Tipo de evento é obrigatório');
        } else if (!['start', 'processing', 'complete', 'pause'].includes(event.event_type)) {
            errors.push('Tipo de evento inválido (permitidos: start, processing, complete, pause)');
        }

        if (!event.timestamp) {
            errors.push('Timestamp é obrigatório');
        }

        if (!event.shift) {
            errors.push('Turno (shift) é obrigatório');
        }

        if (event.quantity !== undefined && event.quantity < 0) {
            errors.push('Quantidade não pode ser negativa');
        }

        if (!event.operator_id) {
            errors.push('Operador é obrigatório');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Detecta gargalos em eventos
     */
    detectBottlenecks(events: ProductionEvent[]): string[] {
        const bottlenecks: string[] = [];

        // Detectar eventos em "processing" por muito tempo (>2h exemplo)
        const now = new Date();
        events.forEach(event => {
            if (event.event_type === 'processing') {
                const eventTime = new Date(event.timestamp);
                const diffHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);

                if (diffHours > 2) {
                    bottlenecks.push(`Evento ${event.id} em processamento há ${diffHours.toFixed(1)} horas`);
                }
            }
        });

        // Detectar pausas frequentes
        const pauseEvents = events.filter(e => e.event_type === 'pause');
        if (pauseEvents.length > 5) {
            bottlenecks.push(`Muitas pausas detectadas (${pauseEvents.length})`);
        }

        return bottlenecks;
    }

    /**
     * Valida schema Supabase
     */
    validateSchema(migrations: string[]): { valid: boolean; recommendations: string[] } {
        const recommendations: string[] = [];

        const hasProductionEvents = migrations.some(m => m.includes('create table production_events'));
        const hasPlantLogs = migrations.some(m => m.includes('create table plant_logs'));
        const hasMiningCycles = migrations.some(m => m.includes('create table mining_cycles'));

        if (!hasProductionEvents) {
            recommendations.push('Criar tabela "production_events" (id, event_type, timestamp, shift, quantity, operator_id)');
        }

        if (!hasPlantLogs) {
            recommendations.push('Criar tabela "plant_logs" (id, plant_id, log_type, timestamp, data)');
        }

        if (!hasMiningCycles) {
            recommendations.push('Criar tabela "mining_cycles" (id, cycle_start, cycle_end, location, quantity)');
        }

        return { valid: recommendations.length === 0, recommendations };
    }

    /**
     * Especialidade padrão do Production Control Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Production Control Agent - Especialidade

## Responsabilidades
- Monitorar eventos de produção
- Validar fluxo (inicio → processamento → conclusão)
- Alertar sobre gargalos ou atrasos
- Validar schema Supabase para produção
- Otimizar processos de produção

## Expertise
- Controle de Produção
- Gestão de Turnos
- Detecção de Gargalos
- KPIs de Produção
- Mineração e Expedição

## Regras
- Eventos devem seguir fluxo: start → processing → complete
- Pausas devem ser justificadas
- Quantidade não pode ser negativa
- Operador deve estar vinculado
- Monitorar tempo de processamento

## Tarefas Típicas
- Validar eventos de produção
- Detectar gargalos em tempo real
- Sugerir otimizações de processo
- Validar schema de banco de dados
- Gerar relatórios de produção
`;
    }
}
