import React, { useEffect, useState } from 'react';
import { User, NewsItem } from '../../types';
import Logo from './Logo';

interface AuthorProfileModalProps {
    authorId: string;
    authorName: string;
    currentUser: User | null;
    allUsers: User[];
    allNews: NewsItem[];
    onClose: () => void;
    onNewsClick: (news: NewsItem) => void;
    onUpdateUser?: (updatedUser: User) => void;
}

const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({ 
    authorId, authorName, currentUser, allUsers, allNews, onClose, onNewsClick, onUpdateUser 
}) => {
    const [authorData, setAuthorData] = useState<User | null>(() => {
        return allUsers.find(u => u.id === authorId) || 
               (currentUser?.id === authorId ? currentUser : null) ||
               ({ id: authorId, name: authorName, role: 'Repórter', bio: '', status: 'active', email: '' } as User);
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    const canEdit = currentUser?.id === authorId || currentUser?.role === 'Desenvolvedor' || currentUser?.role === 'Editor-Chefe';

    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handleSave = () => {
        if (authorData && onUpdateUser) {
            const updated = { ...authorData, ...editForm } as User;
            setAuthorData(updated);
            onUpdateUser(updated);
            setIsEditing(false);
        }
    };

    const authorNews = allNews
        .filter(n => n.authorId === authorId || n.author === authorData?.name)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-fadeIn">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose}></div>
            
            {/* Modal Card - Estilo Home (Limpo) */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-950 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col animate-slideUp overflow-visible border border-gray-100 dark:border-zinc-800">
                
                {/* BOTÃO SAIR - QUADRADO PERFEITO E SEM ARREDONDAMENTO */}
                <button 
                    onClick={onClose} 
                    className="absolute top-12 -right-4 md:top-16 md:-right-6 z-[10500] bg-red-600 text-white w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center transition-all hover:bg-black group shadow-2xl rounded-none active:scale-95 border-none outline-none"
                    style={{ borderRadius: '0px !important' }}
                    title="Fechar"
                >
                    <i className="fas fa-times text-2xl md:text-3xl group-hover:rotate-90 transition-transform"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest italic mt-1">Sair</span>
                </button>

                {/* CONTEÚDO */}
                <div className="flex-1 overflow-y-auto custom-scrollbar-clean rounded-[2rem] relative">
                    
                    {/* Banner Superior */}
                    <div className="h-40 md:h-52 bg-zinc-950 relative shrink-0 overflow-visible z-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-zinc-900 to-black"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        
                        <div className="absolute top-6 left-8 flex items-center gap-3">
                            <div className="bg-red-600 text-white px-4 py-1 skew-x-[-12deg] shadow-lg">
                                <span className="block skew-x-[12deg] text-[9px] font-black uppercase tracking-widest italic">Perfil Editorial</span>
                            </div>
                        </div>

                        {/* AVATAR SOBREPOSTO - Sobrepõe o container de baixo */}
                        <div className="absolute -bottom-16 left-12 z-[100] group/avatar">
                            <div className="w-40 h-40 md:w-52 md:h-52 bg-white dark:bg-zinc-900 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-zinc-800 overflow-hidden relative rounded-none">
                                {authorData?.avatar ? (
                                    <img src={authorData.avatar} className="w-full h-full object-cover group-hover/avatar:scale-105 transition-all duration-700" alt={authorData.name} />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-6xl font-black text-gray-300">
                                        {authorData?.name.charAt(0)}
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-red-600/60 transition-colors">
                                        <i className="fas fa-camera text-3xl mb-1"></i>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Alterar</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-8 md:px-16 relative z-0">
                        {/* Nome e Cargo - Fontes Reduzidas */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                            <div className="flex-1 w-full">
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={editForm.name || authorData?.name} 
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                        className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-red-600 w-full outline-none py-2"
                                    />
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100 leading-none">{authorData?.name}</h2>
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-red-600 italic">
                                                {authorData?.role || 'Jornalista'}
                                            </span>
                                            <div className="h-px flex-1 bg-gray-100 dark:bg-zinc-800"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {canEdit && !isEditing && (
                                <button 
                                    onClick={() => {
                                        setEditForm({ name: authorData?.name, role: authorData?.role, bio: authorData?.bio });
                                        setIsEditing(true);
                                    }}
                                    className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2"
                                >
                                    <i className="fas fa-cog"></i> Configurar
                                </button>
                            )}
                        </div>

                        {/* Bio - Estilo Home */}
                        <div className="mb-16">
                            {isEditing ? (
                                <textarea 
                                    value={editForm.bio || authorData?.bio}
                                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                                    rows={4}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 text-base font-medium outline-none focus:border-red-600 resize-none font-serif italic text-zinc-800 dark:text-zinc-200"
                                />
                            ) : (
                                <div className="max-w-3xl">
                                    <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 italic font-serif border-l-4 border-red-600 pl-6">
                                        "{authorData?.bio || `Voz ativa no jornalismo da Rede Welix Duarte, focado em trazer a realidade de Lagoa Formosa aos nossos leitores com precisão e coragem.`}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Controles Edição */}
                        {isEditing && (
                            <div className="flex gap-3 mb-12">
                                <button onClick={handleSave} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Salvar</button>
                                <button onClick={() => setIsEditing(false)} className="px-10 bg-gray-100 text-gray-400 py-4 rounded-xl font-black uppercase text-[10px]">Cancelar</button>
                            </div>
                        )}

                        {/* Lista de Matérias - Estilo Home */}
                        {!isEditing && (
                            <div className="animate-fadeIn">
                                <div className="flex items-center gap-4 mb-8">
                                    <h4 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter leading-none">
                                        Matérias <span className="text-red-600">Assinadas</span>
                                    </h4>
                                    <div className="h-0.5 flex-1 bg-gray-100 dark:bg-zinc-800"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {authorNews.length > 0 ? authorNews.map(news => (
                                        <button 
                                            key={news.id}
                                            onClick={() => { onNewsClick(news); onClose(); }}
                                            className="w-full flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-red-500 hover:shadow-xl transition-all text-left overflow-hidden group"
                                        >
                                            <div className="w-full aspect-video overflow-hidden relative bg-gray-100">
                                                <img src={news.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                                                    {news.category}
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <h5 className="text-sm font-black uppercase italic leading-tight group-hover:text-red-600 transition-colors line-clamp-2 mb-3">{news.title}</h5>
                                                <p className="mt-auto text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(news.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="col-span-full py-16 text-center opacity-30">
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">Nenhuma publicação arquivada</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Footer Final */}
                        <div className="mt-20 pt-10 border-t border-gray-100 dark:border-zinc-900 text-center flex flex-col items-center">
                            <div className="w-20 h-20 mb-4 grayscale opacity-30">
                                <Logo />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 leading-relaxed italic">
                                Sistema LFNM • Welix Duarte
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar-clean::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar-clean::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-clean::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar-clean::-webkit-scrollbar-thumb:hover { background: #dc2626; }
                
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default AuthorProfileModal;