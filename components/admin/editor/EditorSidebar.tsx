
import React, { useState } from 'react';
import { ContentBlock } from '../../../types';
import { EDITOR_WIDGETS } from '../EditorWidgets';
import { CELEBRATION_BLOCKS } from './CelebrationBlocks';

interface EditorSidebarProps {
    onAddBlock: (type: ContentBlock['type'], content?: any, settings?: any) => void;
    isUploading: boolean;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ onAddBlock }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>('escrita');

    const categories = [
        {
            id: 'escrita',
            label: 'Redação',
            icon: 'fa-pen-nib',
            items: [
                { type: 'paragraph', icon: 'fa-paragraph', label: 'Texto', color: 'text-blue-500', bg: 'bg-blue-50 group-hover:bg-blue-600' },
                { type: 'heading', icon: 'fa-heading', label: 'Título', color: 'text-indigo-600', bg: 'bg-indigo-50 group-hover:bg-indigo-600' },
                { type: 'quote', icon: 'fa-quote-left', label: 'Citação', color: 'text-purple-500', bg: 'bg-purple-50 group-hover:bg-purple-600' },
                { type: 'list', icon: 'fa-list-ul', label: 'Lista', color: 'text-teal-500', bg: 'bg-teal-50 group-hover:bg-teal-600' },
                { type: 'separator', icon: 'fa-minus', label: 'Divisor', color: 'text-zinc-600', bg: 'bg-zinc-100 group-hover:bg-zinc-600', settings: { iconPosition: 'none', thickness: 1, color: '#e2e8f0' } },
                { type: 'separator', icon: 'fa-grip-lines-vertical', label: 'Vertical', color: 'text-zinc-600', bg: 'bg-zinc-100 group-hover:bg-zinc-600', settings: { orientation: 'vertical', thickness: 2, height: 60, color: '#e2e8f0' } }
            ]
        },
        {
            id: 'cloud',
            label: 'Mídia Cloud',
            icon: 'fa-cloud',
            customContent: (
                <div className="grid grid-cols-1 gap-3 p-1">
                    <button
                        onClick={() => onAddBlock('gallery', { items: [] }, { style: 'hero_slider', width: 'full' })}
                        className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all group text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <i className="fas fa-images"></i>
                        </div>
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800 block mb-0.5">Galeria (Cloud)</span>
                            <span className="text-[9px] text-zinc-400 font-medium">Fotos somente</span>
                        </div>
                    </button>
                    <button
                        onClick={() => onAddBlock('video', '', { style: 'clean', width: 'full' })}
                        className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center gap-4 hover:border-red-200 hover:shadow-md transition-all group text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                            <i className="fab fa-youtube"></i>
                        </div>
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800 block mb-0.5">Vídeo (YouTube)</span>
                            <span className="text-[9px] text-zinc-400 font-medium">Vídeos somente</span>
                        </div>
                    </button>
                </div>
            )
        },
        {
            id: 'interativo',
            label: 'Interativo',
            icon: 'fa-bolt',
            items: [
                { type: 'engagement', icon: 'fa-square-poll-vertical', label: 'Enquete', color: 'text-orange-500', bg: 'bg-orange-50 group-hover:bg-orange-500', settings: { engagementType: 'poll', width: 'full' }, content: { question: 'Sua opinião?', options: ['Sim', 'Não'] } },
                { type: 'engagement', icon: 'fa-balance-scale', label: 'Comparação', color: 'text-cyan-500', bg: 'bg-cyan-50 group-hover:bg-cyan-500', settings: { engagementType: 'comparison', width: 'full' }, content: { question: 'Quem ganha?', imageA: '', imageB: '' } },
                { type: 'engagement', icon: 'fa-face-smile', label: 'Reações', color: 'text-yellow-500', bg: 'bg-yellow-50 group-hover:bg-yellow-500', settings: { engagementType: 'reaction', width: 'full' }, content: { question: 'Como avalia?', reactionEmojis: '🔥,👏,😢' } },
                { type: 'engagement', icon: 'fa-hand-holding-heart', label: 'Apoio', color: 'text-pink-500', bg: 'bg-pink-50 group-hover:bg-pink-500', settings: { engagementType: 'counter', width: 'full' }, content: { question: 'Clique no coração!', buttonText: 'Apoiar' } },
                { type: 'engagement', icon: 'fa-stopwatch', label: 'Nobreak', color: 'text-red-500', bg: 'bg-red-50 group-hover:bg-red-500', settings: { engagementType: 'countdown' }, content: {} },
                { type: 'engagement', icon: 'fa-stream', label: 'Timeline', color: 'text-blue-400', bg: 'bg-blue-50 group-hover:bg-blue-500', settings: { engagementType: 'timeline' }, content: {} },
                { type: 'engagement', icon: 'fa-exchange-alt', label: 'Flip Card', color: 'text-emerald-500', bg: 'bg-emerald-50 group-hover:bg-emerald-500', settings: { engagementType: 'flipcard' }, content: {} },
                { type: 'engagement', icon: 'fa-chevron-down', label: 'Acordeão', color: 'text-gray-500', bg: 'bg-gray-100 group-hover:bg-gray-600', settings: { engagementType: 'accordion' }, content: {} },
                { type: 'engagement', icon: 'fa-bullhorn', label: 'CTA', color: 'text-violet-500', bg: 'bg-violet-50 group-hover:bg-violet-500', settings: { engagementType: 'cta' }, content: {} }
            ]
        },
        {
            id: 'widgets',
            label: 'Widgets',
            icon: 'fa-layer-group',
            isWidgets: true
        },
        {
            id: 'celebracoes',
            label: 'Comemorações',
            icon: 'fa-calendar-star',
            isCelebrations: true
        }
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-gray-50 bg-white">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900 leading-none flex items-center gap-2">
                    <i className="fas fa-toolbox text-red-600"></i>
                    Ferramentas
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {categories.map(cat => (
                    <div key={cat.id} className="mb-2">
                        <button
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${activeCategory === cat.id ? 'bg-black text-white shadow-lg' : 'bg-gray-50 text-zinc-600 hover:bg-gray-100'}`}
                        >
                            <div className="flex items-center gap-3">
                                <i className={`fas ${cat.icon} text-xs ${activeCategory === cat.id ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-600'}`}></i>
                                <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                            </div>
                            <i className={`fas fa-chevron-${activeCategory === cat.id ? 'up' : 'down'} text-[8px] opacity-50`}></i>
                        </button>

                        {activeCategory === cat.id && (
                            <div className="mt-3 pl-1 pr-1 pb-2 animate-fadeIn grid grid-cols-2 gap-2">
                                {cat.customContent && <div className="col-span-2">{cat.customContent}</div>}

                                {cat.isWidgets ? EDITOR_WIDGETS.slice(0, 10).map(w => (
                                    <button
                                        key={w.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onAddBlock('smart_block', w.html, { width: 'full', widgetId: w.id });
                                        }}
                                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 hover:border-red-600 hover:shadow-lg transition-all gap-2 aspect-square group"
                                    >
                                        <i className={`fas ${w.icon} text-gray-400 text-lg group-hover:text-red-600 transition-colors`}></i>
                                        <span className="text-[9px] font-black uppercase text-zinc-500 text-center leading-tight group-hover:text-black line-clamp-1">{w.name}</span>
                                    </button>
                                )) : cat.isCelebrations ? CELEBRATION_BLOCKS.map(celebration => (
                                    <button
                                        key={celebration.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            onAddBlock(
                                                celebration.template.type as any,
                                                celebration.template.content,
                                                celebration.template.settings
                                            );
                                        }}
                                        className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 hover:border-red-600 hover:shadow-lg transition-all gap-2 aspect-square group relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${celebration.colors.primary}15, ${celebration.colors.secondary}15)`
                                        }}
                                    >
                                        <span className="text-3xl">{celebration.emoji}</span>
                                        <span className="text-[9px] font-black uppercase text-zinc-600 text-center leading-tight group-hover:text-black line-clamp-2">{celebration.name}</span>
                                        <span className="text-[6px] text-zinc-400 absolute bottom-1">{celebration.date}</span>
                                    </button>
                                )) :
                                    cat.items?.map(item => (
                                        <button
                                            key={item.label} onClick={() => onAddBlock(item.type as any, item.content, item.settings)}
                                            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 cursor-pointer transition-all gap-2 aspect-square group hover:shadow-md hover:border-gray-200"
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${item.bg || 'bg-gray-100'} ${item.color || 'text-gray-400'} group-hover:text-white`}>
                                                <i className={`fas ${item.icon}`}></i>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-zinc-600 text-center leading-tight group-hover:text-black line-clamp-1">{item.label}</span>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EditorSidebar;
