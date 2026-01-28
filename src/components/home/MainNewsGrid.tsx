
import React, { useState } from 'react';
import { NewsItem } from '../../types';
import NewsCard from '../news/NewsCard';

interface MainNewsGridProps {
    news: NewsItem[];
    highlights: NewsItem[];
    onNewsClick: (item: NewsItem) => void;
}

const MainNewsGrid: React.FC<MainNewsGridProps> = ({ news, highlights, onNewsClick }) => {
    // Estado para controlar qual cartão está expandido (Zoom) no mobile
    const [zoomedId, setZoomedId] = useState<string | null>(null);

    const handleZoomChange = (id: string, isActive: boolean) => {
        // Se ativar, define o ID. Se desativar e for o atual, limpa.
        if (isActive) {
            setZoomedId(id);
        } else if (zoomedId === id) {
            setZoomedId(null);
        }
    };

    return (
        <section className="mb-12 px-4 md:px-8 lg:px-4 pt-2">

            {/* BARRA DE INSTRUÇÕES ATUALIZADA */}
            <div className="flex justify-center mb-4 animate-fadeIn">
                <div className="bg-black/5 backdrop-blur-sm border border-black/10 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm">
                    <div className="flex md:hidden items-center gap-2 text-[8px] font-bold text-zinc-600 uppercase tracking-tight text-center leading-tight">
                        <i className="fas fa-hand-pointer text-red-600 animate-pulse"></i>
                        <span>1x Expande • 2x Abre • 1x Fecha</span>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><i className="fas fa-mouse-pointer text-zinc-400"></i> Mouse: Ler</span>
                        <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                        <span className="flex items-center gap-1 text-zinc-800"><i className="fas fa-arrow-up-down text-red-600"></i> ↕ Vel</span>
                    </div>
                </div>
            </div>

            {/* Grid Principal: Lógica de Flow Dinâmico
          Mobile: grid-cols-2
          Tablet (md): grid-cols-3 
          PC (lg): grid-cols-4 
      */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 auto-rows-fr grid-flow-dense">
                {news.length > 0 ? (
                    news.map((item, index) => {
                        const isZoomed = zoomedId === item.id;

                        // LÓGICA CORE v2 (Order-based Displacement):
                        // Se estiver com zoom, ocupa 2 colunas.
                        // Para "jogar o da esquerda para baixo", reduzimos mecanicamente o 'order' do card.
                        // Isso faz com que ele assuma a posição anterior no fluxo do grid.
                        const gridClasses = isZoomed
                            ? 'col-span-2 row-span-2 z-30 shadow-2xl transition-all duration-500' // Ocupa 2x2, fica por cima
                            : 'col-span-1 z-auto transition-all duration-500'; // Normal

                        // Calculamos a ordem para que o card com zoom "puxe" a vaga do anterior se necessário
                        const itemOrder = isZoomed ? (index * 10 - 11) : (index * 10);

                        return (
                            <div
                                key={item.id}
                                className={gridClasses}
                                style={{ order: itemOrder }}
                            >
                                <NewsCard
                                    news={item}
                                    featured
                                    onClick={onNewsClick}
                                    isZoomed={isZoomed}
                                    onZoomChange={(active) => handleZoomChange(item.id, active)}
                                />
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-16 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Aguardando publicações...</p>
                    </div>
                )}
            </div>

            {/* Seção Secundária */}
            {highlights.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">
                            Destaques das <span className="text-red-600">Editorias</span>
                        </h3>
                        <i className="fas fa-layer-group text-gray-300"></i>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        {highlights.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onNewsClick(item)}
                                className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex gap-3 items-center h-24 transform hover:-translate-y-1"
                            >
                                <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden relative">
                                    <img
                                        src={item.imageUrl || (item as any).image_url}
                                        loading="lazy"
                                        width="120"
                                        height="120"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={item.title}
                                    />
                                    {item.mediaType === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <i className="fas fa-play text-white text-[10px]"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center h-full">
                                    <span className="text-[8px] font-black uppercase text-red-600 tracking-widest mb-0.5">{item.category}</span>
                                    <h4 className="text-[11px] font-bold text-gray-900 leading-tight line-clamp-3 group-hover:text-red-600">{item.title}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default MainNewsGrid;
