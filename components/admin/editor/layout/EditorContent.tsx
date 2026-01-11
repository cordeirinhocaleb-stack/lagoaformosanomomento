
import React from 'react';
import { ContentBlock } from '../../../../types';
import { ToastType } from '../../../common/Toast';
import TextBlock from '../blocks/TextBlock';
import MediaBlock from '../blocks/MediaBlock';
import VideoLinkBlock from '../blocks/VideoLinkBlock';
import SeparatorBlock from '../blocks/SeparatorBlock';
import GalleryEditorBlock from '../../GalleryEditorBlock';
import EngagementEditorBlock from '../../EngagementEditorBlock';
import { SmartBlockEditor } from '../blocks/SmartBlockEditor';
import { SmartBlockRenderer } from '../blocks/SmartBlockRenderer';

interface EditorContentProps {
    blocks: ContentBlock[];
    selectedBlockId: string | null;
    isMobile: boolean;
    category: string;
    setCategory: (cat: string) => void;
    title: string;
    setTitle: (title: string) => void;
    lead: string;
    setLead: (lead: string) => void;
    isPublished: boolean;
    uploadingSlot: number | null;
    handleBlockSelect: (id: string) => void;
    handleDeleteBlock: (id: string) => void;
    handleUpdateBlock: (block: ContentBlock) => void;
    setShowInspectorMobile: (show: boolean) => void;
    setShowMobileFormatting: (show: boolean) => void;
    showMobileFormatting: boolean;
    onPublishPhone: () => void;
    accessToken: string | null;
}

const getWidthClass = (width: string) => {
    switch (width) {
        case '1/4': return 'w-full md:w-1/4';
        case '1/3': return 'w-full md:w-1/3';
        case '1/2': return 'w-full md:w-1/2';
        case '2/3': return 'w-full md:w-2/3';
        case '3/4': return 'w-full md:w-3/4';
        default: return 'w-full';
    }
};

const getBlockTypeLabel = (type: string) => {
    switch (type) {
        case 'paragraph': return 'TEXTO';
        case 'heading': return 'TÍTULO';
        case 'image': return 'IMAGEM';
        case 'video': return 'VÍDEO';
        case 'video_link': return 'VÍDEO LINK';
        case 'gallery': return 'GALERIA';
        case 'quote': return 'CITAÇÃO';
        case 'separator': return 'DIVISOR';
        case 'engagement': return 'INTERATIVO';
        case 'smart_block': return 'WIDGET';
        default: return 'BLOCO';
    }
};

const EditorContent: React.FC<EditorContentProps> = ({
    blocks, selectedBlockId, isMobile,
    category, setCategory,
    title, setTitle,
    lead, setLead,
    isPublished,
    uploadingSlot,
    handleBlockSelect, handleDeleteBlock, handleUpdateBlock,
    setShowInspectorMobile, setShowMobileFormatting, showMobileFormatting,
    onPublishPhone, accessToken
}) => {
    console.log('🚀 [EditorContent] COMPONENT LOADED - Version 1.105');
    console.log('🚀 [EditorContent] Blocks count:', blocks.length);

    return (
        <div className="p-6 md:p-16 lg:p-20" onClick={(e) => e.stopPropagation()}>
            {/* CATEGORIA E METADADOS */}
            <div className="mb-8 flex items-center gap-4">
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl outline-none hover:bg-red-700 transition-colors cursor-pointer appearance-none text-center"
                >
                    {['Cotidiano', 'Polícia', 'Política', 'Esporte', 'Agro', 'Cultura', 'Saúde', 'Regional'].map(c => (
                        <option key={c} value={c} className="text-black bg-white">{c}</option>
                    ))}
                </select>
                <div className="h-px bg-zinc-200 flex-1"></div>
                <span className="text-[9px] font-black uppercase text-zinc-300 tracking-widest">{new Date().toLocaleDateString()}</span>
            </div>

            {/* MANCHETE */}
            <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="DIGITE A MANCHETE AQUI..."
                rows={2}
                className="w-full text-3xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-zinc-900 bg-transparent border-none outline-none focus:ring-0 mb-8 md:mb-10 resize-none leading-[0.9] placeholder:text-zinc-200"
            />

            {/* LEAD */}
            <textarea
                value={lead}
                onChange={e => setLead(e.target.value)}
                placeholder="Resumo da reportagem (Lead)..."
                className="w-full text-lg md:text-2xl font-medium text-zinc-500 bg-white border-l-[6px] border-red-600 pl-6 py-2 outline-none min-h-[100px] resize-none mb-10 md:mb-14 font-serif italic placeholder:text-zinc-200 placeholder:not-italic"
            />

            {/* BLOCOS DE CONTEÚDO */}
            <div className="flex flex-wrap -mx-2 md:-mx-3">
                {blocks.map(block => (
                    <div
                        key={block.id}
                        className={`
                            transition-all duration-300
                            ${getWidthClass(block.settings.width)}
                            ${block.settings.minHeight || ''} 
                            ${block.settings.paddingY ? block.settings.paddingY.replace('py-', 'py-') : 'p-3'}
                        `}
                    >
                        <div
                            onClick={(e) => { e.stopPropagation(); handleBlockSelect(block.id); }}
                            className={`relative group/block rounded-[2rem] transition-all duration-300 h-full border-2 ${selectedBlockId === block.id ? 'shadow-2xl ring-2 ring-red-100 bg-white z-10 scale-[1.01] border-red-600' : 'bg-white border-zinc-200 border-dashed hover:border-zinc-300'}`}
                        >
                            {selectedBlockId === block.id && (
                                <>
                                    <span className="absolute -top-3 left-6 bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest z-20 shadow-md">
                                        {getBlockTypeLabel(block.type)}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} className="absolute -top-3 -right-2 z-[200] w-8 h-8 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 transition-all active:scale-90"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                </>
                            )}

                            {/* Mobile: Mostrar botão de ajustes */}
                            {selectedBlockId === block.id && isMobile && (
                                <button onClick={(e) => { e.stopPropagation(); setShowInspectorMobile(true); setShowMobileFormatting(false); }} className="absolute -bottom-3 right-6 z-[200] bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-90" title="Ajustes">
                                    <i className="fas fa-sliders-h text-[10px]"></i> <span className="text-[9px] font-black uppercase">Ajustar</span>
                                </button>
                            )}

                            {(() => {
                                console.log('[EditorContent] Rendering block type:', block.type, 'ID:', block.id);
                                switch (block.type) {
                                    case 'paragraph': case 'heading': case 'quote': case 'list':
                                        return (
                                            <TextBlock
                                                block={block}
                                                isSelected={selectedBlockId === block.id}
                                                onSelect={() => handleBlockSelect(block.id)}
                                                onUpdate={c => handleUpdateBlock({ ...block, content: c })}
                                                isMobileFormattingOpen={selectedBlockId === block.id && showMobileFormatting}
                                                onToggleMobileFormatting={setShowMobileFormatting}
                                            />
                                        );
                                    case 'image': case 'video':
                                        return <MediaBlock block={block} isSelected={selectedBlockId === block.id} isUploading={!!uploadingSlot} onSelect={() => handleBlockSelect(block.id)} />;
                                    case 'video_link':
                                        return <VideoLinkBlock block={block} isSelected={selectedBlockId === block.id} onSelect={() => handleBlockSelect(block.id)} onUpdate={(content) => handleUpdateBlock({ ...block, content })} />;
                                    case 'separator':
                                        return <SeparatorBlock block={block} isSelected={selectedBlockId === block.id} onSelect={() => handleBlockSelect(block.id)} />;
                                    case 'gallery':
                                        return <GalleryEditorBlock block={block} accessToken={accessToken} onUpdate={handleUpdateBlock} />;
                                    case 'engagement':
                                        return <EngagementEditorBlock block={block} onUpdate={handleUpdateBlock} />;
                                    case 'smart_block':
                                        console.log('[EditorContent] SMART_BLOCK CASE EXECUTING! Block:', block);
                                        return (
                                            <div className="transition-all duration-300">
                                                <SmartBlockRenderer block={block} />
                                                {selectedBlockId === block.id && (
                                                    <div className="mt-4 border-t border-dashed border-zinc-200 pt-4 animate-fadeIn">
                                                        <SmartBlockEditor block={block} onUpdate={handleUpdateBlock} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                ))}
            </div>

            {/* BOTÃO PUBLICAR MOBILE */}
            <div className="md:hidden mt-12 pb-8 border-t border-zinc-100 pt-8">
                <button
                    onClick={onPublishPhone}
                    className="w-full bg-red-600 text-white py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <i className="fas fa-paper-plane"></i> {isPublished ? 'Atualizar Matéria' : 'Publicar Reportagem'}
                </button>
            </div>
        </div>
    );
};

export default EditorContent;
