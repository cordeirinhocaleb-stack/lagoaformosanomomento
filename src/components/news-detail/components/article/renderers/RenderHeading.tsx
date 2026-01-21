import React from 'react';
import { ContentBlock } from '@/types';

interface RenderHeadingProps {
    block: ContentBlock;
}

export const RenderHeading: React.FC<RenderHeadingProps> = ({ block }) => {
    const hVariant = block.settings?.editorialVariant || 'hero_headline';
    const settings = block.settings || {};
    const hSettings = settings.perStyle?.[hVariant] || {};

    if (hVariant === 'sub_classic') {
        return <h3 className="text-xl md:text-2xl font-serif text-zinc-600 dark:text-zinc-400 font-bold mt-8 mb-4 border-b border-zinc-100 pb-2">{block.content}</h3>;
    }

    if (hVariant === 'live_update') {
        return (
            <div className="flex items-center gap-4 mt-10 mb-6 group">
                <span className="px-2 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded animate-pulse whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.5)]">AO VIVO</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors cursor-default">{block.content}</h2>
            </div>
        );
    }

    if (hVariant === 'breaking_alert') {
        const ba = hSettings;
        const colors: Record<string, string> = {
            red: 'bg-red-600 border-red-700 text-white',
            dark: 'bg-zinc-900 border-zinc-800 text-white',
            amber: 'bg-amber-500 border-amber-600 text-black',
            blue: 'bg-blue-600 border-blue-700 text-white'
        };
        const theme = colors[ba.bgPreset || 'red'] || colors.red;
        const intensityClass = ba.intensity === 'strong' ? 'shadow-xl' : 'shadow-sm';
        const pulseClass = ba.pulseEnabled ? 'animate-pulse' : '';
        const skewClass = ba.skew ? '-skew-x-6' : '';
        const icon = (!ba.icon || ba.icon === 'none') ? null : (ba.icon === 'warning' ? 'fa-triangle-exclamation' : ba.icon === 'fire' ? 'fa-fire' : ba.icon === 'siren' ? 'fa-lightbulb' : 'fa-bolt');

        return (
            <div className={`my-10 p-6 rounded-xl border-l-8 ${theme} ${intensityClass} ${pulseClass} ${skewClass} relative overflow-hidden`}>
                {ba.animation === 'shimmer' && <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>}
                <div className="flex items-start gap-4 relative z-10">
                    {icon && <i className={`fas ${icon} text-3xl opacity-80 mt-1`}></i>}
                    <div>
                        <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Plantão de Notícias</span>
                        <h2 className="text-xl md:text-2xl font-black leading-tight uppercase" dangerouslySetInnerHTML={{ __html: block.content }} />
                    </div>
                </div>
            </div>
        );
    }

    if (hVariant === 'police_siren') {
        const ps = hSettings;
        const colorClass = ps.palette === 'red' ? 'from-red-600 to-red-900' : 'from-blue-600 to-red-600';
        const animateClass = ps.animate !== false ? (ps.palette === 'red' ? 'animate-pulse' : 'animate-[pulse_0.5s_ease-in-out_infinite_alternate]') : '';

        if (ps.mode === 'tape') {
            return (
                <div className="my-10 -mx-4 md:-mx-8 bg-yellow-400 text-black font-black uppercase tracking-widest text-center py-2 text-xl transform -rotate-1 shadow-lg border-y-4 border-black border-dashed">
                    <i className="fas fa-exclamation-triangle mr-3"></i> {block.content} <i className="fas fa-exclamation-triangle ml-3"></i>
                </div>
            );
        }

        return (
            <div className="my-10 p-1 rounded-xl bg-zinc-900 shadow-[0_0_30px_rgba(220,38,38,0.3)] overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClass} ${animateClass}`}></div>
                <div className="bg-black/90 p-6 rounded-lg backdrop-blur-sm relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em] blink">Urgente</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping delay-100"></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight font-mono uppercase" dangerouslySetInnerHTML={{ __html: block.content }} />
                </div>
            </div>
        );
    }

    // Default: Hero Headline with options
    const widthClass = hSettings.width === 'prose' ? 'max-w-[65ch] mx-auto' : '';
    const weightMap: Record<number, string> = { 700: 'font-bold', 800: 'font-extrabold', 900: 'font-black' };
    const weightClass = weightMap[hSettings.weight] || 'font-black';
    const alignClass = 'text-left'; // Headlines usually left, but could be customizable

    return (
        <div className={`${widthClass} mt-12 mb-6`}>
            <h2 className={`text-2xl md:text-3xl ${weightClass} uppercase italic tracking-tighter text-zinc-900 dark:text-zinc-100 border-l-[6px] border-red-600 pl-5 py-1 leading-tight`} dangerouslySetInnerHTML={{ __html: block.content }} />
            {hSettings.subtitle && <p className="mt-2 pl-6 text-zinc-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wide">{hSettings.subtitle}</p>}
        </div>
    );
};
