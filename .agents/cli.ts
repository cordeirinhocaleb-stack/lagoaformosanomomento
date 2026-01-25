#!/usr/bin/env node

/**
 * CLI do Sistema de Agentes
 * 
 * Comandos disponíveis:
 * - !comandos         - Lista todos comandos
 * - !iniciar contexto - Carrega contexto do projeto
 * - !rever codigo     - Executa auditoria do código
 * - !rever plano      - Revisa plano de implementação
 * - !voltar versao    - Reverte para versão anterior
 * - !criar backup     - Cria backup do estado atual
 */

import { initializeContext } from './context-loader.js';
import { CodeAuditorAgent } from './code-auditor-agent.js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as readline from 'readline';
import { IntelligentOrchestrator } from './orchestrator.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define commands using a mapped type or interface if needed, but simple object is fine
const COMMANDS: Record<string, () => Promise<void> | void> = {
    '!comandos': showCommands,
    '!iniciar contexto': initContext,
    '!rever codigo': reviewCode,
    '!rever plano': reviewPlan,
    '!voltar versao': revertVersion,
    '!criar backup': createBackup,
    '!escanear': scanProject,
    '!desinstalar': uninstall,
};

/**
 * Mostra todos os comandos disponíveis
 */
export function showCommands(): void {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 COMANDOS DO SISTEMA DE AGENTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📋 Comandos Disponíveis:\n');

    console.log('  !comandos');
    console.log('    └─ Mostra esta lista de comandos\n');

    console.log('  !iniciar contexto');
    console.log('    └─ Carrega contexto completo do projeto');
    console.log('    └─ Detecta domínio, perfil, documentação\n');

    console.log('  !rever codigo');
    console.log('    └─ Executa auditoria completa do código');
    console.log('    └─ Gera relatório de violações (P0/P1/P2)');
    console.log('    └─ Salva em docs/AUDIT_REPORT.md\n');

    console.log('  !rever plano');
    console.log('    └─ Revisa plano de implementação');
    console.log('    └─ Valida agentes necessários');
    console.log('    └─ Lista próximos passos\n');

    console.log('  !voltar versao');
    console.log('    └─ Reverte para versão anterior (git)');
    console.log('    └─ Lista commits recentes para escolher\n');

    console.log('  !criar backup');
    console.log('    └─ Cria backup do estado atual');
    console.log('    └─ Salva em .backups/backup-YYYYMMDD-HHmmss/\n');

    console.log('  !escanear');
    console.log('    └─ Escaneia todo o projeto e atualiza o inventário');
    console.log('    └─ Cataloga componentes, tipos, rotas e banco\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('💡 Uso:');
    console.log('   npx tsx .agents/cli.ts "!comando"\n');
    console.log('   Ou adicione ao package.json:');
    console.log('   "scripts": {');
    console.log('     "agent": "npx tsx .agents/cli.ts"');
    console.log('   }\n');
    console.log('   E use: npm run agent "!comando"\n');
}

/**
 * Iniciar Contexto
 */
export async function initContext(): Promise<any> {
    console.log('\n🔄 Executando: !iniciar contexto\n');

    try {
        const context = await initializeContext(true);
        console.log('✅ Contexto inicializado com sucesso!\n');
        return context;
    } catch (error: any) {
        console.error('❌ Erro ao iniciar contexto:', error.message);
        process.exit(1);
    }
}

/**
 * Rever Código
 */
export async function reviewCode(): Promise<any> {
    console.log('\n🔍 Executando: !rever codigo\n');

    try {
        const auditor = new CodeAuditorAgent(process.cwd());
        const report = await auditor.auditProject();

        console.log(report.summary);

        auditor.saveReport(report);

        console.log(`\n✅ Auditoria concluída!`);
        console.log(`📊 ${report.totalViolations} violações encontradas`);
        console.log(`   💀 P0: ${report.p0Count}`);
        console.log(`   ⚠️  P1: ${report.p1Count}`);
        console.log(`   💡 P2: ${report.p2Count}\n`);

        if (report.p0Count > 0) {
            console.log('❌ ATENÇÃO: Existem violações P0 (críticas) que devem ser corrigidas!\n');
            process.exit(1);
        }

        return report;
    } catch (error: any) {
        console.error('❌ Erro na auditoria:', error.message);
        process.exit(1);
    }
}

/**
 * Rever Plano
 */
export async function reviewPlan(): Promise<void> {
    console.log('\n📋 Executando: !rever plano\n');

    const planFile = 'docs/IMPLEMENTATION_PLAN.md';

    if (!fs.existsSync(planFile)) {
        console.log('⚠️  Nenhum plano de implementação encontrado.');
        console.log('💡 Crie um plano primeiro ou use o Task Analyzer.\n');
        return;
    }

    const plan = fs.readFileSync(planFile, 'utf-8');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 PLANO DE IMPLEMENTAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(plan);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar se há profil do projeto
    if (fs.existsSync('docs/PROJECT_PROFILE.json')) {
        const profile = JSON.parse(fs.readFileSync('docs/PROJECT_PROFILE.json', 'utf-8'));
        console.log('🎯 Perfil do Projeto:');
        console.log(`   Nome: ${profile.projectName}`);
        console.log(`   Domínio: ${profile.domain}`);
        console.log(`   Complexidade estimada: ${profile.customNeeds?.length || 0} necessidades customizadas\n`);
    }
}

/**
 * Voltar Versão
 */
export function revertVersion(): void {
    console.log('\n⏮️  Executando: !voltar versao\n');

    try {
        // Verificar se está em repositório git
        if (!fs.existsSync('.git')) {
            console.log('❌ Não é um repositório Git!');
            console.log('💡 Inicialize com: git init\n');
            return;
        }

        // Listar últimos 10 commits
        console.log('📜 Últimos commits:\n');
        const commits = execSync('git log --oneline -n 10', { encoding: 'utf-8' });
        console.log(commits);

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Para reverter, execute manualmente:\n');
        console.log('   git revert <commit-hash>   # Criar commit de reversão');
        console.log('   ou');
        console.log('   git reset --hard <commit-hash>   # Voltar diretamente (CUIDADO!)\n');
        console.log('💡 Recomendado: git revert (mais seguro)\n');

    } catch (error: any) {
        console.error('❌ Erro ao listar commits:', error.message);
    }
}

/**
 * Criar Backup
 */
export function createBackup(): void {
    console.log('\n💾 Executando: !criar backup\n');

    try {
        // Criar diretório de backups
        const backupsDir = '.backups';
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        // Nome do backup com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupName = `backup-${timestamp}`;
        const backupPath = path.join(backupsDir, backupName);

        console.log(`📦 Criando backup em: ${backupPath}\n`);

        // Diretórios/arquivos para backup
        const itemsToBackup = [
            'app',
            'components',
            'hooks',
            'lib',
            'utils',
            'docs',
            '.agents',
            'package.json',
            'tsconfig.json',
            'next.config.js',
        ];

        fs.mkdirSync(backupPath, { recursive: true });

        let backedUp = 0;

        itemsToBackup.forEach(item => {
            if (fs.existsSync(item)) {
                const isDir = fs.statSync(item).isDirectory();

                if (isDir) {
                    // Copiar diretório recursivamente
                    copyRecursive(item, path.join(backupPath, item));
                    console.log(`  ✅ ${item}/`);
                } else {
                    // Copiar arquivo
                    fs.copyFileSync(item, path.join(backupPath, item));
                    console.log(`  ✅ ${item}`);
                }

                backedUp++;
            }
        });

        console.log(`\n✅ Backup criado com sucesso!`);
        console.log(`📂 Localização: ${backupPath}`);
        console.log(`📊 ${backedUp} itens salvos\n`);

        // Criar arquivo de metadata
        const metadata = {
            timestamp: new Date().toISOString(),
            items: itemsToBackup.filter(i => fs.existsSync(i)),
            git: {
                branch: execSync('git branch --show-current', { encoding: 'utf-8' }).trim(),
                commit: execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim(),
            },
        };

        fs.writeFileSync(
            path.join(backupPath, 'backup-info.json'),
            JSON.stringify(metadata, null, 2),
            'utf-8'
        );

        console.log('💡 Para restaurar:');
        console.log(`   cp -r ${backupPath}/* .\n`);

    } catch (error: any) {
        console.error('❌ Erro ao criar backup:', error.message);
    }
}

/**
 * Copia diretório recursivamente
 */
function copyRecursive(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        // Ignorar node_modules, .next, etc
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist') {
            continue;
        }

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Escanear Projeto
 */
export async function scanProject(): Promise<void> {
    console.log('\n🔍 Executando: !escanear\n');

    try {
        const context = await initializeContext(false); // Carregar sem modo interativo para ser rápido
        const orchestrator = new IntelligentOrchestrator(context);

        console.log('🏭 Iniciando scan completo do projeto...');
        await orchestrator.orchestrateTask('escanear projeto');

        console.log('\n✅ Inventário atualizado com sucesso!');
        console.log('📂 Veja os resultados em: .agents/memory/inventory-agent/inventory/');
    } catch (error: any) {
        console.error('❌ Erro ao escanear projeto:', error.message);
        process.exit(1);
    }
}

/**
 * Desinstala o sistema de agentes do projeto
 */
export async function uninstall(): Promise<void> {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  DESINSTALANDO SISTEMA DE AGENTES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const confirm = await new Promise<boolean>(resolve => {
        rl.question('⚠️ Tem certeza que deseja remover o sistema de agentes e todas as documentações? (s/N): ', answer => {
            resolve(answer.toLowerCase() === 's');
            rl.close();
        });
    });

    if (!confirm) {
        console.log('\n❌ Desinstalação cancelada.\n');
        return;
    }

    try {
        const projectRoot = process.cwd();
        const agentsDir = path.join(projectRoot, '.webgho-agents');
        const legacyAgentsDir = path.join(projectRoot, '.agents');

        if (fs.existsSync(agentsDir)) {
            console.log(`  📁 Removendo .webgho-agents/...`);
            fs.rmSync(agentsDir, { recursive: true, force: true });
        }

        if (fs.existsSync(legacyAgentsDir)) {
            console.log(`  📁 Removendo .agents/ (legado)...`);
            fs.rmSync(legacyAgentsDir, { recursive: true, force: true });
        }

        // Remover scripts do package.json
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            console.log(`  📝 Limpando package.json...`);
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (packageJson.scripts) {
                delete packageJson.scripts['agents:init'];
                delete packageJson.scripts['agent'];
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
            }
        }

        console.log('\n✅ Sistema de agentes removido com sucesso!\n');
        console.log('💡 Para instalar novamente: npx @webgho.com/agentes install\n');

    } catch (error: any) {
        console.error(`\n❌ Erro ao desinstalar: ${error.message}`);
    }
}

/**
 * Main
 */
async function main(): Promise<void> {
    const command = process.argv[2];

    if (!command) {
        showCommands();
        return;
    }

    const handler = COMMANDS[command.toLowerCase()];

    if (!handler) {
        console.log(`\n❌ Comando não encontrado: ${command}\n`);
        console.log('💡 Use "!comandos" para ver a lista completa.\n');
        process.exit(1);
    }

    await handler();
}

if (process.argv[1] === __filename) {
    main().catch(error => {
        console.error('\n❌ Erro:', error.message);
        process.exit(1);
    });
}
