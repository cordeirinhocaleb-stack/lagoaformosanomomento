
import React from 'react';
import { ContentBlock } from '@/types';

interface InspectorSidebarProps {
    block: ContentBlock | null;
    onUpdate: (updatedBlock: ContentBlock) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    accessToken: string | null;
    newsMetadata: {
        slug: string; setSlug: (s: string) => void;
        category: string; setCategory: (c: string) => void;
    };
}

type EditorialStyle = 'newspaper_standard' | 'breaking_alert' | 'impact_quote' | 'hero_headline' | 'police_siren' | 'tech_neon' | 'executive_summary' | 'vintage_letter' | 'footnote' | 'checklist_pro' | 'quote_modern_accent' | 'quote_elegant_editorial' | 'quote_breaking_card';

const PRESETS: { id: EditorialStyle; label: string; icon: string; color: string }[] = [
    { id: 'newspaper_standard', label: 'Padrão Jornal', icon: 'fa-align-left', color: 'bg-zinc-800' },
    { id: 'breaking_alert', label: 'Breaking News', icon: 'fa-bolt', color: 'bg-red-600' },
    { id: 'impact_quote', label: 'Citação Impacto', icon: 'fa-quote-left', color: 'bg-zinc-400' },
    { id: 'hero_headline', label: 'Manchete Hero', icon: 'fa-heading', color: 'bg-zinc-900' },
    { id: 'police_siren', label: 'Alerta Policial', icon: 'fa-shield-halved', color: 'bg-yellow-500' },
    { id: 'tech_neon', label: 'Destaque Tech', icon: 'fa-terminal', color: 'bg-emerald-500' },
    { id: 'executive_summary', label: 'Resumo Exec.', icon: 'fa-list-check', color: 'bg-blue-600' },
    { id: 'vintage_letter', label: 'Carta Leitor', icon: 'fa-envelope-open-text', color: 'bg-orange-300' },
    { id: 'footnote', label: 'Rodapé/Nota', icon: 'fa-comment-dots', color: 'bg-zinc-300' },
    { id: 'checklist_pro', label: 'Lista Check', icon: 'fa-check-double', color: 'bg-green-600' },
    { id: 'quote_modern_accent', label: 'Citação G1', icon: 'fa-quote-left', color: 'bg-red-700' },
    { id: 'quote_elegant_editorial', label: 'Editorial Lux', icon: 'fa-feather-pointed', color: 'bg-zinc-800' },
    { id: 'quote_breaking_card', label: 'Card Breaking', icon: 'fa-bolt-lightning', color: 'bg-amber-600' },
];

const PRESET_STYLES = ['listing', 'grid', 'mosaic', 'carousel', 'filmstrip'];

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ block, onUpdate, onDelete, onClose, accessToken, newsMetadata }) => {
    const [tab, setTab] = React.useState<'style' | 'seo'>('style');

    const updateSets = (newSets: Record<string, unknown>) => {
        if (!block) { return; }
        onUpdate({ ...block, settings: { ...block.settings, ...newSets } });
    };

    const updateContent = (newContent: unknown) => {
        if (!block) { return; }
        const currentContent = block.content;
        if (typeof currentContent === 'object' && currentContent !== null && !Array.isArray(currentContent)) {
            onUpdate({ ...block, content: { ...currentContent, ...(typeof newContent === 'object' ? newContent : {}) } });
        } else {
            onUpdate({ ...block, content: newContent });
        }
    };

    if (!block && tab === 'style') {
        return (
            <aside className="w-96 bg-white border-l border-zinc-200 flex flex-col h-full animate-fadeIn">
                <div className="p-8 border-b border-zinc-100">
                    <button onClick={() => setTab('seo')} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Configurações Globais</button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                    <i className="fas fa-wand-magic-sparkles text-5xl mb-6"></i>
                    <p className="text-xs font-black uppercase tracking-widest">Selecione um bloco p/ configurar</p>
                </div>
            </aside>
        );
    }

    const currentStyle = block?.settings.editorialStyle || 'newspaper_standard';

    return (
        <aside className="w-96 bg-white border-l border-zinc-200 flex flex-col h-full shadow-2xl animate-slideInRight">
            <div className="flex border-b border-zinc-100 flex-shrink-0 bg-zinc-50">
                <button onClick={() => setTab('style')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'style' ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-zinc-400'}`}>Design & Dados</button>
                <button onClick={() => setTab('seo')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'seo' ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-zinc-400'}`}>SEO</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-32">
                {tab === 'style' && block && (
                    <div className="space-y-10 animate-fadeIn">
                        {/* DADOS ESPECÍFICOS DO BLOCO (RESTAURADOS) */}
                        <section className="bg-zinc-900 p-6 rounded-[2.5rem] text-white space-y-6">
                            <header className="flex items-center gap-2 mb-2">
                                <i className="fas fa-database text-blue-400 text-xs"></i>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Conteúdo do Bloco</h4>
                            </header>

                            {block.type === 'engagement' && (
                                <p className="text-[9px] font-bold text-zinc-500 uppercase italic">Configure o conteúdo de engajamento diretamente no bloco central.</p>
                            )}

                            {['paragraph', 'heading', 'quote'].includes(block.type) && (
                                <p className="text-[9px] font-bold text-zinc-500 uppercase italic">Edite o texto diretamente no bloco central.</p>
                            )}
                        </section>

                        {/* PRESETS CAMALEÃO (TEXTO) */}
                        {['paragraph', 'heading', 'quote'].includes(block.type) && (
                            <section>
                                <label className="text-[9px] font-black uppercase text-zinc-400 mb-4 block tracking-widest">Estilos Camaleão</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => updateSets({ editorialStyle: p.id })}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${currentStyle === p.id ? 'border-red-600 bg-red-50/20' : 'border-zinc-50 hover:border-zinc-200'}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] ${p.color}`}><i className={`fas ${p.icon}`}></i></div>
                                            <span className={`text-[8px] font-black uppercase leading-none ${currentStyle === p.id ? 'text-red-700' : 'text-zinc-500'}`}>{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="bg-zinc-50 p-6 rounded-[2.5rem] border border-zinc-100 space-y-8">
                            <header className="flex items-center gap-2 mb-4">
                                <i className="fas fa-sliders-h text-red-600 text-xs"></i>
                                <h4 className="text-[10px] font-black uppercase text-zinc-900 tracking-widest">Design Custom</h4>
                            </header>

                            {/* CONTROLES CAMALEÃO (CONDICIONAIS) */}
                            {currentStyle === 'breaking_alert' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Animação Pulsante</span>
                                        <input type="checkbox" checked={block.settings.pulseEnabled || false} onChange={e => updateSets({ pulseEnabled: e.target.checked })} className="w-5 h-5 accent-red-600" />
                                    </label>
                                </div>
                            )}

                            {currentStyle === 'police_siren' && (
                                <div className="space-y-4 animate-fadeIn">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Fita Zebrada LFNM</span>
                                        <input type="checkbox" checked={block.settings.zebraStripes || false} onChange={e => updateSets({ zebraStripes: e.target.checked })} className="w-5 h-5 accent-black" />
                                    </label>
                                </div>
                            )}

                            {/* CONTROLES UNIVERSAIS */}
                            <div className="pt-6 border-t border-zinc-200 grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase">Alinhamento</span>
                                    <div className="flex bg-white p-1 rounded-lg border border-zinc-200">
                                        {['left', 'center', 'right'].map(a => (
                                            <button key={a} onClick={() => updateSets({ alignment: a })} className={`flex-1 py-2 rounded text-[10px] ${block.settings.alignment === a ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-50'}`}>
                                                <i className={`fas fa-align-${a}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-zinc-400 uppercase">Largura Bloco</span>
                                    <select value={block.settings.width || 'full'} onChange={e => updateSets({ width: e.target.value })} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-[10px] font-bold uppercase outline-none">
                                        <option value="full">Total</option>
                                        <option value="3/4">Editorial</option>
                                        <option value="1/2">Meia Tela</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {tab === 'seo' && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white">
                            <label className="text-[10px] font-black text-red-500 uppercase mb-4 block tracking-widest">SEO da Notícia</label>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[8px] font-bold opacity-50 uppercase mb-1 block">Slug de URL</label>
                                    <input type="text" value={newsMetadata.slug} onChange={e => newsMetadata.setSlug(e.target.value)} className="w-full bg-white/10 border border-white/10 p-3 rounded-xl text-xs font-mono text-blue-300 outline-none" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-bold opacity-50 uppercase mb-1 block">Editoria Principal</label>
                                    <select value={newsMetadata.category} onChange={e => newsMetadata.setCategory(e.target.value)} className="w-full bg-white/10 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none">
                                        {['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'].map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-zinc-50 border-t border-zinc-100 mt-auto">
                <button onClick={onClose} className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-red-600 transition-all active:scale-95">Concluir Alterações</button>
            </div>
        </aside>
    );
};

export default InspectorSidebar;
