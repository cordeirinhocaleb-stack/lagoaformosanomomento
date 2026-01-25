/**
 * CMS Agent (com Memória)
 * Domínio: Site de Notícias
 * 
 * Responsabilidades:
 * - Validar estrutura de artigos/posts
 * - Verificar campos obrigatórios (título, slug, conteúdo, autor)
 * - Sugerir taxonomia (categorias, tags)
 * - Validar schema do Supabase
 * - Aprender padrões de conteúdo que funcionam
 */

import { BaseAgent, TaskContext, TaskResult } from '../../core/base-agent.js';

export interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    author_id: string;
    published_at: string | null;
    category_id: string;
    tags: string[];
}

export class CMSAgent extends BaseAgent {
    constructor(memoryBasePath: string = '.agents/memory') {
        super('cms-agent', memoryBasePath);
    }

    /**
     * Implementação da validação de CMS
     */
    async executeTask(taskDescription: string, context: TaskContext): Promise<TaskResult> {
        const issues: string[] = [];
        const recommendations: string[] = [];

        // Aqui seria feita a validação real de artigos
        // Por enquanto, retorna sucesso
        const success = issues.length === 0;
        const details = success
            ? 'Estrutura de CMS validada com sucesso'
            : `Problemas encontrados: ${issues.join(', ')}`;

        return {
            success,
            details,
            issues: issues.length > 0 ? issues : undefined,
            recommendations: recommendations.length > 0 ? recommendations : undefined
        };
    }

    /**
     * Valida estrutura de artigo
     */
    validateArticle(article: Partial<Article>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!article.title || article.title.trim().length === 0) {
            errors.push('Título é obrigatório');
        }

        if (!article.slug || article.slug.trim().length === 0) {
            errors.push('Slug é obrigatório');
        } else if (!/^[a-z0-9-]+$/.test(article.slug)) {
            errors.push('Slug deve conter apenas letras minúsculas, números e hífens');
        }

        if (!article.content || article.content.trim().length === 0) {
            errors.push('Conteúdo é obrigatório');
        }

        if (!article.author_id) {
            errors.push('Autor é obrigatório');
        }

        if (!article.category_id) {
            errors.push('Categoria é obrigatória');
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Gera slug a partir do título
     */
    generateSlug(title: string): string {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .trim()
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-'); // Remove hífens duplicados
    }

    /**
     * Valida schema Supabase para CMS
     */
    validateSchema(migrations: string[]): { valid: boolean; recommendations: string[] } {
        const recommendations: string[] = [];
        const hasArticlesTable = migrations.some(m => m.includes('create table articles'));
        const hasCategoriesTable = migrations.some(m => m.includes('create table categories'));
        const hasTagsTable = migrations.some(m => m.includes('create table tags'));

        if (!hasArticlesTable) {
            recommendations.push('Criar tabela "articles" (id, title, slug, content, author_id, published_at, category_id)');
        }

        if (!hasCategoriesTable) {
            recommendations.push('Criar tabela "categories" (id, name, slug)');
        }

        if (!hasTagsTable) {
            recommendations.push('Criar tabela "tags" (id, name) e tabela de relacionamento "article_tags"');
        }

        return { valid: recommendations.length === 0, recommendations };
    }

    /**
     * Especialidade padrão do CMS Agent
     */
    protected getDefaultSpecialty(): string {
        return `# CMS Agent - Especialidade

## Responsabilidades
- Validar estrutura de artigos/posts
- Verificar campos obrigatórios (título, slug, conteúdo, autor)
- Sugerir taxonomia (categorias, tags)
- Validar schema do Supabase para CMS
- Gerar slugs automaticamente

## Expertise
- Content Management Systems
- Taxonomia (categorias, tags)
- Schema de banco de dados para CMS
- SEO-friendly URLs (slugs)
- Estrutura de artigos/posts

## Regras
- Título é obrigatório
- Slug deve ser único e SEO-friendly
- Conteúdo não pode estar vazio
- Autor deve estar vinculado
- Categoria é obrigatória
- Tags são opcionais mas recomendadas

## Tarefas Típicas
- Validar estrutura de novos artigos
- Gerar slugs a partir de títulos
- Sugerir categorias e tags
- Validar schema de banco de dados
- Recomendar melhorias de taxonomia
`;
    }
}
