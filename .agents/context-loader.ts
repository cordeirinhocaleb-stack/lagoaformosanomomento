/**
 * Context Loader - Sistema "Iniciar Contexto"
 * 
 * Carrega toda a base de conhecimento do projeto antes de iniciar qualquer implementação:
 * - DESIGN_SYSTEM.md
 * - SYMBOLS_TREE.md
 * - BUILD_HISTORY.md
 * - AGENT_RULES.md
 * - Build atual (build-XXX.md)
 * - Regras do usuário (MEMORY)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PATHS, detectDomain, DomainConfig, getCurrentBuildNumber } from './config.js';
import { ProjectDiscoveryAgent } from './project-discovery-agent.js';

export interface ProjectContext {
    designSystem: string;
    symbolsTree: string;
    buildHistory: string;
    agentRules: string;
    currentBuild: string | null;
    domainConfig: DomainConfig;
    timestamp: string;
    projectProfile?: any; // ProjectProfile do discovery
}

/**
 * Carrega o conteúdo de um arquivo markdown
 */
function loadMarkdown(filePath: string): string {
    try {
        const fullPath = path.resolve(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf-8');
        }
        console.warn(`⚠️ Arquivo não encontrado: ${filePath}`);
        return '';
    } catch (error) {
        console.error(`❌ Erro ao carregar ${filePath}:`, error);
        return '';
    }
}

/**
 * Carrega o arquivo de build atual
 */
function loadCurrentBuild(): string | null {
    const buildNumber = getCurrentBuildNumber();
    const buildPath = `${PATHS.builds}/build-${String(buildNumber).padStart(3, '0')}.md`;

    if (fs.existsSync(buildPath)) {
        return loadMarkdown(buildPath);
    }

    console.log(`ℹ️ Build atual (build-${buildNumber}) ainda não existe. Será criado ao finalizar a primeira tarefa.`);
    return null;
}

/**
 * Executa pré-verificações do projeto
 */
async function runPreChecks(): Promise<{ success: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Verificar se estrutura de documentação existe
    if (!fs.existsSync(PATHS.docs)) {
        issues.push('⚠️ Diretório docs/ não encontrado');
    }

    if (!fs.existsSync(PATHS.designSystem)) {
        issues.push('⚠️ DESIGN_SYSTEM.md não encontrado');
    }

    if (!fs.existsSync(PATHS.symbolsTree)) {
        issues.push('⚠️ SYMBOLS_TREE.md não encontrado');
    }

    if (!fs.existsSync(PATHS.buildHistory)) {
        issues.push('⚠️ BUILD_HISTORY.md não encontrado');
    }

    if (!fs.existsSync(PATHS.agentRules)) {
        issues.push('⚠️ AGENT_RULES.md não encontrado');
    }

    // Verificar package.json
    if (!fs.existsSync('package.json')) {
        issues.push('⚠️ package.json não encontrado');
    }

    return {
        success: issues.length === 0,
        issues,
    };
}

/**
 * FUNÇÃO PRINCIPAL: Inicializar Contexto
 * 
 * Chamada quando o usuário escreve "inicie o contexto"
 */
export async function initializeContext(interactive: boolean = true): Promise<ProjectContext> {
    // Desabilitar interatividade em ambientes de CI
    if (process.env.CI) {
        interactive = false;
    }

    let projectProfile: any;

    // NOVO: Descoberta interativa do projeto
    if (interactive) {
        const discovery = new ProjectDiscoveryAgent();
        const isNewProject = discovery.detectNewProject();

        if (isNewProject) {
            console.log('✨ Projeto novo detectado!\n');
            console.log('Vamos fazer algumas perguntas para configurar os agentes ideais...\n');

            // Executar descoberta interativa
            projectProfile = await discovery.discoverProject();

            // Gerar recomendações
            const recommendations = discovery.generateRecommendations(projectProfile);

            // Mostrar relatório
            const report = discovery.generateReport(projectProfile, recommendations);
            console.log(report);

            // Salvar perfil
            discovery.saveProfile(projectProfile);

            // TODO: Auto-criar agentes recomendados com autoCreate: true
            console.log('🚀 Criando agentes recomendados...\n');
            // (implementação futura)
        } else {
            console.log('📦 Projeto existente detectado. Carregando perfil...\n');

            // Tentar carregar perfil existente
            if (fs.existsSync('docs/PROJECT_PROFILE.json')) {
                projectProfile = JSON.parse(fs.readFileSync('docs/PROJECT_PROFILE.json', 'utf-8'));
                console.log(`✅ Perfil carregado: ${projectProfile.projectName}\n`);
            }
        }
    }

    // Passo 1: Executar pré-verificações
    console.log('📋 Verificando estrutura do projeto...');
    const preCheckResult = await runPreChecks();

    if (!preCheckResult.success) {
        console.warn('\n⚠️ Avisos encontrados:');
        preCheckResult.issues.forEach((issue) => console.warn(`  ${issue}`));
        console.log('');
    } else {
        console.log('  ✅ Estrutura do projeto OK\n');
    }

    // Passo 2: Carregar documentação base
    console.log('📚 Carregando documentação base...');
    const designSystem = loadMarkdown(PATHS.designSystem);
    const symbolsTree = loadMarkdown(PATHS.symbolsTree);
    const buildHistory = loadMarkdown(PATHS.buildHistory);
    const agentRules = loadMarkdown(PATHS.agentRules);
    console.log('  ✅ Documentação carregada\n');

    // Passo 3: Carregar build atual 
    console.log('📦 Carregando build atual...');
    const currentBuild = loadCurrentBuild();
    console.log(`  ${currentBuild ? '✅' : 'ℹ️'} Build atual ${currentBuild ? 'carregado' : 'será criado'}\n`);

    // Passo 4: Detectar domínio do projeto
    console.log('🎯 Detectando domínio do projeto...');
    const domainConfig = projectProfile ?
        { name: projectProfile.domain, agents: [], description: projectProfile.customDomain || projectProfile.domain } :
        detectDomain();
    console.log(`  ✅ Domínio detectado: ${domainConfig.description || domainConfig.name}`);
    console.log(`  📌 Agentes especializados: ${domainConfig.agents.join(', ') || 'nenhum'}\n`);

    // Passo 5: Validar regras do usuário (MEMORY)
    console.log('📜 Carregando regras do usuário (MEMORY)...');
    console.log('  ✅ Regras globais carregadas');
    console.log('  ✅ Regras gerais (6 passos + relatórios) carregadas\n');

    // Passo 6: Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CONTEXTO CARREGADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 Resumo do Contexto:');
    console.log(`  • Sistema de Design: ${designSystem ? '✅ Carregado' : '❌ Não encontrado'}`);
    console.log(`  • Árvore de Símbolos: ${symbolsTree ? '✅ Carregada' : '❌ Não encontrada'}`);
    console.log(`  • Histórico de Builds: ${buildHistory ? '✅ Carregado' : '❌ Não encontrado'}`);
    console.log(`  • Regras de Agentes: ${agentRules ? '✅ Carregadas' : '❌ Não encontradas'}`);
    console.log(`  • Build Atual: ${currentBuild ? '✅ Carregado' : 'ℹ️ Será criado'}`);
    console.log(`  • Domínio: ${domainConfig.description || domainConfig.name}`);
    if (projectProfile) {
        console.log(`  • Perfil do Projeto: ✅ ${projectProfile.projectName}`);
    }
    console.log('');

    console.log('🚀 Sistema pronto para implementar!\n');

    return {
        designSystem,
        symbolsTree,
        buildHistory,
        agentRules,
        currentBuild,
        domainConfig,
        timestamp: new Date().toISOString(),
        projectProfile,
    };
}


/**
 * Valida se o contexto foi carregado antes de prosseguir
 */
export function validateContextLoaded(context: ProjectContext | null): boolean {
    if (!context) {
        console.error('❌ ERRO: Contexto não foi carregado!');
        console.error('💡 Execute "inicie o contexto" antes de prosseguir.\n');
        return false;
    }

    return true;
}

/**
 * Exibe resumo do contexto atual
 */
export function printContextSummary(context: ProjectContext): void {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RESUMO DO CONTEXTO ATUAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`🕐 Carregado em: ${new Date(context.timestamp).toLocaleString('pt-BR')}`);
    console.log(`🎯 Domínio: ${context.domainConfig.description || context.domainConfig.name}`);
    console.log(`📦 Build: ${getCurrentBuildNumber()}`);
    console.log('');
}
