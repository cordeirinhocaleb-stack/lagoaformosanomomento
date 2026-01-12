
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
        title: string;
        lead: string;
        socialCaptions?: any[];
        setSocialCaptions?: (s: any[]) => void;
    };
    darkMode?: boolean;
}

import { getThemesForBlock } from '../EditorialThemes';
import { InspectorTextBlock } from '../blocks/textblock/inspector/InspectorTextBlock';
import { EditorialStyle } from '../blocks/textblock/types';

const PRESET_STYLES = ['listing', 'grid', 'mosaic', 'carousel', 'filmstrip'];

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ block, onUpdate, onDelete, onClose, accessToken, newsMetadata, darkMode = false }) => {
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

    if (!block) {
        return (
            <aside className={`w-full flex flex-col h-full animate-fadeIn ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                    <i className="fas fa-wand-magic-sparkles text-5xl mb-6"></i>
                    <p className="text-xs font-black uppercase tracking-widest">Selecione um bloco p/ configurar</p>
                </div>
            </aside>
        );
    }

    const currentVariant = block?.settings?.editorialVariant || 'newspaper_standard';
    const contextualThemes = getThemesForBlock(block.type);
    const isTextBlock = ['paragraph', 'heading', 'quote', 'list'].includes(block.type);

    return (
        <aside className={`w-full flex flex-col h-full animate-slideInRight ${darkMode ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
            <div className={`flex border-b flex-shrink-0 ${darkMode ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                <div className={`flex-1 py-5 text-center text-[10px] font-black uppercase tracking-widest text-red-600 border-b-2 border-red-600 bg-white`}>
                    Configurações do Bloco
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar pb-32">
                <div className="space-y-10 animate-fadeIn">
                    {/* DADOS ESPECÍFICOS DO BLOCO */}
                    <section className="bg-zinc-900 p-6 rounded-[2.5rem] text-white space-y-6">
                        <header className="flex items-center gap-2 mb-2">
                            <i className="fas fa-database text-blue-400 text-xs"></i>
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Conteúdo do Bloco</h4>
                        </header>

                        {block.type === 'engagement' && (
                            <p className="text-[9px] font-bold text-zinc-500 uppercase italic">Configure o conteúdo de engajamento diretamente no bloco central.</p>
                        )}

                        {isTextBlock && (
                            <p className="text-[9px] font-bold text-zinc-500 uppercase italic">Edite o texto diretamente no bloco central.</p>
                        )}
                    </section>

                    {/* BASE DE ACESSO: TEMAS (CONTEXTUAIS) */}
                    {isTextBlock && (
                        <section>
                            <label className="text-[9px] font-black uppercase text-zinc-400 mb-4 block tracking-widest">Temas Disponíveis</label>
                            <div className="grid grid-cols-3 gap-2">
                                {contextualThemes.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => updateSets({ editorialVariant: p.id })}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all h-[4.5rem] ${currentVariant === p.id ? 'border-red-600 bg-red-50/10 shadow-sm' : 'border-zinc-100 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20'}`}
                                    >
                                        <span className={`text-[8px] font-black uppercase tracking-wider text-center leading-tight ${currentVariant === p.id ? 'text-red-600 dark:text-red-500' : 'text-zinc-400'}`}>{p.label}</span>
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] shadow-sm ${p.color}`}><i className={`fas ${p.icon}`}></i></div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* BASE DE ACESSO: DESIGN CUSTOM (UNIVERSAL) */}
                    <section className={`p-6 rounded-[2.5rem] border space-y-8 ${darkMode ? 'bg-zinc-900/40 border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                        <header className="flex items-center gap-2 mb-4">
                            <i className="fas fa-sliders-h text-red-600 text-xs"></i>
                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Design & Layout</h4>
                        </header>

                        <div className={`pt-2 grid grid-cols-1 gap-6`}>
                            {/* DIVISOR CONTROLS (SPECIFIC) */}
                            {block.type === 'separator' && (
                                <div className="space-y-6 animate-fadeIn bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Grossura ({block.settings?.thickness || 1}px)</span>
                                            <input type="range" min="1" max="10" step="1" value={block.settings?.thickness || 1} onChange={e => updateSets({ thickness: Number(e.target.value) })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Tamanho ({block.settings?.maxWidth || 100}%)</span>
                                            <input type="range" min="10" max="100" step="5" value={block.settings?.maxWidth || 100} onChange={e => updateSets({ maxWidth: Number(e.target.value) })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-600" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Ícone Destaque</span>
                                            <select value={block.settings?.iconName || 'none'} onChange={e => updateSets({ iconName: e.target.value, iconPosition: e.target.value === 'none' ? 'none' : (block.settings?.iconPosition || 'center') })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-[10px] font-bold text-white focus:border-red-500 outline-none">
                                                <option value="none">NENHUM</option>
                                                <option value="fa-star">ESTRELA</option>
                                                <option value="fa-circle">CÍRCULO</option>
                                                <option value="fa-bolt-lightning">RAIO</option>
                                                <option value="fa-newspaper">NOTÍCIA</option>
                                                <option value="site_logo">LOGO LFNM</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Posição Ícone</span>
                                            <select value={block.settings?.iconPosition || 'none'} onChange={e => updateSets({ iconPosition: e.target.value })} disabled={!block.settings?.iconName || block.settings?.iconName === 'none'} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-[10px] font-bold text-white focus:border-red-500 outline-none disabled:opacity-30">
                                                <option value="none">OCULTO</option>
                                                <option value="left">ESQUERDA</option>
                                                <option value="center">CENTRO</option>
                                                <option value="right">DIREITA</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!['separator', 'image', 'video'].includes(block.type) && (
                                <div className="space-y-3">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Alinhamento</span>
                                    <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-black border-white/10' : 'bg-white border-zinc-200'}`}>
                                        {['left', 'center', 'right', 'justify'].map(a => (
                                            <button key={a} onClick={() => updateSets({ alignment: a })} className={`flex-1 py-3 rounded-lg text-xs transition-all ${block.settings?.alignment === a ? (darkMode ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 text-white shadow-md') : (darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:bg-zinc-50')}`}>
                                                <i className={`fas fa-align-${a === 'justify' ? 'justify' : a}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Largura (Grid 4 colunas)</span>
                                <div className={`grid grid-cols-4 gap-2 p-1 rounded-xl border ${darkMode ? 'bg-black border-white/10' : 'bg-white border-zinc-200'}`}>
                                    {[
                                        { val: '1/4', label: '25%', icon: 'fa-square' },
                                        { val: '1/2', label: '50%', icon: 'fa-table-columns' },
                                        { val: '3/4', label: '75%', icon: 'fa-table-cells' },
                                        { val: 'full', label: '100%', icon: 'fa-window-maximize' }
                                    ].map(w => (
                                        <button
                                            key={w.val}
                                            onClick={() => updateSets({ width: w.val })}
                                            className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-all ${block.settings?.width === w.val ? (darkMode ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 text-white shadow-md') : (darkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-400 hover:bg-zinc-50')}`}
                                            title={w.label}
                                        >
                                            <i className={`fas ${w.icon} text-xs`}></i>
                                            <span className="text-[7px] font-bold">{w.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* DELEGAÇÃO: INSPETOR ESPECÍFICO DO BLOCO */}
                    {isTextBlock && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-2 px-1 mb-2">
                                <i className="fas fa-microchip text-zinc-400 text-[8px]"></i>
                                <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Configurações Avançadas</span>
                            </div>
                            <InspectorTextBlock block={block} onUpdate={onUpdate} darkMode={darkMode} />
                        </div>
                    )}
                </div>
            </div>

            <div className={`p-6 border-t mt-auto ${darkMode ? 'bg-black border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                <button onClick={onClose} className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 ${darkMode ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-black text-white hover:bg-red-600'}`}>Concluir Alterações</button>
            </div>
        </aside>
    );
};

export default InspectorSidebar;
