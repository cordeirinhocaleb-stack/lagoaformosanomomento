/**
 * Workflow Validator - Garante que agentes sigam os 6 passos obrigatórios
 * 
 * Passos obrigatórios do AGENT_WORKFLOW.md:
 * 1. Consultar memória para casos similares
 * 2. Obter recomendações de aprendizados
 * 3. Consultar repositórios de referência relevantes
 * 4. Aplicar aprendizados com alta confiança (>0.7)
 * 5. Registrar resultado (sucesso ou falha)
 * 6. Gerar aprendizados baseado em feedback (opcional)
 */

export interface WorkflowStep {
    name: string;
    required: boolean;
    completed: boolean;
    timestamp?: Date;
    details?: any;
}

export interface WorkflowValidationResult {
    compliant: boolean;
    missingSteps: string[];
    warnings: string[];
    completedSteps: string[];
    totalRequired: number;
    totalCompleted: number;
}

export class WorkflowValidator {
    /**
     * Valida se um agente seguiu todos os passos obrigatórios
     */
    validateAgentExecution(agentName: string, executionLog: WorkflowStep[]): WorkflowValidationResult {
        const requiredSteps = executionLog.filter(step => step.required);
        const completedRequired = requiredSteps.filter(step => step.completed);
        const missingSteps = requiredSteps
            .filter(step => !step.completed)
            .map(step => step.name);

        const warnings: string[] = [];
        const completedSteps = executionLog
            .filter(step => step.completed)
            .map(step => step.name);

        // Verificar se passos foram executados na ordem correta
        const expectedOrder = [
            'Consultar Memória',
            'Obter Recomendações',
            'Consultar Repositórios',
            'Aplicar Aprendizados',
            'Registrar Resultado'
        ];

        const completedOrder = executionLog
            .filter(step => step.completed && step.timestamp)
            .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime())
            .map(step => step.name);

        // Verificar ordem (warning, não erro)
        for (let i = 0; i < completedOrder.length - 1; i++) {
            const currentIndex = expectedOrder.indexOf(completedOrder[i]);
            const nextIndex = expectedOrder.indexOf(completedOrder[i + 1]);

            if (currentIndex !== -1 && nextIndex !== -1 && currentIndex > nextIndex) {
                warnings.push(
                    `Passos executados fora de ordem: "${completedOrder[i]}" antes de "${completedOrder[i + 1]}"`
                );
            }
        }

        // Verificar se passos críticos foram pulados
        const criticalSteps = ['Consultar Memória', 'Registrar Resultado'];
        const missingCritical = criticalSteps.filter(
            step => !completedSteps.includes(step)
        );

        if (missingCritical.length > 0) {
            warnings.push(
                `Passos críticos não executados: ${missingCritical.join(', ')}`
            );
        }

        const compliant = missingSteps.length === 0;

        return {
            compliant,
            missingSteps,
            warnings,
            completedSteps,
            totalRequired: requiredSteps.length,
            totalCompleted: completedRequired.length
        };
    }

    /**
     * Gera relatório detalhado de validação
     */
    generateValidationReport(agentName: string, validation: WorkflowValidationResult): string {
        const lines: string[] = [];

        lines.push(`\n━━━ Validação de Workflow: ${agentName} ━━━`);
        lines.push(`Status: ${validation.compliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
        lines.push(`Passos Completados: ${validation.totalCompleted}/${validation.totalRequired}`);

        if (validation.completedSteps.length > 0) {
            lines.push(`\n✅ Passos Executados:`);
            validation.completedSteps.forEach(step => {
                lines.push(`   - ${step}`);
            });
        }

        if (validation.missingSteps.length > 0) {
            lines.push(`\n❌ Passos Faltantes:`);
            validation.missingSteps.forEach(step => {
                lines.push(`   - ${step}`);
            });
        }

        if (validation.warnings.length > 0) {
            lines.push(`\n⚠️  Avisos:`);
            validation.warnings.forEach(warning => {
                lines.push(`   - ${warning}`);
            });
        }

        lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        return lines.join('\n');
    }

    /**
     * Valida múltiplos agentes e retorna resumo
     */
    validateMultipleAgents(
        agentExecutions: Array<{ agentName: string; steps: WorkflowStep[] }>
    ): {
        allCompliant: boolean;
        compliantCount: number;
        nonCompliantCount: number;
        details: Array<{ agentName: string; validation: WorkflowValidationResult }>;
    } {
        const details = agentExecutions.map(({ agentName, steps }) => ({
            agentName,
            validation: this.validateAgentExecution(agentName, steps)
        }));

        const compliantCount = details.filter(d => d.validation.compliant).length;
        const nonCompliantCount = details.length - compliantCount;

        return {
            allCompliant: nonCompliantCount === 0,
            compliantCount,
            nonCompliantCount,
            details
        };
    }
}
