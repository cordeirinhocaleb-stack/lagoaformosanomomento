
import React, { useState, useEffect } from 'react';
import { ContentBlock, SocialDistribution } from '../../types';

interface InspectorSidebarProps {
  block: ContentBlock | null;
  onUpdate: (updatedBlock: ContentBlock) => void;
  onClose: () => void;
  newsMetadata: {
    slug: string;
    setSlug: (s: string) => void;
    category: string;
    setCategory: (c: string) => void;
    title: string;
    lead: string;
    socialCaptions: SocialDistribution[];
    setSocialCaptions: (d: SocialDistribution[]) => void;
  };
}

const ICON_LIBRARY = [
    'fa-bolt-lightning', 'fa-fire-flame-curved', 'fa-star', 'fa-square-poll-vertical', 'fa-face-smile', 
    'fa-brain', 'fa-heart', 'fa-bullhorn', 'fa-newspaper', 'fa-camera', 'fa-video', 'fa-microphone',
    'fa-shield-halved', 'fa-wheat-awn', 'fa-building-columns', 'fa-trophy', 'fa-masks-theater'
];

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ block, onUpdate, onClose, newsMetadata }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'news'>('content');

  const updateSettings = (newSettings: any) => {
    if (!block) return;
    onUpdate({ ...block, settings: { ...block.settings, ...newSettings } });
  };

  const updateContent = (newContent: any) => {
    if (!block) return;
    onUpdate({
        ...block,
        content: typeof block.content === 'object' ? { ...block.content, ...newContent } : newContent
    });
  };

  const handleOptionEdit = (idx: number, field: string, value: any) => {
      if (!block || !block.content.options) return;
      const newOptions = [...block.content.options];
      newOptions[idx] = { ...newOptions[idx], [field]: value };
      updateContent({ options: newOptions });
  };

  const addOption = () => {
      if (!block) return;
      const newId = Math.random().toString(36).substr(2, 5);
      const newOptions = [...(block.content.options || []), { id: newId, label: 'Nova Opção', votes: 0 }];
      updateContent({ options: newOptions });
  };

  if (!block && activeTab !== 'news') {
    return (
        <aside className="w-full lg:w-96 bg-white border-l border-zinc-200 flex flex-col shadow-2xl h-full animate-fadeIn">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                <button onClick={() => setActiveTab('news')} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                    Configurações da Notícia
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                <i className="fas fa-hand-pointer text-5xl mb-6"></i>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Selecione um bloco no centro para editar</p>
            </div>
        </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-zinc-200 flex flex-col shadow-2xl h-full overflow-hidden">
      <div className="flex border-b border-zinc-100 bg-zinc-50 flex-shrink-0">
        {[
            { id: 'content', label: 'Dados', icon: 'fa-pen' },
            { id: 'design', label: 'Estilos', icon: 'fa-palette' },
            { id: 'news', label: 'Notícia', icon: 'fa-gear' }
        ].map(t => (
            <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)} 
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === t.id ? 'bg-white text-red-600 border-red-600' : 'text-zinc-400 border-transparent hover:text-zinc-900'}`}
            >
                <i className={`fas ${t.icon} text-xs`}></i>
                <span className="text-[8px] font-black uppercase tracking-tighter">{t.label}</span>
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-32">
        {activeTab === 'content' && block && (
            <div className="space-y-6 animate-fadeIn">
                <header className="pb-4 border-b border-zinc-100">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 tracking-widest">Painel de Conteúdo</h4>
                </header>

                {block.type === 'engagement' ? (
                    <div className="space-y-6">
                        <div>
                            <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Pergunta Principal</label>
                            <textarea value={block.content.question || ''} onChange={(e) => updateContent({ question: e.target.value })} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-sm font-bold resize-none h-24 focus:border-red-600 outline-none" />
                        </div>

                        {/* CONFIG ESPECÍFICA POR TIPO */}
                        {block.settings.engagementType === 'battle' || block.settings.engagementType === 'visual_vote' ? (
                            <div className="space-y-4">
                                {['A', 'B'].map(side => (
                                    <div key={side} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Lado {side}</label>
                                        <input type="text" value={block.content[`option${side}`]?.label || block.content[`label${side}`] || ''} onChange={(e) => updateContent({ [`option${side}`]: { ...block.content[`option${side}`], label: e.target.value } })} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs font-bold mb-2" placeholder="Nome" />
                                        <input type="text" value={block.content[`option${side}`]?.imageUrl || ''} onChange={(e) => updateContent({ [`option${side}`]: { ...block.content[`option${side}`], imageUrl: e.target.value } })} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-[10px]" placeholder="URL da Imagem" />
                                    </div>
                                ))}
                            </div>
                        ) : block.settings.engagementType === 'prediction' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-2 block">Time Casa</label>
                                    <input type="text" value={block.content.teamA || ''} onChange={(e) => updateContent({ teamA: e.target.value })} className="w-full bg-white border border-zinc-200 rounded p-2 text-xs font-bold" />
                                </div>
                                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-2 block">Time Fora</label>
                                    <input type="text" value={block.content.teamB || ''} onChange={(e) => updateContent({ teamB: e.target.value })} className="w-full bg-white border border-zinc-200 rounded p-2 text-xs font-bold" />
                                </div>
                            </div>
                        ) : block.settings.engagementType === 'impact_ask' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-2 block">Texto Sim</label>
                                    <input type="text" value={block.content.labelYes || ''} onChange={(e) => updateContent({ labelYes: e.target.value })} className="w-full bg-white border border-zinc-200 rounded p-2 text-xs font-bold" />
                                </div>
                                <div>
                                    <label className="text-[8px] font-black uppercase text-zinc-400 mb-2 block">Texto Não</label>
                                    <input type="text" value={block.content.labelNo || ''} onChange={(e) => updateContent({ labelNo: e.target.value })} className="w-full bg-white border border-zinc-200 rounded p-2 text-xs font-bold" />
                                </div>
                            </div>
                        ) : block.content.options && (
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-zinc-400 block">Opções da Lista</label>
                                {block.content.options.map((opt: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                        <div className="flex gap-2">
                                            {opt.emoji !== undefined && (
                                                <input type="text" value={opt.emoji} onChange={(e) => handleOptionEdit(i, 'emoji', e.target.value)} className="w-12 bg-white border border-zinc-200 rounded-lg text-center" />
                                            )}
                                            <input type="text" value={opt.label || ''} onChange={(e) => handleOptionEdit(i, 'label', e.target.value)} className="flex-1 bg-white border border-zinc-200 rounded-lg p-2 text-xs font-bold" />
                                        </div>
                                        {block.settings.engagementType === 'quiz' && (
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={opt.isCorrect} onChange={(e) => handleOptionEdit(i, 'isCorrect', e.target.checked)} className="accent-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-zinc-400">Resposta Correta</span>
                                            </label>
                                        )}
                                    </div>
                                ))}
                                <button onClick={addOption} className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:bg-zinc-50">+ Adicionar Opção</button>
                            </div>
                        )}
                    </div>
                ) : ['paragraph', 'heading', 'quote'].includes(block.type) && (
                    <div>
                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Texto</label>
                        <textarea value={block.content} onChange={(e) => updateContent(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm font-medium h-48 focus:border-red-600 outline-none" />
                    </div>
                )}
            </div>
        )}

        {activeTab === 'design' && block && (
            <div className="space-y-8 animate-fadeIn">
                <section>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block">Personalização Visual</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Cor de Destaque</label>
                            <input type="color" value={block.settings.accentColor || '#dc2626'} onChange={(e) => updateSettings({ accentColor: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
                        </div>
                        <div>
                            <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Arredondamento</label>
                            <select value={block.settings.borderRadius || '3xl'} onChange={(e) => updateSettings({ borderRadius: e.target.value })} className="w-full h-10 bg-zinc-50 border rounded-lg text-[10px] font-black uppercase px-2">
                                <option value="md">Médio</option>
                                <option value="xl">Grande</option>
                                <option value="3xl">Extra (Jornal)</option>
                                <option value="full">Cápsula</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block">Ícone do Módulo</label>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                        {ICON_LIBRARY.map(icon => (
                            <button key={icon} onClick={() => updateSettings({ customIcon: icon })} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${block.settings.customIcon === icon ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-300 hover:text-zinc-900'}`}>
                                <i className={`fas ${icon} text-xs`}></i>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        )}

        {activeTab === 'news' && (
            <div className="space-y-6 animate-fadeIn">
                <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase mb-1 block">Editoria</label>
                    <select value={newsMetadata.category} onChange={e => newsMetadata.setCategory(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded-xl text-[10px] font-black uppercase">
                        {['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase mb-1 block">SEO Slug</label>
                    <input type="text" value={newsMetadata.slug} onChange={e => newsMetadata.setSlug(e.target.value)} className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded-xl text-[10px] font-bold text-blue-600" />
                </div>
            </div>
        )}
      </div>

      <div className="p-6 bg-zinc-50 border-t border-zinc-100">
        <button onClick={onClose} className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-red-600 transition-all">Salvar Alterações</button>
      </div>
    </aside>
  );
};

export default InspectorSidebar;
