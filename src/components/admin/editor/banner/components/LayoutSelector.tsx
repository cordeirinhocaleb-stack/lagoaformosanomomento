/**
 * LayoutSelector Component
 * Buttons for selecting image layout style
 */

import React from 'react';

type LayoutType = 'carousel' | 'grid' | 'fade' | 'split' | 'mosaic';

interface LayoutSelectorProps {
    currentLayout: LayoutType;
    onLayoutChange: (layout: LayoutType) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({
    currentLayout,
    onLayoutChange
}) => {
    const layouts: LayoutType[] = ['carousel', 'grid', 'fade', 'split', 'mosaic'];

    return (
        <div className="px-8 pt-8">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                Estilo da Composição
            </label>
            <div className="flex flex-wrap gap-3">
                {layouts.map((layout) => (
                    <button
                        key={layout}
                        onClick={() => onLayoutChange(layout)}
                        className={`px-5 py-2.5 rounded-full border-2 text-[10px] font-bold uppercase tracking-widest transition-all ${currentLayout === layout
                            ? 'border-black bg-black text-white shadow-lg scale-105'
                            : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        {layout}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LayoutSelector;
