/**
 * Python Bridge - Ponte de comunicação TypeScript ↔ Python
 * 
 * Responsável por executar o agente Python de pentesting
 * e retornar resultados para o orquestrador TypeScript
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PentestConfig {
    target: string;
    testSqlInjection?: boolean;
    testXss?: boolean;
    testPasswords?: boolean;
    testHeaders?: boolean;
    endpoints?: string[];
    inputs?: string[];
    loginEndpoint?: string;
    usernames?: string[];
}

export interface PentestResult {
    target: string;
    timestamp: string;
    tests: Array<{
        test: string;
        severity: string;
        vulnerabilities_found: number;
        details: any[];
    }>;
    summary: {
        total_tests: number;
        total_vulnerabilities: number;
        critical_vulnerabilities: number;
        status: 'VULNERABLE' | 'SECURE';
    };
}

export class PythonBridge {
    private pythonPath: string;
    private agentPath: string;

    constructor() {
        this.pythonPath = 'python'; // ou 'python3' dependendo do sistema
        this.agentPath = path.join(__dirname, 'pentesting-agent.py');
    }

    /**
     * Executa testes de pentesting
     */
    async executePentesting(config: PentestConfig): Promise<PentestResult> {
        // Criar arquivo de configuração temporário
        const configPath = path.join(__dirname, 'temp-config.json');
        fs.writeFileSync(configPath, JSON.stringify({
            test_sql_injection: config.testSqlInjection ?? true,
            test_xss: config.testXss ?? true,
            test_passwords: config.testPasswords ?? true,
            test_headers: config.testHeaders ?? true,
            endpoints: config.endpoints ?? ['/api/users', '/api/posts'],
            inputs: config.inputs ?? ['username', 'email', 'comment'],
            login_endpoint: config.loginEndpoint ?? '/api/login',
            usernames: config.usernames ?? ['admin', 'user', 'test']
        }));

        return new Promise((resolve, reject) => {
            const args = [
                this.agentPath,
                '--target', config.target,
                '--config', configPath
            ];

            console.log(`\n🐍 Executando agente Python de pentesting...`);
            console.log(`   Comando: ${this.pythonPath} ${args.join(' ')}\n`);

            const python = spawn(this.pythonPath, args);

            let stdout = '';
            let stderr = '';
            let jsonOutput = '';
            let inJsonSection = false;

            python.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;

                // Detectar início do JSON
                if (output.includes('{')) {
                    inJsonSection = true;
                }

                if (inJsonSection) {
                    jsonOutput += output;
                }

                // Mostrar output em tempo real (exceto JSON)
                if (!inJsonSection) {
                    process.stdout.write(output);
                }
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });

            python.on('close', (code) => {
                // Limpar arquivo temporário
                try {
                    fs.unlinkSync(configPath);
                } catch (e) {
                    // Ignorar erro
                }

                if (code === null || code === 0 || code === 1) {
                    // Code 1 é esperado quando vulnerabilidades são encontradas
                    try {
                        // Extrair JSON do output
                        const jsonMatch = jsonOutput.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const result = JSON.parse(jsonMatch[0]);
                            resolve(result);
                        } else {
                            reject(new Error('Não foi possível extrair JSON do output'));
                        }
                    } catch (error) {
                        reject(new Error(`Erro ao parsear JSON: ${error}`));
                    }
                } else {
                    reject(new Error(`Python process exited with code ${code}\nStderr: ${stderr}`));
                }
            });

            python.on('error', (error) => {
                reject(new Error(`Erro ao executar Python: ${error.message}`));
            });
        });
    }

    /**
     * Verifica se Python está instalado
     */
    async checkPythonInstalled(): Promise<boolean> {
        return new Promise((resolve) => {
            const python = spawn(this.pythonPath, ['--version']);

            python.on('close', (code) => {
                resolve(code === 0);
            });

            python.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Converte resultado de pentesting para formato do agente
     */
    convertToAgentResult(pentestResult: PentestResult): {
        success: boolean;
        details: string;
        issues?: string[];
        warnings?: string[];
    } {
        const success = pentestResult.summary.status === 'SECURE';

        const issues: string[] = [];
        const warnings: string[] = [];

        for (const test of pentestResult.tests) {
            if (test.vulnerabilities_found > 0) {
                const message = `${test.test}: ${test.vulnerabilities_found} vulnerabilidade(s) encontrada(s)`;

                if (test.severity === 'CRITICAL') {
                    issues.push(message);
                } else {
                    warnings.push(message);
                }
            }
        }

        const details = `Pentesting concluído: ${pentestResult.summary.total_vulnerabilities} vulnerabilidade(s) encontrada(s)`;

        return {
            success,
            details,
            issues: issues.length > 0 ? issues : undefined,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
}
