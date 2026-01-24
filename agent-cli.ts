/**
 * AGENT CLI BRIDGE (Local TypeScript Version)
 * 
 * Este arquivo substitui o CLI padrão para evitar erros de compatibilidade ESM/CommonJS.
 * Ele importa diretamente os arquivos TypeScript do pacote wegho-agentes.
 */

import { initializeContext } from './node_modules/wegho-agentes/.agents/context-loader';
import { CodeAuditorAgent } from './node_modules/wegho-agentes/.agents/code-auditor-agent';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// --- Re-implementação das funções do CLI ---

async function initContext() {
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

async function reviewCode() {
    console.log('\n🔍 Executando: !rever codigo\n');
    try {
        const auditor = new CodeAuditorAgent(process.cwd());
        const report = await auditor.auditProject();

        console.log(report.summary);
        auditor.saveReport(report);

        console.log(`\n✅ Auditoria concluída!`);
        console.log(`📊 ${report.totalViolations} violações encontradas`);

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

function showCommands() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 COMANDOS DO SISTEMA DE AGENTES (TypeScript Local)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('  !comandos           - Mostra esta lista');
    console.log('  !iniciar contexto   - Carrega contexto do projeto');
    console.log('  !rever codigo       - Executa auditoria do código');
    console.log('  !rever plano        - Revisa plano de implementação');
    console.log('  !criar backup       - Cria backup do estado atual');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function reviewPlan() {
    console.log('\n📋 Executando: !rever plano\n');
    const planFile = 'docs/IMPLEMENTATION_PLAN.md';
    if (!fs.existsSync(planFile)) {
        console.log('⚠️  Nenhum plano de implementação encontrado.');
        return;
    }
    console.log(fs.readFileSync(planFile, 'utf-8'));
}

function createBackup() {
    console.log('\n💾 Executando: !criar backup\n');
    try {
        const backupsDir = '.backups';
        if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupName = `backup-${timestamp}`;
        const backupPath = path.join(backupsDir, backupName);

        console.log(`📦 Criando backup em: ${backupPath}\n`);

        const itemsToBackup = ['app', 'components', 'hooks', 'lib', 'utils', 'docs', '.agents', 'package.json'];
        fs.mkdirSync(backupPath, { recursive: true });

        itemsToBackup.forEach(item => {
            if (fs.existsSync(item)) {
                console.log(`  ✅ Copiando ${item}...`);
                fs.cpSync(item, path.join(backupPath, item), { recursive: true });
            }
        });
        console.log(`\n✅ Backup concluído!`);
    } catch (error: any) {
        console.error('❌ Erro ao criar backup:', error.message);
    }
}

// --- Main Handler ---

const COMMANDS: Record<string, Function> = {
    '!comandos': showCommands,
    '!iniciar contexto': initContext,
    '!rever codigo': reviewCode,
    '!rever plano': reviewPlan,
    '!criar backup': createBackup,
};

async function main() {
    const command = process.argv[2];
    if (!command) {
        showCommands();
        return;
    }

    const handler = COMMANDS[command.toLowerCase()];
    if (!handler) {
        console.log(`\n❌ Comando não encontrado: ${command}`);
        showCommands();
        process.exit(1);
    }

    await handler();
}

main().catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
});
