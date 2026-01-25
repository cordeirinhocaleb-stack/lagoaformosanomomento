import { spawn } from 'child_process';
import * as path from 'path';

export interface PythonExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    logs: string[];
}

export class PythonBridge {
    private pythonPath: string;
    private scriptsPath: string;

    constructor(pythonPath: string = 'python', scriptsPath: string = '.agents/python') {
        this.pythonPath = pythonPath;
        this.scriptsPath = path.resolve(process.cwd(), scriptsPath);
    }

    /**
     * Excecute a Python agent script
     * @param scriptName Name of the script (e.g., 'analysis_agent.py')
     * @param payload JSON payload to pass to the script
     */
    async execute(scriptName: string, payload: any): Promise<PythonExecutionResult> {
        return new Promise((resolve, reject) => {
            const scriptFullPath = path.join(this.scriptsPath, scriptName);
            const logs: string[] = [];

            const pythonProcess = spawn(this.pythonPath, [scriptFullPath]);

            let outputData = '';
            let errorData = '';

            // Send payload to stdin
            pythonProcess.stdin.write(JSON.stringify(payload));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on('data', (data) => {
                const str = data.toString();
                outputData += str;
                // Try to capture logs if mixed in output (simple heuristic)
                if (str.startsWith('[LOG]')) {
                    logs.push(str.trim());
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                const str = data.toString();
                errorData += str;
                logs.push(`[STDERR] ${str.trim()}`);
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    resolve({
                        success: false,
                        error: `Process exited with code ${code}. Error: ${errorData}`,
                        logs,
                    });
                    return;
                }

                try {
                    // Try to find the last JSON line in the output
                    // Python scripts should print the JSON result as the last line
                    const lines = outputData.trim().split('\n');
                    const lastLine = lines[lines.length - 1];
                    const result = JSON.parse(lastLine);

                    resolve({
                        success: true,
                        data: result,
                        logs
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        error: `Failed to parse Python output: ${(e as Error).message}. Raw output: ${outputData}`,
                        logs
                    });
                }
            });

            pythonProcess.on('error', (err) => {
                resolve({
                    success: false,
                    error: `Failed to spawn Python process: ${err.message}`,
                    logs
                });
            });
        });
    }
}
