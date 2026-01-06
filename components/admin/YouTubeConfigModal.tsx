
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { VideoMetadata } from '../../services/youtubeService';

interface YouTubeConfigModalProps {
    videoFile: File | null;
    onConfirm: (metadata: VideoMetadata) => void;
    onCancel: () => void;
    currentTitle?: string;
    currentDescription?: string;
}

const YOUTUBE_CATEGORIES = [
    { id: '25', name: 'Notícias e Política' },
    { id: '17', name: 'Esportes' },
    { id: '22', name: 'Pessoas e Blogs' },
    { id: '1', name: 'Filmes e Animação' },
    { id: '10', name: 'Música' },
    { id: '20', name: 'Jogos' },
    { id: '27', name: 'Educação' },
    { id: '28', name: 'Ciência e Tecnologia' }
];

const YouTubeConfigModal: React.FC<YouTubeConfigModalProps> = ({
    videoFile, onConfirm, onCancel, currentTitle, currentDescription
}) => {
    const [title, setTitle] = useState(currentTitle || (videoFile?.name ? videoFile.name.split('.')[0].substring(0, 100) : 'Novo Vídeo LFNM'));
    const [description, setDescription] = useState(currentDescription || 'Vídeo exclusivo Portal Lagoa Formosa No Momento.');
    const [tags, setTags] = useState('lagoa formosa, noticias, regional, lfnm');
    const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
    const [categoryId, setCategoryId] = useState('25');
    const [madeForKids, setMadeForKids] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        onConfirm({
            title,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            privacy,
            categoryId,
            madeForKids
        });
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto custom-scrollbar">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative my-8">
                <div className="bg-red-600 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-xl">
                            <i className="fab fa-youtube text-3xl"></i>
                        </div>
                        <div>
                            <h3 className="text-2xl font-[1000] uppercase italic tracking-tighter">Wizard YouTube</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Preencha os metadados obrigatórios</p>
                        </div>
                    </div>
                    <button type="button" onClick={onCancel} className="text-white/50 hover:text-white transition-colors relative z-10">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                        <i className="fas fa-info-circle text-blue-500 mt-1"></i>
                        <div>
                            <p className="text-[10px] font-[1000] text-blue-900 uppercase">Processamento Automático</p>
                            <p className="text-[9px] text-blue-700 leading-relaxed">
                                O upload será iniciado automaticamente em segundo plano assim que você salvar a notícia. Não feche a aba do navegador durante a publicação.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Título do Vídeo (Max 100)</label>
                                <input
                                    type="text" required maxLength={100}
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-red-500 transition-all"
                                    placeholder="Ex: Grande evento em Lagoa Formosa..."
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Descrição SEO</label>
                                <textarea
                                    rows={5} required
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-red-500 resize-none transition-all"
                                    placeholder="Detalhe o conteúdo do vídeo..."
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Tags (Separar por vírgula)</label>
                                <input
                                    type="text"
                                    value={tags} onChange={(e) => setTags(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-red-600 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Categoria</label>
                                    <select
                                        value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                    >
                                        {YOUTUBE_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Privacidade</label>
                                    <select
                                        value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                    >
                                        <option value="public">Público (Visível a todos)</option>
                                        <option value="unlisted">Não Listado (Apenas link)</option>
                                        <option value="private">Privado (Apenas eu)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <label className="flex items-start gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={madeForKids} onChange={(e) => setMadeForKids(e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-300 text-zinc-600 mt-1"
                                    />
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-zinc-900 tracking-tight block mb-1">Conteúdo p/ Crianças?</span>
                                        <p className="text-[9px] text-zinc-500 leading-tight">Marque apenas se o conteúdo for feito especificamente para público infantil (Lei COPPA).</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row gap-4 justify-end">
                        <button type="button" onClick={onCancel} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200">Cancelar</button>
                        <button
                            type="submit"
                            className="px-12 py-4 bg-red-600 text-white rounded-2xl font-[1000] uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center gap-3 active:scale-95"
                        >
                            <i className="fas fa-check"></i> Confirmar Configuração
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default YouTubeConfigModal;
