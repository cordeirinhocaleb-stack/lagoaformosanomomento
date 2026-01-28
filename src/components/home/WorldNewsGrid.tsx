
import React, { useState, useEffect } from 'react';
import VerticalNewsColumn from './world/VerticalNewsColumn';

interface WorldNewsGridProps {
    externalCategories: Record<string, any[]>;
    selectedCategory: string;
}

const WorldNewsGrid: React.FC<WorldNewsGridProps> = ({ externalCategories, selectedCategory }) => {
    // Lista completa de categorias para rotação
    const allCategories = ['Política', 'Economia', 'Agro', 'Mundo', 'Tecnologia', 'Esporte', 'Cultura', 'Cotidiano'];
    const [startIndex, setStartIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    // Responsive Column Count
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 768) setVisibleCount(2); // Mobile
            else if (w < 1280) setVisibleCount(4); // Tablet
            else setVisibleCount(6); // PC
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Rotação automática dos filtros (apenas quando não há filtro selecionado)
    useEffect(() => {
        if (selectedCategory !== 'all') return; // Não rotaciona se há filtro ativo

        const interval = setInterval(() => {
            setStartIndex((prev) => (prev + 1) % allCategories.length);
        }, 6000); // Muda a cada 6 segundos

        return () => clearInterval(interval);
    }, [allCategories.length, selectedCategory]);

    // Calcula as categorias visíveis (circular ou filtrada)
    const visibleCategories: string[] = [];

    if (selectedCategory !== 'all') {
        // Se há filtro ativo, mostra apenas essa categoria
        visibleCategories.push(selectedCategory);
    } else {
        // Rotação normal das categorias baseada no count responsivo
        for (let i = 0; i < visibleCount; i++) {
            const idx = (startIndex + i) % allCategories.length;
            visibleCategories.push(allCategories[idx]);
        }
    }

    return (
        <section className="w-full mb-24 px-4 md:px-8 lg:px-12">
            <div className="bg-gray-50 rounded-[3rem] p-6 md:p-10 lg:p-16 border border-gray-100">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-12 bg-black rounded-full"></div>
                        <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
                            Giro <span className="text-red-600">Brasil & Mundo</span>
                        </h3>
                    </div>
                    {/* Indicador de Rotação */}
                    <div className="hidden md:flex gap-1">
                        {allCategories.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-500 ${visibleCategories.includes(allCategories[i]) ? 'w-6 bg-red-600' : 'w-2 bg-gray-300'}`}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-8">
                    {visibleCategories.map(cat => {
                        let theme: 'blue' | 'green' | 'orange' | 'purple' = 'blue';
                        if (['Política', 'Economia'].includes(cat)) theme = 'orange';
                        if (['Agro', 'Agronegócio'].includes(cat)) theme = 'green';
                        if (['Tecnologia', 'Mundo'].includes(cat)) theme = 'purple';

                        const items = (externalCategories[cat] || []).slice(0, 3);

                        return (
                            <VerticalNewsColumn
                                key={cat}
                                title={cat}
                                items={items}
                                theme={theme}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WorldNewsGrid;
