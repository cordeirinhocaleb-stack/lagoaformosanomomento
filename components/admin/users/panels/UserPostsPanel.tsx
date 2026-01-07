import React from 'react';

interface UserPost {
    id: string;
    title: string;
    clicks?: number;
    created_at: string;
    status: string;
}

interface UserPostsPanelProps {
    userId: string;
    posts?: UserPost[];
    darkMode?: boolean;
}

const UserPostsPanel: React.FC<UserPostsPanelProps> = ({ userId, posts = [], darkMode = false }) => {
    const totalClicks = posts.reduce((sum, p) => sum + (p.clicks || 0), 0);

    return (
        <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
                <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                    <i className="fas fa-bullhorn"></i> Postagens ({posts.length})
                </h3>
                <span className="text-[8px] font-black uppercase text-gray-500">
                    {totalClicks} cliques totais
                </span>
            </div>

            {posts.length > 0 ? (
                <div className="space-y-2">
                    {posts.map((post) => (
                        <div key={post.id} className={`rounded-xl p-4 border transition-colors group ${darkMode ? 'bg-white/5 border-white/5 hover:border-white/20' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className={`text-xs font-bold line-clamp-1 group-hover:text-red-600 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {post.title}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[9px] text-gray-500 font-medium">
                                            <i className="fas fa-calendar mr-1"></i>
                                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        {post.clicks !== undefined && (
                                            <span className="text-[9px] font-bold text-purple-600">
                                                <i className="fas fa-mouse-pointer mr-1"></i>
                                                {post.clicks} cliques
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[7px] font-black uppercase ${post.status === 'published'
                                    ? (darkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700')
                                    : post.status === 'draft'
                                        ? (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                                        : (darkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                                    }`}>
                                    {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : post.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`rounded-2xl p-8 text-center border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <i className="fas fa-newspaper text-4xl text-gray-300 mb-3"></i>
                    <p className="text-xs font-bold text-gray-400 uppercase">Nenhuma postagem</p>
                    <p className="text-[9px] text-gray-400 mt-1">Este usuário ainda não publicou anúncios</p>
                </div>
            )}
        </div>
    );
};

export default UserPostsPanel;
