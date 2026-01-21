
import React, { useState, useEffect } from 'react';
import { VideoMetadata } from '../../services/youtubeService';

interface YouTubeMetadataFormProps {
    initialData?: Partial<VideoMetadata>;
    onChange: (data: VideoMetadata) => void;
    onValidationChange: (isValid: boolean) => void;
}

const CATEGORIES = [
    { id: '25', name: 'Notícias e Política' },
    { id: '17', name: 'Esportes' },
    { id: '24', name: 'Entretenimento' },
    { id: '10', name: 'Música' },
    { id: '22', name: 'Pessoas e Blogs' },
    { id: '28', name: 'Ciência e Tecnologia' },
    { id: '19', name: 'Viagens e Eventos' }
];

const YouTubeMetadataForm: React.FC<YouTubeMetadataFormProps> = ({ initialData, onChange, onValidationChange }) => {
    const [tab, setTab] = useState<'details' | 'visibility' | 'advanced'>('details');

    // Estado do Formulário
    const [formData, setFormData] = useState<VideoMetadata>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        tags: initialData?.tags || [],
        privacy: initialData?.privacy || 'public',
        categoryId: initialData?.categoryId || '25', // Default: Notícias
        madeForKids: initialData?.madeForKids || false,
        embeddable: initialData?.embeddable ?? true,
        license: initialData?.license || 'youtube',
        language: initialData?.language || 'pt-BR',
        commentsPolicy: initialData?.commentsPolicy || 'allow',
        notifySubscribers: initialData?.notifySubscribers ?? true,
        ...initialData
    });

    const [tagsInput, setTagsInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Validação em Tempo Real
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {newErrors.title = "O título é obrigatório";}
        if (formData.title.length > 100) {newErrors.title = "O título é muito longo (máx 100 caracteres)";}

        if (formData.description.length > 5000) {newErrors.description = "A descrição é muito longa (máx 5000 caracteres)";}

        // COPPA é um boolean, mas vamos garantir que o usuário tenha interagido conscientemente se fosse um form vazio
        // (Aqui assumimos false como padrão, mas em produção poderíamos forçar null inicial para check explícito)

        setErrors(newErrors);
        onValidationChange(Object.keys(newErrors).length === 0);
        onChange(formData);
    }, [formData, onChange, onValidationChange]);

    const handleTagsKeyDown = (e: React.KeyboardEvent) => {
        if (['Enter', ','].includes(e.key)) {
            e.preventDefault();
            const tag = tagsInput.trim();
            if (tag && !formData.tags.includes(tag)) {
                if (formData.tags.length >= 50) {return;} // Limite de tags
                const newTags = [...formData.tags, tag];
                setFormData(prev => ({ ...prev, tags: newTags }));
                setTagsInput('');
            }
        } else if (e.key === 'Backspace' && !tagsInput && formData.tags.length > 0) {
            const newTags = [...formData.tags];
            newTags.pop();
            setFormData(prev => ({ ...prev, tags: newTags }));
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[600px]">

            {/* Header / Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => setTab('details')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${tab === 'details' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    1. Detalhes
                </button>
                <button
                    onClick={() => setTab('visibility')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${tab === 'visibility' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    2. Visibilidade
                </button>
                <button
                    onClick={() => setTab('advanced')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${tab === 'advanced' ? 'text-red-600 border-b-2 border-red-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    3. Avançado
                </button>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                {/* TAB 1: DETALHES */}
                {tab === 'details' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Título */}
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 group-focus-within:text-blue-500 transition-colors">
                                Título do Vídeo <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 font-semibold outline-none transition-all ${errors.title ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:bg-white'}`}
                                placeholder="Digite um título chamativo..."
                            />
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-red-500 font-bold">{errors.title}</span>
                                <span className={`text-[10px] font-bold ${formData.title.length > 90 ? 'text-orange-500' : 'text-gray-300'}`}>
                                    {formData.title.length}/100
                                </span>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 group-focus-within:text-blue-500 transition-colors">
                                Descrição
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                className={`w-full bg-gray-50 border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-100 focus:border-blue-500 focus:bg-white'}`}
                                placeholder="Sobre o que é este vídeo?"
                            />
                            <div className="flex justify-end mt-1">
                                <span className="text-[10px] font-bold text-gray-300">
                                    {formData.description.length}/5000
                                </span>
                            </div>
                        </div>

                        {/* Audiência (COPPA) */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-3">
                                Público (Lei COPPA) <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.madeForKids ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                        {formData.madeForKids && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                    <input type="radio" className="hidden" checked={formData.madeForKids} onChange={() => setFormData({ ...formData, madeForKids: true })} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-700">Sim, é conteúdo para crianças</span>
                                        <span className="text-xs text-gray-400">Recursos como anúncios personalizados serão desativados.</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!formData.madeForKids ? 'border-blue-500 bg-blue-500' : 'border-gray-300 group-hover:border-blue-400'}`}>
                                        {!formData.madeForKids && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                    <input type="radio" className="hidden" checked={!formData.madeForKids} onChange={() => setFormData({ ...formData, madeForKids: false })} />
                                    <span className="text-sm font-bold text-gray-700">Não, não é conteúdo para crianças</span>
                                </label>
                            </div>
                        </div>

                        {/* Thumbnail Upload (Simulado na UI, enviado como arquivo separado no backend) */}
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Miniatura (Thumbnail)</label>
                            <div className="flex gap-4">
                                <div className="w-40 aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                    <i className="fas fa-image text-gray-300 text-xl mb-2"></i>
                                    <span className="text-[9px] font-bold uppercase text-gray-400">Upload</span>
                                    {/* Input real seria implementado aqui ou no pai */}
                                </div>
                                <div className="flex-1 flex gap-2">
                                    {/* Auto-generated thumbnails placeholders */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex-1 aspect-video bg-gray-800 rounded-lg opacity-40 animate-pulse"></div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Envie uma imagem com 1280x720 (16:9). Se nenhuma for enviada, o YouTube escolherá automaticamente.</p>
                        </div>
                    </div>
                )}

                {/* TAB 2: VISIBILIDADE */}
                {tab === 'visibility' && (
                    <div className="space-y-6 animate-fadeIn">

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-4">
                                Visibilidade do Vídeo
                            </label>

                            <div className="space-y-4">
                                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.privacy === 'public' ? 'border-green-500 bg-white shadow-md' : 'border-transparent hover:bg-gray-100'}`}>
                                    <input type="radio" className="hidden" checked={formData.privacy === 'public'} onChange={() => setFormData({ ...formData, privacy: 'public' })} />
                                    <div className={`w-6 h-6 rounded-full border-2 flex-none flex items-center justify-center ${formData.privacy === 'public' ? 'border-green-500' : 'border-gray-300'}`}>
                                        {formData.privacy === 'public' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Público</h4>
                                        <p className="text-xs text-gray-500 mt-1">Todo mundo pode ver seu vídeo. Ele aparecerá nos resultados de pesquisa.</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.privacy === 'unlisted' ? 'border-yellow-500 bg-white shadow-md' : 'border-transparent hover:bg-gray-100'}`}>
                                    <input type="radio" className="hidden" checked={formData.privacy === 'unlisted'} onChange={() => setFormData({ ...formData, privacy: 'unlisted' })} />
                                    <div className={`w-6 h-6 rounded-full border-2 flex-none flex items-center justify-center ${formData.privacy === 'unlisted' ? 'border-yellow-500' : 'border-gray-300'}`}>
                                        {formData.privacy === 'unlisted' && <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Não Listado</h4>
                                        <p className="text-xs text-gray-500 mt-1">Qualquer pessoa com o link pode ver o vídeo. Não aparece na busca.</p>
                                    </div>
                                </label>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.privacy === 'private' ? 'border-red-500 bg-white shadow-md' : 'border-transparent hover:bg-gray-100'}`}>
                                    <input type="radio" className="hidden" checked={formData.privacy === 'private'} onChange={() => setFormData({ ...formData, privacy: 'private' })} />
                                    <div className={`w-6 h-6 rounded-full border-2 flex-none flex items-center justify-center ${formData.privacy === 'private' ? 'border-red-500' : 'border-gray-300'}`}>
                                        {formData.privacy === 'private' && <div className="w-3 h-3 bg-red-500 rounded-full"></div>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Privado</h4>
                                        <p className="text-xs text-gray-500 mt-1">Apenas você e pessoas que você escolher podem ver.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Agendamento (Opcional - Simulado) */}
                        <div className="opacity-70 pointer-events-none filter grayscale">
                            <div className="flex items-center gap-3 mb-2">
                                <i className="fas fa-clock text-gray-400"></i>
                                <span className="font-bold text-gray-600 text-sm">Agendar (Em Breve)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: AVANÇADO */}
                {tab === 'advanced' && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Tags */}
                        <div className="group">
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                                Tags (Etiquetas)
                            </label>
                            <div className="bg-white border-2 border-gray-100 focus-within:border-blue-500 rounded-xl p-2 flex flex-wrap gap-2 transition-all">
                                {formData.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-red-500"><i className="fas fa-times"></i></button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={tagsInput}
                                    onChange={e => setTagsInput(e.target.value)}
                                    onKeyDown={handleTagsKeyDown}
                                    placeholder={formData.tags.length === 0 ? "Adicione tags (Enter para separar)" : ""}
                                    className="flex-1 outline-none text-sm bg-transparent min-w-[150px]"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">Tags podem ser úteis se as pessoas costumam escrever errado o nome do conteúdo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Categoria */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Categoria</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Idioma */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Idioma do Vídeo</label>
                                <select
                                    value={formData.language}
                                    onChange={e => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                                >
                                    <option value="pt-BR">Português (Brasil)</option>
                                    <option value="en">Inglês</option>
                                    <option value="es">Espanhol</option>
                                </select>
                            </div>
                        </div>

                        {/* Configurações Extras */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <span className="text-sm font-bold text-gray-700">Permitir incorporação</span>
                                <input type="checkbox" checked={formData.embeddable} onChange={e => setFormData({ ...formData, embeddable: e.target.checked })} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                            </label>

                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <span className="text-sm font-bold text-gray-700">Notificar inscritos</span>
                                <input type="checkbox" checked={formData.notifySubscribers} onChange={e => setFormData({ ...formData, notifySubscribers: e.target.checked })} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                            </label>
                        </div>

                        {/* Comentários */}
                        <div>
                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Comentários e Avaliações</label>
                            <div className="bg-gray-50 rounded-xl p-1 flex">
                                <button onClick={() => setFormData({ ...formData, commentsPolicy: 'allow' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.commentsPolicy === 'allow' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Permitir</button>
                                <button onClick={() => setFormData({ ...formData, commentsPolicy: 'hold' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.commentsPolicy === 'hold' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Reter</button>
                                <button onClick={() => setFormData({ ...formData, commentsPolicy: 'disable' })} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.commentsPolicy === 'disable' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Desativar</button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default YouTubeMetadataForm;
