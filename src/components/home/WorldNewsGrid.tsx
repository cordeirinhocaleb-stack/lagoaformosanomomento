
import React, { useState, useEffect } from 'react';
import VerticalNewsColumn from './world/VerticalNewsColumn';

interface WorldNewsGridProps {
    externalCategories: Record<string, any[]>;
    selectedCategory: string;
}

const WorldNewsGrid: React.FC<WorldNewsGridProps> = ({ externalCategories, selectedCategory }) => {
    // Lista completa de categorias para o Giro
    const allCategories = ['Política', 'Economia', 'Agro', 'Mundo', 'Tecnologia', 'Esporte', 'Cultura', 'Cotidiano'];
    const [startIndex, setStartIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    // Responsive Column Count
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            if (w < 768) setVisibleCount(2); // Mobile (2 por vez)
            else setVisibleCount(4); // Tablet e PC (4 por vez)
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Rotação automática dos filtros (apenas quando não há filtro selecionado)
    useEffect(() => {
        if (selectedCategory !== 'all') return; // Não rotaciona se há filtro ativo

        const interval = setInterval(() => {
            // Rotaciona de 4 em 4 para trocar o bloco completo conforme solicitado
            setStartIndex((prev) => (prev + 4) % allCategories.length);
        }, 40000); // Muda a cada 40 segundos conforme solicitado

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
        <section className="w-full mb-24 px-0">
            <div className="bg-gray-50 rounded-[2.5rem] md:rounded-[3rem] py-8 px-4 md:py-10 md:px-6 lg:py-12 lg:px-8 border border-gray-100">
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

                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-8">
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
