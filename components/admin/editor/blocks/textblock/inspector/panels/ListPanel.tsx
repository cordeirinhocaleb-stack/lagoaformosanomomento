import React from 'react';

interface ListPanelProps {
    variant: string;
    data: any;
    onChange: (val: any) => void;
    darkMode?: boolean;
}

export const ListPanel: React.FC<ListPanelProps> = ({ variant, data, onChange, darkMode = false }) => {
    if (['bullets_clean', 'checklist_flow', 'numbered_steps', 'bullets_square', 'timeline_dots', 'list_bullets_classic', 'list_check_circle', 'list_numbered_modern', 'list_timeline_vertical', 'list_cards_shadow'].includes(variant)) {
        const ls = data || { spacing: 'normal', markerColor: 'default', fontSize: 'normal', weight: 'normal', markerStyle: 'solid', rowStyle: 'none' };
        const currentListStyle = ls.listStyle || 'bullet';

        return (
            <div className="space-y-8 animate-fadeIn">
                {/* 0. SELETOR DE MARCADOR (NOVO) */}
                <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Tipo de Marcador</label>
                    <div className={`grid grid-cols-4 gap-2 p-1.5 rounded-2xl border ${darkMode ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                        {[
                            { val: 'bullet', label: 'Bolinha', icon: 'fa-circle' },
                            { val: 'square', label: 'Quadrado', icon: 'fa-square' },
                            { val: 'ordered', label: 'Número', icon: 'fa-list-ol' },
                            { val: 'check', label: 'Checklist', icon: 'fa-list-check' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => onChange({ listStyle: opt.val })}
                                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${currentListStyle === opt.val ? (darkMode ? 'bg-zinc-800 shadow-xl text-red-500 scale-105 z-10' : 'bg-white shadow-xl text-red-600 scale-105 z-10') : (darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600')}`}
                            >
                                <i className={`fas ${opt.icon} text-lg mb-1`}></i>
                                <span className="text-[7px] font-black uppercase tracking-tighter">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    {currentListStyle === 'check' && (
                        <div className={`mt-4 p-4 rounded-2xl border flex items-center gap-4 animate-fadeIn ${darkMode ? 'bg-green-950/20 border-green-500/20' : 'bg-green-50 border-green-100'}`}>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-lg"><i className="fas fa-square"></i></div>
                                <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center shadow-lg"><i className="fas fa-check"></i></div>
                                <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg"><i className="fas fa-times"></i></div>
                            </div>
                            <p className={`text-[8px] font-[1000] uppercase leading-tight italic ${darkMode ? 'text-green-400' : 'text-green-800'}`}>Clique no marcador da lista para alternar entre Pendente, Aceito ou Recusado.</p>
                        </div>
                    )}
                </div>

                {/* 1. ESPAÇAMENTO */}
                <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Espaçamento Vertical</label>
                    <div className={`grid grid-cols-3 gap-2 p-1.5 rounded-2xl border ${darkMode ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                        {[
                            { val: 'compact', label: 'Micro', icon: 'fa-compress' },
                            { val: 'normal', label: 'Normal', icon: 'fa-bars' },
                            { val: 'relaxed', label: 'Amplo', icon: 'fa-expand' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => onChange({ spacing: opt.val })}
                                className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all ${ls.spacing === opt.val ? (darkMode ? 'bg-zinc-800 shadow-xl text-red-500 scale-105 z-10' : 'bg-white shadow-xl text-red-600 scale-105 z-10') : (darkMode ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600')}`}
                            >
                                <i className={`fas ${opt.icon} text-lg mb-1`}></i>
                                <span className="text-[8px] font-black uppercase tracking-tighter">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. ESTILO DE LINHA / FUNDO */}
                <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Fundo dos Itens</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { val: 'none', label: 'LIMPO', icon: 'fa-square' },
                            { val: 'divided', label: 'LINHAS', icon: 'fa-grip-lines' },
                            { val: 'striped', label: 'ZEBRADO', icon: 'fa-equals' },
                            { val: 'boxed', label: 'CARDS', icon: 'fa-table-cells-large' }
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => onChange({ rowStyle: opt.val })}
                                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${ls.rowStyle === opt.val ? (darkMode ? 'bg-white text-black border-white shadow-lg scale-[1.02]' : 'bg-black text-white border-black shadow-lg scale-[1.02]') : (darkMode ? 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:bg-zinc-800' : 'bg-white border-zinc-100 text-zinc-400 hover:bg-gray-50')}`}
                            >
                                <i className={`fas ${opt.icon} text-sm ${ls.rowStyle === opt.val ? 'text-red-500' : 'opacity-30'}`}></i>
                                <span className="text-[10px] font-[1000] uppercase tracking-tight">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. COR DO MARCADOR (MAX SIZE) */}
                <div>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest text-center">Cor do Marcador</label>
                    <div className={`flex gap-3 flex-wrap justify-center p-4 rounded-[2rem] border ${darkMode ? 'bg-black border-white/5' : 'bg-zinc-50 border-zinc-100'}`}>
                        {[
                            { val: 'default', color: 'bg-zinc-900' },
                            { val: 'red', color: 'bg-red-600' },
                            { val: 'blue', color: 'bg-blue-600' },
                            { val: 'green', color: 'bg-emerald-500' },
                            { val: 'purple', color: 'bg-purple-600' },
                            { val: 'orange', color: 'bg-orange-500' },
                            { val: 'pink', color: 'bg-pink-500' }
                        ].map(c => (
                            <button
                                key={c.val}
                                onClick={() => onChange({ markerColor: c.val })}
                                className={`w-10 h-10 rounded-full ${c.color} transition-all border-4 ${ls.markerColor === c.val ? (darkMode ? 'border-red-600 ring-4 ring-red-500/20 scale-125 shadow-2xl z-20' : 'border-white ring-4 ring-zinc-300 scale-125 shadow-2xl z-20') : 'border-transparent opacity-40 hover:opacity-100'}`}
                                title={c.val.toUpperCase()}
                            />
                        ))}
                    </div>
                </div>

                {/* 4. CONFIGURAÇÕES FINAIS */}
                <div className={`grid grid-cols-2 gap-4 border-t pt-6 ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Tamanho</label>
                        <div className={`flex p-1 rounded-xl ${darkMode ? 'bg-black' : 'bg-gray-100'}`}>
                            {['sm', 'normal', 'lg'].map(size => (
                                <button key={size} onClick={() => onChange({ fontSize: size })} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${ls.fontSize === size ? (darkMode ? 'bg-zinc-800 shadow-sm text-white' : 'bg-white shadow-sm text-zinc-900') : 'text-zinc-500'}`}>
                                    {size === 'sm' ? 'P' : size === 'normal' ? 'M' : 'G'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest text-center">Destaque</label>
                        <button
                            onClick={() => onChange({ weight: ls.weight === 'bold' ? 'normal' : 'bold' })}
                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 font-black text-[10px] uppercase transition-all ${ls.weight === 'bold' ? 'bg-red-600 text-white border-red-600 shadow-lg' : (darkMode ? 'bg-transparent text-zinc-600 border-white/5' : 'bg-white text-gray-400 border-zinc-100')}`}
                        >
                            <i className="fas fa-bold"></i> NEGRITO
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
