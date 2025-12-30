
import React, { useState } from 'react';
import { User, NewsItem, ContentBlock } from '../../types';
import EditorSidebar from './editor/layout/EditorSidebar';
import InspectorSidebar from './editor/layout/InspectorSidebar';
import TextBlock from './editor/blocks/TextBlock';
import MediaBlock from './editor/blocks/MediaBlock';
import TableBlock from './editor/blocks/TableBlock';
import CTABlock from './editor/blocks/CTABlock';
import RelatedBlock from './editor/blocks/RelatedBlock';
import Logo from '../common/Logo';

interface EditorTabProps {
  user: User;
  initialData: NewsItem | null;
  onSave: (news: NewsItem, isUpdate: boolean) => void;
  onCancel: () => void;
}

const EditorTab: React.FC<EditorTabProps> = ({ user, initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [lead, setLead] = useState(initialData?.lead || '');
  const [category, setCategory] = useState(initialData?.category || 'Cotidiano');
  const [slug, setSlug] = useState(initialData?.seo?.slug || '');
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialData?.blocks || [
    { id: 'b1', type: 'paragraph', content: '', settings: { editorialStyle: 'newspaper_standard', alignment: 'left', width: 'full' } }
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleAddBlock = (type: ContentBlock['type'], content?: any, settings?: any) => {
    const id = Math.random().toString(36).substr(2,9);
    const newBlock: ContentBlock = { id, type, content: content || '', settings: { alignment: 'left', width: 'full', ...settings } };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
  };

  const handlePublish = () => {
    const newsData: NewsItem = {
      id: initialData?.id || Math.random().toString(36).substr(2,9),
      title, lead, category, blocks, status: 'published',
      author: user.name, authorId: user.id, createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(), imageUrl: blocks.find(b => b.type === 'image')?.content || '',
      mediaType: 'image', bannerMediaType: 'image', city: 'Lagoa Formosa', region: 'Região',
      isBreaking: false, isFeatured: false, featuredPriority: 0,
      seo: { slug, metaTitle: title, metaDescription: lead }, source: 'site'
    };
    onSave(newsData, !!initialData);
  };

  const renderBlockEditor = (block: ContentBlock) => {
      const isSelected = selectedBlockId === block.id;
      const onSelect = () => setSelectedBlockId(block.id);
      const onUpdate = (c: any) => setBlocks(blocks.map(b => b.id === block.id ? {...b, content: c} : b));

      switch(block.type) {
          case 'paragraph': case 'heading': case 'quote': case 'list':
              return <TextBlock block={block} isSelected={isSelected} onSelect={onSelect} onUpdate={onUpdate} />;
          case 'table':
              return <TableBlock block={block} isSelected={isSelected} onSelect={onSelect} onUpdate={onUpdate} />;
          case 'cta':
              return <CTABlock block={block} isSelected={isSelected} onSelect={onSelect} onUpdate={onUpdate} />;
          case 'related':
              return <RelatedBlock block={block} isSelected={isSelected} onSelect={onSelect} onUpdate={onUpdate} />;
          case 'separator':
              return <div onClick={onSelect} className={`py-12 flex items-center gap-4 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}><div className="h-px flex-1 bg-zinc-100"></div><Logo className="w-6 h-6 opacity-10"/><div className="h-px flex-1 bg-zinc-100"></div></div>;
          default:
              return <MediaBlock block={block} isSelected={isSelected} onSelect={onSelect} />;
      }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-zinc-100 animate-fadeIn" onClick={() => setSelectedBlockId(null)}>
      <EditorSidebar onAddBlock={handleAddBlock} isUploading={false} />

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="bg-white/95 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] shadow-sm">
            <div className="flex items-center gap-5 cursor-pointer group" onClick={onCancel}>
                <div className="w-10 h-10 flex-none group-hover:scale-110 transition-transform"><Logo /></div>
                <div className="hidden sm:flex flex-col">
                    <span className="text-[11px] font-black uppercase text-zinc-900 leading-none">ESTÚDIO LFNM</span>
                    <span className="text-[7px] font-bold text-red-600 uppercase tracking-widest mt-1">SISTEMA NO-CODE</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={onCancel} className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase text-zinc-400 hover:bg-zinc-100">Sair</button>
                <button onClick={handlePublish} className="bg-red-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:bg-black transition-all">Publicar Agora</button>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-20 custom-scrollbar bg-zinc-100">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl border border-zinc-100 min-h-full transition-all flex flex-col overflow-hidden">
                <div className="p-10 md:p-24">
                    <input 
                        type="text" value={title} onChange={e => setTitle(e.target.value)} 
                        placeholder="Manchete Principal..." 
                        className="w-full text-4xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-zinc-900 bg-transparent border-none outline-none mb-12" 
                    />
                    <textarea 
                        value={lead} onChange={e => setLead(e.target.value)} 
                        placeholder="Resumo editorial..." 
                        className="w-full text-lg md:text-2xl font-medium text-zinc-400 bg-zinc-50 border-l-8 border-red-600 rounded-r-3xl p-10 outline-none min-h-[140px] resize-none mb-14" 
                    />
                    
                    <div className="space-y-6">
                        {blocks.map(block => (
                            <div key={block.id} className={`${block.settings.width === '1/2' ? 'w-1/2 inline-block p-2' : 'w-full'}`}>
                                <div onClick={e => e.stopPropagation()}>
                                    {renderBlockEditor(block)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <InspectorSidebar 
        block={blocks.find(b => b.id === selectedBlockId) || null} 
        onUpdate={u => setBlocks(blocks.map(b => b.id === u.id ? u : b))}
        onClose={() => setSelectedBlockId(null)}
        newsMetadata={{ slug, setSlug, category, setCategory }}
      />
    </div>
  );
};

export default EditorTab;
