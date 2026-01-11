// Version: 1.108 - Menu rico com abas via React Portal (corrigido overflow:hidden)
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { TextBlockProps, normalizeTextBlockData } from './textblock/index';
import { applyGlobalStyles } from './textblock/render/applyGlobalStyles';
import { renderTextMode } from './textblock/render/renderTextMode';
import { storeLocalFile } from '../../../../services/storage/localStorageService';

const TextBlock: React.FC<TextBlockProps> = ({ block, isSelected, onUpdate, onSelect, isMobileFormattingOpen, onToggleMobileFormatting }) => {
    const contentRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isList = block.type === 'list';
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'style' | 'color' | 'layout'>('style');

    const { editorial, variant, perStyle, listType } = normalizeTextBlockData(block);
    const { style: globalStyles } = applyGlobalStyles(editorial.global);

    useEffect(() => {
        if (contentRef.current) {
            const currentHTML = contentRef.current.innerHTML;
            const savedContent = block.content || (isList ? '<li></li>' : '');

            if (currentHTML !== savedContent || contentRef.current.dataset.blockId !== block.id) {
                contentRef.current.innerHTML = savedContent;
                contentRef.current.dataset.blockId = block.id;
            }
        }
    }, [block.id, isList, variant]);

    // Fechar menu de contexto ao clicar fora
    useEffect(() => {
        const handleClickOutside = () => {
            if (contextMenu) { setContextMenu(null); }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [contextMenu]);



    // Handler para Upload de Imagem no Texto (Paste/Drop)
    const handleImageUpload = async (file: File) => {
        try {
            const localId = await storeLocalFile(file);
            // Cria URL local temporária para exibir imediatamente
            const previewUrl = URL.createObjectURL(file);

            // Inserir imagem no cursor
            if (contentRef.current) {
                contentRef.current.focus();
                // Executa comando para inserir imagem com data-local-id para sync posterior
                const imgHtml = `<img src="${previewUrl}" data-local-id="${localId}" class="max-w-full rounded-lg my-4 shadow-sm" alt="Imagem inserida" />`;
                document.execCommand('insertHTML', false, imgHtml);
                handleInput();
            }
        } catch (error) {
            console.error("Erro ao inserir imagem no texto:", error);
            alert("Erro ao colar imagem. Tente novamente.");
        }
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) { handleImageUpload(file); }
                return;
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.indexOf('image') !== -1) {
            handleImageUpload(files[0]);
        }
    };

    const handleInput = () => {
        if (contentRef.current) {
            onUpdate(contentRef.current.innerHTML);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const execCommand = (command: string, value?: string) => {
        if (contentRef.current) {
            contentRef.current.focus();
            document.execCommand(command, false, value);
            handleInput();
        }
    };

    const insertLink = () => {
        const url = prompt("Digite a URL para o link:", "https://");
        if (url) { execCommand('createLink', url); }
    };

    // Handler unificado para ações do menu
    const handleMenuAction = (action: string, value?: string) => {
        setContextMenu(null);

        switch (action) {
            case 'openInspector':
                // Abre o inspetor/sidebar de propriedades
                onSelect();
                break;
            case 'format':
                execCommand(value || '');
                break;
            case 'fontName':
                execCommand('fontName', value);
                break;
            case 'fontSize':
                execCommand('fontSize', value);
                break;
            case 'hiliteColor': // Marca Texto / Watermark
                execCommand('hiliteColor', value);
                break;
            case 'foreColor':
                execCommand('foreColor', value);
                break;
            case 'link':
                insertLink();
                break;
            case 'align':
                execCommand('justify' + (value === 'justify' ? 'Full' : (value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Left')));
                break;
            case 'delete':
                if (confirm("Deseja limpar o conteúdo deste bloco?")) {
                    if (contentRef.current) { contentRef.current.innerHTML = ""; }
                    handleInput();
                }
                break;
            case 'triggerImage':
                triggerImageUpload();
                break;
            default:
                execCommand(action, value);
                break;
        }
    };

    const addNewItem = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (contentRef.current && isList) {
            const currentHTML = contentRef.current.innerHTML;
            contentRef.current.innerHTML = currentHTML + '<li>Novo item...</li>';
            onUpdate(contentRef.current.innerHTML);
            setTimeout(() => {
                if (contentRef.current) {
                    contentRef.current.focus();
                    // Move cursor to end logic here if needed
                }
            }, 10);
        }
    };

    const Tag = isList ? (listType === 'ordered' ? 'ol' : 'ul') : 'div';

    // Botão Auxiliar de Menu Mobile
    const MobileToolBtn = ({ icon, label, action, val, activeColor, tooltip }: any) => (
        <button
            onClick={(e) => { e.stopPropagation(); action === 'link' ? insertLink() : handleMenuAction(action, val); }}
            className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-11 rounded-xl transition-all border border-zinc-800 hover:border-zinc-600 active:scale-95 group relative ${activeColor ? activeColor : 'bg-zinc-800 text-white'}`}
            title={tooltip || label}
        >
            <i className={`fas ${icon} text-sm mb-0.5`}></i>
            <span className="text-[6px] font-black uppercase tracking-wider opacity-60">{label}</span>
        </button>
    );

    return (
        <div
            onContextMenu={handleContextMenu}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
                setTimeout(() => { if (contentRef.current) { contentRef.current.focus(); } }, 50);
            }}
            className={`relative group/text cursor-text py-4 px-2 transition-all duration-200 min-h-[3rem] text-zinc-900 ${isSelected ? '' : 'hover:bg-zinc-50/50 rounded-xl'}`}
            role="article"
            aria-selected={isSelected}
        >

            {/* MOBILE FORMATTING TOOLBAR - EXPANDIDA E ORGANIZADA */}
            {isSelected && isMobileFormattingOpen && (
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
            )}

            <div className="w-full relative z-10">
                {renderTextMode(variant, perStyle, globalStyles, Tag, contentRef, handleInput, block.settings)}
            </div>

            {isList && isSelected && (
                <div className="mt-4 flex justify-start animate-fadeIn relative z-20">
                    <button
                        onClick={addNewItem}
                        className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all shadow-lg active:scale-95"
                    >
                        <i className="fas fa-plus text-[10px]"></i> Item
                    </button>
                </div>
            )}

            {/* Menu de Contexto Rico (Desktop e Mobile) - Renderizado via Portal */}
            {contextMenu && ReactDOM.createPortal(
                <div
                    className="fixed z-[99999]"
                    style={{
                        top: Math.min(contextMenu.y, window.innerHeight - 450),
                        left: Math.min(contextMenu.x, window.innerWidth - 380)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-[#0f0f0f] rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col w-[360px]">

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
                            <button onClick={(e) => { e.stopPropagation(); setContextMenu(null); }} className="px-4 text-zinc-500 hover:text-red-500 border-l border-white/10">
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
                </div>,
                document.body
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
                style={{ display: 'none' }}
            />

            <style>{`
          /* GLOBAL LIST STYLES */
          [role="article"] ul { list-style-type: disc !important; padding-left: 1.5rem !important; display: block !important; margin: 10px 0; }
          [role="article"] ol { list-style-type: decimal !important; padding-left: 1.5rem !important; display: block !important; margin: 10px 0; }
          [role="article"] li { display: list-item !important; margin-bottom: 0.6rem; outline: none; min-height: 1.2em; text-align: left; }
          
          /* Estilos de Espaçamento */
          .list-spacing-compact li { margin-bottom: 0.2rem !important; }
          .list-spacing-normal li { margin-bottom: 0.6rem !important; }
          .list-spacing-relaxed li { margin-bottom: 1.2rem !important; }

          /* Estilos de Tamanho */
          .list-size-sm li { font-size: 0.875rem !important; }
          .list-size-normal li { font-size: 1rem !important; }
          .list-size-lg li { font-size: 1.25rem !important; }

          /* Cores de Marcadores (Bullets/Numbers) */
          .list-marker-red li::marker { color: #dc2626 !important; }
          .list-marker-blue li::marker { color: #2563eb !important; }
          .list-marker-green li::marker { color: #10b981 !important; }
          .list-marker-purple li::marker { color: #9333ea !important; }
          .list-marker-orange li::marker { color: #f97316 !important; }
          .list-marker-pink li::marker { color: #ec4899 !important; }
          .list-marker-default li::marker { color: inherit !important; }

          /* ROW STYLES (NOVO) */
          .list-row-divided li { border-bottom: 1px solid #f4f4f5; padding-bottom: 0.5em; padding-top: 0.5em; }
          .list-row-divided li:last-child { border-bottom: none; }
          
          .list-row-striped li:nth-child(odd) { background-color: #f9fafb; padding: 0.5em; border-radius: 6px; }
          .list-row-striped li { padding-left: 0.5em; padding-right: 0.5em; }
          
          .list-row-boxed li { background-color: #f9fafb; padding: 0.75em; border: 1px solid #f4f4f5; border-radius: 8px; margin-bottom: 0.5em !important; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }

          /* Variantes Específicas */
          .list-bullets-square li { list-style-type: square !important; }
          
          /* Numbered Steps Customizados */
          .list-numbered-steps ol { list-style-type: none !important; counter-reset: lfnm-step; padding-left: 0 !important; }
          .list-numbered-steps li { 
              counter-increment: lfnm-step; 
              position: relative; 
              padding-left: 3rem !important; 
              list-style-type: none !important;
              display: block !important;
          }
          
          .list-numbered-steps li::before { 
            content: counter(lfnm-step); 
            position: absolute; left: 0; top: 0; 
            width: 1.8rem; height: 1.8rem; 
            background: #000; color: #fff; 
            border-radius: 50%; display: flex; 
            align-items: center; justify-content: center; 
            font-size: 10px; font-weight: 900; 
            z-index: 10;
          }

          .list-numbered-steps.marker-style-outline li::before {
              background: transparent !important;
              border: 2px solid #000;
              color: #000;
          }

          .list-numbered-steps.marker-style-simple li::before {
              background: transparent !important;
              border: none;
              color: #000;
              font-size: 14px;
              width: auto;
              justify-content: flex-start;
              content: counter(lfnm-step) ".";
          }
          
          /* Steps com Cores Override */
          .list-marker-red.list-numbered-steps li::before { background: #dc2626; border-color: #dc2626; color: #fff; }
          .list-marker-red.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #dc2626; }
          .list-marker-red.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #dc2626; }

          .list-marker-blue.list-numbered-steps li::before { background: #2563eb; border-color: #2563eb; color: #fff; }
          .list-marker-blue.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #2563eb; }
          .list-marker-blue.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #2563eb; }

          .list-marker-green.list-numbered-steps li::before { background: #10b981; border-color: #10b981; color: #fff; }
          .list-marker-green.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #10b981; }
          .list-marker-green.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #10b981; }

          .list-marker-purple.list-numbered-steps li::before { background: #9333ea; border-color: #9333ea; color: #fff; }
          .list-marker-purple.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #9333ea; }
          .list-marker-purple.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #9333ea; }

          .list-marker-orange.list-numbered-steps li::before { background: #f97316; border-color: #f97316; color: #fff; }
          .list-marker-orange.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #f97316; }
          .list-marker-orange.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #f97316; }

          .list-marker-pink.list-numbered-steps li::before { background: #ec4899; border-color: #ec4899; color: #fff; }
          .list-marker-pink.list-numbered-steps.marker-style-outline li::before { background: transparent; color: #ec4899; }
          .list-marker-pink.list-numbered-steps.marker-style-simple li::before { background: transparent; color: #ec4899; }

          [contenteditable="true"]:empty:before { content: attr(data-placeholder); color: #cbd5e1; pointer-events: none; }
      `}</style>
        </div>
    );
};

export default TextBlock;
