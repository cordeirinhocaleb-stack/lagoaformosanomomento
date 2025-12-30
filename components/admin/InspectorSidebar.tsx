
import React, { useState } from 'react';
import { ContentBlock, SocialDistribution, GalleryStyle, VideoStyle } from '../../types';
import { uploadFileToDrive } from '../../services/driveService';
import { uploadVideoToYouTube } from '../../services/youtubeService';

interface InspectorSidebarProps {
  block: ContentBlock | null;
  onUpdate: (updatedBlock: ContentBlock) => void;
  onClose: () => void;
  accessToken?: string | null;
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

const GALLERY_STYLES: { id: GalleryStyle; label: string; icon: string }[] = [
    { id: 'hero_slider', label: 'Impact Slider', icon: 'fa-images' },
    { id: 'news_mosaic', label: 'Jornal Mosaico', icon: 'fa-th-large' },
    { id: 'masonry', label: 'Pinterest Grid', icon: 'fa-border-all' },
    { id: 'filmstrip', label: 'Tira Filme', icon: 'fa-film' },
    { id: 'comparison', label: 'Antes/Depois', icon: 'fa-arrows-left-right' },
    { id: 'stories_scroll', label: 'Insta Stories', icon: 'fa-mobile-screen' },
    { id: '3d_cube', label: 'Cubo 3D', icon: 'fa-cube' },
    { id: 'coverflow', label: 'Apple Style', icon: 'fa-layer-group' },
    { id: 'polaroid_stack', label: 'Pilha Fotos', icon: 'fa-camera-retro' },
    { id: 'honeycomb', label: 'Colmeia Pro', icon: 'fa-hexagon-nodes' },
    { id: 'ken_burns', label: 'Zoom Dinâmico', icon: 'fa-magnifying-glass-plus' },
    { id: 'magazine_spread', label: 'Revista', icon: 'fa-book-open' },
];

const VIDEO_STYLES: { id: VideoStyle; label: string; icon: string }[] = [
    { id: 'clean', label: 'Minimalista', icon: 'fa-play' },
    { id: 'cinema', label: 'Modo Cinema', icon: 'fa-clapperboard' },
    { id: 'shorts_wrapper', label: 'TikTok Layout', icon: 'fa-mobile' },
    { id: 'tv_news', label: 'Breaking News', icon: 'fa-tv' },
    { id: 'pip_floating', label: 'PiP Floating', icon: 'fa-window-restore' },
    { id: 'retro_tv', label: 'TV Vintage', icon: 'fa-television' },
];

const InspectorSidebar: React.FC<InspectorSidebarProps> = ({ block, onUpdate, onClose, accessToken, newsMetadata }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'news'>('content');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0 || !accessToken || !block) return;

    setIsUploading(true);
    try {
        if (block.type === 'gallery') {
            const uploadPromises = files.map(async (file) => {
                const url = await uploadFileToDrive(file, accessToken);
                return { id: Math.random().toString(36).substr(2, 9), url, caption: '', alt: file.name };
            });
            const newItems = await Promise.all(uploadPromises);
            const currentItems = block.content?.items || [];
            updateContent({ items: [...currentItems, ...newItems] });
        } else if (block.type === 'video') {
            const url = await uploadVideoToYouTube(files[0], accessToken);
            updateContent(url);
        }
    } catch (error) {
        alert("Erro no upload Mídia Cloud. Verifique sua conexão Google.");
    } finally {
        setIsUploading(false);
    }
  };

  if (!block && activeTab !== 'news') {
    return (
        <aside className="w-full lg:w-96 bg-white border-l border-zinc-200 flex flex-col shadow-2xl h-full animate-fadeIn">
            <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                <button onClick={() => setActiveTab('news')} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Configurações Globais
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                <i className="fas fa-sliders text-5xl mb-6"></i>
                <p className="text-xs font-black uppercase tracking-[0.2em]">Selecione um bloco para configurar</p>
            </div>
        </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 bg-white border-l border-zinc-200 flex flex-col shadow-2xl h-full overflow-hidden">
      <div className="flex border-b border-zinc-100 bg-zinc-50 flex-shrink-0">
        {[
            { id: 'content', label: 'Dados', icon: 'fa-pen-to-square' },
            { id: 'design', label: 'Estilos', icon: 'fa-palette' },
            { id: 'news', label: 'SEO', icon: 'fa-globe' }
        ].map(t => (
            <button 
                key={t.id}
                onClick={() => setActiveTab(t.id as any)} 
                className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === t.id ? 'bg-white text-blue-600 border-blue-600' : 'text-zinc-400 border-transparent hover:text-zinc-900'}`}
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
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 tracking-widest flex items-center gap-2">
                        <i className="fas fa-cube text-blue-600"></i>
                        Parâmetros do Bloco
                    </h4>
                </header>

                {/* AREA DE UPLOAD (EXCLUSIVA GALERIA E VIDEO) */}
                {(block.type === 'gallery' || block.type === 'video') && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Sincronização Cloud</label>
                            {block.type === 'gallery' && block.content?.items?.length > 0 && (
                                <button onClick={() => updateContent({ items: [] })} className="text-[7px] font-black text-red-600 uppercase">Limpar Tudo</button>
                            )}
                        </div>
                        
                        <div className="relative group">
                            <input 
                                type="file" 
                                multiple={block.type === 'gallery'} 
                                accept={block.type === 'gallery' ? "image/*" : "video/*"}
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                disabled={isUploading}
                            />
                            <div className={`w-full py-12 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all ${isUploading ? 'bg-zinc-50 border-zinc-200' : 'bg-blue-50/20 border-blue-200 group-hover:border-blue-500 group-hover:bg-blue-50'}`}>
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <i className="fas fa-circle-notch fa-spin text-blue-600 text-2xl"></i>
                                        <span className="text-[8px] font-black text-blue-600 uppercase">Cloud Sync...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg ${block.type === 'gallery' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                            <i className={`fab ${block.type === 'gallery' ? 'fa-google-drive' : 'fa-youtube'} text-xl`}></i>
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-zinc-900">{block.type === 'gallery' ? 'Subir p/ Drive' : 'Subir p/ YouTube'}</p>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Multi-upload permitido</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {block.type === 'video' && (
                            <div className="pt-2">
                                <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Link Direto (Opcional)</label>
                                <input 
                                    type="text" value={typeof block.content === 'string' ? block.content : ''} 
                                    onChange={(e) => updateContent(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-[10px] font-bold outline-none focus:border-red-600"
                                    placeholder="Cole aqui a URL do YouTube"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* SELECTOR DE ESTILOS (VITRINE DE APPS) */}
                {block.type === 'gallery' && (
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block">Layouts Disponíveis (12)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {GALLERY_STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => updateSettings({ style: style.id })}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 aspect-square ${block.settings.style === style.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-zinc-100 text-zinc-400 hover:border-blue-300 hover:text-zinc-900'}`}
                                >
                                    <i className={`fas ${style.icon} text-lg`}></i>
                                    <span className="text-[7px] font-black uppercase text-center leading-tight">{style.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {block.type === 'video' && (
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-widest block">Estilo do Player (6)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {VIDEO_STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => updateSettings({ style: style.id })}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${block.settings.style === style.id ? 'bg-red-600 border-red-600 text-white shadow-xl scale-105' : 'bg-white border-zinc-100 text-zinc-400 hover:border-red-200 hover:text-zinc-900'}`}
                                >
                                    <i className={`fas ${style.icon} text-lg`}></i>
                                    <span className="text-[8px] font-black uppercase text-center leading-tight">{style.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* TEXT BLOCKS / OTHERS */}
                {['paragraph', 'heading', 'quote'].includes(block.type) && (
                    <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Conteúdo Editorial</label>
                        <textarea 
                            value={block.content} 
                            onChange={(e) => updateContent(e.target.value)} 
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium h-48 focus:border-zinc-900 outline-none" 
                            placeholder="Escreva aqui..."
                        />
                    </div>
                )}
            </div>
        )}

        {activeTab === 'design' && block && (
            <div className="space-y-8 animate-fadeIn">
                <section>
                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest">Alinhamento e Largura</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Espaço em Tela</label>
                            <select value={block.settings.width || 'full'} onChange={(e) => updateSettings({ width: e.target.value })} className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-black uppercase px-2">
                                <option value="full">Manchete (100%)</option>
                                <option value="3/4">Editorial (75%)</option>
                                <option value="1/2">Meia Coluna</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] font-bold text-zinc-400 uppercase mb-1 block">Alinhamento</label>
                            <div className="flex gap-1 h-12">
                                {['left', 'center', 'right'].map(align => (
                                    <button key={align} onClick={() => updateSettings({ alignment: align })} className={`flex-1 rounded-xl border flex items-center justify-center transition-all ${block.settings.alignment === align ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg' : 'bg-white border-zinc-100 text-zinc-400'}`}>
                                        <i className={`fas fa-align-${align}`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                {block.type === 'image' && (
                    <section>
                        <label className="text-[9px] font-black uppercase text-zinc-400 mb-3 block tracking-widest">Legenda Foto</label>
                        <input 
                            type="text" value={block.settings.caption || ''} 
                            onChange={(e) => updateSettings({ caption: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-100 p-3 rounded-xl text-[10px] font-bold outline-none"
                            placeholder="Créditos da imagem..."
                        />
                    </section>
                )}
            </div>
        )}

        {activeTab === 'news' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-gray-900 p-6 rounded-[2rem] shadow-xl text-white">
                    <label className="text-[8px] font-black uppercase text-blue-400 mb-2 block tracking-[0.2em]">Metadados da Notícia</label>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black uppercase mb-1 block opacity-50">Editoria Regional</label>
                            <select value={newsMetadata.category} onChange={e => newsMetadata.setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none">
                                {['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'].map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase mb-1 block opacity-50">Slug de URL (SEO)</label>
                            <input type="text" value={newsMetadata.slug} onChange={e => newsMetadata.setSlug(e.target.value)} className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-[10px] font-bold text-blue-400 outline-none" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white border border-zinc-100 p-6 rounded-[2rem]">
                    <h5 className="text-[9px] font-black uppercase text-zinc-400 mb-4 tracking-widest">Distribuição Social</h5>
                    <p className="text-[10px] font-bold text-zinc-600 leading-relaxed mb-4">
                        As legendas para as redes sociais são geradas automaticamente pelo motor Gemini IA ao publicar.
                    </p>
                    <div className="flex gap-2">
                        {['instagram', 'facebook', 'whatsapp', 'linkedin'].map(net => (
                            <div key={net} className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                                <i className={`fab fa-${net}`}></i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>

      <div className="p-6 bg-zinc-50 border-t border-zinc-100 mt-auto">
        <button onClick={onClose} className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-red-600 transition-all active:scale-95">Concluir Bloco</button>
      </div>
    </aside>
  );
};

export default InspectorSidebar;
