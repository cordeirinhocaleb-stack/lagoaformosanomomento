import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Instagram, Calendar, User, Loader2, AlertCircle, ArrowLeft, Share2 } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingScreen from '../common/LoadingScreen';
import { NewsItem, Advertiser, User as UserType, AdPricingConfig, SystemSettings } from '../../types';
import { useRouter } from 'next/navigation';

// Componentes da Notícia
import LeftAdsRail from '../news-detail/components/layout/LeftAdsRail';
import RightToolsRail from '../news-detail/components/layout/RightToolsRail';
import AdvertisersFooter from '../news-detail/components/article/AdvertisersFooter';
import PartnersStrip from '../home/PartnersStrip';
import CommentsSection from '../news-detail/components/article/CommentsSection';
import BackToTopButton from '../news-detail/components/tools/BackToTopButton';
import CategoryMenu from '../layout/CategoryMenu';

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

    // Novas Props para Layout de Notícia
    advertisers: Advertiser[];
    allNews: NewsItem[];
    onAdvertiserClick: (ad: Advertiser) => void;
    adConfig: AdPricingConfig;
    onPricingClick: () => void;
    onLogin: () => void;
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
    onSelectRegion,
    advertisers,
    allNews,
    onAdvertiserClick,
    adConfig,
    onPricingClick,
    onLogin
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

    // Filtragem de Anúncios e Recomendações (Mesmo padrão do NewsDetailPage)
    const sidebarAds = useMemo(() => {
        return advertisers
            .filter(ad => !ad.displayLocations || ad.displayLocations.includes('article_sidebar'))
            .sort(() => Math.random() - 0.5);
    }, [advertisers]);

    const footerAds = useMemo(() => {
        return advertisers
            .filter(ad => ad.isActive)
            .filter(ad => !ad.displayLocations || ad.displayLocations.includes('article_footer'))
            .sort(() => Math.random() - 0.5);
    }, [advertisers]);

    const recommendedNews = useMemo(() => {
        return allNews
            .filter(n => n.status === 'published')
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
    }, [allNews]);

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
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col font-sans">
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

            <main className="flex-grow w-full max-w-[1920px] mx-auto px-4 md:px-8 xl:px-12 py-10">
                {/* 1. GRID PRINCIPAL (Layout Artigo: 3 | 8 | 1) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14">

                    {/* COLUNA ESQUERDA: Patrocinadores */}
                    <aside className="hidden lg:block lg:col-span-3 sticky top-40 h-fit space-y-8">
                        <LeftAdsRail
                            advertisers={sidebarAds}
                            onAdvertiserClick={onAdvertiserClick}
                            isStatic={false}
                        />
                    </aside>

                    {/* COLUNA CENTRAL: Conteúdo Principal */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Botão de Retorno */}
                        <button
                            onClick={() => router.push('/')}
                            className="group flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-6 hover:text-red-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Voltar ao Portal</span>
                        </button>

                        {/* Título e Meta */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 text-pink-600">
                                <Instagram className="w-6 h-6" />
                                <span className="text-[11px] font-[1000] uppercase tracking-[0.4em]">Publicação do Instagram</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-[1000] uppercase italic tracking-tighter leading-[0.9] text-gray-900 dark:text-white">
                                Confira os <span className="text-pink-600">Bastidores</span> no Insta
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest py-6 border-y border-gray-100 dark:border-white/5">
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

                        {/* ÁREA DE MÍDIA - Mais integrada ao texto */}
                        <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 relative aspect-video md:aspect-[16/9] max-h-[800px] w-full">
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

                            {/* Marca d'água */}
                            <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                                <img src="/logo-m.png" className="w-5 h-5 object-contain" alt="LFNM" />
                                <span className="text-[8px] font-bold text-white uppercase tracking-[0.2em]">Exclusivo LFNM</span>
                            </div>
                        </div>

                        {/* LEGENDA / TEXTO */}
                        <article className="prose prose-xl dark:prose-invert max-w-none">
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/5 relative">
                                <div className="absolute -top-4 left-10 bg-red-600 text-white text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Legenda Original</div>
                                <p className="text-lg md:text-2xl font-medium text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap italic opacity-90">
                                    "{post.caption || 'Confira os bastidores no nosso Instagram! @lagoaformosanomomento'}"
                                </p>
                            </div>
                        </article>

                        {/* BOTÕES DE AÇÃO */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-8">
                            <a
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white h-20 rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <Instagram className="w-6 h-6" />
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
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black h-20 rounded-[2.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-4 hover:bg-zinc-900 dark:hover:bg-gray-200 transition-all shadow-xl"
                            >
                                <Share2 className="w-6 h-6 text-red-600" />
                                <span>Compartilhar Agora</span>
                            </button>
                        </div>

                        {/* RECOMENDAÇÕES (Continue lendo) */}
                        {recommendedNews.length > 0 && (
                            <section className="pt-24 border-t-2 border-gray-50 dark:border-white/5">
                                <div className="mb-12">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2 flex items-center gap-3">
                                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Continue por dentro
                                    </h4>
                                    <p className="text-2xl font-black uppercase italic tracking-tighter">Principais de <span className="text-red-600">Lagoa e Região</span></p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {recommendedNews.slice(0, 2).map(rn => (
                                        <div
                                            key={rn.id}
                                            onClick={() => router.push(`/news/view?slug=${rn.id}`)}
                                            className="group cursor-pointer flex flex-col gap-4"
                                        >
                                            <div className="aspect-[16/9] rounded-[2rem] overflow-hidden bg-gray-100 shadow-md">
                                                <img src={rn.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                            </div>
                                            <h5 className="text-lg font-black leading-tight group-hover:text-red-600 transition-colors uppercase italic tracking-tighter">{rn.title}</h5>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* COMENTÁRIOS */}
                        <section className="pt-24 border-t-2 border-gray-50 dark:border-white/5 px-2">
                            <CommentsSection newsId={post.id} user={user} onLogin={onLogin} />
                        </section>

                        {/* PARCEIROS NO RODAPÉ */}
                        <section className="pt-24">
                            <PartnersStrip
                                advertisers={advertisers}
                                onAdvertiserClick={onAdvertiserClick}
                            />
                        </section>

                        {/* RODAPÉ DE ANUNCIANTES ESTILO ARTIGO */}
                        <section className="pt-24 pb-12">
                            <AdvertisersFooter
                                advertisers={footerAds}
                                onAdvertiserClick={onAdvertiserClick}
                                onPlanRequest={onPricingClick}
                                fullWidth
                            />
                        </section>
                    </div>

                    {/* COLUNA DIREITA: Ferramentas (Opcional - mas mantém o grid fixo) */}
                    <aside className="hidden lg:block lg:col-span-1 border-l border-gray-100 dark:border-white/5 pl-8">
                        {/* Se necessário pode espelhar RightToolsRail aqui */}
                    </aside>
                </div>
            </main>

            <Footer settings={settings} />
            <BackToTopButton />
        </div>
    );
};

export default InstagramPostDetail;
