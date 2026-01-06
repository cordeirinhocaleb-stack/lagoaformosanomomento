
import React from 'react';
import Logo from '../../common/Logo';
import { NewsItem } from '../../../types';

interface EditorHeaderProps {
    isPublished: boolean;
    isHeaderVisible: boolean;
    initialData: NewsItem | null;
    onCancel: () => void;
    onPublish: (isUpdate: boolean, forceSocial: boolean) => void;
    onSaveDraft: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ isPublished, isHeaderVisible, initialData, onCancel, onPublish, onSaveDraft }) => {
    return (
        <header className={`hidden md:flex bg-black border-b-4 ${isPublished ? 'border-green-500' : 'border-red-600'} px-6 py-3 items-center justify-between sticky top-0 z-[1500] flex-none shadow-2xl transition-all duration-500 ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onCancel()}>
                    <div className="w-10 h-10 flex-none group-hover:animate-almost-fall"><Logo /></div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-white leading-none tracking-tighter">
                            {isPublished ? 'GERENCIADOR DE PUBLICAÇÃO' : 'ESTÚDIO DE CRIAÇÃO'}
                        </span>
                        <span className={`text-[7px] font-bold ${isPublished ? 'text-green-500' : 'text-red-600'} uppercase tracking-widest mt-1`}>
                            {isPublished ? 'MATÉRIA NO AR • ONLINE' : 'REDE WELIX DUARTE'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={onCancel} className="px-5 py-2 rounded-full text-[9px] font-black uppercase text-white/50 border border-white/10 hover:text-white hover:border-white transition-all">
                    Cancelar
                </button>

                {isPublished ? (
                    <>
                        <button
                            onClick={() => window.open(`/#/news/${initialData?.id}`, '_blank')}
                            className="bg-white/10 text-white px-5 py-2.5 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-external-link-alt"></i> Ver no Site
                        </button>

                        <button
                            onClick={() => {
                                if (confirm("⚠️ ATENÇÃO: Isso enviará a notícia novamente para todas as redes sociais configuradas (Instagram, Facebook, etc). Deseja continuar?")) {
                                    onPublish(true, true);
                                }
                            }}
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-full font-black uppercase text-[9px] tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                        >
                            <i className="fas fa-share-nodes"></i> Republicar
                        </button>

                        <button
                            onClick={() => onPublish(true, false)}
                            className="bg-green-600 text-white px-6 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-white hover:text-green-600 transition-all flex items-center gap-2 group"
                        >
                            <i className="fas fa-save group-hover:rotate-12 transition-transform"></i> Salvar Edição
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onSaveDraft}
                            className="bg-white/10 text-white px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2"
                        >
                            <i className="fas fa-save"></i> Salvar Rascunho
                        </button>
                        <button
                            onClick={() => onPublish(false, false)}
                            className="bg-red-600 text-white px-8 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-white hover:text-red-600 transition-all flex items-center gap-2 group transform hover:scale-105"
                        >
                            <span>PUBLICAR AGORA</span>
                            <i className="fas fa-paper-plane group-hover:rotate-45 transition-transform"></i>
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};
