import { BaseAgent, TaskContext, TaskResult } from './base-agent.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

// ============================================================
// 🏭 INVENTORY AGENT - ALMOXARIFADO CENTRAL DO SISTEMA
// ============================================================
// Responsável por:
// 1. Mapear TUDO no projeto (componentes, variáveis, banco, APIs)
// 2. Fornecer busca rápida para outros agentes
// 3. IMPEDIR duplicação de código
// 4. Organizar e catalogar recursos
// ============================================================

interface InventoryItem {
    id: string;
    name: string;
    type: 'component' | 'variable' | 'table' | 'endpoint' | 'type' | 'asset' | 'function';
    path: string;
    line?: number;
    metadata: Record<string, any>;
    usedBy: string[];
    createdAt: string;
    lastModified: string;
}

interface Component extends InventoryItem {
    type: 'component';
    exports: string[];
    props: string[];
    dependencies: string[];
}

interface Variable extends InventoryItem {
    type: 'variable';
    scope: 'global' | 'local' | 'exported';
    value?: string;
    dataType: string;
}

interface DatabaseTable extends InventoryItem {
    type: 'table';
    schema: string;
    columns: Array<{
        name: string;
        type: string;
        nullable: boolean;
        primaryKey?: boolean;
        foreignKey?: string;
    }>;
    relationships: Array<{
        table: string;
        type: 'one-to-one' | 'one-to-many' | 'many-to-many';
        foreignKey: string;
    }>;
}

interface Endpoint extends InventoryItem {
    type: 'endpoint';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    params?: string[];
    body?: Record<string, string>;
    response?: string;
    authentication: boolean;
}

interface InventoryQuery {
    type?: InventoryItem['type'];
    name?: string;
    path?: string;
    fuzzy?: boolean;
}

interface DuplicationCheck {
    exists: boolean;
    duplicates: InventoryItem[];
    suggestions: string[];
}

export class InventoryAgent extends BaseAgent {
    private inventory: Map<string, InventoryItem> = new Map();
    private inventoryPath: string;
    private projectRoot: string;

    constructor(projectRoot: string, memoryBasePath: string = '.agents/memory') {
        super('inventory-agent', memoryBasePath);
        this.projectRoot = projectRoot;
        this.inventoryPath = path.join(memoryBasePath, 'inventory-agent', 'inventory');
    }

    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        try {
            // Determinar ação baseada na descrição da tarefa
            if (taskDescription.includes('scan') || taskDescription.includes('escanear')) {
                await this.scanProject();
                return {
                    success: true,
                    details: `Inventário completo: ${this.inventory.size} itens catalogados`,
                    recommendations: [`Total de ${this.inventory.size} itens no almoxarifado`],
                };
            }

            if (taskDescription.includes('find') || taskDescription.includes('buscar')) {
                const query = this.parseQuery(taskDescription);
                const results = await this.findAll(query);
                return {
                    success: true,
                    details: `Encontrados ${results.length} itens`,
                    recommendations: results.map((r) => `${r.type}: ${r.name} (${r.path})`),
                };
            }

            if (taskDescription.includes('cleanup') || taskDescription.includes('limpeza') || taskDescription.includes('unused')) {
                await this.scanProject(); // Garantir dados frescos
                await this.analyzeUsage(); // Analisar uso
                const unused = await this.findUnusedItems();

                // Gerar relatório
                const reportPath = path.join(this.projectRoot, 'docs', 'CLEANUP_REPORT.md');
                const reportContent = this.generateCleanupReport(unused);

                // Garantir diretório docs
                const docsDir = path.join(this.projectRoot, 'docs');
                try {
                    await fs.mkdir(docsDir, { recursive: true });
                } catch { }

                await fs.writeFile(reportPath, reportContent);

                return {
                    success: true,
                    details: `Análise de limpeza concluída. ${unused.length} itens potencialmente não utilizados.`,
                    recommendations: [
                        `Relatório salvo em: ${reportPath}`,
                        `Revise os itens antes de excluir (Next.js pages/layouts são falsos positivos comuns se não detectados corretamente)`
                    ],
                    issues: unused.length > 0 ? unused.slice(0, 5).map(i => `Não utilizado: ${i.name} (${i.type}) - ${i.path}`) : undefined
                };
            }

            if (taskDescription.includes('check') || taskDescription.includes('verificar')) {
                const itemName = this.extractItemName(taskDescription);
                const check = await this.checkDuplication(itemName, 'component');
                return {
                    success: !check.exists,
                    details: check.exists
                        ? `Item "${itemName}" já existe`
                        : `Nenhuma duplicação encontrada para "${itemName}"`,
                    warnings: check.exists ? [`Duplicação detectada: ${itemName}`] : undefined,
                    recommendations: check.suggestions,
                };
            }

            // Scan padrão
            await this.scanProject();
            return {
                success: true,
                details: `Scan completo: ${this.inventory.size} itens catalogados`,
            };
        } catch (error) {
            return {
                success: false,
                details: `Erro ao executar tarefa: ${(error as Error).message}`,
                issues: [(error as Error).message],
            };
        }
    }

    // ============================================================
    // 🔍 MÉTODOS DE BUSCA (Para outros agentes)
    // ============================================================

    /**
     * Busca um único item no inventário
     */
    async find(query: InventoryQuery): Promise<InventoryItem | null> {
        const results = await this.findAll(query);
        return results[0] || null;
    }

    /**
     * Busca todos os itens que correspondem à query
     */
    async findAll(query: InventoryQuery): Promise<InventoryItem[]> {
        await this.loadInventory();

        let results = Array.from(this.inventory.values());

        // Filtrar por tipo
        if (query.type) {
            results = results.filter((item) => item.type === query.type);
        }

        // Filtrar por nome
        if (query.name) {
            if (query.fuzzy) {
                // Busca fuzzy (case-insensitive, parcial)
                const searchTerm = query.name.toLowerCase();
                results = results.filter((item) => item.name.toLowerCase().includes(searchTerm));
            } else {
                // Busca exata
                results = results.filter((item) => item.name === query.name);
            }
        }

        // Filtrar por path
        if (query.path) {
            results = results.filter((item) => item.path.includes(query.path!));
        }

        return results;
    }

    /**
     * Busca textual em todo o inventário
     */
    async search(text: string): Promise<InventoryItem[]> {
        await this.loadInventory();

        const searchTerm = text.toLowerCase();
        return Array.from(this.inventory.values()).filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.path.toLowerCase().includes(searchTerm) ||
                JSON.stringify(item.metadata).toLowerCase().includes(searchTerm)
        );
    }

    // ============================================================
    // 🛡️ VERIFICAÇÃO ANTI-DUPLICAÇÃO (CRÍTICO!)
    // ============================================================

    /**
     * Verifica se um item já existe antes de criar
     * TODOS os agentes DEVEM chamar isso antes de criar algo novo!
     */
    async checkDuplication(name: string, type: InventoryItem['type']): Promise<DuplicationCheck> {
        await this.loadInventory();

        // Busca exata
        const exact = await this.find({ name, type });

        // Busca fuzzy (similares)
        const similar = await this.findAll({ name, type, fuzzy: true });

        const exists = exact !== null;
        const duplicates = similar.filter((item) => item.name !== name);

        const suggestions: string[] = [];

        if (exists) {
            suggestions.push(`⚠️ Item "${name}" já existe em: ${exact.path}`);
            suggestions.push(`💡 Use o existente em vez de criar novo`);
        }

        if (duplicates.length > 0) {
            suggestions.push(`⚠️ Encontrados ${duplicates.length} item(ns) similar(es):`);
            duplicates.forEach((dup) => {
                suggestions.push(`   - ${dup.name} (${dup.path})`);
            });
            suggestions.push(`💡 Considere reutilizar um desses em vez de criar novo`);
        }

        if (!exists && duplicates.length === 0) {
            suggestions.push(`✅ Nenhuma duplicação encontrada. Seguro criar "${name}"`);
        }

        return {
            exists,
            duplicates,
            suggestions,
        };
    }

    // ============================================================
    // 📊 MÉTODOS DE SCAN
    // ============================================================

    /**
     * Escaneia o projeto inteiro e atualiza o inventário
     */
    async scanProject(): Promise<void> {
        console.log('🔍 [inventory-agent] Escaneando projeto...');

        this.inventory.clear();

        await Promise.all([
            this.scanComponents(),
            this.scanVariables(),
            this.scanEndpoints(),
            this.scanTypes(),
            this.scanDatabase(),
        ]);

        await this.saveInventory();

        console.log(`✅ [inventory-agent] Scan completo: ${this.inventory.size} itens catalogados`);
    }

    /**
     * Escaneia componentes React/Next.js
     */
    private async scanComponents(): Promise<void> {
        const patterns = ['**/*.tsx', '**/*.jsx', '!node_modules/**', '!.next/**', '!.agents/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) continue;

                const content = await fs.readFile(fullPath, 'utf-8');

                // Detectar componentes exportados
                const exportMatches = content.matchAll(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g);

                for (const match of exportMatches) {
                    const componentName = match[1];

                    // Extrair props
                    const propsMatch = content.match(new RegExp(`${componentName}.*?\\(\\s*{([^}]+)}`, 's'));
                    const props = propsMatch
                        ? propsMatch[1]
                            .split(',')
                            .map((p) => p.trim().split(':')[0].trim())
                            .filter(Boolean)
                        : [];

                    // Extrair imports (dependências)
                    const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g);
                    const dependencies = Array.from(importMatches, (m) => m[1]);

                    const component: Component = {
                        id: `component:${file}:${componentName}`,
                        name: componentName,
                        type: 'component',
                        path: file,
                        exports: [componentName],
                        props,
                        dependencies,
                        metadata: {
                            isDefaultExport: content.includes(`export default ${componentName}`),
                        },
                        usedBy: [],
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                    };

                    this.inventory.set(component.id, component);
                }
            } catch (err) {
                console.warn(`[inventory-agent] Erro ao ler componente ${file}: ${(err as Error).message}`);
            }
        }
    }

    /**
     * Escaneia variáveis globais e exportadas
     */
    private async scanVariables(): Promise<void> {
        const patterns = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '!node_modules/**', '!.next/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) continue;

                const content = await fs.readFile(fullPath, 'utf-8');

                // Detectar variáveis exportadas
                const varMatches = content.matchAll(/export\s+const\s+(\w+)\s*[:=]\s*(.+?)(?:[;\n])/g);

                for (const match of varMatches) {
                    const [, varName, value] = match;

                    const variable: Variable = {
                        id: `variable:${file}:${varName}`,
                        name: varName,
                        type: 'variable',
                        path: file,
                        scope: 'exported',
                        value: value.trim(),
                        dataType: this.inferType(value),
                        metadata: {},
                        usedBy: [],
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                    };

                    this.inventory.set(variable.id, variable);
                }
            } catch (err) {
                console.warn(`[inventory-agent] Erro ao ler variável ${file}: ${(err as Error).message}`);
            }
        }
    }

    /**
     * Escaneia endpoints de API
     */
    private async scanEndpoints(): Promise<void> {
        const patterns = ['**/api/**/*.ts', '**/api/**/*.js', '!node_modules/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) continue;

                const content = await fs.readFile(fullPath, 'utf-8');

                // Detectar métodos HTTP
                const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

                for (const method of methods) {
                    const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'g');
                    if (regex.test(content)) {
                        const endpoint: Endpoint = {
                            id: `endpoint:${file}:${method}`,
                            name: file.replace(/.*\/api\//, '/api/').replace(/\/route\.(ts|js)/, ''),
                            type: 'endpoint',
                            path: file,
                            method,
                            authentication: content.includes('auth') || content.includes('session'),
                            metadata: {},
                            usedBy: [],
                            createdAt: new Date().toISOString(),
                            lastModified: new Date().toISOString(),
                        };

                        this.inventory.set(endpoint.id, endpoint);
                    }
                }
            } catch (err) {
                console.warn(`[inventory-agent] Erro ao ler endpoint ${file}: ${(err as Error).message}`);
            }
        }
    }

    /**
     * Escaneia tipos TypeScript
     */
    private async scanTypes(): Promise<void> {
        const patterns = ['**/types/**/*.ts', '**/*.d.ts', '!node_modules/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) continue;

                const content = await fs.readFile(fullPath, 'utf-8');

                // Detectar interfaces e types
                const typeMatches = content.matchAll(/(?:export\s+)?(?:interface|type)\s+(\w+)/g);

                for (const match of typeMatches) {
                    const typeName = match[1];

                    const typeItem: InventoryItem = {
                        id: `type:${file}:${typeName}`,
                        name: typeName,
                        type: 'type',
                        path: file,
                        metadata: {
                            isInterface: content.includes(`interface ${typeName}`),
                            isType: content.includes(`type ${typeName}`),
                        },
                        usedBy: [],
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                    };

                    this.inventory.set(typeItem.id, typeItem);
                }
            } catch (err) {
                console.warn(`[inventory-agent] Erro ao ler tipo ${file}: ${(err as Error).message}`);
            }
        }
    }

    /**
     * Escaneia schema do banco de dados (Supabase/PostgreSQL)
     */
    private async scanDatabase(): Promise<void> {
        const patterns = ['**/supabase/migrations/**/*.sql', '**/prisma/schema.prisma', '!node_modules/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);

            try {
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) continue;

                const content = await fs.readFile(fullPath, 'utf-8');

                // Detectar CREATE TABLE
                const tableMatches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(/gi);

                for (const match of tableMatches) {
                    const tableName = match[1];

                    const table: DatabaseTable = {
                        id: `table:${tableName}`,
                        name: tableName,
                        type: 'table',
                        path: file,
                        schema: 'public',
                        columns: [],
                        relationships: [],
                        metadata: {},
                        usedBy: [],
                        createdAt: new Date().toISOString(),
                        lastModified: new Date().toISOString(),
                    };

                    this.inventory.set(table.id, table);
                }
            } catch (err) {
                console.warn(`[inventory-agent] Erro ao ler schema ${file}: ${(err as Error).message}`);
            }
        }
    }

    // ============================================================
    // 💾 PERSISTÊNCIA
    // ============================================================

    /**
     * Salva inventário em arquivos JSON
     */
    private async saveInventory(): Promise<void> {
        await fs.mkdir(this.inventoryPath, { recursive: true });

        // Agrupar por tipo
        const byType = new Map<string, InventoryItem[]>();

        for (const item of this.inventory.values()) {
            if (!byType.has(item.type)) {
                byType.set(item.type, []);
            }
            byType.get(item.type)!.push(item);
        }

        // Salvar cada tipo em arquivo separado
        for (const [type, items] of byType) {
            const filePath = path.join(this.inventoryPath, `${type}s.json`);
            await fs.writeFile(filePath, JSON.stringify(items, null, 2));
        }

        // Salvar índice geral
        const index = {
            totalItems: this.inventory.size,
            byType: Object.fromEntries(
                Array.from(byType.entries()).map(([type, items]) => [type, items.length])
            ),
            lastUpdated: new Date().toISOString(),
        };

        await fs.writeFile(path.join(this.inventoryPath, 'index.json'), JSON.stringify(index, null, 2));
    }

    /**
     * Carrega inventário dos arquivos JSON
     */
    private async loadInventory(): Promise<void> {
        try {
            const indexPath = path.join(this.inventoryPath, 'index.json');
            const indexExists = await fs
                .access(indexPath)
                .then(() => true)
                .catch(() => false);

            if (!indexExists) {
                await this.scanProject();
                return;
            }

            this.inventory.clear();
            const types = ['component', 'variable', 'table', 'endpoint', 'type'];

            for (const type of types) {
                const filePath = path.join(this.inventoryPath, `${type}s.json`);
                const fileExists = await fs
                    .access(filePath)
                    .then(() => true)
                    .catch(() => false);

                if (fileExists) {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const items = JSON.parse(content) as InventoryItem[];

                    for (const item of items) {
                        this.inventory.set(item.id, item);
                    }
                }
            }
        } catch (error) {
            console.warn('[inventory-agent] Erro ao carregar inventário:', error);
        }
    }

    // ============================================================
    // 🛠️ UTILITÁRIOS
    // ============================================================

    private inferType(value: string): string {
        if (value.startsWith("'") || value.startsWith('"') || value.startsWith('`')) return 'string';
        if (value === 'true' || value === 'false') return 'boolean';
        if (!isNaN(Number(value))) return 'number';
        if (value.startsWith('[')) return 'array';
        if (value.startsWith('{')) return 'object';
        return 'unknown';
    }

    private parseQuery(description: string): InventoryQuery {
        const query: InventoryQuery = { fuzzy: true };

        if (description.includes('component')) query.type = 'component';
        if (description.includes('variable')) query.type = 'variable';
        if (description.includes('endpoint')) query.type = 'endpoint';
        if (description.includes('table')) query.type = 'table';

        return query;
    }

    private extractItemName(description: string): string {
        const match = description.match(/["']([^"']+)["']/);
        return match ? match[1] : '';
    }

    // ============================================================
    // 🧹 LIMPEZA E ANÁLISE DE USO (OTIMIZADO)
    // ============================================================

    /**
     * Analisa o uso de cada item no projeto - OTIMIZADO
     */
    async analyzeUsage(): Promise<void> {
        console.log('🕵️ [inventory-agent] Analisando referências cruzadas (Modo Otimizado)...');

        await this.loadInventory();
        const items = Array.from(this.inventory.values());

        // Resetar contadores
        items.forEach(i => i.usedBy = []);

        const patterns = ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js', '!node_modules/**', '!.next/**', '!.agents/**'];
        const files = await glob(patterns, { cwd: this.projectRoot });

        // Mapa para busca rápida de itens por nome
        // Tratando colisão de nomes: Map<Name, Item[]>
        const itemsByName = new Map<string, InventoryItem[]>();
        for (const item of items) {
            if (!itemsByName.has(item.name)) {
                itemsByName.set(item.name, []);
            }
            itemsByName.get(item.name)!.push(item);
        }

        let processedFiles = 0;

        for (const file of files) {
            const fullPath = path.join(this.projectRoot, file);
            try {
                const content = await fs.readFile(fullPath, 'utf-8');

                // Extrair todos os "tokens" (palavras) do arquivo
                // Isso é muito mais rápido que rodar milhares de regex
                const tokens = new Set(content.match(/\b\w+\b/g) || []);

                // Verificar quais itens estão presentes nos tokens
                for (const [name, potentialItems] of itemsByName) {
                    if (tokens.has(name)) {
                        for (const item of potentialItems) {
                            // Evitar auto-referência (arquivo definindo o item)
                            // Apenas se o path for exatamente o mesmo
                            if (item.path !== file) {
                                item.usedBy.push(file);
                            }
                        }
                    }
                }

                processedFiles++;
            } catch (err) {
                console.warn(`Erro ao ler arquivo ${file}: ${(err as Error).message}`);
            }
        }

        // Salvar inventário atualizado com contagem de uso
        await this.saveInventory();
        console.log(`✅ [inventory-agent] Análise completa. ${files.length} arquivos processados.`);
    }

    /**
     * Encontra itens não utilizados (com whitelist)
     */
    async findUnusedItems(): Promise<InventoryItem[]> {
        await this.loadInventory();
        const items = Array.from(this.inventory.values());

        return items.filter(item => {
            // Filtrar quem tem uso
            if (item.usedBy.length > 0) return false;

            // Whitelists (Falsos positivos conhecidos)

            // 1. Next.js Pages/Layouts/API Routes (Sempre usados pelo framework)
            if (item.path.includes('page.tsx') || item.path.includes('layout.tsx') || item.path.includes('route.ts')) return false;

            // 2. Config files
            if (item.name.includes('Config') || item.path.includes('config')) return false;

            // 3. Types (muitas vezes importados globalmente ou d.ts)
            if (item.type === 'type' && item.path.endsWith('.d.ts')) return false;

            return true;
        });
    }

    private generateCleanupReport(unused: InventoryItem[]): string {
        let report = '# 🧹 Relatório de Limpeza de Código\n\n';
        report += `**Data**: ${new Date().toLocaleDateString()}\n`;
        report += `**Total de Itens Analisados**: ${this.inventory.size}\n`;
        report += `**Potencialmente Não Utilizados**: ${unused.length}\n\n`;

        report += '> ⚠️ **Atenção**: Esta análise busca referências textuais exatas. Valide manualmente antes de excluir, pois podem haver usos dinâmicos ou indiretos.\n\n';

        const byType = new Map<string, InventoryItem[]>();
        unused.forEach(i => {
            if (!byType.has(i.type)) byType.set(i.type, []);
            byType.get(i.type)!.push(i);
        });

        for (const [type, items] of byType) {
            report += `## ${type.toUpperCase()} (${items.length})\n`;
            items.forEach(i => {
                report += `- **${i.name}**\n  - Path: \`${i.path}\`\n  - Last Modified: ${new Date(i.lastModified).toLocaleDateString()}\n`;
            });
            report += '\n';
        }

        return report;
    }
}
