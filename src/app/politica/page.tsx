
'use client';

import React, { useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MainNewsGrid from '@/components/home/MainNewsGrid';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import { Building2 } from 'lucide-react';

export default function PoliticaPage() {
    const ctrl = useAppControllerContext();

    const politicaNews = useMemo(() => {
        return ctrl.news.filter(n => n.category === 'Política' && !n.hidden);
    }, [ctrl.news]);

    return (
        <div className="w-full flex flex-col min-h-screen animate-fadeIn">
            <Header
                onAdminClick={() => ctrl.updateHash('/admin')}
                onHomeClick={() => ctrl.updateHash('/')}
                latestNews={ctrl.tickerNews}
                externalNews={ctrl.marqueeNews}
                user={ctrl.user}
                onOpenProfile={() => ctrl.modals.setShowProfileModal(true)}
                selectedCategory="Política"
                onSelectCategory={ctrl.handleCategorySelection}
                selectedRegion={ctrl.selectedRegion}
                onSelectRegion={ctrl.handleRegionSelection}
            />

            <main className="flex-grow w-full max-w-[1550px] mx-auto pb-20">
                {/* Hero Header Category */}
                <div className="w-full bg-zinc-900 pt-32 pb-20 px-4 md:px-12 relative overflow-hidden mb-12">
                    <div className="absolute inset-0 bg-red-600/10 mix-blend-overlay"></div>
                    <div className="relative z-10 max-w-4xl">
                        <div className="inline-flex items-center gap-3 text-red-500 mb-6">
                            <Building2 className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-[0.4em]">Cobertura Política</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-white leading-none mb-6">
                            Bastidores do <span className="text-red-600">Poder</span>
                        </h1>
                        <p className="text-zinc-400 text-sm md:text-lg font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
                            Informação isenta sobre o cenário político local, regional e nacional. O que realmente importa para o cidadão.
                        </p>
                    </div>
                </div>

                <div className="px-4 md:px-12">
                    {politicaNews.length > 0 ? (
                        <MainNewsGrid
                            highlights={politicaNews.slice(0, 3)}
                            news={politicaNews.slice(3)}
                            onNewsClick={(n) => {
                                ctrl.setSelectedNews(n);
                                ctrl.updateHash(`/news/view?slug=${n.seo?.slug || n.slug || n.id}`);
                            }}
                        />
                    ) : (
                        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                            <p className="text-gray-400 font-black uppercase tracking-widest italic">Nenhuma notícia política no momento.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer settings={ctrl.systemSettings} />
        </div>
    );
}
