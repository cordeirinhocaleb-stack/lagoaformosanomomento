/**
 * Testes para WorkflowValidator
 */

import { WorkflowValidator, WorkflowStep } from './workflow-validator';

describe('WorkflowValidator', () => {
    let validator: WorkflowValidator;

    beforeEach(() => {
        validator = new WorkflowValidator();
    });

    describe('validateAgentExecution', () => {
        test('deve validar workflow completo com todos os passos', () => {
            const steps: WorkflowStep[] = [
                { name: 'Consultar Memória', required: true, completed: true, timestamp: new Date() },
                { name: 'Obter Recomendações', required: true, completed: true, timestamp: new Date() },
                { name: 'Consultar Repositórios', required: true, completed: true, timestamp: new Date() },
                { name: 'Aplicar Aprendizados', required: true, completed: true, timestamp: new Date() },
                { name: 'Registrar Resultado', required: true, completed: true, timestamp: new Date() }
            ];

            const result = validator.validateAgentExecution('test-agent', steps);

            expect(result.compliant).toBe(true);
            expect(result.missingSteps).toHaveLength(0);
            expect(result.completedSteps).toHaveLength(5);
            expect(result.totalRequired).toBe(5);
            expect(result.totalCompleted).toBe(5);
        });

        test('deve detectar passos faltantes', () => {
            const steps: WorkflowStep[] = [
                { name: 'Consultar Memória', required: true, completed: true },
                { name: 'Obter Recomendações', required: true, completed: false },
                { name: 'Consultar Repositórios', required: true, completed: false }
            ];

            const result = validator.validateAgentExecution('test-agent', steps);

            expect(result.compliant).toBe(false);
            expect(result.missingSteps).toContain('Obter Recomendações');
            expect(result.missingSteps).toContain('Consultar Repositórios');
            expect(result.totalCompleted).toBe(1);
        });

        test('deve ignorar passos opcionais não completados', () => {
            const steps: WorkflowStep[] = [
                { name: 'Consultar Memória', required: true, completed: true },
                { name: 'Obter Recomendações', required: true, completed: true },
                { name: 'Consultar Repositórios', required: true, completed: true },
                { name: 'Aplicar Aprendizados', required: true, completed: true },
                { name: 'Registrar Resultado', required: true, completed: true },
                { name: 'Gerar Aprendizados', required: false, completed: false }
            ];

            const result = validator.validateAgentExecution('test-agent', steps);

            expect(result.compliant).toBe(true);
            expect(result.missingSteps).toHaveLength(0);
        });

        test('deve gerar warnings para passos críticos faltantes', () => {
            const steps: WorkflowStep[] = [
                { name: 'Obter Recomendações', required: true, completed: true },
                { name: 'Consultar Repositórios', required: true, completed: true }
            ];

            const result = validator.validateAgentExecution('test-agent', steps);

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.includes('Consultar Memória'))).toBe(true);
        });

        test('deve detectar passos fora de ordem', () => {
            const now = new Date();
            const steps: WorkflowStep[] = [
                { name: 'Registrar Resultado', required: true, completed: true, timestamp: new Date(now.getTime() - 1000) },
                { name: 'Consultar Memória', required: true, completed: true, timestamp: now }
            ];

            const result = validator.validateAgentExecution('test-agent', steps);

            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.warnings.some(w => w.includes('fora de ordem'))).toBe(true);
        });
    });

    describe('generateValidationReport', () => {
        test('deve gerar relatório para workflow compliant', () => {
            const validation = {
                compliant: true,
                missingSteps: [],
                warnings: [],
                completedSteps: ['Consultar Memória', 'Obter Recomendações'],
                totalRequired: 2,
                totalCompleted: 2
            };

            const report = validator.generateValidationReport('test-agent', validation);

            expect(report).toContain('test-agent');
            expect(report).toContain('✅ COMPLIANT');
            expect(report).toContain('Consultar Memória');
        });

        test('deve gerar relatório para workflow non-compliant', () => {
            const validation = {
                compliant: false,
                missingSteps: ['Consultar Repositórios'],
                warnings: ['Teste de warning'],
                completedSteps: ['Consultar Memória'],
                totalRequired: 2,
                totalCompleted: 1
            };

            const report = validator.generateValidationReport('test-agent', validation);

            expect(report).toContain('❌ NON-COMPLIANT');
            expect(report).toContain('Consultar Repositórios');
            expect(report).toContain('Teste de warning');
        });
    });

    describe('validateMultipleAgents', () => {
        test('deve validar múltiplos agentes', () => {
            const executions = [
                {
                    agentName: 'agent-1',
                    steps: [
                        { name: 'Consultar Memória', required: true, completed: true },
                        { name: 'Registrar Resultado', required: true, completed: true }
                    ]
                },
                {
                    agentName: 'agent-2',
                    steps: [
                        { name: 'Consultar Memória', required: true, completed: false }
                    ]
                }
            ];

            const result = validator.validateMultipleAgents(executions);

            expect(result.allCompliant).toBe(false);
            expect(result.compliantCount).toBe(1);
            expect(result.nonCompliantCount).toBe(1);
            expect(result.details).toHaveLength(2);
        });

        test('deve retornar allCompliant true quando todos passam', () => {
            const executions = [
                {
                    agentName: 'agent-1',
                    steps: [{ name: 'Step 1', required: true, completed: true }]
                },
                {
                    agentName: 'agent-2',
                    steps: [{ name: 'Step 1', required: true, completed: true }]
                }
            ];

            const result = validator.validateMultipleAgents(executions);

            expect(result.allCompliant).toBe(true);
            expect(result.compliantCount).toBe(2);
            expect(result.nonCompliantCount).toBe(0);
        });
    });
});
