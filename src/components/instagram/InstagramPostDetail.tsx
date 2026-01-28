import React, { useState, useEffect } from 'react';
import { Instagram, Calendar, User, Loader2, AlertCircle, ArrowLeft, Share2 } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingScreen from '../common/LoadingScreen';
import { SystemSettings, User as UserType } from '../../types';
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

interface InstagramPostDetailProps {
    postId: string;
    token: string;
    settings: SystemSettings;
    user: UserType | null;
    tickerNews: any[];
    marqueeNews: any[];
    onAdminClick: () => void;
    onHomeClick: () => void;
    selectedCategory: string;
    onSelectCategory: (id: string) => void;
    selectedRegion: any;
    onSelectRegion: (region: any) => void;
}

const InstagramPostDetail: React.FC<InstagramPostDetailProps> = ({
    postId,
    token,
    settings,
    user,
    tickerNews,
    marqueeNews,
    onAdminClick,
    onHomeClick,
    selectedCategory,
    onSelectCategory,
    selectedRegion,
    onSelectRegion
}) => {
    const router = useRouter();
    const [post, setPost] = useState<InstaPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://graph.instagram.com/${postId}?fields=id,media_type,media_url,permalink,thumbnail_url,timestamp,caption&access_token=${token}`
                );

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error?.message || 'Falha ao carregar post do Instagram');
                }

                const data = await response.json();
                setPost(data);
                setError(null);
            } catch (err: any) {
                console.error('Insta Detail Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (postId && token) {
            fetchPost();
        }
    }, [postId, token]);

    if (loading) return <LoadingScreen onFinished={() => { }} />;

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col">
                <Header
                    onAdminClick={onAdminClick}
                    onHomeClick={onHomeClick}
                    latestNews={tickerNews}
                    externalNews={marqueeNews}
                    user={user}
                    onOpenProfile={() => { }}
                    selectedCategory={selectedCategory}
                    onSelectCategory={onSelectCategory}
                    selectedRegion={selectedRegion}
                    onSelectRegion={onSelectRegion}
                />
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mb-6" />
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Post não encontrado</h1>
                    <p className="text-gray-500 mb-8 max-w-md">O conteúdo pode ter sido removido ou o token de acesso expirou.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                    >
                        Voltar ao Início
                    </button>
                </div>
                <Footer settings={settings} />
            </div>
        );
    }

    const formattedDate = new Date(post.timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
            <Header
                onAdminClick={onAdminClick}
                onHomeClick={onHomeClick}
                latestNews={tickerNews}
                externalNews={marqueeNews}
                user={user}
                onOpenProfile={() => { }}
                selectedCategory={selectedCategory}
                onSelectCategory={onSelectCategory}
                selectedRegion={selectedRegion}
                onSelectRegion={onSelectRegion}
            />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                {/* Navegação Retorno */}
                <button
                    onClick={() => router.push('/')}
                    className="group flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-10 hover:text-red-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Voltar ao Portal</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Coluna de Mídia (Esquerda) */}
                    <div className="lg:col-span-7">
                        <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 relative aspect-[9/16] max-h-[800px] mx-auto lg:mx-0">
                            {post.media_type === 'VIDEO' ? (
                                <video
                                    src={post.media_url}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay
                                    playsInline
                                    loop
                                />
                            ) : (
                                <img
                                    src={post.media_url}
                                    className="w-full h-full object-cover"
                                    alt="Instagram Post"
                                />
                            )}

                            {/* Marca d'água Flutuante */}
                            <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border border-pink-500 p-0.5">
                                    <img src="/logo-m.png" className="w-full h-full object-contain rounded-full bg-white" alt="LFNM" />
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">LFNM no Instagram</span>
                            </div>
                        </div>
                    </div>

                    {/* Coluna de Texto (Direita) */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div>
                            <div className="flex items-center gap-3 text-pink-600 mb-4">
                                <Instagram className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Publicação do Instagram</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">
                                Confira os <span className="text-pink-600">Bastidores</span> no Insta
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-y border-gray-100 dark:border-white/5 py-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-red-600" />
                                    <span>{formattedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-red-600" />
                                    <span>@lagoaformosanomomento</span>
                                </div>
                            </div>
                        </div>

                        {/* Legenda/Conteúdo */}
                        <div className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2rem] border border-gray-100 dark:border-white/5">
                            <p className="text-lg font-medium text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap italic">
                                "{post.caption || 'Sem legenda disponível.'}"
                            </p>
                        </div>

                        {/* Ações */}
                        <div className="flex flex-col gap-4">
                            <a
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white h-16 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Instagram className="w-5 h-5" />
                                <span>Ver Post Original</span>
                            </a>

                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'Lagoa Formosa No Momento - Instagram',
                                            text: post.caption,
                                            url: window.location.href
                                        });
                                    }
                                }}
                                className="w-full bg-black dark:bg-zinc-800 text-white h-16 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-900 transition-colors"
                            >
                                <Share2 className="w-5 h-5 text-red-600" />
                                <span>Compartilhar</span>
                            </button>
                        </div>

                        {/* Footer Disclaimer */}
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mt-auto">
                            Este conteúdo foi importado automaticamente de nossa rede social oficial.
                        </p>
                    </div>
                </div>
            </main>

            <Footer settings={settings} />
        </div>
    );
};

export default InstagramPostDetail;
