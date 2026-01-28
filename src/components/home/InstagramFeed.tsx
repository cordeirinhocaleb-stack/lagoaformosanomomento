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
        // Agora sempre navegamos para a página de "notícia" do Instagram
        e.preventDefault();
        router.push(`/noticia/instagram?id=${post.id}`);
    };

    // Se não tiver token, não renderiza nada ou mostra aviso sutil
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {posts.map((post) => (
                            <a
                                key={post.id}
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handlePostClick(post, e)}
                                className="group relative aspect-square rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                            >
                                <img
                                    src={post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url}
                                    alt="Instagram Post"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay Interaction */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="flex items-center gap-2">
                                            {post.media_type === 'VIDEO' ? (
                                                <i className="fas fa-play text-xl"></i>
                                            ) : (
                                                <Heart className="w-5 h-5 fill-white" />
                                            )}
                                            <span className="font-black text-sm">{post.media_type === 'VIDEO' ? 'Assistir' : 'Ver Post'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Icon Indicator */}
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl opacity-100 group-hover:opacity-0 transition-opacity border border-white/10">
                                    {post.media_type === 'VIDEO' ? (
                                        <i className="fas fa-play text-white text-[10px]"></i>
                                    ) : post.media_type === 'CAROUSEL_ALBUM' ? (
                                        <i className="fas fa-clone text-white text-[10px]"></i>
                                    ) : (
                                        <i className="fas fa-image text-white text-[10px]"></i>
                                    )}
                                </div>
                            </a>
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
