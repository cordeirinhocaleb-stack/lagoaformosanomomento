'use client';

import React from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </head>
            <body>
                <div id="ErrorPageContainer" className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 left-20 w-64 h-64 bg-red-800 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>

                    <div id="ErrorContentArea" className="relative z-10 max-w-2xl w-full text-center space-y-8">
                        {/* Logo/Brand */}
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <img
                                src="https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P"
                                alt="Logo"
                                className="w-16 h-16 object-contain animate-coin"
                            />
                            <div className="text-left">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Lagoa Formosa</h2>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">No Momento</p>
                            </div>
                        </div>

                        {/* Error Code */}
                        <div className="relative">
                            <h1 className="text-[180px] md:text-[240px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-red-500 to-blue-600">
                                500
                            </h1>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-30 police-sweep"></div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight italic" style={{ fontFamily: 'Merriweather, serif' }}>
                                Erro Interno do Servidor
                            </h2>
                            <p className="text-sm md:text-base text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                                Algo deu errado em nossos servidores. Nossa equipe já foi notificada e está trabalhando para resolver o problema.
                            </p>

                            {/* Error Details (Development Only) */}
                            {process.env.NODE_ENV === 'development' && (
                                <details className="mt-6 text-left bg-black/40 border border-red-600/30 rounded-2xl p-6 max-w-lg mx-auto">
                                    <summary className="text-xs font-black uppercase tracking-wider text-red-500 cursor-pointer hover:text-red-400 transition-colors">
                                        Detalhes do Erro (Dev Mode)
                                    </summary>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-xs text-zinc-300 font-mono break-all">
                                            <span className="text-red-400 font-bold">Message:</span> {error.message}
                                        </p>
                                        {error.digest && (
                                            <p className="text-xs text-zinc-300 font-mono">
                                                <span className="text-red-400 font-bold">Digest:</span> {error.digest}
                                            </p>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                            <button
                                onClick={reset}
                                className="group relative bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-2xl hover:shadow-red-600/50 active:scale-95 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <i className="fas fa-rotate-right"></i>
                                    Tentar Novamente
                                </span>
                            </button>

                            <a
                                href="/"
                                className="group relative bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all border border-white/20 hover:border-white/40 active:scale-95 inline-flex items-center gap-3"
                            >
                                <i className="fas fa-home"></i>
                                Voltar para Home
                            </a>
                        </div>

                        {/* Support Info */}
                        <div className="pt-12 border-t border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4">
                                Precisa de Ajuda?
                            </p>
                            <p className="text-xs text-zinc-400">
                                Se o problema persistir, entre em contato com nossa equipe de suporte.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
