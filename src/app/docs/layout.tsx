import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AppControllerProvider } from '@/providers/AppControllerProvider';
import Link from 'next/link';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
            <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-2xl font-black tracking-tighter text-white hover:text-red-500 transition-colors">
                                LF<span className="text-red-600">NM</span> <span className="text-blue-600">DOCS</span>
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-4">
                                <Link href="/" className="text-zinc-400 hover:text-white transition-colors px-3 py-2 text-sm font-medium">Voltar ao Site</Link>
                                <span className="h-4 w-px bg-zinc-800" />
                                <div className="text-xs font-mono text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">SYSTEM_DOC_VERSION: 1.0.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-8 gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24 space-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Protocolos</h3>
                            <ul className="space-y-1">
                                <li><Link href="/docs/MASTER_PROTOCOL" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Norma Suprema</Link></li>
                                <li><Link href="/docs/docs/RULES_MASTER" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Regras Gerais</Link></li>
                                <li><Link href="/docs/docs/DESIGN_SYSTEM" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Design System</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Playbooks Agentes</h3>
                            <ul className="space-y-1">
                                <li><Link href="/docs/agents/architect-specialist" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Arquiteto</Link></li>
                                <li><Link href="/docs/agents/frontend-specialist" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Frontend</Link></li>
                                <li><Link href="/docs/agents/backend-specialist" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Backend</Link></li>
                                <li><Link href="/docs/agents/security-auditor" className="block px-2 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800 rounded transition-colors">Segurança</Link></li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-grow min-w-0 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
                    {children}
                </main>
            </div>

            <footer className="border-t border-zinc-800 bg-zinc-900/50 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-zinc-500 text-sm">Lagoa Formosa no Momento © 2026 - Documentação Técnica do Sistema</p>
                </div>
            </footer>
        </div>
    );
}
