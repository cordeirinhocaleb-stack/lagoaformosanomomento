import React, { useState, useEffect } from 'react';
import { Instagram, ExternalLink, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import { useRouter } from 'next/navigation';

interface InstaPost {
    id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    media_url: string;
    permalink: string;
    thumbnail_url?: string;
    timestamp: string;
    caption?: string;
}

const InstagramFeed: React.FC = () => {
    const ctrl = useAppControllerContext();
    const router = useRouter();
    const token = ctrl.systemSettings.instagramToken;

    const [posts, setPosts] = useState<InstaPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,caption&access_token=${token}`
                );

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error?.message || 'Falha ao carregar Instagram');
                }

                const data = await response.json();
                setPosts(data.data?.slice(0, 4) || []);
                setError(null);
            } catch (err: any) {
                console.error('Insta Feed Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [token]);

    const handlePostClick = (post: InstaPost, e: React.MouseEvent) => {
        e.preventDefault();
        router.push(`/noticia/instagram?id=${post.id}`);
    };

    if (!token && !posts.length) return null;

    return (
        <section className="w-full mb-16 md:mb-24 px-4 md:px-8 lg:px-12 animate-fadeIn relative">
            <div className="max-w-[1920px] mx-auto">
                {/* Header do Feed */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-pink-600">
                            <Instagram className="w-6 h-6 border-2 border-pink-600 rounded-lg p-0.5" />
                            <span className="text-xs font-black uppercase tracking-[0.3em]">No Momento no Instagram</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                            Acompanhe no <span className="text-pink-600">Insta</span>
                        </h2>
                    </div>

                    <a
                        href="https://instagram.com/lagoaformosanomomento"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:shadow-pink-500/20 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <span>Ver perfil completo</span>
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                        <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sincronizando feed...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-[3rem] border border-red-100">
                        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                        <p className="text-[10px] font-black uppercase text-red-900 tracking-widest mb-2">Erro na Conexão</p>
                        <p className="text-xs font-bold text-red-600/60 uppercase">Verifique o token nas configurações do admin</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                onClick={(e) => handlePostClick(post, e)}
                                className="group relative h-[300px] md:h-[360px] rounded-2xl overflow-hidden bg-black border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                            >
                                {/* Media Image */}
                                <img
                                    src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                                    alt="Instagram Post"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-40 group-hover:grayscale"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>

                                {/* Content Info (Matches NewsCard style) */}
                                <div className="absolute bottom-0 left-0 w-full p-5 text-white transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
                                    <div className="flex flex-col items-start gap-2 mb-3">
                                        {/* Faixa pequena escrito Instagram */}
                                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[7px] font-black px-3 py-0.5 uppercase tracking-widest shadow-lg border-l-2 border-white inline-block skew-x-[-15deg]">
                                            <span className="skew-x-[15deg] block">Instagram</span>
                                        </div>
                                    </div>

                                    {/* Caption as Title */}
                                    <h3 className="text-sm font-[1000] leading-tight uppercase italic mb-3 line-clamp-3 drop-shadow-md tracking-tighter">
                                        {post.caption || 'Confira os bastidores no nosso Instagram'}
                                    </h3>

                                    <div className="flex justify-between items-end border-t border-white/20 pt-2 opacity-80">
                                        <span className="text-[7px] font-black uppercase tracking-widest">@lagoaformosanomomento</span>
                                        <span className="text-[7px] font-bold uppercase">
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Interaction (Play icon for video) */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                            {post.media_type === 'VIDEO' ? (
                                                <i className="fas fa-play text-white text-xl ml-1"></i>
                                            ) : (
                                                <Heart className="w-6 h-6 text-white" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{post.media_type === 'VIDEO' ? 'Assistir' : 'Ver Post'}</span>
                                    </div>
                                </div>

                                {/* Media Type Icon (Top Right) */}
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10 transition-opacity duration-300 group-hover:opacity-0">
                                    {post.media_type === 'VIDEO' ? (
                                        <i className="fas fa-play text-white text-[9px]"></i>
                                    ) : post.media_type === 'CAROUSEL_ALBUM' ? (
                                        <i className="fas fa-clone text-white text-[9px]"></i>
                                    ) : (
                                        <i className="fas fa-image text-white text-[9px]"></i>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile CTA */}
                {!loading && !error && (
                    <div className="mt-8 md:hidden text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Atualizado em tempo real • Lagoa Formosa No Momento
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default InstagramFeed;
