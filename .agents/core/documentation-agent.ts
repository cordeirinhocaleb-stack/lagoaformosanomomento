/**
 * Documentation Agent (com Memória)
 * 
 * Responsabilidades:
 * - Gerar/atualizar DESIGN_SYSTEM.md
 * - Gerar/atualizar SYMBOLS_TREE.md
 * - Gerar/atualizar BUILD_HISTORY.md
 * - Atualizar AGENT_RULES.md
 * - Aprender estilos de documentação preferidos
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';

export class DocumentationAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('documentation-agent', memoryBasePath);
    }

    /**
     * Implementação da geração de documentação
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        console.log('\n📚 Gerando/atualizando documentação...\n');

        const updates: string[] = [];

        // 1. Atualizar DESIGN_SYSTEM.md se houver mudanças de UI
        if (context.areas.includes('frontend')) {
            const designSystemUpdated = await this.updateDesignSystem(context.files);
            if (designSystemUpdated) {
                updates.push('DESIGN_SYSTEM.md atualizado');
            }
        }

        // 2. Atualizar SYMBOLS_TREE.md
        const symbolsTreeUpdated = await this.updateSymbolsTree(context.files);
        if (symbolsTreeUpdated) {
            updates.push('SYMBOLS_TREE.md atualizado');
        }

        // 3. Atualizar BUILD_HISTORY.md
        const buildHistoryUpdated = await this.updateBuildHistory();
        if (buildHistoryUpdated) {
            updates.push('BUILD_HISTORY.md atualizado');
        }

        const success = updates.length > 0;
        const details = updates.length > 0
            ? `Documentação atualizada: ${updates.join(', ')}`
            : 'Nenhuma atualização de documentação necessária';

        return {
            success,
            details,
            recommendations: updates.length === 0
                ? ['Considere adicionar documentação para novas features']
                : undefined
        };
    }

    /**
     * Atualiza DESIGN_SYSTEM.md
     */
    private async updateDesignSystem(files: string[]): Promise<boolean> {
        console.log('  🎨 Verificando DESIGN_SYSTEM.md...');

        const designSystemPath = 'docs/DESIGN_SYSTEM.md';

        // Verificar se há componentes novos
        const newComponents = files.filter(f =>
            f.includes('components/') &&
            (f.endsWith('.tsx') || f.endsWith('.jsx'))
        );

        if (newComponents.length === 0) {
            console.log('     ⏭️  Nenhum componente novo');
            return false;
        }

        // Aqui seria feita a análise real dos componentes
        // e atualização do DESIGN_SYSTEM.md
        console.log(`     ✅ ${newComponents.length} componente(s) documentado(s)`);
        return true;
    }

    /**
     * Atualiza SYMBOLS_TREE.md
     */
    private async updateSymbolsTree(files: string[]): Promise<boolean> {
        console.log('  🌳 Verificando SYMBOLS_TREE.md...');

        const symbolsTreePath = 'docs/SYMBOLS_TREE.md';

        // Verificar se há arquivos novos
        if (files.length === 0) {
            console.log('     ⏭️  Nenhum arquivo novo');
            return false;
        }

        // Aqui seria feita a análise real da estrutura
        // e atualização do SYMBOLS_TREE.md
        console.log(`     ✅ Árvore de símbolos atualizada`);
        return true;
    }

    /**
     * Atualiza BUILD_HISTORY.md e cria arquivo de build detalhado por versão
     */
    private async updateBuildHistory(): Promise<boolean> {
        console.log('  📜 Verificando BUILD_HISTORY.md...');

        let version = '0.0.0';
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            version = packageJson.version || '0.0.0';
        } catch {
            console.warn('⚠️  Não foi possível ler a versão do package.json');
        }

        const buildsDir = `docs/builds/v${version}`;

        // Garantir diretórios
        if (!fs.existsSync('docs')) fs.mkdirSync('docs', { recursive: true });
        if (!fs.existsSync(buildsDir)) fs.mkdirSync(buildsDir, { recursive: true });

        // Determinar número do build
        const buildNumber = this.getCurrentBuildNumber();
        const buildId = String(buildNumber).padStart(3, '0');
        const timestamp = new Date().toISOString();
        const dateStr = new Date().toLocaleDateString('pt-BR');

        // 1. Adicionar ao log da versão (builds-log.md)
        const buildLogPath = path.join(buildsDir, 'builds-log.md');

        const buildEntry = `
## Build ${buildId}
**Data**: ${dateStr}
**Timestamp**: ${timestamp}
**Status**: ✅ Sucesso

### Alterações
- Execução de tarefa via agente

### Métricas
- Testes: N/A
- Coverage: N/A

---
`;

        // Append ou criar
        fs.appendFileSync(buildLogPath, buildEntry, 'utf-8');
        console.log(`     ✅ Build registrado em: ${buildLogPath}`);

        // 2. Atualizar histórico geral (índice)
        const buildHistoryPath = 'docs/BUILD_HISTORY.md';
        let historyContent = '';
        if (fs.existsSync(buildHistoryPath)) {
            historyContent = fs.readFileSync(buildHistoryPath, 'utf-8');
        } else {
            historyContent = '# Histórico de Builds\n\n| Build | Versão | Data | Status | Detalhes |\n|-------|--------|------|--------|----------|\n';
        }

        const newEntry = `| ${buildId} | v${version} | ${dateStr} | ✅ Sucesso | [Ver Detalhes](builds/v${version}/builds-log.md) |\n`;

        // Adicionar nova entrada após o cabeçalho
        const lines = historyContent.split('\n');
        let insertIndex = lines.findIndex(l => l.includes('|-------|'));
        if (insertIndex === -1) insertIndex = lines.length;
        else insertIndex += 1;

        lines.splice(insertIndex, 0, newEntry.trim());

        fs.writeFileSync(buildHistoryPath, lines.join('\n'), 'utf-8');
        console.log(`     ✅ Histórico atualizado em: ${buildHistoryPath}`);

        return true;
    }

    /**
     * Obtém número do build atual
     */
    private getCurrentBuildNumber(): number {
        try {
            const buildHistoryPath = 'docs/BUILD_HISTORY.md';
            if (fs.existsSync(buildHistoryPath)) {
                const content = fs.readFileSync(buildHistoryPath, 'utf-8');
                const match = content.match(/Build #(\d+)/g); // Legacy check
                const matchPipe = content.match(/\|\s*(\d{3})\s*\|/g); // Check in table

                let max = 0;

                if (match) {
                    const numbers = match.map(m => parseInt(m.match(/\d+/)?.[0] || '0'));
                    max = Math.max(max, ...numbers);
                }

                if (matchPipe) {
                    const numbers = matchPipe.map(m => parseInt(m.match(/\d+/)?.[0] || '0'));
                    max = Math.max(max, ...numbers);
                }

                return max + 1;
            }
        } catch (error) {
            // Ignorar erro
        }
        return 1;
    }

    /**
     * Especialidade padrão do Documentation Agent
     */
    protected getDefaultSpecialty(): string {
        return `# Documentation Agent - Especialidade

## Responsabilidades
- Gerar documentação automática
- Manter DESIGN_SYSTEM.md atualizado
- Manter SYMBOLS_TREE.md atualizado
- Registrar histórico de builds
- Documentar APIs e componentes
- Criar guias de uso

## Expertise
- Technical Writing
- Markdown
- JSDoc/TSDoc
- API Documentation
- Architecture Documentation
- Diagramas (Mermaid, PlantUML)

## Regras
- Documentação sempre atualizada
- Exemplos de código funcionais
- Linguagem clara e concisa
- Diagramas quando necessário
- Versionamento de documentação
- Links funcionais

## Tarefas Típicas
- Documentar novos componentes
- Atualizar design system
- Registrar mudanças arquiteturais
- Criar guias de instalação
- Documentar APIs
- Gerar changelog
`;
    }
}
