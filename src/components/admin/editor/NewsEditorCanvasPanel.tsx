
import React from 'react';
// Force Refresh 1
import { ContentBlock } from '@/types';
import TextBlock from './blocks/TextBlock';
import MediaBlock from './blocks/MediaBlock';
import VideoLinkBlock from './blocks/VideoLinkBlock';
import SeparatorBlock from './blocks/SeparatorBlock';
import GalleryEditorBlock from '../GalleryEditorBlock';
import EngagementEditorBlock from '../EngagementEditorBlock';
import { SmartBlockEditor } from './blocks/SmartBlockEditor';
import { SmartBlockRenderer } from './blocks/BlockContent';
import { ImageUploadBlock } from './blocks/ImageUploadBlock';

interface EditorCanvasProps {
    user: import('../../../types').User;
    blocks: ContentBlock[];
    selectedBlockId: string | null;
    isMobile: boolean;
    uploadingSlot: number | null;
    showMobileFormatting: boolean;
    onBlockSelect: (id: string) => void;
    onDeleteBlock: (id: string) => void;
    onUpdateBlock: (updatedBlock: ContentBlock) => void;
    onShowInspectorMobile: () => void;
    setShowMobileFormatting: (value: boolean) => void;
    localFileHandler: (file: File) => Promise<string>;
    accessToken: string | null;
    onDuplicateBlock: (id: string) => void;
}

const getWidthClass = (width: string, type: string, orientation?: string) => {
    if (type === 'separator' && orientation === 'vertical') { return 'w-auto mx-2'; }

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

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
    user, blocks, selectedBlockId, isMobile, uploadingSlot, showMobileFormatting,
    onBlockSelect, onDeleteBlock, onUpdateBlock, onShowInspectorMobile, setShowMobileFormatting, localFileHandler, accessToken, onDuplicateBlock
}) => {
    return (
        <div className="flex flex-wrap -mx-2 md:-mx-3 items-stretch">
            {blocks.map(block => {
                const s = block.settings as Record<string, unknown>;
                return (
                    <div
                        key={block.id}
                        className={`
                transition-all duration-300
                ${getWidthClass(s.width, block.type, s.orientation)}
                ${s.minHeight || ''} 
                ${s.paddingY ? s.paddingY.replace('py-', 'py-') : 'p-3'}
            `}
                    >
                        <div
                            onClick={(e) => { e.stopPropagation(); onBlockSelect(block.id); }}
                            className={`relative group/block rounded-[1.5rem] md:rounded-[2rem] transition-all duration-300 h-full border-2 ${selectedBlockId === block.id ? 'shadow-2xl ring-2 ring-red-100 bg-white z-10 md:scale-[1.01] border-red-600' : 'bg-white border-zinc-200 border-dashed hover:border-zinc-300'}`}
                        >
                            {selectedBlockId === block.id && (
                                <>
                                    <span className="absolute -top-3 left-6 bg-red-600 text-white text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest z-20 shadow-md">
                                        {getBlockTypeLabel(block.type)}
                                    </span>

                                    {/* Ações do Bloco (Desktop) */}
                                    <div className="absolute -top-3 -right-2 z-[200] flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); onBlockSelect(block.id); onShowInspectorMobile(); }} className="w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-all active:scale-90" title="Editar">
                                            <i className="fas fa-pencil-alt text-[10px]"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }} className="w-8 h-8 bg-zinc-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-black transition-all active:scale-90" title="Duplicar">
                                            <i className="fas fa-copy text-[10px]"></i>
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }} className="w-8 h-8 bg-white text-red-600 border border-red-100 rounded-full shadow-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all active:scale-90" title="Excluir">
                                            <i className="fas fa-trash-alt text-[10px]"></i>
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Mobile: Mostrar botão de ajustes */}
                            {selectedBlockId === block.id && isMobile && (
                                <button onClick={(e) => { e.stopPropagation(); onShowInspectorMobile(); setShowMobileFormatting(false); }} className="absolute -bottom-3 right-6 z-[200] bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-90" title="Ajustes">
                                    <i className="fas fa-sliders-h text-[10px]"></i> <span className="text-[9px] font-black uppercase">Ajustar</span>
                                </button>
                            )}

                            {(() => {
                                switch (block.type) {
                                    case 'paragraph': case 'heading': case 'quote': case 'list':
                                        return (
                                            <TextBlock
                                                block={block}
                                                isSelected={selectedBlockId === block.id}
                                                onSelect={() => onBlockSelect(block.id)}
                                                onUpdate={c => onUpdateBlock({ ...block, content: c })}
                                                isMobileFormattingOpen={selectedBlockId === block.id && showMobileFormatting}
                                                onToggleMobileFormatting={setShowMobileFormatting}
                                            />
                                        );
                                    case 'image':
                                        return (
                                            <ImageUploadBlock
                                                data={{
                                                    url: block.content as string,
                                                    caption: s.caption,
                                                    effects: s.effects,
                                                    layout: s.layout,
                                                    background: s.background
                                                }}
                                                onUpdate={(newData: unknown) => onUpdateBlock({
                                                    ...block,
                                                    content: newData.url || block.content,
                                                    settings: {
                                                        ...block.settings,
                                                        caption: newData.caption,
                                                        effects: newData.effects,
                                                        layout: newData.layout,
                                                        background: newData.background
                                                    }
                                                })}
                                                onUpload={localFileHandler}
                                            />
                                        );
                                    case 'video':
                                        return <MediaBlock
                                            user={user}
                                            block={block}
                                            isSelected={selectedBlockId === block.id}
                                            isUploading={!!uploadingSlot}
                                            onSelect={() => onBlockSelect(block.id)}
                                            onUpdate={(content, settings, extraProps) => onUpdateBlock({
                                                ...block,
                                                content: content !== undefined ? content : block.content,
                                                settings: settings ? { ...block.settings, ...settings } : block.settings,
                                                ...extraProps
                                            })}
                                        />;
                                    case 'video_link':
                                        return <VideoLinkBlock
                                            block={block}
                                            isSelected={selectedBlockId === block.id}
                                            onSelect={() => onBlockSelect(block.id)}
                                            onUpdate={(newUrl) => onUpdateBlock({ ...block, content: newUrl })}
                                        />;
                                    case 'separator':
                                        return <SeparatorBlock block={block} isSelected={selectedBlockId === block.id} onSelect={() => onBlockSelect(block.id)} />;
                                    case 'gallery':
                                        return <GalleryEditorBlock block={block} user={user} accessToken={accessToken} onUpdate={onUpdateBlock} />;
                                    case 'engagement':
                                        return <EngagementEditorBlock block={block} onUpdate={onUpdateBlock} />;
                                    case 'smart_block':
                                        return (
                                            <div className="transition-all duration-300">
                                                {/* Always render Editor for true WYSIWYG/Inline experience */}
                                                <SmartBlockEditor block={block} onUpdate={onUpdateBlock} />
                                            </div>
                                        );
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
