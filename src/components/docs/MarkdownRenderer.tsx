'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose prose-invert prose-red max-w-none">
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl md:text-4xl font-black mb-8 border-b border-zinc-800 pb-4 text-white" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-3 text-zinc-100" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-8 mb-4 text-zinc-200" {...props} />,
                    p: ({ node, ...props }) => <p className="text-zinc-400 leading-relaxed mb-6" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-none space-y-3 mb-8 pl-0" {...props} />,
                    li: ({ node, ...props }) => (
                        <li className="flex items-start gap-3 text-zinc-400">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                            <span>{props.children}</span>
                        </li>
                    ),
                    code: ({ node, ...props }) => (
                        <code className="bg-zinc-800 text-red-400 px-1.5 py-0.5 rounded font-mono text-sm" {...props} />
                    ),
                    pre: ({ node, ...props }) => (
                        <pre className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl overflow-x-auto my-8 shadow-inner" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <div className="border-l-4 border-blue-600 bg-blue-600/5 p-6 rounded-r-xl my-8 italic text-zinc-300">
                            {props.children}
                        </div>
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-8">
                            <table className="w-full border-collapse text-sm" {...props} />
                        </div>
                    ),
                    th: ({ node, ...props }) => <th className="border border-zinc-800 bg-zinc-800/50 p-3 text-left font-bold text-zinc-200" {...props} />,
                    td: ({ node, ...props }) => <td className="border border-zinc-800 p-3 text-zinc-400" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
