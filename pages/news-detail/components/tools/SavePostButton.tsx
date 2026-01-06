import React, { useState, useEffect } from 'react';

interface SavePostButtonProps {
    newsId: string;
    mini?: boolean;
}

const SavePostButton: React.FC<SavePostButtonProps> = ({ newsId, mini }) => {
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const savedPosts = JSON.parse(localStorage.getItem('lfnm_saved_posts') || '[]');
        setSaved(savedPosts.includes(newsId));
    }, [newsId]);

    const handleSave = () => {
        let savedPosts = JSON.parse(localStorage.getItem('lfnm_saved_posts') || '[]');
        if (savedPosts.includes(newsId)) {
            savedPosts = savedPosts.filter((id: string) => id !== newsId);
            setSaved(false);
        } else {
            savedPosts.push(newsId);
            setSaved(true);
        }
        localStorage.setItem('lfnm_saved_posts', JSON.stringify(savedPosts));
    };

    if (mini) {
        return (
            <button 
                onClick={handleSave}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${saved ? 'text-red-600' : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600'}`}
                title={saved ? 'Remover dos salvos' : 'Salvar esta matéria'}
            >
                <i className={`${saved ? 'fas' : 'far'} fa-bookmark`}></i>
            </button>
        );
    }

    return (
        <button 
            onClick={handleSave}
            className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border flex items-center justify-center gap-3 ${
                saved 
                ? 'bg-red-600 text-white border-red-600 shadow-md' 
                : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-red-600 hover:text-red-600'
            }`}
        >
            <i className={`${saved ? 'fas' : 'far'} fa-bookmark`}></i>
            {saved ? 'Salvo no Seu Perfil' : 'Salvar p/ Ler Depois'}
        </button>
    );
};

export default SavePostButton;