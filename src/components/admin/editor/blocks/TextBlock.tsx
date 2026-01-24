// Version: 1.108 - Menu rico com abas via React Portal (corrigido overflow:hidden)
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { TextBlockProps, normalizeTextBlockData } from './textblock/index';
import { applyGlobalStyles } from './textblock/render/applyGlobalStyles';
import { renderTextMode } from './textblock/render/TextModeRenderBlock';
import { storeLocalFile } from '../../../../services/storage/localStorageService';
import { TEXT_BLOCK_STYLES } from './textblock/TextBlockStyles';
import { RichTextToolbar } from './textblock/RichTextToolbar';

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
    }, [block.id, block.content, isList, variant]);

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

            {/* MOBILE FORMATTING TOOLBAR */}
            {isSelected && isMobileFormattingOpen && (
                <div className="fixed bottom-[88px] left-4 right-4 z-[1900] animate-slideUp">
                    <RichTextToolbar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleMenuAction={handleMenuAction}
                        execCommand={execCommand}
                        insertLink={insertLink}
                        onToggleMobileFormatting={onToggleMobileFormatting}
                    />
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

            {/* CONTEXT MENU */}
            {contextMenu && ReactDOM.createPortal(
                <div
                    className="fixed z-[99999]"
                    style={{
                        top: Math.min(contextMenu.y, window.innerHeight - 450),
                        left: Math.min(contextMenu.x, window.innerWidth - 380)
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <RichTextToolbar
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleMenuAction={handleMenuAction}
                        execCommand={execCommand}
                        insertLink={insertLink}
                        onToggleMobileFormatting={() => setContextMenu(null)}
                    />
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

            <style>{TEXT_BLOCK_STYLES}</style>
        </div>
    );
};

export default TextBlock;
