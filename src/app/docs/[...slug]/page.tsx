import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { MarkdownRenderer } from '@/components/docs/MarkdownRenderer';

interface PageProps {
    params: Promise<{
        slug: string[];
    }>;
}

export default async function DynamicDocPage({ params }: PageProps) {
    const { slug } = await params;
    const projectRoot = process.cwd();

    let filePath = '';

    // Mapeamento de Slugs para caminhos físicos
    if (slug[0] === 'agents') {
        filePath = path.join(projectRoot, '.context', 'agents', `${slug[1]}.md`);
    } else if (slug[0] === 'docs') {
        filePath = path.join(projectRoot, 'docs', `${slug[1]}.md`);
    } else {
        // Arquivos na raiz
        filePath = path.join(projectRoot, `${slug[0]}.md`);
    }

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`Doc not found at: ${filePath}`);
            return notFound();
        }

        const content = fs.readFileSync(filePath, 'utf-8');

        return (
            <article className="animate-fadeIn">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-tighter">
                        <span>LFNM</span>
                        <span>/</span>
                        <span>{slug.join(' / ')}</span>
                    </div>
                </div>

                <MarkdownRenderer content={content} />

                <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500 font-mono">
                    <span>PATH: {path.relative(projectRoot, filePath)}</span>
                    <span>SOURCE: PROJECT_SOT</span>
                </div>
            </article>
        );
    } catch (error) {
        console.error('Error reading doc file:', error);
        return notFound();
    }
}
