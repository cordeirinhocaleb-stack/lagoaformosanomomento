#!/usr/bin/env node

/**
 * Script de Sincronização: task.md ↔ .context
 * 
 * Este script automatiza o workflow de sincronização entre task.md e o sistema .context
 * conforme definido em .agent/workflows/context-sync.md
 * 
 * Uso: npm run sync-context
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output no console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

// Caminhos dos arquivos
const ROOT_DIR = path.join(__dirname, '..');
const TASK_MD = path.join(ROOT_DIR, 'task.md');
const TASK_TRACKING_MD = path.join(ROOT_DIR, '.context', 'docs', 'task-tracking.md');
const SYMBOLS_TREE_MD = path.join(ROOT_DIR, 'docs', 'SYMBOLS_TREE.md');
const DESIGN_SYSTEM_MD = path.join(ROOT_DIR, 'docs', 'DESIGN_SYSTEM.md');

// Função para contar tarefas
function countTasks(content) {
    const completed = (content.match(/- \[x\]/g) || []).length;
    const pending = (content.match(/- \[ \]/g) || []).length;
    const total = completed + pending;
    const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

    return { completed, pending, total, percentage };
}

// Função para verificar se arquivo existe
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        return false;
    }
}

// Função para ler arquivo
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        log(`❌ Erro ao ler ${path.basename(filePath)}: ${err.message}`, 'red');
        return null;
    }
}

// Função principal
function syncContext() {
    logSection('🔄 Sincronização task.md ↔ .context');

    // 1. Verificar arquivos essenciais
    log('\n📋 Verificando arquivos essenciais...', 'yellow');

    const files = [
        { path: TASK_MD, name: 'task.md' },
        { path: TASK_TRACKING_MD, name: 'task-tracking.md' },
        { path: SYMBOLS_TREE_MD, name: 'SYMBOLS_TREE.md' },
        { path: DESIGN_SYSTEM_MD, name: 'DESIGN_SYSTEM.md' }
    ];

    let allFilesExist = true;
    files.forEach(file => {
        if (fileExists(file.path)) {
            log(`  ✅ ${file.name}`, 'green');
        } else {
            log(`  ❌ ${file.name} não encontrado`, 'red');
            allFilesExist = false;
        }
    });

    if (!allFilesExist) {
        log('\n⚠️  Alguns arquivos essenciais não foram encontrados.', 'yellow');
        log('Execute o workflow de integração primeiro.', 'yellow');
        process.exit(1);
    }

    // 2. Analisar task.md
    logSection('📊 Análise de task.md');

    const taskContent = readFile(TASK_MD);
    if (!taskContent) {
        process.exit(1);
    }

    const stats = countTasks(taskContent);

    log(`\nEstatísticas de Tarefas:`, 'cyan');
    log(`  Total: ${stats.total}`, 'gray');
    log(`  Concluídas: ${stats.completed}`, 'green');
    log(`  Pendentes: ${stats.pending}`, 'yellow');
    log(`  Progresso: ${stats.percentage}%`, stats.percentage >= 90 ? 'green' : 'yellow');

    // 3. Verificar tarefas pendentes
    logSection('🎯 Tarefas Pendentes');

    const pendingTasks = taskContent.match(/- \[ \] .+/g) || [];

    if (pendingTasks.length === 0) {
        log('\n🎉 Nenhuma tarefa pendente! Projeto 100% completo!', 'green');
    } else {
        log(`\nEncontradas ${pendingTasks.length} tarefa(s) pendente(s):\n`, 'yellow');
        pendingTasks.forEach((task, index) => {
            const taskName = task.replace('- [ ] ', '').trim();
            log(`  ${index + 1}. ${taskName}`, 'gray');
        });
    }

    // 4. Verificar integridade da documentação
    logSection('🔍 Verificação de Integridade');

    const taskTrackingContent = readFile(TASK_TRACKING_MD);
    const symbolsTreeContent = readFile(SYMBOLS_TREE_MD);
    const designSystemContent = readFile(DESIGN_SYSTEM_MD);

    let issues = [];

    // Verificar se task-tracking.md menciona as tarefas pendentes
    if (taskTrackingContent && pendingTasks.length > 0) {
        pendingTasks.forEach(task => {
            const taskName = task.replace('- [ ] ', '').trim().substring(0, 30);
            if (!taskTrackingContent.includes(taskName.substring(0, 20))) {
                issues.push(`Tarefa "${taskName}..." não encontrada em task-tracking.md`);
            }
        });
    }

    if (issues.length === 0) {
        log('\n✅ Todos os arquivos estão sincronizados!', 'green');
    } else {
        log('\n⚠️  Problemas encontrados:', 'yellow');
        issues.forEach(issue => {
            log(`  • ${issue}`, 'yellow');
        });
    }

    // 5. Recomendações
    logSection('💡 Recomendações');

    if (pendingTasks.length > 0) {
        log('\n📝 Próximos passos:', 'cyan');
        log('  1. Revisar tarefas pendentes em task.md', 'gray');
        log('  2. Consultar plano detalhado em .context/docs/task-tracking.md', 'gray');
        log('  3. Usar agentes apropriados para cada tarefa', 'gray');
        log('  4. Atualizar documentação após conclusão', 'gray');
    }

    if (stats.percentage >= 90) {
        log('\n🎯 Projeto quase completo! Considere:', 'cyan');
        log('  • Executar testes finais', 'gray');
        log('  • Revisar documentação', 'gray');
        log('  • Preparar para deploy de produção', 'gray');
    }

    // 6. Resumo final
    logSection('✨ Resumo da Sincronização');

    log(`\n✅ Sincronização concluída com sucesso!`, 'green');
    log(`📊 Progresso geral: ${stats.percentage}%`, stats.percentage >= 90 ? 'green' : 'yellow');
    log(`🎯 Tarefas pendentes: ${pendingTasks.length}`, pendingTasks.length === 0 ? 'green' : 'yellow');
    log(`📚 Documentação: ${issues.length === 0 ? 'Sincronizada' : 'Necessita atualização'}`, issues.length === 0 ? 'green' : 'yellow');

    console.log('\n');
}

// Executar
try {
    syncContext();
} catch (error) {
    log(`\n❌ Erro fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
}
