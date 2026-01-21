import React from 'react';
import Link from 'next/link';

export default function DocsPage() {
    return (
        <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 text-red-600 bg-red-600 animate-pulse" />
                <span className="text-xs font-mono text-red-500 font-bold uppercase tracking-widest">SISTEMA DE INTELIGÊNCIA</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Documentação Central <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-white to-blue-600">
                    LF No Momento
                </span>
            </h1>

            <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
                Bem-vindo ao centro de controle técnico de um dos maiores portais de notícias da região.
                Aqui você encontrará todos os protocolos, playbooks de agentes e regras de arquitetura que garantem a
                segurança e a escalabilidade deste sistema.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/docs/MASTER_PROTOCOL" className="group p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-red-600 transition-all">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-500 transition-colors">📜 Norma Suprema</h3>
                    <p className="text-sm text-zinc-500">Leia o Master Protocol antes de qualquer alteração no código.</p>
                </Link>
                <Link href="/docs/docs/RULES_MASTER" className="group p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-blue-600 transition-all">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">🛡️ Regras de Qualidade</h3>
                    <p className="text-sm text-zinc-500">Padrões rígidos de clean code e segurança de dados.</p>
                </Link>
            </div>

            <div className="mt-16 p-8 border-l-4 border-red-600 bg-zinc-800/30 rounded-r-xl">
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3">Aviso Importante</h4>
                <p className="text-zinc-300 italic">
                    "Resolver o bug é apenas metade do trabalho. Garantir que o sistema permaneça modular, seguro e documentado é a outra metade."
                </p>
            </div>
        </div>
    );
}
