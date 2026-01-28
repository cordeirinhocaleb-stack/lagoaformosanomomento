import React, { useState } from 'react';
import { User } from '../../../../types';

interface CommentsSectionProps {
    newsId: string;
    user?: User | null;
    onLogin?: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ newsId, user, onLogin }) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Aqui iria a lógica de envio (RPC/API)
        console.log('Comentário enviado:', comment);
        setComment('');
        alert('Seu comentário foi enviado para análise.');
    };

    return (
        <section className="mt-12 pt-8 border-t border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 dark:text-zinc-100">
                <i className="fas fa-comments text-red-600"></i>
                Comentários
            </h3>

            {/* Aviso Importante (Disclaimer) */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-500 p-4 mb-8 rounded-r-xl shadow-sm">
                <div className="flex gap-4 items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg shrink-0">
                        <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-500"></i>
                    </div>
                    <div>
                        <h4 className="text-yellow-800 dark:text-yellow-500 font-bold uppercase text-[10px] tracking-widest mb-1">Aviso de Moderação</h4>
                        <p className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200 leading-relaxed font-sans">
                            Não toleramos comentários maldosos ou com falta de respeito. Qualquer comentário nesse estilo será excluído e o usuário poderá perder o acesso ao site.
                        </p>
                    </div>
                </div>
            </div>

            {/* Area de Input */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-zinc-800 relative overflow-hidden group">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                {user ? (
                    <form onSubmit={handleSubmit} className="relative z-10">
                        <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-white font-black uppercase shadow-xl shrink-0 border-2 border-white dark:border-zinc-700 overflow-hidden">
                                {user.avatar || user.avatar_url ? (
                                    <img src={user.avatar || user.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <div className="flex-1 w-full">
                                <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-zinc-400">
                                    Comentando como <span className="text-red-600 border-b border-red-600/20">{user.name}</span>
                                </h4>
                                <div className="relative">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="O que você achou desta notícia? Participe da discussão com responsabilidade..."
                                        className="w-full bg-white dark:bg-black border-2 border-gray-100 dark:border-zinc-800 rounded-2xl p-4 md:p-5 text-sm focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 min-h-[120px] resize-y transition-all placeholder:text-zinc-400 dark:text-zinc-200"
                                        required
                                    />
                                    <i className="fas fa-pen-nib absolute bottom-4 right-4 text-zinc-300 pointer-events-none"></i>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={!comment.trim()}
                                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-red-600 dark:hover:bg-red-600 hover:text-white dark:hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
                            >
                                <span className="flex items-center gap-2">
                                    Enviar Comentário <i className="fas fa-paper-plane"></i>
                                </span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6 relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-zinc-400 dark:text-zinc-500">
                            <i className="fas fa-lock text-2xl"></i>
                        </div>
                        <h4 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">Discussão Restrita</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
                            Para garantir a qualidade e segurança do debate, apenas leitores cadastrados podem comentar.
                        </p>
                        <button
                            onClick={onLogin}
                            className="bg-red-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30"
                        >
                            Fazer Login / Cadastrar
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-12">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-4">
                    <span className="w-8 h-[2px] bg-red-600 block"></span>
                    Comentários Recentes
                </h4>

                {/* Lista Vazia (Placeholder) */}
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-2xl opacity-60">
                    <i className="far fa-comments text-4xl text-zinc-300 mb-3"></i>
                    <p className="text-xs font-medium text-zinc-500 italic">Seja o primeiro a comentar nesta notícia.</p>
                </div>
            </div>
        </section>
    );
};

export default CommentsSection;
