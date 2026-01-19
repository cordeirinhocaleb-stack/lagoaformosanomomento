import React, { useState } from 'react';

interface MobileFormattingToolbarProps {
    isSelected: boolean;
    isMobileFormattingOpen: boolean | undefined;
    onToggleMobileFormatting: ((isOpen: boolean) => void) | undefined;
    execCommand: (command: string, value?: string) => void;
    insertLink: () => void;
    triggerImageUpload?: () => void;
}

export const MobileFormattingToolbar: React.FC<MobileFormattingToolbarProps> = ({
    isSelected,
    isMobileFormattingOpen,
    onToggleMobileFormatting,
    execCommand,
    insertLink,
    triggerImageUpload
}) => {
    const [activeTab, setActiveTab] = useState<'style' | 'color' | 'layout'>('style');

    if (!isSelected || !isMobileFormattingOpen) return null;

    const MobileToolBtn = ({ icon, label, action, val, activeColor, tooltip }: { icon: string; label: string; action: () => void; val?: string | boolean; activeColor?: string; tooltip?: string }) => (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (action === 'link') insertLink();
                else if (action === 'triggerImage' && triggerImageUpload) triggerImageUpload();
                else execCommand(action, val);
            }}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-11 rounded-xl transition-all border border-zinc-800 hover:border-zinc-600 active:scale-95 group relative ${activeColor ? activeColor : 'bg-zinc-800 text-white'}`}
            title={tooltip || label}
        >
            <i className={`fas ${icon} text-sm mb-0.5`}></i>
            <span className="text-[6px] font-black uppercase tracking-wider opacity-60">{label}</span>
        </button>
    );

    return (
        <div className="fixed bottom-[88px] left-4 right-4 z-[1900] animate-slideUp">
            <div className="bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">

                {/* Abas de Navegação do Menu */}
                <div className="flex border-b border-white/10 bg-black/40">
                    <button onClick={(e) => { e.stopPropagation(); setActiveTab('style') }} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'style' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <i className="fas fa-font mr-1"></i> Estilo
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setActiveTab('color') }} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'color' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <i className="fas fa-palette mr-1"></i> Cores
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setActiveTab('layout') }} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest ${activeTab === 'layout' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        <i className="fas fa-align-left mr-1"></i> Layout
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onToggleMobileFormatting && onToggleMobileFormatting(false); }} className="px-4 text-zinc-500 hover:text-red-500 border-l border-white/10">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Conteúdo das Abas */}
                <div className="p-3 bg-zinc-900">

                    {/* ABA 1: ESTILO E TIPOGRAFIA */}
                    {activeTab === 'style' && (
                        <div className="space-y-3">
                            {/* Fontes Jornalísticas */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                <button onClick={(e) => { e.stopPropagation(); execCommand('fontName', 'Merriweather') }} className="px-3 py-2 bg-zinc-800 rounded-lg text-white font-serif text-xs border border-zinc-700 whitespace-nowrap active:bg-zinc-700">Serifa (Jornal)</button>
                                <button onClick={(e) => { e.stopPropagation(); execCommand('fontName', 'Inter') }} className="px-3 py-2 bg-zinc-800 rounded-lg text-white font-sans text-xs border border-zinc-700 whitespace-nowrap active:bg-zinc-700">Sans (Digital)</button>
                                <button onClick={(e) => { e.stopPropagation(); execCommand('fontName', 'monospace') }} className="px-3 py-2 bg-zinc-800 rounded-lg text-white font-mono text-xs border border-zinc-700 whitespace-nowrap active:bg-zinc-700">Mono (Tech)</button>
                            </div>

                            <div className="h-px bg-zinc-800 w-full"></div>

                            {/* Formatação Básica + Tamanho */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                <MobileToolBtn icon="fa-bold" label="Negrito" action="bold" tooltip="Texto em Negrito" />
                                <MobileToolBtn icon="fa-italic" label="Itálico" action="italic" tooltip="Texto Itálico" />
                                <MobileToolBtn icon="fa-underline" label="Sublin." action="underline" tooltip="Sublinhar Texto" />
                                <MobileToolBtn icon="fa-strikethrough" label="Riscado" action="strikeThrough" tooltip="Riscar Texto" />

                                <div className="w-px bg-zinc-800 mx-1"></div>

                                <MobileToolBtn icon="fa-text-height" label="Pequeno" action="fontSize" val="2" />
                                <MobileToolBtn icon="fa-text-height" label="Normal" action="fontSize" val="3" />
                                <MobileToolBtn icon="fa-heading" label="Grande" action="fontSize" val="5" />
                                <MobileToolBtn icon="fa-heading" label="Manchete" action="fontSize" val="7" />
                            </div>
                        </div>
                    )}

                    {/* ABA 2: CORES E MARCA TEXTO */}
                    {activeTab === 'color' && (
                        <div className="space-y-3">
                            {/* Cor do Texto */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                                <span className="text-[8px] font-black uppercase text-zinc-500 w-10 shrink-0">Texto</span>
                                {['#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'].map(c => (
                                    <button key={c} onClick={(e) => { e.stopPropagation(); execCommand('foreColor', c); }} className="w-8 h-8 rounded-full border-2 border-zinc-700 shrink-0 shadow-sm active:scale-90 transition-transform" style={{ backgroundColor: c }} title={`Texto: ${c}`} />
                                ))}
                            </div>

                            <div className="h-px bg-zinc-800 w-full"></div>

                            {/* Marca Texto / Watermark */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                                <span className="text-[8px] font-black uppercase text-zinc-500 w-10 shrink-0">Fundo</span>
                                <button onClick={(e) => { e.stopPropagation(); execCommand('hiliteColor', 'transparent'); }} className="w-8 h-8 rounded border border-zinc-600 bg-transparent text-red-500 flex items-center justify-center shrink-0 active:scale-90"><i className="fas fa-ban text-xs"></i></button>
                                {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa', '#e9d5ff', '#1f2937'].map(c => (
                                    <button key={c} onClick={(e) => { e.stopPropagation(); execCommand('hiliteColor', c); }} className="w-8 h-8 rounded border border-zinc-700 shrink-0 shadow-sm active:scale-90 transition-transform" style={{ backgroundColor: c }} title="Marca Texto" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ABA 3: LAYOUT E INSERÇÕES */}
                    {activeTab === 'layout' && (
                        <div className="space-y-3">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                <MobileToolBtn icon="fa-align-left" label="Esq" action="justifyLeft" />
                                <MobileToolBtn icon="fa-align-center" label="Centro" action="justifyCenter" />
                                <MobileToolBtn icon="fa-align-right" label="Dir" action="justifyRight" />
                                <MobileToolBtn icon="fa-align-justify" label="Justif." action="justifyFull" />

                                <div className="w-px bg-zinc-800 mx-1"></div>

                                <MobileToolBtn icon="fa-list-ul" label="Lista" action="insertUnorderedList" />
                                <MobileToolBtn icon="fa-list-ol" label="Num." action="insertOrderedList" />

                                <div className="w-px bg-zinc-800 mx-1"></div>

                                {/* Botão de Upload de Imagem */}
                                <MobileToolBtn icon="fa-image" label="Imagem" action="triggerImage" activeColor="text-green-400 border-green-900 bg-green-900/20" />
                            </div>

                            <div className="h-px bg-zinc-800 w-full"></div>

                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                <MobileToolBtn icon="fa-link" label="Link" action="link" activeColor="text-blue-400 border-blue-900 bg-blue-900/20" />
                                <MobileToolBtn icon="fa-quote-right" label="Citação" action="formatBlock" val="BLOCKQUOTE" activeColor="text-amber-400 border-amber-900 bg-amber-900/20" />
                                <MobileToolBtn icon="fa-eraser" label="Limpar" action="removeFormat" activeColor="text-red-400 border-red-900 bg-red-900/20" />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Seta indicativa */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-zinc-900 rotate-45 border-r border-b border-zinc-800"></div>
        </div>
    );
};
