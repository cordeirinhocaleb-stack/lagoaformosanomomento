
import React from 'react';

interface InspectorPageSettingsProps {
    slug: string;
    setSlug: (s: string) => void;
    seoTitle: string;
    setSeoTitle: (s: string) => void;
    seoDescription: string;
    setSeoDescription: (s: string) => void;
    focusKeyword: string;
    setFocusKeyword: (s: string) => void;
    canonicalUrl: string;
    setCanonicalUrl: (s: string) => void;
    category: string;
    setCategory: (c: string) => void;
    onRegenerate?: () => void;
    darkMode?: boolean;
}

export const InspectorPageSettings: React.FC<InspectorPageSettingsProps> = ({
    slug, setSlug,
    seoTitle, setSeoTitle,
    seoDescription, setSeoDescription,
    focusKeyword, setFocusKeyword,
    canonicalUrl, setCanonicalUrl,
    category, setCategory,
    onRegenerate,
    darkMode = false
}) => {
    return (
        <aside className={`w-full flex flex-col h-full animate-fadeIn overflow-hidden ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
            <div className={`flex border-b flex-shrink0 ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                <div className={`flex-1 py-4 md:py-5 text-center text-[9px] md:text-[10px] font-black uppercase tracking-wide md:tracking-widest text-blue-600 border-b-2 border-blue-600 bg-white px-2 md:px-3`}>
                    <span className="block truncate">Configurações da Página</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 custom-scrollbar pb-28">

                {/* ACTIONS */}
                {onRegenerate && (
                    <div className="flex justify-end">
                        <button
                            onClick={onRegenerate}
                            className={`text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${darkMode ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                            title="Recriar Slug e Metadados com base no título atual"
                        >
                            <i className="fas fa-sync-alt"></i> Reload Config SEO
                        </button>
                    </div>
                )}

                {/* SEO BASICS */}
                <section className={`p-5 rounded-[2rem] border space-y-4 ${darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <header className="flex items-center gap-2 mb-2">
                        <i className="fas fa-search text-blue-500 text-xs"></i>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Otimização SEO</h4>
                    </header>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Meta Title (SEO)</label>
                            <input
                                type="text"
                                value={seoTitle}
                                onChange={e => setSeoTitle(e.target.value)}
                                placeholder="Título otimizado para Google..."
                                className={`w-full bg-transparent border-b py-2 text-xs font-bold outline-none ${darkMode ? 'border-white/10 focus:border-blue-500 placeholder-zinc-700' : 'border-zinc-200 focus:border-blue-500 placeholder-zinc-300'}`}
                            />
                            <p className="text-[8px] text-zinc-500">Deixe vazio para usar a Manchete principal.</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Meta Description</label>
                            <textarea
                                value={seoDescription}
                                onChange={e => setSeoDescription(e.target.value)}
                                rows={3}
                                placeholder="Resumo curto para resultados de busca..."
                                className={`w-full bg-transparent border py-2 px-3 rounded-lg text-xs font-medium outline-none resize-none ${darkMode ? 'border-white/10 focus:border-blue-500 placeholder-zinc-700' : 'border-zinc-200 focus:border-blue-500 placeholder-zinc-300'}`}
                            />
                            <p className="text-[8px] text-zinc-500">Deixe vazio para usar o Lead/Resumo da matéria.</p>
                        </div>
                    </div>
                </section>

                {/* ADVANCED URL */}
                <section className={`p-5 rounded-[2rem] border space-y-4 ${darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                    <header className="flex items-center gap-2 mb-2">
                        <i className="fas fa-link text-orange-500 text-xs"></i>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-zinc-900'}`}>URL & Identificação</h4>
                    </header>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">URL Slug (Link Destaque)</label>
                            <div className={`flex items-center px-3 py-2 rounded-lg border ${darkMode ? 'bg-black/30 border-white/10' : 'bg-white border-zinc-200'}`}>
                                <span className="text-[9px] text-zinc-500 mr-1">/news/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    className={`flex-1 bg-transparent border-none p-0 text-xs font-bold outline-none ${darkMode ? 'text-white' : 'text-zinc-900'}`}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">URL Canônica (Opcional)</label>
                            <input
                                type="text"
                                value={canonicalUrl}
                                onChange={e => setCanonicalUrl(e.target.value)}
                                placeholder="https://..."
                                className={`w-full bg-transparent border-b py-2 text-xs font-bold outline-none ${darkMode ? 'border-white/10 focus:border-orange-500 placeholder-zinc-700' : 'border-zinc-200 focus:border-orange-500 placeholder-zinc-300'}`}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Palavra-Chave Foco</label>
                            <input
                                type="text"
                                value={focusKeyword}
                                onChange={e => setFocusKeyword(e.target.value)}
                                placeholder="Ex: Acidente, Festa, Prefeitura..."
                                className={`w-full bg-transparent border-b py-2 text-xs font-bold outline-none ${darkMode ? 'border-white/10 focus:border-orange-500 placeholder-zinc-700' : 'border-zinc-200 focus:border-orange-500 placeholder-zinc-300'}`}
                            />
                        </div>
                    </div>
                </section>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <p className="text-[9px] text-blue-600 dark:text-blue-400 leading-relaxed text-center font-medium">
                        <i className="fas fa-info-circle mr-1"></i>
                        Essas configurações são aplicadas a toda a página. Selecione um bloco específico para editar seu conteúdo.
                    </p>
                </div>
            </div>
        </aside>
    );
};
