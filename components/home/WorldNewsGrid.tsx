
import React, { useState, useEffect } from 'react';
import VerticalNewsColumn from './world/VerticalNewsColumn';

interface WorldNewsGridProps {
  externalCategories: Record<string, any[]>;
}

const WorldNewsGrid: React.FC<WorldNewsGridProps> = ({ externalCategories }) => {
  // Lista completa de categorias para rotação
  const allCategories = ['Política', 'Economia', 'Agro', 'Mundo', 'Tecnologia', 'Esporte', 'Cultura', 'Cotidiano'];
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4; // Exibe 4 colunas por vez

  // Rotação automática dos filtros
  useEffect(() => {
    const interval = setInterval(() => {
        setStartIndex((prev) => (prev + 1) % allCategories.length);
    }, 6000); // Muda a cada 6 segundos

    return () => clearInterval(interval);
  }, [allCategories.length]);

  // Calcula as categorias visíveis (circular)
  const visibleCategories = [];
  for (let i = 0; i < visibleCount; i++) {
      const idx = (startIndex + i) % allCategories.length;
      visibleCategories.push(allCategories[idx]);
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {visibleCategories.map(cat => (
                    <VerticalNewsColumn 
                        key={cat} 
                        title={cat} 
                        items={(externalCategories[cat] || []).slice(0, 3)} 
                        theme={['Política', 'Agronegócio', 'Esporte'].includes(cat) ? 'green' : 'blue'} 
                    />
                ))}
            </div>
        </div>
    </section>
  );
};

export default WorldNewsGrid;
